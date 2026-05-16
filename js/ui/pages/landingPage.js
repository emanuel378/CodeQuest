import { PageComponent } from './pageComponent.js';
import { router, setPendingLevelId } from '../routes.js';
import { LevelSelectModal } from '../levelSelectModal.js';
import { PlayerManager } from '../../game/playerManager.js';
import { Progression } from '../../game/progression.js';

class LandingPage extends PageComponent {
  _render() {
    const template = document.getElementById('page-landing');
    return template.content.cloneNode(true);
  }

  _bindEvents() {
    this._handlers = [];
    this._updateContinueButton();

    const selectBtns = this.el.querySelectorAll('[data-action="select-level"]');
    for (const btn of selectBtns) {
      const handler = (e) => {
        e.preventDefault();
        if (this._levelModal || this._profileOverlay) return;

        const playerManager = new PlayerManager();
        const activePlayer = playerManager.getActivePlayer();

        if (!activePlayer) {
          this._showProfilePrompt(playerManager, (pm, ap) => {
            this._openLevelModal(pm, ap);
          });
          return;
        }

        this._openLevelModal(playerManager, activePlayer);
      };
      btn.addEventListener('click', handler);
      this._handlers.push({ el: btn, type: 'click', handler });
    }

    const continueBtns = this.el.querySelectorAll('[data-action="continue"]');
    for (const btn of continueBtns) {
      const handler = (e) => {
        e.preventDefault();
        if (btn.disabled || this._levelModal || this._profileOverlay) return;

        const playerManager = new PlayerManager();
        const activePlayer = playerManager.getActivePlayer();

        if (!activePlayer) {
          this._showProfilePrompt(playerManager, (pm, ap) => {
            const progression = new Progression(ap.id, ap.name);
            setPendingLevelId(progression.getCurrentLevel());
            router.navigate('/game');
          });
          return;
        }

        const progression = new Progression(activePlayer.id, activePlayer.name);
        setPendingLevelId(progression.getCurrentLevel());
        router.navigate('/game');
      };
      btn.addEventListener('click', handler);
      this._handlers.push({ el: btn, type: 'click', handler });
    }

    const rankingBtn = this.el.querySelector('[data-action="ranking"]');
    if (rankingBtn) {
      const handler = (e) => {
        e.preventDefault();
        router.navigate('/ranking');
      };
      rankingBtn.addEventListener('click', handler);
      this._handlers.push({ el: rankingBtn, type: 'click', handler });
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

    const playBtn = this.el.querySelector('[data-action="play"]');
    if (playBtn) {
      const handler = (e) => {
        e.preventDefault();
        router.navigate('/game');
      };
      playBtn.addEventListener('click', handler);
      this._handlers.push({ el: playBtn, type: 'click', handler });
    }

    this._initMobileDrawer();
  }

  _initMobileDrawer() {
    const menuBtn = this.el.querySelector('.mobile-menu-btn');
    const drawer = this.el.querySelector('.mobile-drawer');
    const closeBtn = this.el.querySelector('.mobile-drawer-close');
    const overlay = this.el.querySelector('.mobile-drawer-overlay');
    if (!menuBtn || !drawer || !overlay) return;

    const open = () => {
      drawer.classList.add('active');
      overlay.classList.add('active');
    };
    const close = () => {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
    };

    menuBtn.addEventListener('click', open);
    this._handlers.push({ el: menuBtn, type: 'click', handler: open });

    closeBtn?.addEventListener('click', close);
    if (closeBtn) this._handlers.push({ el: closeBtn, type: 'click', handler: close });

    overlay.addEventListener('click', close);
    this._handlers.push({ el: overlay, type: 'click', handler: close });

    drawer.querySelectorAll('.mobile-drawer-link').forEach((link) => {
      const handler = () => close();
      link.addEventListener('click', handler);
      this._handlers.push({ el: link, type: 'click', handler });
    });
  }

  _updateContinueButton() {
    const continueBtns = this.el.querySelectorAll('[data-action="continue"]');
    const playerManager = new PlayerManager();
    const activePlayer = playerManager.getActivePlayer();
    let disabled = true;

    if (activePlayer) {
      const progression = new Progression(activePlayer.id, activePlayer.name);
      disabled = progression.getCurrentLevel() === 0;
    }

    for (const btn of continueBtns) {
      btn.disabled = disabled;
    }
  }

  _openLevelModal(playerManager, activePlayer) {
    const progression = new Progression(activePlayer.id, activePlayer.name);

    this._levelModal = new LevelSelectModal(
      (levelId) => {
        this._levelModal = null;
        setPendingLevelId(levelId);
        router.navigate('/game');
      },
      () => { this._levelModal = null; },
      {
        currentLevel: progression.getCurrentLevel(),
        completedLevels: progression.completedLevels,
        failedLevels: progression._failedLevels
      }
    );
    this._levelModal.show();
  }

  _showProfilePrompt(playerManager, onResolve) {
    const players = playerManager.getPlayers();
    const hasPlayers = players.length > 0;

    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.innerHTML = `
      <div class="profile-modal">
        <div class="profile-modal-icon-wrapper">
          <span class="material-symbols-outlined profile-modal-icon">badge</span>
        </div>
        <h2 class="profile-modal-title">${hasPlayers ? 'SELECIONAR JOGADOR' : 'NOVO JOGADOR'}</h2>
        <p class="profile-modal-text">${hasPlayers ? 'Nenhum jogador ativo. Escolha um perfil ou crie um novo:' : 'Crie um perfil para começar a jogar:'}</p>
        <div id="profile-prompt-content"></div>
        <div class="profile-modal-actions" id="profile-prompt-actions"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._profileOverlay = overlay;
    requestAnimationFrame(() => overlay.classList.add('active'));

    const doClose = () => this._closeProfileOverlay();

    if (hasPlayers) {
      this._renderPlayerList(overlay, playerManager, doClose, onResolve);
    } else {
      this._renderPlayerCreate(overlay, playerManager, doClose, onResolve);
    }
  }

  _renderPlayerList(overlay, playerManager, doClose, onResolve) {
    const content = overlay.querySelector('#profile-prompt-content');
    const actions = overlay.querySelector('#profile-prompt-actions');
    let selectedId = null;

    for (const p of playerManager.getPlayers()) {
      const item = document.createElement('div');
      item.className = 'profile-list-item';
      item.dataset.id = p.id;
      const initial = p.name.charAt(0).toUpperCase();
      const xp = this._readPlayerXP(p.id);
      item.innerHTML = `
        <span class="profile-list-avatar">${initial}</span>
        <div class="profile-list-info">
          <span class="profile-list-name">${p.name}</span>
          <span class="profile-list-xp">${xp} XP</span>
        </div>
      `;
      item.addEventListener('click', () => {
        content.querySelectorAll('.profile-list-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        selectedId = p.id;
      });
      content.appendChild(item);
    }

    const newBtn = document.createElement('button');
    newBtn.className = 'profile-dropdown-item';
    newBtn.style.marginTop = 'var(--spacing-sm)';
    newBtn.style.width = '100%';
    newBtn.innerHTML = '<span class="material-symbols-outlined">person_add</span> Novo Jogador';
    newBtn.addEventListener('click', () => {
      this._renderPlayerCreate(overlay, playerManager, doClose, onResolve);
    });
    content.appendChild(newBtn);

    actions.innerHTML = `
      <button class="profile-btn-cancel" id="prompt-cancel">CANCELAR</button>
      <button class="profile-btn-confirm" id="prompt-select">SELECIONAR</button>
    `;

    actions.querySelector('#prompt-cancel').addEventListener('click', doClose);
    actions.querySelector('#prompt-select').addEventListener('click', () => {
      if (!selectedId) return;
      playerManager.setActivePlayer(selectedId);
      const active = playerManager.getActivePlayer();
      doClose();
      if (onResolve) onResolve(playerManager, active);
    });
  }

  _renderPlayerCreate(overlay, playerManager, doClose, onResolve) {
    const content = overlay.querySelector('#profile-prompt-content');
    content.innerHTML = `
      <input class="profile-modal-input" id="prompt-input" type="text" placeholder="Nome do jogador" maxlength="20" autocomplete="off">
    `;

    const actions = overlay.querySelector('#profile-prompt-actions');
    actions.innerHTML = `
      <button class="profile-btn-cancel" id="prompt-cancel">CANCELAR</button>
      <button class="profile-btn-confirm" id="prompt-create">CRIAR</button>
    `;

    actions.querySelector('#prompt-cancel').addEventListener('click', doClose);

    const input = content.querySelector('#prompt-input');
    const save = () => {
      const name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }
      const player = playerManager.addPlayer(name);
      playerManager.setActivePlayer(player.id);
      doClose();
      if (onResolve) onResolve(playerManager, player);
    };

    actions.querySelector('#prompt-create').addEventListener('click', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
    });

    const escHandler = (e) => {
      if (e.key === 'Escape') doClose();
    };
    document.addEventListener('keydown', escHandler, { once: true });

    setTimeout(() => input.focus(), 300);
  }

  _closeProfileOverlay() {
    if (!this._profileOverlay) return;
    const el = this._profileOverlay;
    el.classList.remove('active');
    el.addEventListener('transitionend', () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, { once: true });
    this._profileOverlay = null;
  }

  _readPlayerXP(playerId) {
    try {
      const key = `codequest_player_${playerId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        return data.totalXP || 0;
      }
    } catch { }
    return 0;
  }

  _unbindEvents() {
    for (const { el, type, handler } of this._handlers) {
      el.removeEventListener(type, handler);
    }
    this._handlers = [];
    if (this._levelModal) {
      this._levelModal._destroy();
      this._levelModal = null;
    }
    if (this._profileOverlay) {
      this._profileOverlay.remove();
      this._profileOverlay = null;
    }
  }
}

export { LandingPage };
