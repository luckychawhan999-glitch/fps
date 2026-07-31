class Game {
    constructor() {
        window.gameInstance = this;

        this.canvas = document.getElementById('game-canvas');
        this.mode = 'MENU'; // Starts in MENU, switches on click/play

        // Three.js Core Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(CONFIG.FOV, window.innerWidth / window.innerHeight, CONFIG.NEAR, CONFIG.FAR);
        this.camera.rotation.order = 'YXZ'; // Prevents flipped camera bug

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        // Modules
        this.physics = new PhysicsWorld();
        this.effects = new ParticleEffects(this.scene);
        this.arena = new ArenaMap(this.scene, this.physics);
        this.player = new PlayerController(this.camera, this.scene, this.physics, this.effects);
        this.ui = new UIManager(this);

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

        // Click canvas to request pointer lock & start game if stuck
        this.canvas.addEventListener('click', () => {
            if (this.mode === 'MENU') {
                this.startSingleplayer(); // Default to practice if clicked directly
            }
            this.canvas.requestPointerLock();
        });

        // Look around controls (Mouse movement)
        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas && !this.player.isDead) {
                const sens = 0.002;
                this.camera.rotation.y -= e.movementX * sens;
                this.camera.rotation.x -= e.movementY * sens;
                
                // Clamp up/down looking angle
                this.camera.rotation.x = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, this.camera.rotation.x));
            }
        });

        // Shooting listener
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0 && document.pointerLockElement === this.canvas) {
                if (this.player.isDead) return;

                let targets = [];
                if (this.mode === 'SINGLEPLAYER' && this.spMode) {
                    targets = this.spMode.getHitTargets();
                } else if (this.mode === 'MULTIPLAYER' && this.mpMode) {
                    targets = this.mpMode.getRemoteHitTargets();
                }

                const result = this.player.weaponSystem.shoot(this.raycaster, targets, this.player.body.velocity);

                if (result) {
                    if (this.mode === 'SINGLEPLAYER' && this.spMode) {
                        this.spMode.onShotFired(result);
                    } else if (this.mode === 'MULTIPLAYER' && this.mpMode) {
                        this.mpMode.onShotFired(result);
                    }
                }
            }
        });
    }

    startSingleplayer() {
        this.mode = 'SINGLEPLAYER';
        if (this.ui) this.ui.hideMenu();
        if (!this.spMode) this.spMode = new SingleplayerMode(this);
        this.canvas.requestPointerLock();
    }

    startMultiplayer() {
        this.mode = 'MULTIPLAYER';
        if (this.ui) this.ui.hideMenu();
        if (!this.mpMode) this.mpMode = new MultiplayerMode(this);
        this.canvas.requestPointerLock();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // Update loop ALWAYS runs when not in MENU
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

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
