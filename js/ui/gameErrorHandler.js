class GameErrorHandler {
  constructor(statusTextEl, statusDotEl) {
    this._statusText = statusTextEl;
    this._statusDot = statusDotEl;
    this._errors = [];
  }

  checkRequired(elements) {
    const missing = [];
    for (const [name, el] of Object.entries(elements)) {
      if (!el) missing.push(name);
    }
    if (missing.length > 0) {
      const msg = `Falha no carregamento: ${missing.join(', ')}`;
      this._show(msg, '#ef4444');
      console.error(`[GameError] ${msg}`);
      return false;
    }
    return true;
  }

  showFatalError(message) {
    this._show(message, '#ef4444');

    const pageView = document.querySelector('.page-view');
    if (!pageView) return;
    if (pageView.querySelector('.game-error-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'game-error-banner';
    banner.innerHTML = `
      <span class="material-symbols-outlined">warning</span>
      <span>${message}</span>
    `;
    pageView.prepend(banner);
  }

  _show(message, color) {
    if (this._statusText) {
      this._statusText.textContent = message;
      if (this._statusDot) {
        this._statusDot.style.background = color;
        this._statusDot.style.boxShadow = `0 0 8px ${color}`;
      }
    } else {
      alert(message);
    }
  }

  clear() {
    this._errors = [];
  }
}

export { GameErrorHandler };
