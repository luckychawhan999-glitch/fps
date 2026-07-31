class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.8;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }

    setVolume(vol) {
        this.masterVolume = vol;
    }

    // Synthesize noise buffer for gunshots and impacts
    _createNoiseBuffer(duration = 0.2) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    playShoot(weaponType) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._createNoiseBuffer(weaponType === 'SNIPER' ? 0.6 : 0.2);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";

        if (weaponType === 'SNIPER') {
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
            filter.frequency.setValueAtTime(3000, now);
            gain.gain.setValueAtTime(1.0 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        } else if (weaponType === 'RIFLE') {
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
            filter.frequency.setValueAtTime(2000, now);
            gain.gain.setValueAtTime(0.7 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        } else { // Pistol
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
            filter.frequency.setValueAtTime(1500, now);
            gain.gain.setValueAtTime(0.5 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        }

        noise.connect(filter);
        filter.connect(gain);
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    playHit(isHeadshot = false) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isHeadshot ? "triangle" : "sine";
        osc.frequency.setValueAtTime(isHeadshot ? 1200 : 600, now);
        osc.frequency.exponentialRampToValueAtTime(isHeadshot ? 1800 : 400, now + 0.1);

        gain.gain.setValueAtTime(0.6 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playDash() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._createNoiseBuffer(0.25);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(200, now + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }
}

const audioManager = new SoundEngine();