const CONFIG = {
    // Canvas & Graphics
    FOV: 90,
    NEAR: 0.1,
    FAR: 1000,
    
    // Player Motion & Physics
    PLAYER_SPEED: 12.0,
    PLAYER_DASH_SPEED: 32.0,
    PLAYER_JUMP_FORCE: 9.5,
    GRAVITY: -24.0,
    PLAYER_HEIGHT: 1.8,
    PLAYER_RADIUS: 0.5,
    
    // Weapons Configuration
    WEAPONS: {
        KNIFE: {
            id: 0,
            name: "KATANA",
            damage: 20,
            fireRate: 400, // ms
            range: 3.2,
            type: "MELEE"
        },
        PISTOL: {
            id: 1,
            name: "PISTOL",
            damage: 50,
            headshotMult: 2.0,
            ammoMax: 12,
            fireRate: 180,
            reloadTime: 1200,
            recoil: 0.03,
            type: "SEMI"
        },
        RIFLE: {
            id: 2,
            name: "ASSAULT RIFLE",
            damage: 25,
            headshotMult: 2.0,
            ammoMax: 20,
            fireRate: 100,
            reloadTime: 1800,
            recoil: 0.02,
            type: "AUTO"
        },
        SNIPER: {
            id: 3,
            name: "SNIPER RIFLE",
            damage: 120,
            headshotMult: 2.5,
            ammoMax: 5,
            fireRate: 1100,
            reloadTime: 2500,
            recoil: 0.15,
            pushback: 4.5,
            type: "BOLT"
        }
    },

    // Vibrant Roblox Rivals Palette
    COLORS: {
        CONCRETE: 0xd0d7de,
        CONTAINER_BLUE: 0x0088ff,
        CONTAINER_RED: 0xff2244,
        CONTAINER_YELLOW: 0xffbb00,
        METAL_DARK: 0x24292e,
        CYAN_ACCENT: 0x00f0ff,
        DUMMY_YELLOW: 0xffcc00,
        DUMMY_BLUE: 0x0066ff
    }
};