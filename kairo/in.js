(() => {
  'use strict';

  const LOOP_SECONDS = 15;
  const LOOP_MS = LOOP_SECONDS * 1000;
  const KEYS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
  const keyIndex = new Map(KEYS.map((key, index) => [key, index]));

  const padGrid = document.querySelector('#padGrid');
  const recordButton = document.querySelector('#recordButton');
  const resetButton = document.querySelector('#resetButton');
  const statusText = document.querySelector('#statusText');
  const statusDot = document.querySelector('#statusDot');
  const timelineState = document.querySelector('#timelineState');
  const eventCount = document.querySelector('#eventCount');
  const timeReadout = document.querySelector('#timeReadout');
  const canvas = document.querySelector('#timelineCanvas');
  const clock = document.querySelector('#clock');
  const ctx2d = canvas.getContext('2d');

  let audioContext = null;
  let master = null;
  let recording = false;
  let looping = false;
  let recordStartedAt = 0;
  let loopStartedAt = 0;
  let recordedEvents = [];
  let finishTimer = 0;
  let cycleTimer = 0;
  let loopToken = 0;
  let raf = 0;

  function setStatus(text, live = false) {
    statusText.textContent = text;
    statusDot.classList.toggle('live', live);
  }

  function initAudio() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
      master = audioContext.createGain();
      master.gain.value = 0.27;
      master.connect(audioContext.destination);
    }
    if (audioContext.state === 'suspended') audioContext.resume();
  }

  function seeded(index, salt = 0) {
    const x = Math.sin((index + 1) * 91.733 + salt * 17.13) * 43758.5453;
    return x - Math.floor(x);
  }

  function envelope(gain, now, peak, attack, release) {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);
  }

  function makeNoise(now, duration, gainAmount, panValue, filterHz, seed = 1) {
    const length = Math.max(1, Math.floor(audioContext.sampleRate * duration));
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let state = (seed * 2654435761) >>> 0;
    for (let i = 0; i < length; i++) {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      const rnd = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      data[i] = rnd * 2 - 1;
    }
    const src = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    filter.type = 'bandpass';
    filter.frequency.value = filterHz;
    filter.Q.value = 1.4;
    envelope(gain, now, gainAmount, 0.002, Math.max(0.025, duration - 0.004));
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(gain);
    if (audioContext.createStereoPanner) {
      const pan = audioContext.createStereoPanner();
      pan.pan.value = panValue;
      gain.connect(pan);
      pan.connect(master);
    } else gain.connect(master);
    src.start(now);
    src.stop(now + duration + 0.03);
  }

  function playSound(key, fromLoop = false) {
    const index = keyIndex.get(key);
    if (index === undefined) return;
    initAudio();
    const now = audioContext.currentTime + 0.006;
    const family = index % 6;
    const base = 85 + index * 13.7 + seeded(index, 1) * 44;
    const panValue = seeded(index, 3) * 1.5 - 0.75;

    if (family === 0) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * 3.1, now);
      osc.frequency.exponentialRampToValueAtTime(base * 2.35, now + 0.18);
      envelope(gain, now, 0.42, 0.004, 0.28);
      osc.connect(gain); gain.connect(master); osc.start(now); osc.stop(now + 0.34);
    } else if (family === 1) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      osc.type = 'square'; osc.frequency.value = base * 1.55;
      filter.type = 'lowpass'; filter.frequency.value = 950 + index * 22; filter.Q.value = 2.5;
      envelope(gain, now, 0.16, 0.003, 0.11);
      osc.connect(filter); filter.connect(gain); gain.connect(master); osc.start(now); osc.stop(now + 0.16);
    } else if (family === 2) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150 + index * 2.2, now);
      osc.frequency.exponentialRampToValueAtTime(46 + index * .4, now + .22);
      envelope(gain, now, .5, .002, .24);
      osc.connect(gain); gain.connect(master); osc.start(now); osc.stop(now + .28);
    } else if (family === 3) {
      makeNoise(now, 0.14 + seeded(index, 4) * .12, .16, panValue, 900 + index * 75, index + 11);
    } else if (family === 4) {
      const carrier = audioContext.createOscillator();
      const mod = audioContext.createOscillator();
      const modGain = audioContext.createGain();
      const gain = audioContext.createGain();
      carrier.type = 'sine'; mod.type = 'triangle';
      carrier.frequency.value = base * 2.2; mod.frequency.value = base * .47;
      modGain.gain.value = 52 + index * 2.7;
      mod.connect(modGain); modGain.connect(carrier.frequency);
      envelope(gain, now, .27, .005, .36);
      carrier.connect(gain); gain.connect(master);
      carrier.start(now); mod.start(now); carrier.stop(now + .42); mod.stop(now + .42);
    } else {
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      osc1.type = 'sawtooth'; osc2.type = 'triangle';
      osc1.frequency.value = base * 1.9; osc2.frequency.value = base * 2.87;
      filter.type = 'bandpass'; filter.frequency.value = base * 3.3; filter.Q.value = 4.5;
      envelope(gain, now, .12, .003, .24 + seeded(index, 5) * .2);
      osc1.connect(filter); osc2.connect(filter); filter.connect(gain); gain.connect(master);
      osc1.start(now); osc2.start(now); osc1.stop(now + .48); osc2.stop(now + .48);
    }

    flashPad(key, fromLoop);
  }

  function flashPad(key, fromLoop) {
    const pad = padGrid.querySelector(`[data-key="${key}"]`);
    if (!pad) return;
    pad.classList.remove('active', 'loop-hit');
    void pad.offsetWidth;
    pad.classList.add(fromLoop ? 'loop-hit' : 'active');
    window.setTimeout(() => pad.classList.remove('active', 'loop-hit'), fromLoop ? 190 : 120);
  }

  function trigger(key, {fromLoop = false} = {}) {
    if (!keyIndex.has(key)) return;
    playSound(key, fromLoop);
    if (recording && !fromLoop) {
      const t = Math.min(LOOP_MS - 1, performance.now() - recordStartedAt);
      recordedEvents.push({key, t});
      eventCount.textContent = String(recordedEvents.length);
    }
  }

  function clearLoopTimers() {
    loopToken += 1;
    window.clearTimeout(finishTimer);
    window.clearTimeout(cycleTimer);
  }

  function scheduleLoopCycle(token) {
    if (!looping || token !== loopToken) return;
    const cycleStart = performance.now();
    if (!loopStartedAt) loopStartedAt = cycleStart;
    recordedEvents.forEach(evt => {
      window.setTimeout(() => {
        if (looping && token === loopToken) trigger(evt.key, {fromLoop:true});
      }, Math.max(0, evt.t));
    });
    cycleTimer = window.setTimeout(() => scheduleLoopCycle(token), LOOP_MS);
  }

  function startRecording() {
    initAudio();
    clearLoopTimers();
    recordedEvents = [];
    recording = true;
    looping = false;
    recordStartedAt = performance.now();
    loopStartedAt = 0;
    document.body.classList.add('recording');
    recordButton.classList.add('is-recording');
    recordButton.disabled = true;
    timelineState.textContent = 'RECORDING';
    eventCount.textContent = '0';
    setStatus('RECORDING / PLAY THE KEYS', true);
    finishTimer = window.setTimeout(finishRecording, LOOP_MS);
  }

  function finishRecording() {
    if (!recording) return;
    recording = false;
    document.body.classList.remove('recording');
    recordButton.classList.remove('is-recording');
    recordButton.disabled = false;
    if (!recordedEvents.length) {
      looping = false;
      timelineState.textContent = 'EMPTY';
      timeReadout.textContent = `${LOOP_SECONDS.toFixed(1)} / ${LOOP_SECONDS.toFixed(1)}`;
      setStatus('EMPTY TAKE / PRESS RECORD TO TRY AGAIN');
      return;
    }
    looping = true;
    timelineState.textContent = 'LOOPING';
    setStatus(`LOOPING / ${recordedEvents.length} EVENTS`, true);
    const token = loopToken;
    loopStartedAt = performance.now();
    scheduleLoopCycle(token);
  }

  function resetAll() {
    clearLoopTimers();
    recording = false;
    looping = false;
    recordedEvents = [];
    recordStartedAt = 0;
    loopStartedAt = 0;
    document.body.classList.remove('recording');
    recordButton.disabled = false;
    recordButton.classList.remove('is-recording');
    timelineState.textContent = 'READY';
    eventCount.textContent = '0';
    timeReadout.textContent = `00.0 / ${LOOP_SECONDS.toFixed(1)}`;
    setStatus('RESET / READY');
    if (audioContext && audioContext.state === 'running') {
      master.gain.cancelScheduledValues(audioContext.currentTime);
      master.gain.setValueAtTime(master.gain.value, audioContext.currentTime);
    }
  }

  function drawTimeline() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const w = canvas.width, h = canvas.height;
    ctx2d.clearRect(0, 0, w, h);
    ctx2d.lineWidth = dpr;

    ctx2d.strokeStyle = 'rgba(24,40,50,.13)';
    for (let sec = 0; sec <= LOOP_SECONDS; sec++) {
      const x = (sec / LOOP_SECONDS) * w;
      ctx2d.beginPath(); ctx2d.moveTo(x, 0); ctx2d.lineTo(x, h); ctx2d.stroke();
    }
    ctx2d.strokeStyle = 'rgba(24,40,50,.28)';
    ctx2d.beginPath(); ctx2d.moveTo(0, h * .72); ctx2d.lineTo(w, h * .72); ctx2d.stroke();

    for (const evt of recordedEvents) {
      const x = (evt.t / LOOP_MS) * w;
      const idx = keyIndex.get(evt.key) || 0;
      const top = h * (.18 + (idx % 6) * .07);
      ctx2d.strokeStyle = idx % 5 === 0 ? 'rgba(230,0,18,.76)' : 'rgba(24,40,50,.62)';
      ctx2d.lineWidth = Math.max(1, 1.35 * dpr);
      ctx2d.beginPath(); ctx2d.moveTo(x, h * .72); ctx2d.lineTo(x, top); ctx2d.stroke();
    }

    let elapsed = 0;
    if (recording) elapsed = Math.min(LOOP_MS, performance.now() - recordStartedAt);
    else if (looping) elapsed = (performance.now() - loopStartedAt) % LOOP_MS;
    if (recording || looping) {
      const x = (elapsed / LOOP_MS) * w;
      ctx2d.strokeStyle = 'rgba(230,0,18,.96)'; ctx2d.lineWidth = 1.5 * dpr;
      ctx2d.beginPath(); ctx2d.moveTo(x, 0); ctx2d.lineTo(x, h); ctx2d.stroke();
      timeReadout.textContent = `${(elapsed/1000).toFixed(1).padStart(4,'0')} / ${LOOP_SECONDS.toFixed(1)}`;
    }
    raf = requestAnimationFrame(drawTimeline);
  }

  function updateClock() {
    const fmt = new Intl.DateTimeFormat('ja-JP', {timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    clock.textContent = fmt.format(new Date());
  }

  KEYS.forEach((key, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pad';
    button.dataset.key = key;
    button.setAttribute('aria-label', `Play sound ${key}`);
    button.innerHTML = `<span>${key}</span><small>${String(index + 1).padStart(2,'0')}</small>`;
    button.addEventListener('pointerdown', event => { event.preventDefault(); trigger(key); });
    padGrid.appendChild(button);
  });

  document.addEventListener('keydown', event => {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toUpperCase();
    if (keyIndex.has(key)) {
      event.preventDefault();
      trigger(key);
    } else if (event.code === 'Space') {
      event.preventDefault();
      resetAll();
    }
  });

  recordButton.addEventListener('click', startRecording);
  resetButton.addEventListener('click', resetAll);
  window.addEventListener('resize', () => { /* canvas re-sizes on the next frame */ });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); clearLoopTimers(); });

  updateClock();
  window.setInterval(updateClock, 1000);
  drawTimeline();
})();
