class SingleplayerMode {
    constructor(game) {
        this.game = game;
        this.targets = [];
        this.spawnDummies();
    }

    spawnDummies() {
        // Clean old dummies
        this.targets.forEach(t => {
            if (t.parentDummy) this.game.scene.remove(t.parentDummy);
        });
        this.targets = [];

        // Spawn 5 Red Practice Dummies around the CODM Shipment arena
        for (let i = 0; i < 5; i++) {
            const dummy = this.game.player.createRobloxCharacterMesh(0xb22222);
            dummy.visible = true; // Ensure practice dummies are visible

            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            dummy.position.set(x, 1, z);

            this.game.scene.add(dummy);

            dummy.children.forEach(child => {
                child.parentDummy = dummy;
                this.targets.push(child);
            });
        }
    }

    getHitTargets() {
        return this.targets;
    }

    onShotFired(result) {
        if (!result || !result.target) return;

        const dummy = result.target.parentDummy || result.target.parent;
        if (dummy) {
            // Register Kill in HUD
            this.game.ui.addKillfeedEntry("YOU", "DUMMY", result.isHead);

            // Respawn dummy at random new location on map
            dummy.position.x = (Math.random() - 0.5) * 40;
            dummy.position.z = (Math.random() - 0.5) * 40;
        }
    }
}
