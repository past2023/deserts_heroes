// ============================================================
// AUDIO — effetti sonori e musica generati con WebAudio
// Bus separati: master → (sfx, music). Volumi salvati in localStorage.
// ============================================================
(function () {
  // Reuse the shell's persistent WebAudio engine across iframe navigation.
  // This preserves Safari activation and prevents Level 1 from starting muted.
  try {
    if (window.parent && window.parent !== window && window.parent.SFX) {
      window.SFX = window.parent.SFX;
      return;
    }
  } catch (e) {}

  let ctx = null;
  let masterGain = null, sfxGain = null, musicGain = null, compressor = null;
  let noiseCache = null;
  let muted = false;
  let musicOn = true;
  let musicTimer = null;
  let lastHitAt = -1;
  let lastCasingAt = -1;
  let stepVariant = 0;

  // volumi 0..1 — i default lasciano il volume percepito vicino all'originale
  let masterVol = 0.5, sfxVol = 0.7, musicVol = 0.7;

  function clamp01(v) { v = +v; return v < 0 ? 0 : v > 1 ? 1 : v; }

  // carica preferenze salvate
  try {
    const saved = JSON.parse(localStorage.getItem('ma_audio') || '{}');
    if (typeof saved.master === 'number') masterVol = clamp01(saved.master);
    if (typeof saved.sfx === 'number')    sfxVol = clamp01(saved.sfx);
    if (typeof saved.music === 'number')  musicVol = clamp01(saved.music);
    if (typeof saved.muted === 'boolean')   muted = saved.muted;
    if (typeof saved.musicOn === 'boolean') musicOn = saved.musicOn;
  } catch (e) {}

  function persist() {
    try {
      localStorage.setItem('ma_audio', JSON.stringify({
        master: masterVol, sfx: sfxVol, music: musicVol,
        muted: muted, musicOn: musicOn,
      }));
    } catch (e) {}
  }

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      sfxGain    = ctx.createGain();
      musicGain  = ctx.createGain();
      masterGain.gain.value = masterVol;
      sfxGain.gain.value    = sfxVol;
      musicGain.gain.value  = musicVol;
      sfxGain.connect(masterGain);
      musicGain.connect(masterGain);
      // A gentle dynamics stage keeps layered procedural gunshots punchy
      // without hard clipping when explosions and automatic fire overlap.
      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 16;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.18;
      masterGain.connect(compressor);
      compressor.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer() {
    const c = ensure();
    if (noiseCache) return noiseCache;
    const len = Math.max(1, Math.floor(c.sampleRate * 2));
    noiseCache = c.createBuffer(1, len, c.sampleRate);
    const d = noiseCache.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseCache;
  }

  // bus: 'sfx' (default) o 'music'
  function tone(freq, dur, type, vol, slideTo, when, bus) {
    if (muted) return;
    const c = ensure();
    const t = c.currentTime + (when || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(bus === 'music' ? musicGain : sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, vol, filterFreq, slideTo, when, bus) {
    if (muted) return;
    const c = ensure();
    const t = c.currentTime + (when || 0);
    const src = c.createBufferSource();
    src.buffer = noiseBuffer();
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(filterFreq, t);
    if (slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g);
    g.connect(bus === 'music' ? musicGain : sfxGain);
    const maxOffset = Math.max(0, src.buffer.duration - dur - 0.01);
    src.start(t, Math.random() * maxOffset, Math.min(dur, src.buffer.duration));
    src.stop(t + dur + 0.02);
  }

  const SFX = {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; if (window.MusicTracks) MusicTracks.setMuted(muted || !musicOn); persist(); return muted; },
    isMuted() { return muted; },

    pistol() {
      noise(0.07, 0.38, 6200, 900);
      tone(190, 0.075, 'triangle', 0.16, 72);
      tone(1450, 0.025, 'square', 0.045, 520);
    },
    flame() {
      noise(0.18, 0.2, 1250, 260);
      tone(86, 0.12, 'sawtooth', 0.045, 58);
    },
    alarm() {
      for (let i = 0; i < 3; i++) {
        tone(880, 0.18, 'square', 0.1, null, i * 0.4);
        tone(660, 0.18, 'square', 0.1, null, i * 0.4 + 0.2);
      }
    },
    waveClear() {
      tone(523, 0.1, 'square', 0.14);
      tone(784, 0.1, 'square', 0.14, null, 0.1);
      tone(1046, 0.16, 'square', 0.14, null, 0.2);
    },
    combo(level) {
      const n = Math.max(2, Math.min(12, level | 0));
      const root = 440 * Math.pow(2, (n - 2) / 12);
      tone(root, 0.055, 'square', 0.045, root * 1.25);
      tone(root * 1.5, 0.08, 'sine', 0.035, root * 2, 0.035);
    },
    mg() {
      noise(0.052, 0.31, 7200, 1100);
      tone(155, 0.055, 'sawtooth', 0.1, 48);
      tone(2100, 0.018, 'square', 0.035, 700);
    },
    spread() {
      noise(0.24, 0.58, 3600, 240);
      noise(0.075, 0.28, 7800, 1700, 0.01);
      tone(108, 0.2, 'triangle', 0.23, 32);
    },
    rocket() {
      noise(0.42, 0.42, 900, 2600);
      noise(0.12, 0.26, 6000, 900);
      tone(78, 0.34, 'sawtooth', 0.17, 190);
    },
    knife() { noise(0.08, 0.35, 6000, 1500); tone(900, 0.06, 'triangle', 0.12, 1400); },
    throwG() { tone(500, 0.12, 'triangle', 0.12, 900); },
    grenadeLaunch() {
      noise(0.15, 0.38, 1800, 320);
      tone(118, 0.18, 'triangle', 0.2, 46);
      tone(680, 0.045, 'square', 0.06, 260);
    },
    guidedLaunch() {
      noise(0.24, 0.3, 1100, 4200);
      tone(120, 0.28, 'sawtooth', 0.15, 360);
      tone(920, 0.08, 'square', 0.06, 1480);
      tone(1480, 0.055, 'triangle', 0.055, 2100, 0.065);
    },
    guidedReady() {
      tone(740, 0.07, 'square', 0.09);
      tone(980, 0.07, 'square', 0.09, null, 0.09);
      tone(1320, 0.14, 'triangle', 0.12, 1760, 0.18);
    },
    missileLock() {
      tone(1180, 0.045, 'square', 0.065);
      tone(1760, 0.065, 'sine', 0.075, 2100, 0.055);
    },
    ammoEmpty() {
      tone(1900, 0.025, 'square', 0.045, 900);
      tone(1150, 0.035, 'square', 0.04, 620, 0.045);
    },
    step() {
      stepVariant ^= 1;
      noise(0.045, 0.055, stepVariant ? 720 : 610, 180);
      tone(stepVariant ? 92 : 82, 0.055, 'triangle', 0.025, 55);
    },
    casingPing() {
      if (muted) return;
      const c = ensure();
      if (lastCasingAt >= 0 && c.currentTime - lastCasingAt < 0.08) return;
      lastCasingAt = c.currentTime;
      tone(2100 + Math.random() * 700, 0.035, 'triangle', 0.022, 1050);
    },
    hitConfirm(style) {
      if (muted) return;
      const c = ensure();
      if (lastHitAt >= 0 && c.currentTime - lastHitAt < 0.032) return;
      lastHitAt = c.currentTime;
      const energy = style === 'spread' || style === 'soldier06Laser' || (style && style.indexOf('enemy') === 0);
      tone(energy ? 920 : 640, 0.035, 'triangle', energy ? 0.055 : 0.04,
        energy ? 1450 : 320);
      noise(0.028, energy ? 0.07 : 0.05, energy ? 6200 : 4200, 1200);
    },
    enemyShot(style) {
      if (style === 'enemyTurret') {
        tone(310, 0.07, 'sawtooth', 0.085, 1050);
        noise(0.05, 0.14, 6800, 1300);
      } else if (style === 'enemyHeli') {
        tone(740, 0.09, 'square', 0.07, 260);
        noise(0.055, 0.1, 5200, 800);
      } else if (style === 'enemyGunship') {
        tone(980, 0.14, 'sawtooth', 0.09, 220);
        tone(1470, 0.055, 'sine', 0.05, 720);
        noise(0.08, 0.13, 7200, 1000);
      } else if (style === 'enemyBoss') {
        tone(170, 0.13, 'sawtooth', 0.14, 55);
        tone(680, 0.08, 'square', 0.07, 190);
        noise(0.11, 0.2, 4900, 420);
      } else {
        noise(0.055, 0.17, 5400, 850);
        tone(230, 0.055, 'triangle', 0.07, 82);
      }
    },
    introFly() {
      noise(1.55, 0.12, 820, 2400);
      tone(74, 1.5, 'sawtooth', 0.07, 132);
      tone(148, 1.35, 'triangle', 0.04, 220, 0.08);
    },
    introJump() {
      noise(0.16, 0.18, 3600, 700);
      tone(260, 0.16, 'triangle', 0.08, 620);
    },
    introLand() {
      noise(0.13, 0.2, 980, 170);
      tone(84, 0.12, 'sine', 0.1, 42);
      tone(520, 0.055, 'triangle', 0.05, 860, 0.035);
    },
    missionStart() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.13, 'square', 0.08, null, i * 0.075));
    },
    bossPhase() {
      noise(0.28, 0.25, 5200, 380);
      tone(110, 0.45, 'sawtooth', 0.18, 38);
      tone(880, 0.15, 'square', 0.07, 220, 0.08);
    },
    bounce() { tone(300, 0.05, 'triangle', 0.1, 200); },
    explosion() {
      noise(0.62, 0.62, 1500, 75);
      noise(0.09, 0.42, 7800, 1100);
      tone(74, 0.46, 'sawtooth', 0.28, 24);
      tone(48, 0.62, 'sine', 0.32, 19);
    },
    bigExplosion() {
      noise(1.15, 0.75, 1250, 52);
      noise(0.14, 0.5, 8500, 900);
      tone(58, 0.92, 'sawtooth', 0.36, 17);
      tone(36, 1.18, 'sine', 0.42, 13);
      tone(96, 0.22, 'triangle', 0.18, 31, 0.035);
    },
    jump() { tone(250, 0.12, 'square', 0.08, 480); },
    land() { noise(0.06, 0.2, 700, 200); },
    hurt() { tone(400, 0.25, 'sawtooth', 0.25, 60); noise(0.2, 0.3, 1500, 300); },
    armorBreak() {
      noise(0.16, 0.28, 6800, 540);
      tone(980, 0.11, 'square', 0.09, 220);
      tone(210, 0.22, 'sawtooth', 0.12, 58, 0.025);
    },
    deathBurst() {
      noise(0.24, 0.45, 5200, 280);
      noise(0.07, 0.3, 8800, 1300);
      tone(112, 0.28, 'sawtooth', 0.22, 34);
      tone(680, 0.08, 'square', 0.07, 160);
    },
    heavenRise() {
      const seq = [523, 659, 784, 1046, 1318];
      seq.forEach((f, i) => tone(f, 0.28, 'sine', 0.095, f * 1.06, i * 0.1));
      tone(1568, 0.75, 'sine', 0.055, 2093, 0.38);
      noise(0.42, 0.06, 7600, 3200, 0.15);
    },
    enemyDie(type) {
      const base = type === 'bazooka' ? 210 : type === 'turret' ? 170 : type === 'knife' ? 360 : 290;
      tone(base, type === 'turret' ? 0.28 : 0.2,
        type === 'turret' ? 'sawtooth' : 'square', type === 'turret' ? 0.18 : 0.13,
        type === 'turret' ? 48 : 70);
      noise(type === 'turret' ? 0.24 : 0.14, type === 'turret' ? 0.28 : 0.2,
        type === 'turret' ? 3200 : 1900, 360);
      if (type === 'grenadier') tone(720, 0.08, 'triangle', 0.05, 260, 0.04);
    },
    pickup() { tone(660, 0.08, 'square', 0.15); tone(880, 0.1, 'square', 0.15, null, 0.08); tone(1320, 0.14, 'square', 0.15, null, 0.16); },
    pow() { tone(523, 0.1, 'square', 0.13); tone(659, 0.1, 'square', 0.13, null, 0.1); tone(784, 0.18, 'square', 0.13, null, 0.2); },
    coinAward(tier) {
      const notes = tier === 'boss' ? [1046, 1318, 1568, 2093, 2637, 3136, 3520, 4186]
        : tier === 'big' ? [988, 1244, 1568, 1976, 2637, 3136]
        : [880, 1175, 1568, 2093, 2637];
      notes.forEach((f, i) => {
        tone(f, 0.055, i % 2 ? 'triangle' : 'square', tier === 'boss' ? 0.07 : 0.055, f * 1.12, i * 0.045);
        if (i % 2 === 0) tone(f * 1.5, 0.045, 'sine', 0.035, null, i * 0.045 + 0.018);
      });
      noise(tier === 'boss' ? 0.28 : 0.16, tier === 'boss' ? 0.12 : 0.08, 8800, 2400, 0.02);
    },
    bossHit() { tone(150, 0.08, 'square', 0.15, 90); noise(0.06, 0.2, 2500, 600); },
    heliBomb() { tone(900, 0.6, 'sine', 0.1, 250); },
    tankShot() { noise(0.3, 0.7, 1500, 200); tone(90, 0.25, 'square', 0.3, 35); },
    tankLaser() {
      tone(420, 0.075, 'sawtooth', 0.1, 1180);
      tone(1320, 0.055, 'square', 0.055, 620);
      noise(0.045, 0.11, 7600, 1500);
    },
    slugCannon() {
      noise(0.35, 0.5, 1200, 150);
      tone(70, 0.3, 'sawtooth', 0.3, 25);
      tone(45, 0.35, 'sine', 0.35, 18);
    },
    metalHit() {
      tone(320, 0.12, 'square', 0.18, 120);
      tone(900, 0.06, 'triangle', 0.12, 500);
      noise(0.05, 0.15, 5000, 1500);
    },
    mount() {
      tone(200, 0.06, 'square', 0.12);
      tone(150, 0.06, 'square', 0.12, null, 0.08);
      noise(0.04, 0.1, 3000, 800);
    },
    eject() { tone(250, 0.15, 'triangle', 0.1, 700); },
    crate() {
      noise(0.12, 0.3, 2500, 500);
      tone(180, 0.07, 'triangle', 0.15);
      tone(140, 0.07, 'triangle', 0.15, null, 0.03);
    },
    warning() { tone(1100, 0.09, 'square', 0.12); },
    blip() { tone(880, 0.04, 'square', 0.08); },
    victory() {
      const seq = [523, 523, 523, 659, 784, 1046];
      seq.forEach((f, i) => tone(f, 0.22, 'square', 0.18, null, i * 0.16));
    },
    gameover() {
      const seq = [392, 370, 349, 330];
      seq.forEach((f, i) => tone(f, 0.4, 'square', 0.18, null, i * 0.35));
    },
  };

  // --- two-track procedural soundtrack: gameplay / boss ---
  const MUSIC_TRACKS = {
    gameplay: {
      interval: 118,
      bass: [82.41, null, 82.41, 98.00, 82.41, null, 110.00, 98.00,
             73.42, null, 82.41, 98.00, 110.00, 98.00, 82.41, null],
      lead: [329.63, null, 392.00, null, 440.00, 392.00, null, 329.63,
             293.66, null, 329.63, 392.00, 493.88, null, 440.00, 392.00,
             329.63, null, 392.00, 440.00, 523.25, 493.88, 440.00, null,
             392.00, 329.63, 293.66, null, 329.63, 392.00, null, null],
      arp: [164.81, 196.00, 246.94, 196.00, 146.83, 196.00, 220.00, 196.00]
    },
    boss: {
      interval: 94,
      bass: [65.41, 65.41, null, 77.78, 65.41, 87.31, 77.78, null,
             58.27, 65.41, 77.78, 87.31, 92.50, 87.31, 77.78, 65.41],
      lead: [261.63, 311.13, 349.23, 311.13, 392.00, 349.23, 466.16, 392.00,
             261.63, 277.18, 311.13, 369.99, 415.30, 369.99, 311.13, 277.18,
             523.25, 466.16, 415.30, 369.99, 349.23, 311.13, 277.18, 261.63,
             311.13, 349.23, 392.00, 466.16, 523.25, 466.16, 392.00, 349.23],
      arp: [130.81, 155.56, 196.00, 233.08, 130.81, 174.61, 207.65, 233.08]
    }
  };
  let intensity = 0;
  let musicTrack = 'gameplay';
  let step = 0;

  function musicDrums(track, s) {
    if (track === 'gameplay') {
      if (s % 8 === 0 || (intensity > 0 && s % 8 === 5)) {
        tone(52, 0.13, 'sine', 0.09, 34, 0, 'music');
        noise(0.045, 0.055, 850, 190, 0, 'music');
      }
      if (s % 8 === 4) {
        noise(0.11, 0.09, 3300, 520, 0, 'music');
        tone(180, 0.055, 'triangle', 0.035, 92, 0, 'music');
      }
      if (s % 2 === 1) noise(0.018, 0.022 + intensity * 0.008, 7800, 5200, 0, 'music');
    } else {
      if (s % 4 === 0 || s % 8 === 6) {
        tone(46, 0.15, 'sine', 0.11, 29, 0, 'music');
        noise(0.05, 0.07, 1000, 180, 0, 'music');
      }
      if (s % 8 === 2 || s % 8 === 6) noise(0.13, 0.12, 3900, 460, 0, 'music');
      noise(0.016, s % 2 ? 0.034 : 0.02, 8500, 5800, 0, 'music');
    }
  }

  function musicTick() {
    const track = MUSIC_TRACKS[musicTrack];
    const s = step % 32;
    if (musicOn) {
      musicDrums(musicTrack, s);
      const bass = track.bass[s % track.bass.length];
      if (bass) {
        tone(bass, musicTrack === 'boss' ? 0.16 : 0.19,
          musicTrack === 'boss' ? 'sawtooth' : 'triangle',
          musicTrack === 'boss' ? 0.1 : 0.085, bass * 0.88, 0, 'music');
      }
      const lead = track.lead[s];
      if (lead && (musicTrack === 'boss' || s % 2 === 0)) {
        tone(lead, musicTrack === 'boss' ? 0.12 : 0.15,
          musicTrack === 'boss' ? 'square' : 'triangle',
          musicTrack === 'boss' ? 0.055 : 0.045,
          lead * (musicTrack === 'boss' ? 0.96 : 1.015), 0, 'music');
      }
      if ((intensity > 0 || musicTrack === 'boss') && s % 2 === 1) {
        const arp = track.arp[s % track.arp.length];
        tone(arp * 2, 0.065, 'square', musicTrack === 'boss' ? 0.035 : 0.022,
          null, 0, 'music');
      }
      // A sparse upper answer gives each track a recognizable phrase ending.
      if (s === 15 || s === 31) {
        const answer = musicTrack === 'boss' ? 622.25 : 659.25;
        tone(answer, 0.24, 'sine', musicTrack === 'boss' ? 0.05 : 0.035,
          answer * 0.75, 0, 'music');
      }
    }
    step++;
  }

  function restartMusicTimer() {
    if (!musicTimer) return;
    clearInterval(musicTimer);
    musicTimer = setInterval(musicTick, MUSIC_TRACKS[musicTrack].interval);
  }

  SFX.startMusic = function () {
    if (window.MusicTracks && MusicTracks.isActive()) return;
    ensure();
    if (musicTimer) return;
    step = 0;
    musicTimer = setInterval(musicTick, MUSIC_TRACKS[musicTrack].interval);
  };
  SFX.stopMusic = function () {
    if (window.MusicTracks) MusicTracks.stop();
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  };
  SFX.setMusicTrack = function (name) {
    if (!MUSIC_TRACKS[name] || name === musicTrack) return musicTrack;
    musicTrack = name;
    step = 0;
    if (name === 'boss') {
      tone(65.41, 0.45, 'sawtooth', 0.08, 32.7, 0, 'music');
      noise(0.18, 0.07, 2400, 260, 0, 'music');
    }
    restartMusicTimer();
    return musicTrack;
  };
  SFX.getMusicTrack = function () { return musicTrack; };
  SFX.setIntensity = function (lvl) {
    if (window.MusicTracks && MusicTracks.isActive()) { intensity = Math.max(0, Math.min(2, lvl | 0)); return; }
    lvl = Math.max(0, Math.min(2, lvl | 0));
    const previous = intensity;
    intensity = lvl;
    const targetTrack = lvl >= 2 ? 'boss' : 'gameplay';
    if (targetTrack !== musicTrack) SFX.setMusicTrack(targetTrack);
    else if (previous !== intensity) restartMusicTimer();
  };
  SFX.toggleMusic = function () { musicOn = !musicOn; if (window.MusicTracks) MusicTracks.setMuted(muted || !musicOn); persist(); return musicOn; };
  SFX.isMusicOn = function () { return musicOn; };

  // --- volumi ---
  SFX.getMaster = function () { return masterVol; };
  SFX.getSfx    = function () { return sfxVol; };
  SFX.getMusic  = function () { return musicVol; };
  SFX.setMaster = function (v) {
    masterVol = clamp01(v);
    if (masterGain) masterGain.gain.value = masterVol;
    if (window.MusicTracks) MusicTracks.setVolume(masterVol * musicVol);
    persist();
  };
  SFX.setSfx = function (v) {
    sfxVol = clamp01(v);
    if (sfxGain) sfxGain.gain.value = sfxVol;
    persist();
  };
  SFX.setMusic = function (v) {
    musicVol = clamp01(v);
    if (musicGain) musicGain.gain.value = musicVol;
    if (window.MusicTracks) MusicTracks.setVolume(masterVol * musicVol);
    persist();
  };

  if (window.MusicTracks) {
    MusicTracks.setVolume(masterVol * musicVol);
    MusicTracks.setMuted(muted || !musicOn);
  }
  window.SFX = SFX;
})();
