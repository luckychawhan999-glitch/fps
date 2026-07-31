class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, CONFIG.GRAVITY, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.bodies = [];
    }

    addBox(position, dimensions, isStatic = true) {
        const shape = new CANNON.Box(new CANNON.Vec3(dimensions.x / 2, dimensions.y / 2, dimensions.z / 2));
        const body = new CANNON.Body({
            mass: isStatic ? 0 : 1,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        body.addShape(shape);
        this.world.addBody(body);
        this.bodies.push(body);
        return body;
    }

    update(delta) {
        this.world.step(1 / 60, delta, 3);
    }
}