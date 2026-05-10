export class AudioManager {
  constructor() {
    this._unlocked = false;
    this._muted = false;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this._currentMusic = null;

    this._music = {};
    this._sfx = {};

    this._init();
  }

  _init() {
    this._music = {
      ocean: new Audio('assets/sounds/Music/Cidade do código/Cidade_do_codigo.mp3'),
      forest: new Audio('assets/sounds/Music/Floresta dos Algoritmos/FlorestaAlgoritmosTeste.mp3'),
      void: new Audio('assets/sounds/Music/Núcleo Logicron/nucleo_logicron.mp3')
    };

    for (const key of Object.keys(this._music)) {
      this._music[key].loop = true;
      this._music[key].volume = this.musicVolume;
    }

    this._sfx = {
      snap: [
        new Audio('assets/sounds/SFX/Blocos (snap)/block_1.mp3'),
        new Audio('assets/sounds/SFX/Blocos (snap)/block_2.mp3')
      ],
      error: [
        new Audio('assets/sounds/SFX/Erro de lógica/erro_1.mp3'),
        new Audio('assets/sounds/SFX/Erro de lógica/erro_2.mp3')
      ],
      execute: new Audio('assets/sounds/SFX/Execução de Código (executar)/exec.mp3'),
      victory: new Audio('assets/sounds/SFX/Vitória/vitoria.mp3')
    };
  }

  unlock() {
    if (this._unlocked) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    ctx.close();
    this._unlocked = true;
  }

  playSfx(name) {
    if (this._muted) return;
    const sfx = this._sfx[name];
    if (!sfx) return;
    const audio = Array.isArray(sfx)
      ? sfx[Math.floor(Math.random() * sfx.length)].cloneNode(true)
      : sfx.cloneNode(true);
    audio.volume = this.sfxVolume;
    audio.play().catch(() => {});
  }

  playMusic(theme) {
    if (this._muted) return;
    this.stopMusic();
    const audio = this._music[theme];
    if (!audio) return;
    audio.volume = this.musicVolume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    this._currentMusic = audio;
  }

  stopMusic() {
    if (this._currentMusic) {
      this._currentMusic.pause();
      this._currentMusic.currentTime = 0;
      this._currentMusic = null;
    }
  }

  fadeOut(duration = 500) {
    const audio = this._currentMusic;
    if (!audio) return;
    const startVol = audio.volume;
    const step = startVol / (duration / 50);
    this._currentMusic = null;
    const timer = setInterval(() => {
      if (audio.volume > step) {
        audio.volume = Math.max(0, audio.volume - step);
      } else {
        clearInterval(timer);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = startVol;
      }
    }, 50);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this._muted) this.stopMusic();
    return this._muted;
  }

  isMuted() {
    return this._muted;
  }
}

export const audioManager = new AudioManager();
