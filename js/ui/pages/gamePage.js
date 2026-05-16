import { PageComponent } from './pageComponent.js';
import { router } from '../routes.js';
import { GlossaryModal } from '../glossaryModal.js';

class GamePage extends PageComponent {
  _render() {
    const template = document.getElementById('page-game');
    return template.content.cloneNode(true);
  }

  _bindEvents() {
    this._handlers = [];

    document.dispatchEvent(new CustomEvent('game:ready'));

    const simHeader = this.el.querySelector('.sim-header');
    const simViewport = this.el.querySelector('.sim-viewport');
    if (simHeader && simViewport) {
      simViewport.parentNode.insertBefore(simHeader, simViewport);
    }

    const homeBtn = this.el.querySelector('[data-action="home"]');
    if (homeBtn) {
      const handler = (e) => {
        e.preventDefault();
        router.navigate('/');
      };
      homeBtn.addEventListener('click', handler);
      this._handlers.push({ el: homeBtn, type: 'click', handler });
    }

    const glossaryBtn = this.el.querySelector('[data-action="glossary"]');
    if (glossaryBtn) {
      const handler = () => {
        this._glossaryModal = new GlossaryModal(() => {
          this._glossaryModal = null;
        });
        this._glossaryModal.show();
      };
      glossaryBtn.addEventListener('click', handler);
      this._handlers.push({ el: glossaryBtn, type: 'click', handler });
    }

    const glossaryEnemyHandler = (e) => {
      if (!this._glossaryModal) {
        this._glossaryModal = new GlossaryModal(() => {
          this._glossaryModal = null;
        });
      }
      this._glossaryModal.show({
        tab: 'enemies',
        scrollToEnemy: e.detail?.enemyName
      });
    };
    document.addEventListener('enemy:open-glossary', glossaryEnemyHandler);
    this._handlers.push({ el: document, type: 'enemy:open-glossary', handler: glossaryEnemyHandler });

    const glossaryBlockHandler = (e) => {
      if (!this._glossaryModal) {
        this._glossaryModal = new GlossaryModal(() => {
          this._glossaryModal = null;
        });
      }
      this._glossaryModal.show({
        tab: 'blocks',
        scrollToBlock: e.detail?.blockType
      });
    };
    document.addEventListener('block:open-glossary', glossaryBlockHandler);
    this._handlers.push({ el: document, type: 'block:open-glossary', handler: glossaryBlockHandler });
  }

  _unbindEvents() {
    for (const { el, type, handler } of this._handlers) {
      el.removeEventListener(type, handler);
    }
    this._handlers = [];
    if (this._glossaryModal) {
      this._glossaryModal._destroy();
      this._glossaryModal = null;
    }
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
      attrPanel: document.getElementById('attributes-panel'),
      enemyInfo: document.getElementById('enemy-info'),
    };
  }
}

export { GamePage };
