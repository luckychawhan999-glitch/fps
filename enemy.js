class DummyTarget {
    constructor(scene, physics, position) {
        this.scene = scene;
        this.physics = physics;
        this.health = 100;
        this.isDead = false;

        this.group = new THREE.Group();
        this.buildRobloxDummy();
        this.setPosition(position);
        this.scene.add(this.group);
    }

    buildRobloxDummy() {
        const yellowMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.DUMMY_YELLOW, roughness: 0.3 });
        const blueMat = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.DUMMY_BLUE, roughness: 0.3 });

        // Head (Headshot Collider)
        this.head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), yellowMat);
        this.head.position.y = 1.4;
        this.head.name = 'HEAD';
        this.group.add(this.head);

        // Torso (Body Collider)
        this.torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.6), blueMat);
        this.torso.position.y = 0.5;
        this.torso.name = 'BODY';
        this.group.add(this.torso);
    }

    setPosition(pos) {
        this.group.position.copy(pos);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0 && !this.isDead) {
            this.isDead = true;
            this.group.visible = false;
            return true; // Target Destroyed
        }
        return false;
    }

    respawn(newPos) {
        this.health = 100;
        this.isDead = false;
        this.setPosition(newPos);
        this.group.visible = true;
    }
}