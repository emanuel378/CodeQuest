import { PageComponent } from './pageComponent.js';

class GamePage extends PageComponent {
  _render() {
    const template = document.getElementById('page-game');
    return template.content.cloneNode(true);
  }

  _bindEvents() {
    document.dispatchEvent(new CustomEvent('game:ready'));
  }

  getRequiredElement(selector) {
    const el = this.el?.querySelector(selector);
    if (!el) {
      console.warn(`[GamePage] Elemento não encontrado: "${selector}"`);
    }
    return el;
  }

  get elements() {
    if (!this.el) return {};
    return {
      workspace:  this.getRequiredElement('#workspace'),
      palette:    this.getRequiredElement('#palette'),
      simGrid:    this.getRequiredElement('.sim-grid'),
      runBtn:     this.getRequiredElement('.btn-executar'),
      pauseBtn:   this.getRequiredElement('.btn-pausar'),
      clearBtn:   this.getRequiredElement('.btn-limpar'),
      statusDot:  this.getRequiredElement('.status-dot'),
      statusText: this.getRequiredElement('.status-text'),
      indicator:  this.getRequiredElement('.level-indicator'),
      simViewport: this.getRequiredElement('.sim-viewport'),
    };
  }
}

export { GamePage };
