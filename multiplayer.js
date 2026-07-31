class MultiplayerMode {
    constructor(game) {
        this.game = game;
        this.network = network;
        this.remoteData = {}; // Stores remote player info and meshes
        this.setupNetworkHandlers();
    }

    setupNetworkHandlers() {
        this.network.onDataReceived = (data, senderId) => {
            if (data.type === 'PLAYER_SYNC') {
                this.updateRemotePlayer(senderId, data);
            } else if (data.type === 'DAMAGE_TAKEN') {
                if (data.targetId === this.network.peer.id) {
                    const killed = this.game.player.takeDamage(data.damage);
                    if (killed) {
                        this.network.broadcast({
                            type: 'KILL_EVENT',
                            killer: data.attacker,
                            victim: "PLAYER",
                            isHead: data.isHead
                        });
                        this.game.ui.addKillfeedEntry(data.attacker, "YOU", data.isHead);
                    }
                }
            } else if (data.type === 'KILL_EVENT') {
                this.game.ui.addKillfeedEntry(data.killer, data.victim, data.isHead);
            }
        };
    }

    getRemoteHitTargets() {
        const targets = [];
        Object.values(this.remoteData).forEach(remote => {
            if (remote.mesh && remote.mesh.visible) {
                remote.mesh.children.forEach(child => {
                    child.ownerId = remote.id;
                    targets.push(child);
                });
            }
        });
        return targets;
    }

    onShotFired(result) {
        if (!result || !result.target) return;
        const targetOwnerId = result.target.ownerId;

        if (targetOwnerId) {
            this.network.broadcast({
                type: 'DAMAGE_TAKEN',
                targetId: targetOwnerId,
                damage: result.damage,
                isHead: result.isHead,
                attacker: "PLAYER"
            });
        }
    }

    updateRemotePlayer(id, data) {
        if (!this.remoteData[id]) {
            const mesh = this.game.player.createRobloxCharacterMesh(CONFIG.COLORS.CONTAINER_RED);
            this.game.scene.add(mesh);
            this.remoteData[id] = { id: id, mesh: mesh };
        }

        const remote = this.remoteData[id];
        remote.mesh.position.lerp(new THREE.Vector3(data.x, data.y, data.z), 0.4);
        remote.mesh.rotation.y = data.rotY;
        remote.mesh.visible = !data.isDead;
    }

    sendLocalState() {
        const p = this.game.player;
        this.network.broadcast({
            type: 'PLAYER_SYNC',
            x: p.body.position.x,
            y: p.body.position.y,
            z: p.body.position.z,
            rotY: p.camera.rotation.y,
            isDead: p.isDead
        });
    }

    update() {
        if (this.network.peer) {
            this.sendLocalState();
        }
    }
}
