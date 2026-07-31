class UIManager {
    constructor() {
        this.healthFill = document.getElementById('health-fill');
        this.ammoCurrent = document.getElementById('ammo-current');
        this.ammoMax = document.getElementById('ammo-max');
        this.killfeedContainer = document.getElementById('killfeed-container');
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
        
        // EMOJIS: ☠️ for Headshot, 💀 for Bodyshot
        const emoji = isHead ? "☠️" : "💀";
        entry.innerHTML = `<span style="color:#ff4757">${killer}</span> ${emoji} <span style="color:#1e90ff">${victim}</span>`;

        this.killfeedContainer.appendChild(entry);

        setTimeout(() => {
            entry.remove();
        }, 4000);
    }
}
