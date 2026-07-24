// Optional authored soundtrack with procedural WebAudio fallback.
(function () {
  // When launched through index.html, one persistent top-level audio owner
  // survives intro/menu/map/level iframe navigation. This avoids Safari losing
  // media activation every time a new HTML document is loaded.
  let parentTracks = null;
  try {
    if (window.parent && window.parent !== window && window.parent.MusicTracks)
      parentTracks = window.parent.MusicTracks;
  } catch (e) {}
  if (parentTracks) {
    window.MusicTracks = parentTracks;
    const resumeParent = function () { parentTracks.resume(); };
    window.addEventListener('keydown', resumeParent);
    window.addEventListener('pointerdown', resumeParent);
    return;
  }
  if (window.parent && window.parent !== window) {
    // file:// documents may receive opaque origins in Safari. postMessage still
    // lets the child request music from the persistent shell safely.
    let bridgeTrack = null, bridgeActive = false;
    const send = function (action, data) {
      window.parent.postMessage(Object.assign({ type: 'dh-music', action: action }, data || {}), '*');
    };
    window.MusicTracks = Object.freeze({
      play: function (track) { bridgeTrack = track; bridgeActive = true; send('play', { track: track }); return true; },
      stop: function () { bridgeActive = false; send('stop'); },
      resume: function () { send('resume'); },
      setVolume: function (value) { send('volume', { value: value }); },
      setMuted: function (value) { send('mute', { value: value }); },
      isActive: function () { return bridgeActive; },
      // Playback status lives in the parent and is intentionally conservative;
      // this also ensures the intro reserves its first file:// gesture for audio.
      isPlaying: function () { return false; },
      current: function () { return bridgeTrack; }, files: {},
    });
    const resumeShell = function () { send('resume'); };
    window.addEventListener('keydown', resumeShell);
    window.addEventListener('pointerdown', resumeShell);
    return;
  }

  const files = {
    overture: 'assets/audio/Star_Map_Overture.mp3',
    level1: 'assets/audio/Sandbyte_Ambush.mp3',
    space: 'assets/audio/Star_Map01.mp3',
  };
  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'auto';
  let active = false;
  let current = null;
  let wanted = null;
  let playing = false;
  let fallbackAttempts = 0;

  function attempt() {
    if (!wanted) return;
    const promise = audio.play();
    if (promise && promise.catch) promise.catch(function () {});
  }
  function play(name) {
    if (!files[name]) return false;
    wanted = name;
    if (current !== name) {
      current = name;
      audio.src = files[name];
      audio.load();
    }
    active = true; playing = false; fallbackAttempts = 0;
    attempt();
    return true;
  }
  function stop() { wanted = null; active = false; playing = false; audio.pause(); }
  function setVolume(value) { audio.volume = Math.max(0, Math.min(1, value)); }
  function setMuted(value) { audio.muted = !!value; }
  function resume() {
    if (wanted) attempt();
    try { window.dispatchEvent(new CustomEvent('dh-audio-resumed')); } catch (e) {}
  }

  function startFallbackWhenReady() {
    if (window.SFX && SFX.startMusic) { SFX.startMusic(); return; }
    if (fallbackAttempts++ < 20) setTimeout(startFallbackWhenReady, 100);
  }
  audio.addEventListener('playing', function () {
    playing = true; active = true;
    try { window.dispatchEvent(new CustomEvent('dh-audio-resumed')); } catch (e) {}
  });
  audio.addEventListener('pause', function () { playing = false; });
  audio.addEventListener('error', function () {
    active = false; playing = false;
    startFallbackWhenReady();
  });
  const unlock = function () { if (wanted) attempt(); };
  window.addEventListener('keydown', unlock);
  window.addEventListener('pointerdown', unlock);

  window.MusicTracks = Object.freeze({
    play: play, stop: stop, resume: resume, setVolume: setVolume, setMuted: setMuted,
    isActive: function () { return active; }, isPlaying: function () { return playing; }, current: function () { return current; },
    files: Object.assign({}, files),
  });
})();
