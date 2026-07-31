class ParticleEffects {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.tracers = [];
    }

    // Bullet tracer line
    createTracer(fromPos, toPos) {
        const material = new THREE.LineBasicMaterial({
            color: 0xffe600,
            transparent: true,
            opacity: 0.9
        });
        const points = [fromPos, toPos];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);

        this.scene.add(line);
        this.tracers.push({ mesh: line, createdAt: Date.now(), duration: 80 });
    }

    // Blocky particle hit sparks (Roblox Style)
    createHitSparks(pos, color = 0xffcc00) {
        const pCount = 12;
        const geom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const mat = new THREE.MeshBasicMaterial({ color: color });

        for (let i = 0; i < pCount; i++) {
            const p = new THREE.Mesh(geom, mat);
            p.position.copy(pos);
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 6 + 2,
                (Math.random() - 0.5) * 8
            );
            this.scene.add(p);
            this.particles.push({ mesh: p, vel: vel, life: 1.0 });
        }
    }

    // Black and white cinematic impact frames for Sniper shots
    triggerSniperImpactFrames() {
        const overlay = document.getElementById('impact-overlay');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('hidden'), 50);
    }

    update(delta) {
        const now = Date.now();

        // Update tracers
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const t = this.tracers[i];
            if (now - t.createdAt > t.duration) {
                this.scene.remove(t.mesh);
                t.mesh.geometry.dispose();
                t.mesh.material.dispose();
                this.tracers.splice(i, 1);
            }
        }

        // Update particle debris physics
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta * 3.0;
            p.vel.y -= 20.0 * delta; // particle gravity
            p.mesh.position.addScaledVector(p.vel, delta);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    }
}