class MultiplayerMode {
    constructor(game) {
        this.game = game;
        this.network = network;
        this.setupNetworkHandlers();
    }

    setupNetworkHandlers() {
        this.network.onDataReceived = (data, senderId) => {
            if (data.type === 'PLAYER_SYNC') {
                this.updateRemotePlayer(senderId, data);
            }
        };
    }

    updateRemotePlayer(id, data) {
        let p = this.network.remotePlayers[id];
        if (!p) {
            // Instantiate remote Roblox Mesh character
            p = this.game.player.createRobloxCharacterMesh(CONFIG.COLORS.DUMMY_YELLOW);
            this.game.scene.add(p);
            this.network.remotePlayers[id] = p;
        }

        // Smooth Interpolation (LERP)
        p.position.lerp(new THREE.Vector3(data.x, data.y, data.z), 0.3);
        p.rotation.y = data.rotY;
    }

    sendLocalState() {
        const p = this.game.player;
        this.network.broadcast({
            type: 'PLAYER_SYNC',
            x: p.body.position.x,
            y: p.body.position.y,
            z: p.body.position.z,
            rotY: p.camera.rotation.y
        });
    }

    update() {
        if (this.network.peer) {
            this.sendLocalState();
        }
    }
}