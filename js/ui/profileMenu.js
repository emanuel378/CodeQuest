import { PlayerManager } from '../game/playerManager.js';
import { router } from './routes.js';

export class ProfileMenu {
  constructor(playerManager, onSwitch, onPlayerAdded) {
    this._pm = playerManager;
    this._onSwitch = onSwitch;
    this._onPlayerAdded = onPlayerAdded;
    this._el = null;
    this._overlay = null;
    this._dropdown = null;
    this._boundClickOutside = this._onClickOutside.bind(this);
  }

  mount() {
    const container = document.querySelector('.nav-controls');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'profile-btn-wrapper';
    wrapper.innerHTML = `
      <button class="profile-btn" id="profile-btn" title="Perfis de jogador">
        <span class="profile-btn-initial" id="profile-initial">?</span>
      </button>
    `;
    container.prepend(wrapper);
    this._el = wrapper;

    this._btn = wrapper.querySelector('#profile-btn');
    this._initial = wrapper.querySelector('#profile-initial');

    this._btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleDropdown();
    });

    this._updateIcon();

    this._rankBtn = document.createElement('button');
    this._rankBtn.className = 'nav-rank-btn';
    this._rankBtn.title = 'Ranking';
    this._rankBtn.innerHTML = '<span class="material-symbols-outlined">leaderboard</span>';
    this._rankBtn.addEventListener('click', () => router.navigate('/ranking'));
    container.prepend(this._rankBtn);
  }

  showAddPlayer() {
    this._showAddPlayerModal();
  }

  showPlayerList() {
    this._showPlayerList();
  }

  destroy() {
    this._closeDropdown();
    this._closeOverlay();
    if (this._rankBtn && this._rankBtn.parentNode) this._rankBtn.parentNode.removeChild(this._rankBtn);
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    this._el = null;
    this._rankBtn = null;
  }

  _updateIcon() {
    const player = this._pm.getActivePlayer();
    if (player) {
      this._initial.textContent = player.name.charAt(0).toUpperCase();
      this._btn.classList.add('active');
      this._btn.title = player.name;
    } else {
      this._initial.textContent = '?';
      this._btn.classList.remove('active');
      this._btn.title = 'Nenhum jogador';
    }
  }

  _toggleDropdown() {
    if (this._dropdown) {
      this._closeDropdown();
      return;
    }
    this._buildDropdown();
    document.addEventListener('click', this._boundClickOutside);
  }

  _buildDropdown() {
    const player = this._pm.getActivePlayer();
    const existing = this._el.querySelector('.profile-dropdown');
    if (existing) existing.remove();

    const dd = document.createElement('div');
    dd.className = 'profile-dropdown';
    dd.innerHTML = `
      <div class="profile-dropdown-header">
        <span class="profile-dropdown-name">${player ? player.name : 'Sem perfil ativo'}</span>
        <span class="profile-dropdown-xp">${player ? this._getPlayerXP(player.id) + ' XP' : ''}</span>
      </div>
      <button class="profile-dropdown-item" data-action="add">
        <span class="material-symbols-outlined">person_add</span> Adicionar Jogador
      </button>
      <button class="profile-dropdown-item" data-action="list">
        <span class="material-symbols-outlined">group</span> Jogadores Já Cadastrados
      </button>
    `;
    this._el.appendChild(dd);
    this._dropdown = dd;

    dd.querySelector('[data-action="add"]').addEventListener('click', () => {
      this._closeDropdown();
      this._showAddPlayerModal();
    });

    dd.querySelector('[data-action="list"]').addEventListener('click', () => {
      this._closeDropdown();
      this._showPlayerList();
    });
  }

  _closeDropdown() {
    if (this._dropdown) {
      this._dropdown.remove();
      this._dropdown = null;
    }
    document.removeEventListener('click', this._boundClickOutside);
  }

  _onClickOutside(e) {
    if (this._el && !this._el.contains(e.target)) {
      this._closeDropdown();
    }
  }

  _getPlayerXP(playerId) {
    try {
      const raw = localStorage.getItem(`codequest_player_${playerId}`);
      if (raw) {
        const data = JSON.parse(raw);
        return data.totalXP || 0;
      }
    } catch { }
    return 0;
  }

  _showAddPlayerModal() {
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.innerHTML = `
      <div class="profile-modal">
        <div class="profile-modal-icon-wrapper">
          <span class="material-symbols-outlined profile-modal-icon">badge</span>
        </div>
        <h2 class="profile-modal-title">NOVO JOGADOR</h2>
        <p class="profile-modal-text">Digite o nome do novo jogador:</p>
        <input class="profile-modal-input" id="profile-add-input" type="text" placeholder="Nome do jogador" maxlength="20" autocomplete="off">
        <div class="profile-modal-actions">
          <button class="profile-btn-cancel" id="profile-add-cancel">CANCELAR</button>
          <button class="profile-btn-confirm" id="profile-add-confirm">CRIAR</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._overlay = overlay;
    requestAnimationFrame(() => overlay.classList.add('active'));

    const input = overlay.querySelector('#profile-add-input');
    const cancel = overlay.querySelector('#profile-add-cancel');
    const confirm = overlay.querySelector('#profile-add-confirm');

    const close = () => {
      overlay.classList.remove('active');
      overlay.addEventListener('transitionend', () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, { once: true });
      this._overlay = null;
    };

    const save = () => {
      const name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }
      const player = this._pm.addPlayer(name);
      this._pm.setActivePlayer(player.id);
      this._updateIcon();
      close();
      if (this._onSwitch) this._onSwitch(player.id);
      if (this._onPlayerAdded) this._onPlayerAdded(player.id);
    };

    cancel.addEventListener('click', close);
    confirm.addEventListener('click', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
    });
    document.addEventListener('keydown', this._boundKeydown = (e) => {
      if (e.key === 'Escape') close();
    });
    setTimeout(() => input.focus(), 300);
  }

  _showPlayerList() {
    const players = this._pm.getPlayers();
    const activeId = this._pm.getActivePlayerId();

    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.innerHTML = `
      <div class="profile-modal profile-modal-lg">
        <h2 class="profile-modal-title">JOGADORES CADASTRADOS</h2>
        <div class="profile-list" id="profile-list">
          ${players.length === 0 ? '<div class="profile-list-empty">Nenhum jogador cadastrado</div>' : ''}
        </div>
        <button class="profile-btn-cancel profile-btn-full" id="profile-list-close">FECHAR</button>
      </div>
    `;
    document.body.appendChild(overlay);
    this._overlay = overlay;
    requestAnimationFrame(() => overlay.classList.add('active'));

    const list = overlay.querySelector('#profile-list');

    for (const p of players) {
      const xp = this._getPlayerXP(p.id);
      const isActive = p.id === activeId;
      const item = document.createElement('div');
      item.className = `profile-list-item${isActive ? ' active' : ''}`;
      item.dataset.id = p.id;

      const initial = p.name.charAt(0).toUpperCase();

      item.innerHTML = `
        <span class="profile-list-avatar">${initial}</span>
        <div class="profile-list-info">
          <span class="profile-list-name">${p.name}${isActive ? ' <span class="profile-list-badge">ATIVO</span>' : ''}</span>
          <span class="profile-list-xp">${xp} XP</span>
        </div>
        <span class="material-symbols-outlined profile-list-check">${isActive ? 'check_circle' : 'radio_button_unchecked'}</span>
        <button class="profile-list-delete" data-id="${p.id}" title="Deletar jogador">
          <span class="material-symbols-outlined">delete</span>
        </button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.profile-list-delete')) return;
        if (p.id === activeId) return;
        this._pm.setActivePlayer(p.id);
        this._updateIcon();
        this._closeOverlay();
        if (this._onSwitch) this._onSwitch(p.id);
      });

      const delBtn = item.querySelector('.profile-list-delete');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._confirmDelete(p);
      });

      list.appendChild(item);
    }

    const close = overlay.querySelector('#profile-list-close');
    const doClose = () => {
      overlay.classList.remove('active');
      overlay.addEventListener('transitionend', () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, { once: true });
      this._overlay = null;
    };
    close.addEventListener('click', doClose);
    document.addEventListener('keydown', this._boundKeydown = (e) => {
      if (e.key === 'Escape') doClose();
    });
  }

  _confirmDelete(player) {
    const xp = this._getPlayerXP(player.id);
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.innerHTML = `
      <div class="profile-modal">
        <div class="profile-modal-icon-wrapper" style="border-color: var(--error); box-shadow: 0 0 20px rgba(255, 180, 171, 0.2);">
          <span class="material-symbols-outlined profile-modal-icon" style="color: var(--error);">warning</span>
        </div>
        <h2 class="profile-modal-title" style="color: var(--error);">DELETAR JOGADOR</h2>
        <p class="profile-modal-text">Tem certeza que deseja deletar <strong>${player.name}</strong> (${xp} XP)?</p>
        <p class="profile-modal-text" style="font-size: 12px; color: var(--outline);">Todo o progresso será perdido permanentemente.</p>
        <div class="profile-modal-actions">
          <button class="profile-btn-cancel" id="profile-del-cancel">CANCELAR</button>
          <button class="profile-btn-danger" id="profile-del-confirm">DELETAR</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const cancel = overlay.querySelector('#profile-del-cancel');
    const confirm = overlay.querySelector('#profile-del-confirm');

    const close = () => {
      overlay.classList.remove('active');
      overlay.addEventListener('transitionend', () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, { once: true });
    };

    cancel.addEventListener('click', close);
    confirm.addEventListener('click', () => {
      const wasActive = player.id === this._pm.getActivePlayerId();
      const oldActiveId = this._pm.getActivePlayerId();
      this._pm.deletePlayer(player.id);
      close();
      this._closeOverlay();
      this._updateIcon();
      if (wasActive || oldActiveId === player.id) {
        const active = this._pm.getActivePlayer();
        if (this._onSwitch) this._onSwitch(active ? active.id : null);
      } else {
        this._showPlayerList();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    }, { once: true });
  }

  _closeOverlay() {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
  }
}
