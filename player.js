class PlayerController {
    constructor(camera, scene, physics, effects) {
        this.camera = camera;
        this.scene = scene;
        this.physics = physics;
        this.effects = effects;

        this.health = 100;
        this.velocity = new THREE.Vector3();
        this.input = { forward: 0, right: 0, jump: false, dash: false };

        this.weaponSystem = new WeaponSystem(this.camera, this.effects);
        
        // Physics Body
        this.body = this.physics.addBox(new THREE.Vector3(0, 5, 0), new THREE.Vector3(1, CONFIG.PLAYER_HEIGHT, 1), false);
        this.body.fixedRotation = true;

        // Local Roblox Mesh Representation
        this.mesh = this.createRobloxCharacterMesh(CONFIG.COLORS.DUMMY_BLUE);
        this.scene.add(this.mesh);

        this.setupControls();
    }

    createRobloxCharacterMesh(color) {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });

        // Roblox Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mat);
        head.position.y = 1.4;
        group.add(head);

        // Roblox Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.6), mat);
        torso.position.y = 0.5;
        group.add(torso);

        return group;
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') this.input.forward = 1;
            if (e.code === 'KeyS') this.input.forward = -1;
            if (e.code === 'KeyA') this.input.right = -1;
            if (e.code === 'KeyD') this.input.right = 1;
            if (e.code === 'Space') this.jump();
            if (e.code === 'ShiftLeft') this.dash();
            if (e.code === 'KeyR') this.weaponSystem.reload();
            if (e.code === 'Digit1') this.weaponSystem.selectWeapon('KNIFE');
            if (e.code === 'Digit2') this.weaponSystem.selectWeapon('PISTOL');
            if (e.code === 'Digit3') this.weaponSystem.selectWeapon('RIFLE');
            if (e.code === 'Digit4') this.weaponSystem.selectWeapon('SNIPER');
        });

        window.addEventListener('keyup', (e) => {
            if (['KeyW', 'KeyS'].includes(e.code)) this.input.forward = 0;
            if (['KeyA', 'KeyD'].includes(e.code)) this.input.right = 0;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 2) this.weaponSystem.toggleScope();
        });
    }

    jump() {
        if (Math.abs(this.body.velocity.y) < 0.05) {
            this.body.velocity.y = CONFIG.PLAYER_JUMP_FORCE;
        }
    }

    dash() {
        audioManager.playDash();
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        this.body.velocity.x += dir.x * CONFIG.PLAYER_DASH_SPEED;
        this.body.velocity.z += dir.z * CONFIG.PLAYER_DASH_SPEED;
    }

    update(delta) {
        // Player WASD Movement
        const moveDir = new THREE.Vector3();
        const front = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        front.y = 0;
        front.normalize();
        const side = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        side.y = 0;
        side.normalize();

        moveDir.addScaledVector(front, this.input.forward);
        moveDir.addScaledVector(side, this.input.right);
        moveDir.normalize();

        this.body.velocity.x = moveDir.x * CONFIG.PLAYER_SPEED;
        this.body.velocity.z = moveDir.z * CONFIG.PLAYER_SPEED;

        // Sync Camera and Local Mesh Position to Cannon Physics Body
        this.camera.position.set(this.body.position.x, this.body.position.y + 0.8, this.body.position.z);
        this.mesh.position.copy(this.body.position);
    }
}