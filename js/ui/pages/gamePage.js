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

    this._initMobileNav();
    this._initDrawer();
  }

  _initMobileNav() {
    const sbLayout = this.el.querySelector('.sb-layout');
    const mobileNav = this.el.querySelector('.mobile-nav');
    if (!sbLayout || !mobileNav) return;

    const setActiveTab = (tabName) => {
      sbLayout.setAttribute('data-active-tab', tabName);
      mobileNav.querySelectorAll('.mobile-nav-tab').forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
      });
    };

    setActiveTab('workspace');

    const navHandler = (e) => {
      const tab = e.target.closest('.mobile-nav-tab');
      if (!tab) return;
      setActiveTab(tab.dataset.tab);
    };
    mobileNav.addEventListener('click', navHandler);
    this._handlers.push({ el: mobileNav, type: 'click', handler: navHandler });
  }

  _initDrawer() {
    const toggleBtn = this.el.querySelector('[data-action="toggle-menu"]');
    const closeBtn = this.el.querySelector('[data-action="close-menu"]');
    const overlay = this.el.querySelector('.game-drawer-overlay');
    const drawer = this.el.querySelector('.game-drawer');
    if (!toggleBtn || !overlay || !drawer) return;

    const icon = toggleBtn.querySelector('.material-symbols-outlined');

    const open = () => {
      drawer.classList.add('open');
      overlay.classList.add('visible');
      if (icon) icon.textContent = 'close';
      document.addEventListener('keydown', boundKeydown);
    };

    const close = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('visible');
      if (icon) icon.textContent = 'menu';
      document.removeEventListener('keydown', boundKeydown);
    };

    const toggle = () => {
      if (drawer.classList.contains('open')) {
        close();
      } else {
        open();
      }
    };

    this._drawerKeydownHandler = (e) => {
      if (e.key === 'Escape') close();
    };
    const boundKeydown = this._drawerKeydownHandler;

    const toggleHandler = () => toggle();
    toggleBtn.addEventListener('click', toggleHandler);
    this._handlers.push({ el: toggleBtn, type: 'click', handler: toggleHandler });

    if (closeBtn) {
      const closeHandler = () => close();
      closeBtn.addEventListener('click', closeHandler);
      this._handlers.push({ el: closeBtn, type: 'click', handler: closeHandler });
    }

    const overlayHandler = () => close();
    overlay.addEventListener('click', overlayHandler);
    this._handlers.push({ el: overlay, type: 'click', handler: overlayHandler });
  }

  _unbindEvents() {
    if (this._drawerKeydownHandler) {
      document.removeEventListener('keydown', this._drawerKeydownHandler);
      this._drawerKeydownHandler = null;
    }
    const drawer = this.el?.querySelector('.game-drawer');
    if (drawer?.classList.contains('open')) {
      drawer.classList.remove('open');
      this.el?.querySelector('.game-drawer-overlay')?.classList.remove('visible');
    }
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
