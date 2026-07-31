class SingleplayerMode {
    constructor(game) {
        this.game = game;
        this.kills = 0;
        this.headshots = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.streak = 0;

        this.dummies = [];
        this.initTargets();
    }

    initTargets() {
        for (let i = 0; i < 4; i++) {
            const pos = new THREE.Vector3((Math.random() - 0.5) * 40, 0, -10 - Math.random() * 30);
            const dummy = new DummyTarget(this.game.scene, this.game.physics, pos);
            this.dummies.push(dummy);
        }
    }

    getHitTargets() {
        const targets = [];
        this.dummies.forEach(d => {
            if (!d.isDead) {
                targets.push(d.head, d.torso);
            }
        });
        return targets;
    }

    onShotFired(result) {
        this.shotsFired++;
        if (result) {
            this.shotsHit++;
            const dummyObj = this.dummies.find(d => d.head === result.target || d.torso === result.target);
            if (dummyObj) {
                const killed = dummyObj.takeDamage(result.damage);
                if (result.isHead) this.headshots++;

                if (killed) {
                    this.kills++;
                    this.streak++;
                    this.game.ui.addKillfeedEntry("PLAYER", "TARGET DUMMY", result.isHead);

                    // Respawn target after delay in random location
                    setTimeout(() => {
                        const newPos = new THREE.Vector3((Math.random() - 0.5) * 50, 0, -10 - Math.random() * 30);
                        dummyObj.respawn(newPos);
                    }, 1000);
                }
            }
        } else {
            this.streak = 0;
        }

        this.updateStatsUI();
    }

    updateStatsUI() {
        document.getElementById('sp-kills').innerText = this.kills;
        document.getElementById('sp-headshots').innerText = this.headshots;
        document.getElementById('sp-streak').innerText = this.streak;
        const acc = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 100;
        document.getElementById('sp-acc').innerText = `${acc}%`;
    }
}