class WeaponSystem {
    constructor(camera, effects) {
        this.camera = camera;
        this.effects = effects;

        this.currentWeaponKey = 'RIFLE';
        this.currentWeapon = CONFIG.WEAPONS.RIFLE;
        this.currentAmmo = this.currentWeapon.magSize;
        this.isReloading = false;
        this.isScoped = false;
        this.lastShotTime = 0;

        // Weapon Models Rig attached directly to FPS Camera
        this.weaponRig = new THREE.Group();
        this.camera.add(this.weaponRig);
        this.weaponModels = {};

        this.buildWeaponModels();
        this.selectWeapon('RIFLE');
    }

    buildWeaponModels() {
        // 1. Katana (Key 1)
        const katana = new THREE.Group();
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.08), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 }));
        blade.position.set(0, 0.5, 0);
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        handle.position.set(0, -0.1, 0);
        katana.add(blade, handle);
        katana.position.set(0.3, -0.3, -0.5);
        katana.rotation.x = Math.PI / 4;
        this.weaponRig.add(katana);
        this.weaponModels['KNIFE'] = katana;

        // 2. Pistol (Key 2)
        const pistol = new THREE.Group();
        const pBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.4), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        const pGrip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.25, 0.12), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        pGrip.position.set(0, -0.15, 0.1);
        pGrip.rotation.x = -0.2;
        pistol.add(pBody, pGrip);
        pistol.position.set(0.25, -0.25, -0.4);
        this.weaponRig.add(pistol);
        this.weaponModels['PISTOL'] = pistol;

        // 3. Assault Rifle with COD Red Holo Sight (Key 3)
        const rifle = new THREE.Group();
        const rBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.8), new THREE.MeshStandardMaterial({ color: 0x2d3436 }));
        const rMag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.12), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        rMag.position.set(0, -0.2, 0);
        
        const sightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.15), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        sightFrame.position.set(0, 0.12, -0.1);
        const reticle = new THREE.Mesh(new THREE.RingGeometry(0.015, 0.02, 16), new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
        reticle.position.set(0, 0.12, -0.12);

        rifle.add(rBody, rMag, sightFrame, reticle);
        rifle.position.set(0.25, -0.25, -0.5);
        this.weaponRig.add(rifle);
        this.weaponModels['RIFLE'] = rifle;

        // 4. Sniper Rifle (Key 4)
        const sniper = new THREE.Group();
        const sBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 1.2), new THREE.MeshStandardMaterial({ color: 0x353b48 }));
        const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), new THREE.MeshStandardMaterial({ color: 0x000000 }));
        scope.rotation.x = Math.PI / 2;
        scope.position.set(0, 0.12, -0.1);
        sniper.add(sBody, scope);
        sniper.position.set(0.25, -0.25, -0.6);
        this.weaponRig.add(sniper);
        this.weaponModels['SNIPER'] = sniper;
    }

    selectWeapon(key) {
        if (!CONFIG.WEAPONS[key]) return;
        this.currentWeaponKey = key;
        this.currentWeapon = CONFIG.WEAPONS[key];
        this.currentAmmo = this.currentWeapon.magSize;
        
        Object.keys(this.weaponModels).forEach(k => {
            if (this.weaponModels[k]) {
                this.weaponModels[k].visible = (k === key);
            }
        });
    }

    shoot(raycaster, targets, playerVel) {
        if (window.gameInstance && window.gameInstance.player.isDead) return null;

        const now = performance.now();
        if (now - this.lastShotTime < this.currentWeapon.fireRate) return null;
        if (this.currentAmmo <= 0) {
            this.reload();
            return null;
        }

        this.lastShotTime = now;
        this.currentAmmo--;

        if (window.audioManager && window.audioManager.playShoot) {
            window.audioManager.playShoot(this.currentWeaponKey);
        }

        const activeModel = this.weaponModels[this.currentWeaponKey];
        if (activeModel) {
            this.effects.createMuzzleFlash(activeModel.position);
        }

        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = raycaster.intersectObjects(targets, true);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const isHead = (hit.object.name === 'HEAD');
            const damage = isHead ? this.currentWeapon.damage * CONFIG.HEADSHOT_MULTIPLIER : this.currentWeapon.damage;

            this.effects.createHitEffect(hit.point);
            
            if (window.audioManager && window.audioManager.playHit) {
                window.audioManager.playHit();
            }

            return { target: hit.object, damage: damage, isHead: isHead, point: hit.point };
        }

        return null;
    }

    reload() {
        if (this.isReloading) return;
        this.isReloading = true;
        setTimeout(() => {
            this.currentAmmo = this.currentWeapon.magSize;
            this.isReloading = false;
        }, this.currentWeapon.reloadTime);
    }

    toggleScope() {
        this.isScoped = !this.isScoped;
        this.camera.fov = this.isScoped ? CONFIG.FOV / this.currentWeapon.zoomFactor : CONFIG.FOV;
        this.camera.updateProjectionMatrix();
    }
}
