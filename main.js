// Safety guard: Prevents game from crashing if audio is missing
if (typeof window.audioManager === 'undefined') {
    window.audioManager = {
        playDash: () => {},
        playShoot: () => {},
        playHit: () => {}
    };
}

class Game {
    constructor() {
        window.gameInstance = this;

        this.canvas = document.getElementById('game-canvas');
        this.mode = 'SINGLEPLAYER'; // Start directly in game so controls work instantly!

        // Three.js Core Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(CONFIG.FOV, window.innerWidth / window.innerHeight, CONFIG.NEAR, CONFIG.FAR);
        this.camera.rotation.order = 'YXZ'; // Prevents flipped axis bug

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

        // Click anywhere to lock pointer and hide menu
        const clickHandler = () => {
            if (this.ui) this.ui.hideMenu();
            this.canvas.requestPointerLock();
        };

        this.canvas.addEventListener('click', clickHandler);
        document.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                clickHandler();
            }
        });

        // Mouse look around (Works whenever Pointer Lock is active)
        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas && !this.player.isDead) {
                const sens = 0.0025;
                this.camera.rotation.y -= e.movementX * sens;
                this.camera.rotation.x -= e.movementY * sens;
                
                // Clamp look up/down limits
                this.camera.rotation.x = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, this.camera.rotation.x));
            }
        });

        // Left Click Shoot
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

        // Movement & physics update loop
        this.physics.update(delta);
        this.player.update(delta);
        this.effects.update(delta);
        this.ui.updateHUD(this.player);

        if (this.mode === 'MULTIPLAYER' && this.mpMode) {
            this.mpMode.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
