class ArenaMap {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.buildMap();
    }

    buildMap() {
        // Main Ground Floor Concrete Platform
        this._createBlock(new THREE.Vector3(0, -1, 0), new THREE.Vector3(120, 2, 120), CONFIG.COLORS.CONCRETE);

        // Surrounding Boundary Walls
        this._createBlock(new THREE.Vector3(0, 10, -60), new THREE.Vector3(120, 20, 2), CONFIG.COLORS.METAL_DARK);
        this._createBlock(new THREE.Vector3(0, 10, 60), new THREE.Vector3(120, 20, 2), CONFIG.COLORS.METAL_DARK);
        this._createBlock(new THREE.Vector3(-60, 10, 0), new THREE.Vector3(2, 20, 120), CONFIG.COLORS.METAL_DARK);
        this._createBlock(new THREE.Vector3(60, 10, 0), new THREE.Vector3(2, 20, 120), CONFIG.COLORS.METAL_DARK);

        // Shipping Containers (Bright Roblox Rivals Colors)
        this._createBlock(new THREE.Vector3(-15, 2.5, -10), new THREE.Vector3(6, 5, 14), CONFIG.COLORS.CONTAINER_BLUE);
        this._createBlock(new THREE.Vector3(15, 2.5, 10), new THREE.Vector3(6, 5, 14), CONFIG.COLORS.CONTAINER_RED);
        this._createBlock(new THREE.Vector3(0, 2.5, -25), new THREE.Vector3(14, 5, 6), CONFIG.COLORS.CONTAINER_YELLOW);

        // Elevated Sniper Platforms
        this._createBlock(new THREE.Vector3(-25, 7, -35), new THREE.Vector3(16, 1, 16), CONFIG.COLORS.CONCRETE);
        this._createBlock(new THREE.Vector3(25, 7, 35), new THREE.Vector3(16, 1, 16), CONFIG.COLORS.CONCRETE);

        // Center Tower
        this._createBlock(new THREE.Vector3(0, 5, 0), new THREE.Vector3(10, 10, 10), CONFIG.COLORS.METAL_DARK);
        this._createBlock(new THREE.Vector3(0, 10.5, 0), new THREE.Vector3(14, 1, 14), CONFIG.COLORS.CYAN_ACCENT);
    }

    _createBlock(pos, size, color) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4,
            metalness: 0.2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(pos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Physics Collider
        this.physics.addBox(pos, size, true);
    }
}