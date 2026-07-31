class Game {
    constructor() {
        window.gameInstance = this;

        this.canvas = document.getElementById('game-canvas');
        this.mode = 'MENU'; // MENU, SINGLEPLAYER, MULTIPLAYER

        // Three.js Core Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Vibrant Sky Blue

        this.camera = new THREE.PerspectiveCamera(CONFIG.FOV, window.innerWidth / window.innerHeight, CONFIG.NEAR, CONFIG.FAR);
        
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        // Add Lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(20, 40, 20);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Modules Initialization
        this.physics = new PhysicsWorld();
        this.effects = new ParticleEffects(this.scene);
        this.arena = new ArenaMap(this.scene, this.physics);
        this.player = new PlayerController(this.camera, this.scene, this.physics, this.effects);
        this.ui = new UIManager();
        
        this.raycaster = new THREE.Raycaster();
        this.clock = new THREE.Clock();

        this.setupEvents();
        this.animate();
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Pointer Lock Controls for First Person Camera
        this.canvas.addEventListener('click', () => {
            if (this.mode !== 'MENU') this.canvas.requestPointerLock();
        });

        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas) {
                this.camera.rotation.y -= e.movementX * 0.002;
                this.camera.rotation.x -= e.movementY * 0.002;
                this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0 && document.pointerLockElement === this.canvas) {
                let targets = [];
                if (this.mode === 'SINGLEPLAYER') targets = this.spMode.getHitTargets();

                const result = this.player.weaponSystem.shoot(this.raycaster, targets, this.player.body.velocity);
                
                if (this.mode === 'SINGLEPLAYER') {
                    this.spMode.onShotFired(result);
                }
            }
        });
    }

    startSingleplayer() {
        this.mode = 'SINGLEPLAYER';
        this.spMode = new SingleplayerMode(this);
    }

    startMultiplayer() {
        this.mode = 'MULTIPLAYER';
        this.mpMode = new MultiplayerMode(this);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (this.mode !== 'MENU') {
            this.physics.update(delta);
            this.player.update(delta);
            this.effects.update(delta);
            this.ui.updateHUD(this.player);

            if (this.mode === 'MULTIPLAYER' && this.mpMode) {
                this.mpMode.update();
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Start Game On Load
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});