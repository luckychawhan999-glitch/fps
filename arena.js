class ArenaMap {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.setupAtmosphere();
        this.buildShipmentMap();
    }

    setupAtmosphere() {
        // CODM Industrial Atmosphere & Sky
        this.scene.background = new THREE.Color(0xd0e0e3);
        this.scene.fog = new THREE.FogExp2(0xd0e0e3, 0.012);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const sun = new THREE.DirectionalLight(0xfffaed, 1.2);
        sun.position.set(30, 50, 20);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    buildShipmentMap() {
        // Ground - Concrete Dirt mix
        const groundGeo = new THREE.PlaneGeometry(80, 80);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: 0.9 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.physics.addBox(new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(80, 1, 80), true);

        // Outer Boundary Walls
        this.createWall(0, 4, -39, 78, 8, 2);
        this.createWall(0, 4, 39, 78, 8, 2);
        this.createWall(-39, 4, 0, 2, 8, 78);
        this.createWall(39, 4, 0, 2, 8, 78);

        // Shipment Container Colors
        const RED = 0xb22222;
        const BLUE = 0x1e90ff;
        const YELLOW = 0xda1010;
        const GREEN = 0x2e8b57;

        // Center Cross Shipment Containers
        this.createContainer(-6, 0, RED, Math.PI / 2);
        this.createContainer(6, 0, BLUE, Math.PI / 2);
        this.createContainer(0, -8, GREEN, 0);
        this.createContainer(0, 8, YELLOW, 0);

        // Corner Container Stacks
        this.createContainer(-18, -18, BLUE, 0);
        this.createContainer(-18, -18, RED, 0, 3.2); // Stacked top
        this.createContainer(18, -18, RED, Math.PI / 2);
        this.createContainer(-18, 18, YELLOW, Math.PI / 2);
        this.createContainer(18, 18, GREEN, 0);

        // Wooden Crates & Oil Drums
        this.createCrate(-10, 10, 2);
        this.createCrate(-10, 12, 2);
        this.createCrate(12, -10, 2.5);
        this.createCrate(14, -10, 2);
        
        this.createBarrel(-12, -8);
        this.createBarrel(-11, -6);
        this.createBarrel(10, 12);
    }

    createContainer(x, z, colorHex, rotation = 0, yOffset = 1.6) {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4, metalness: 0.3 });
        
        // Container Main Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(3, 3.2, 8), mat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        group.position.set(x, yOffset, z);
        group.rotation.y = rotation;
        this.scene.add(group);

        const width = (rotation === 0) ? 3 : 8;
        const depth = (rotation === 0) ? 8 : 3;
        this.physics.addBox(new THREE.Vector3(x, yOffset, z), new THREE.Vector3(width, 3.2, depth), true);
    }

    createWall(x, y, z, w, h, d) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        wall.position.set(x, y, z);
        this.scene.add(wall);
        this.physics.addBox(new THREE.Vector3(x, y, z), new THREE.Vector3(w, h, d), true);
    }

    createCrate(x, z, size) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
        const crate = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
        crate.position.set(x, size / 2, z);
        crate.castShadow = true;
        this.scene.add(crate);
        this.physics.addBox(new THREE.Vector3(x, size / 2, z), new THREE.Vector3(size, size, size), true);
    }

    createBarrel(x, z) {
        const mat = new THREE.MeshStandardMaterial({ color: 0xcc3333, metalness: 0.5 });
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 12), mat);
        barrel.position.set(x, 0.9, z);
        barrel.castShadow = true;
        this.scene.add(barrel);
        this.physics.addBox(new THREE.Vector3(x, 0.9, z), new THREE.Vector3(1.2, 1.8, 1.2), true);
    }
}
