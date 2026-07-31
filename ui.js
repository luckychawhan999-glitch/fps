class UIManager {
    constructor(game) {
        this.game = game;

        this.menuContainer = document.getElementById('menu-container');
        this.singleplayerBtn = document.getElementById('singleplayer-btn');
        this.multiplayerBtn = document.getElementById('multiplayer-btn');
        this.hostBtn = document.getElementById('host-btn');
        this.joinBtn = document.getElementById('join-btn');

        this.healthFill = document.getElementById('health-fill');
        this.ammoCurrent = document.getElementById('ammo-current');
        this.ammoMax = document.getElementById('ammo-max');
        this.killfeedContainer = document.getElementById('killfeed-container');

        this.setupMenuListeners();
    }

    setupMenuListeners() {
        if (this.singleplayerBtn) {
            this.singleplayerBtn.addEventListener('click', () => {
                this.game.startSingleplayer();
            });
        }

        if (this.hostBtn) {
            this.hostBtn.addEventListener('click', () => {
                this.game.startMultiplayer();
                if (network) {
                    network.initHost((code) => {
                        alert(`ROOM CREATED! Your Code: ${code}\nSend this code to your friend!`);
                    });
                }
            });
        }

        if (this.joinBtn) {
            this.joinBtn.addEventListener('click', () => {
                const code = prompt("Enter Room Code:");
                if (code && network) {
                    this.game.startMultiplayer();
                    network.joinRoom(code, () => {
                        alert("Connected to Room!");
                    });
                }
            });
        }
    }

    hideMenu() {
        if (this.menuContainer) {
            this.menuContainer.style.display = 'none';
        }
    }

    updateHUD(player) {
        if (this.healthFill) {
            this.healthFill.style.width = `${player.health}%`;
        }
        if (this.ammoCurrent && this.ammoMax) {
            this.ammoCurrent.innerText = player.weaponSystem.currentAmmo;
            this.ammoMax.innerText = player.weaponSystem.currentWeapon.magSize;
        }
    }

    addKillfeedEntry(killer, victim, isHead) {
        if (!this.killfeedContainer) return;

        const entry = document.createElement('div');
        entry.style.cssText = "background: rgba(0,0,0,0.7); color: #fff; padding: 4px 10px; margin-bottom: 4px; border-radius: 4px; font-weight: bold; font-family: monospace;";
        
        const emoji = isHead ? "☠️" : "💀";
        entry.innerHTML = `<span style="color:#ff4757">${killer}</span> ${emoji} <span style="color:#1e90ff">${victim}</span>`;

        this.killfeedContainer.appendChild(entry);

        setTimeout(() => {
            entry.remove();
        }, 4000);
    }
}
