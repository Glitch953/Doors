// ---------------------------------------------------------------------------
// AudioSystem -- a tiny, dependency-free procedural sound engine built on the
// Web Audio API. DOORS ships with no binary audio assets, so every sound
// (footsteps, door creaks, rain, train rumble, room tone, clock tick) is
// synthesized at runtime. This keeps the project runnable immediately with
// nothing to download, while still giving each scene a distinct sonic
// signature.
//
// Nothing plays until `AudioSystem.unlock()` is called from a real user
// gesture (handled by the ENTER interaction in LoadingScreen), respecting
// browser autoplay policy and the "no loud autoplay" requirement.
// ---------------------------------------------------------------------------

class AudioSystemClass {
  constructor() {
    this.ctx = null
    this.master = null
    this.unlocked = false
    this.loops = {}
  }

  unlock() {
    if (this.unlocked) return
    const Ctx = window.AudioContext || window.webkitAudioContext
    this.ctx = new Ctx()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.55
    this.master.connect(this.ctx.destination)
    this.unlocked = true
  }

  get time() {
    return this.ctx ? this.ctx.currentTime : 0
  }

  // -- one-shots ------------------------------------------------------------

  footstep(surface = 'wood') {
    if (!this.unlocked) return
    const t = this.time
    const noise = this._noiseBuffer(0.08)
    const src = this.ctx.createBufferSource()
    src.buffer = noise
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = surface === 'wet' ? 1800 : 500
    filter.Q.value = 0.7
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(0.35, t + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    src.connect(filter).connect(gain).connect(this.master)
    src.start(t)
    src.stop(t + 0.15)
  }

  doorHandle() {
    if (!this.unlocked) return
    const t = this.time
    const osc = this.ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, t)
    osc.frequency.exponentialRampToValueAtTime(210, t + 0.25)
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    osc.connect(gain).connect(this.master)
    osc.start(t)
    osc.stop(t + 0.32)
  }

  doorOpen() {
    if (!this.unlocked) return
    const t = this.time
    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(140, t)
    osc.frequency.linearRampToValueAtTime(95, t + 1.1)
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 500
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3)
    osc.connect(filter).connect(gain).connect(this.master)
    osc.start(t)
    osc.stop(t + 1.35)
  }

  chime(freq = 660) {
    if (!this.unlocked) return
    const t = this.time
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
    osc.connect(gain).connect(this.master)
    osc.start(t)
    osc.stop(t + 1.85)
  }

  // -- loops ------------------------------------------------------------

  _noiseBuffer(duration = 2) {
    const sr = this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(1, sr * duration, sr)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  startLoop(name, { type = 'rain', volume = 0.15 } = {}) {
    if (!this.unlocked || this.loops[name]) return
    const noise = this._noiseBuffer(4)
    const src = this.ctx.createBufferSource()
    src.buffer = noise
    src.loop = true

    const filter = this.ctx.createBiquadFilter()
    if (type === 'rain') {
      filter.type = 'highpass'
      filter.frequency.value = 1200
    } else if (type === 'wind' || type === 'train') {
      filter.type = 'lowpass'
      filter.frequency.value = 400
    } else {
      filter.type = 'lowpass'
      filter.frequency.value = 900
    }

    const gain = this.ctx.createGain()
    gain.gain.value = 0.0001
    src.connect(filter).connect(gain).connect(this.master)
    src.start()
    gain.gain.linearRampToValueAtTime(volume, this.time + 1.5)

    this.loops[name] = { src, gain, filter }
  }

  stopLoop(name, fade = 1.2) {
    const loop = this.loops[name]
    if (!loop) return
    const t = this.time
    loop.gain.gain.cancelScheduledValues(t)
    loop.gain.gain.setValueAtTime(loop.gain.gain.value, t)
    loop.gain.gain.linearRampToValueAtTime(0.0001, t + fade)
    setTimeout(() => {
      try {
        loop.src.stop()
      } catch (e) {}
    }, fade * 1000 + 100)
    delete this.loops[name]
  }

  stopAll(fade = 1) {
    Object.keys(this.loops).forEach((name) => this.stopLoop(name, fade))
  }

  tick() {
    if (!this.unlocked) return
    const t = this.time
    const osc = this.ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = 1800
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(0.03, t + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    osc.connect(gain).connect(this.master)
    osc.start(t)
    osc.stop(t + 0.06)
  }
}

export const AudioSystem = new AudioSystemClass()
