class UIManager {
    constructor(game) {
        this.game = game;

        this.healthFill = document.getElementById('health-fill');
        this.ammoCurrent = document.getElementById('ammo-current');
        this.ammoMax = document.getElementById('ammo-max');
        this.killfeedContainer = document.getElementById('killfeed-container');

        this.setupSmartMenuListeners();
    }

    setupSmartMenuListeners() {
        // Global listener: Auto-detects ANY button clicked on the page
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const text = (btn.innerText || "").toLowerCase();
            const id = (btn.id || "").toLowerCase();

            // Training / Singleplayer Button
            if (text.includes('train') || text.includes('single') || id.includes('train') || id.includes('sp')) {
                this.hideMenu();
                this.game.startSingleplayer();
            } 
            // Multiplayer / Host Button
            else if (text.includes('multi') || text.includes('host') || text.includes('create') || id.includes('multi') || id.includes('host')) {
                this.hideMenu();
                this.game.startMultiplayer();
                if (window.network) {
                    window.network.initHost((code) => {
                        alert(`ROOM CREATED!\nRoom Code: ${code}\nSend this code to your friend to join!`);
                    });
                }
            } 
            // Join Room Button
            else if (text.includes('join') || id.includes('join')) {
                const code = prompt("Enter 6-character Room Code:");
                if (code && window.network) {
                    this.hideMenu();
                    this.game.startMultiplayer();
                    window.network.joinRoom(code, () => {
                        alert("Successfully connected to room!");
                    });
                }
            }
        });
    }

    hideMenu() {
        // Searches for and hides any menu container or overlay on screen
        const menuSelectors = ['#menu-container', '#main-menu', '#menu', '.menu', '.overlay', '#ui-overlay'];
        menuSelectors.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.display = 'none';
        });
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
        entry.style.cssText = "background: rgba(0,0,0,0.75); color: #fff; padding: 6px 12px; margin-bottom: 4px; border-radius: 4px; font-weight: bold; font-family: sans-serif; font-size: 14px;";
        
        const emoji = isHead ? "☠️" : "💀";
        entry.innerHTML = `<span style="color:#ff4757">${killer}</span> ${emoji} <span style="color:#1e90ff">${victim}</span>`;

        this.killfeedContainer.appendChild(entry);

        setTimeout(() => {
            entry.remove();
        }, 4000);
    }
}
