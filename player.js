class PlayerController {
    constructor(camera, scene, physics, effects) {
        this.camera = camera;
        this.scene = scene;
        this.physics = physics;
        this.effects = effects;

        this.health = 100;
        this.isDead = false;
        this.input = { forward: 0, right: 0 };

        this.weaponSystem = new WeaponSystem(this.camera, this.effects);

        // Physics Body
        this.body = this.physics.addBox(new THREE.Vector3(0, 5, 0), new THREE.Vector3(1, CONFIG.PLAYER_HEIGHT, 1), false);
        this.body.fixedRotation = true;

        // Character Mesh
        this.mesh = this.createRobloxCharacterMesh(CONFIG.COLORS.DUMMY_BLUE);
        this.scene.add(this.mesh);
        this.mesh.visible = false; // Hide 3rd person local mesh to fix camera clipping

        this.setupControls();
    }

    createRobloxCharacterMesh(color) {
        const group = new THREE.Group();
        const yellowMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.DUMMY_YELLOW, roughness: 0.3 });
        const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });
        const limbMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), yellowMat);
        head.position.y = 1.4;
        head.name = 'HEAD';
        group.add(head);

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.5), bodyMat);
        torso.position.y = 0.5;
        torso.name = 'BODY';
        group.add(torso);

        // Limbs
        const armGeo = new THREE.BoxGeometry(0.35, 1.0, 0.35);
        const lArm = new THREE.Mesh(armGeo, limbMat);
        lArm.position.set(-0.7, 0.5, 0);
        lArm.name = 'BODY';
        const rArm = new THREE.Mesh(armGeo, limbMat);
        rArm.position.set(0.7, 0.5, 0);
        rArm.name = 'BODY';
        group.add(lArm, rArm);

        const legGeo = new THREE.BoxGeometry(0.38, 1.0, 0.38);
        const lLeg = new THREE.Mesh(legGeo, limbMat);
        lLeg.position.set(-0.25, -0.5, 0);
        lLeg.name = 'BODY';
        const rLeg = new THREE.Mesh(legGeo, limbMat);
        rLeg.position.set(0.25, -0.5, 0);
        rLeg.name = 'BODY';
        group.add(lLeg, rLeg);

        return group;
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (this.isDead) return;

            const key = e.key.toLowerCase();
            const code = e.code;

            // WASD Movement
            if (key === 'w' || code === 'KeyW') this.input.forward = 1;
            if (key === 's' || code === 'KeyS') this.input.forward = -1;
            if (key === 'a' || code === 'KeyA') this.input.right = -1;
            if (key === 'd' || code === 'KeyD') this.input.right = 1;

            // Jump & Dash
            if (code === 'Space' || key === ' ') this.jump();
            if (code === 'ShiftLeft' || key === 'shift') this.dash();
            
            // Reload & Weapon Selection (Keys 1, 2, 3, 4)
            if (key === 'r' || code === 'KeyR') this.weaponSystem.reload();
            if (key === '1' || code === 'Digit1') this.weaponSystem.selectWeapon('KNIFE');
            if (key === '2' || code === 'Digit2') this.weaponSystem.selectWeapon('PISTOL');
            if (key === '3' || code === 'Digit3') this.weaponSystem.selectWeapon('RIFLE');
            if (key === '4' || code === 'Digit4') this.weaponSystem.selectWeapon('SNIPER');
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const code = e.code;

            if (key === 'w' || key === 's' || code === 'KeyW' || code === 'KeyS') this.input.forward = 0;
            if (key === 'a' || key === 'd' || code === 'KeyA' || code === 'KeyD') this.input.right = 0;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 2) this.weaponSystem.toggleScope();
        });
    }

    takeDamage(amount) {
        if (this.isDead) return false;
        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            setTimeout(() => this.respawn(), 3000);
            return true;
        }
        return false;
    }

    respawn() {
        this.health = 100;
        this.isDead = false;
        const spawnX = (Math.random() - 0.5) * 20;
        const spawnZ = (Math.random() - 0.5) * 20;
        this.body.position.set(spawnX, 4, spawnZ);
        this.body.velocity.set(0, 0, 0);
    }

    jump() {
        if (Math.abs(this.body.velocity.y) < 0.15) {
            this.body.velocity.y = CONFIG.PLAYER_JUMP_FORCE;
        }
    }

    dash() {
        if (window.audioManager && window.audioManager.playDash) {
            window.audioManager.playDash();
        }
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        this.body.velocity.x += dir.x * CONFIG.PLAYER_DASH_SPEED;
        this.body.velocity.z += dir.z * CONFIG.PLAYER_DASH_SPEED;
    }

    update(delta) {
        if (this.isDead) return;

        const front = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        front.y = 0;
        front.normalize();
        const side = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        side.y = 0;
        side.normalize();

        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(front, this.input.forward);
        moveDir.addScaledVector(side, this.input.right);
        moveDir.normalize();

        this.body.velocity.x = moveDir.x * CONFIG.PLAYER_SPEED;
        this.body.velocity.z = moveDir.z * CONFIG.PLAYER_SPEED;

        this.camera.position.set(this.body.position.x, this.body.position.y + 0.8, this.body.position.z);
        this.mesh.position.copy(this.body.position);
    }
}
