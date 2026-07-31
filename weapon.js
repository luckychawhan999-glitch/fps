class WeaponSystem {
    constructor(camera, effects) {
        this.camera = camera;
        this.effects = effects;
        this.currentWeaponKey = 'RIFLE';
        this.weaponData = CONFIG.WEAPONS.RIFLE;
        
        this.ammoCurrent = this.weaponData.ammoMax;
        this.isReloading = false;
        this.isScoped = false;
        this.lastFired = 0;

        this.weaponContainer = new THREE.Group();
        this.camera.add(this.weaponContainer);
        this.buildWeaponMeshes();
        this.selectWeapon('RIFLE');
    }

    buildWeaponMeshes() {
        // Procedural 3D Weapon Models attached to camera
        this.meshes = {};

        // Katana
        const katanaGroup = new THREE.Group();
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 1.2, 0.05),
            new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
        );
        blade.position.set(0.3, -0.2, -0.6);
        katanaGroup.add(blade);
        this.meshes.KNIFE = katanaGroup;

        // Assault Rifle
        const rifleGroup = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.2, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x1a1d24 })
        );
        body.position.set(0.25, -0.25, -0.5);
        rifleGroup.add(body);
        this.meshes.RIFLE = rifleGroup;

        // Pistol
        const pistolGroup = new THREE.Group();
        const pBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.15, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        pBody.position.set(0.2, -0.2, -0.4);
        pistolGroup.add(pBody);
        this.meshes.PISTOL = pistolGroup;

        // Sniper
        const sniperGroup = new THREE.Group();
        const sBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.22, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x0d0e12 })
        );
        sBody.position.set(0.25, -0.25, -0.7);
        sniperGroup.add(sBody);
        this.meshes.SNIPER = sniperGroup;

        Object.values(this.meshes).forEach(m => {
            m.visible = false;
            this.weaponContainer.add(m);
        });
    }

    selectWeapon(key) {
        if (!CONFIG.WEAPONS[key] || this.isReloading) return;
        
        Object.keys(this.meshes).forEach(k => this.meshes[k].visible = false);
        
        this.currentWeaponKey = key;
        this.weaponData = CONFIG.WEAPONS[key];
        this.meshes[key].visible = true;
        this.ammoCurrent = this.weaponData.ammoMax || 0;
        this.isScoped = false;
        document.getElementById('sniper-scope').classList.add('hidden');
    }

    shoot(raycaster, targets, playerVelocity) {
        const now = Date.now();
        if (now - this.lastFired < this.weaponData.fireRate || this.isReloading) return null;
        if (this.weaponData.type !== 'MELEE' && this.ammoCurrent <= 0) {
            this.reload();
            return null;
        }

        this.lastFired = now;
        if (this.weaponData.type !== 'MELEE') this.ammoCurrent--;

        audioManager.playShoot(this.currentWeaponKey);

        // Recoil effect
        this.camera.rotation.x += this.weaponData.recoil || 0.02;

        // Sniper Pushback Momentum & Impact Frame FX
        if (this.currentWeaponKey === 'SNIPER') {
            playerVelocity.z += this.weaponData.pushback;
            this.effects.triggerSniperImpactFrames();
            if (this.isScoped) this.toggleScope(); // Auto un-scope after shot
        }

        // Raycast Hit Detection
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = raycaster.intersectObjects(targets, true);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const isHead = hit.object.name === 'HEAD';
            const damage = this.weaponData.damage * (isHead ? (this.weaponData.headshotMult || 1) : 1);

            // Create hit particle FX
            this.effects.createHitSparks(hit.point, isHead ? 0xff0055 : 0xffcc00);
            
            // Bullet Tracer
            const muzzlePos = new THREE.Vector3().setFromMatrixPosition(this.meshes[this.currentWeaponKey].matrixWorld);
            this.effects.createTracer(muzzlePos, hit.point);

            audioManager.playHit(isHead);

            return { target: hit.object, damage: damage, isHead: isHead };
        }

        return null;
    }

    toggleScope() {
        if (this.currentWeaponKey !== 'SNIPER') return;
        this.isScoped = !this.isScoped;
        const scopeElem = document.getElementById('sniper-scope');
        
        if (this.isScoped) {
            scopeElem.classList.remove('hidden');
            this.camera.fov = 30;
        } else {
            scopeElem.classList.add('hidden');
            this.camera.fov = CONFIG.FOV;
        }
        this.camera.updateProjectionMatrix();
    }

    reload() {
        if (this.isReloading || this.weaponData.type === 'MELEE') return;
        this.isReloading = true;
        setTimeout(() => {
            this.ammoCurrent = this.weaponData.ammoMax;
            this.isReloading = false;
        }, this.weaponData.reloadTime);
    }
}