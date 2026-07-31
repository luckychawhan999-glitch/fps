class UIManager {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('btn-singleplayer').addEventListener('click', () => {
            this.showScreen('hud');
            window.gameInstance.startSingleplayer();
        });

        document.getElementById('btn-multiplayer').addEventListener('click', () => {
            this.showScreen('multiplayer-menu');
        });

        document.getElementById('btn-mp-back').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('btn-create-room').addEventListener('click', () => {
            audioManager.init();
            network.initHost((code) => {
                document.getElementById('display-room-code').innerText = code;
                this.showScreen('lobby-panel');
            });
        });

        document.getElementById('btn-join-room').addEventListener('click', () => {
            audioManager.init();
            const code = document.getElementById('room-code-input').value;
            if (code) {
                network.joinRoom(code, () => {
                    this.showScreen('hud');
                    window.gameInstance.startMultiplayer();
                });
            }
        });

        document.getElementById('btn-copy-code').addEventListener('click', () => {
            const code = document.getElementById('display-room-code').innerText;
            navigator.clipboard.writeText(code);
            alert("Room Code Copied to Clipboard!");
        });

        document.getElementById('btn-start-match').addEventListener('click', () => {
            this.showScreen('hud');
            window.gameInstance.startMultiplayer();
        });
    }

    showScreen(screenId) {
        const panels = ['main-menu', 'multiplayer-menu', 'lobby-panel', 'settings-menu', 'hud'];
        panels.forEach(id => {
            const elem = document.getElementById(id);
            if (id === screenId) elem.classList.remove('hidden');
            else elem.classList.add('hidden');
        });
    }

    updateHUD(player) {
        document.getElementById('health-bar-fill').style.width = `${player.health}%`;
        document.getElementById('health-value').innerText = Math.max(0, player.health);
        document.getElementById('ammo-cur').innerText = player.weaponSystem.ammoCurrent;
        document.getElementById('ammo-max').innerText = player.weaponSystem.weaponData.ammoMax || '∞';
        document.getElementById('weapon-name').innerText = player.weaponSystem.weaponData.name;
    }

    addKillfeedEntry(killer, victim, isHeadshot) {
        const feed = document.getElementById('kill-feed');
        const item = document.createElement('div');
        item.className = 'kf-item';
        item.innerHTML = `${killer} <span style="color:#ff3355;">Eliminated</span> ${victim} ${isHeadshot ? '💥' : ''}`;
        feed.appendChild(item);

        setTimeout(() => item.remove(), 4000);
    }
}