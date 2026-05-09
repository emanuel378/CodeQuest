const LEVEL_META = [
  { id: 0, name: 'Tutorial', icon: 'school', desc: 'Aprenda os controles básicos movendo o herói até o objetivo.', theme: 'ocean' },
  { id: 1, name: 'Cidade da Lógica', icon: 'apartment', desc: 'Use if/else para tomar decisões. Mova até o inimigo e ataque!', theme: 'ocean' },
  { id: 2, name: 'Floresta dos Algoritmos', icon: 'forest', desc: 'Use repetição para navegar pela floresta e derrotar inimigos.', theme: 'forest' },
  { id: 3, name: 'Núcleo de Logicron', icon: 'memory', desc: 'Derrote o boss final e chegue ao núcleo do Logicron!', theme: 'void' }
];

const THEME_GLOW = {
  ocean: 'var(--primary-container)',
  forest: 'var(--tertiary-container)',
  void: 'var(--secondary)'
};

class LevelSelectModal {
  constructor(onSelect, onClosed, { currentLevel = 0, completedLevels = [] } = {}) {
    this.onSelect = onSelect;
    this.onClosed = onClosed;
    this.currentLevel = currentLevel;
    this.completedLevels = completedLevels;
    this.el = null;
    this._handlers = [];
    this._closing = false;
    this._closeTimer = null;
  }

  _close(callback) {
    if (!this.el || this._closing) return;
    this._closing = true;

    const modal = this.el.querySelector('.lvl-modal');
    if (modal) modal.classList.remove('active');
    this.el.classList.remove('active');

    const transHandler = () => {
      this._destroy();
      if (callback) callback();
    };
    this.el.addEventListener('transitionend', transHandler, { once: true });
    this._handlers.push({ el: this.el, type: 'transitionend', handler: transHandler });

    this._closeTimer = setTimeout(() => {
      this._closing = false;
      if (this.el && this.el.parentNode) {
        this._destroy();
        if (callback) callback();
      }
    }, 400);
  }

  _destroy() {
    if (this._closeTimer) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }

    for (const { el, type, handler } of this._handlers) {
      el.removeEventListener(type, handler);
    }
    this._handlers = [];

    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    document.body.style.overflow = '';
    this.el = null;
    this._closing = false;

    if (this.onClosed) this.onClosed();
  }

  _build() {
    if (this.el) this._destroy();

    const overlay = document.createElement('div');
    overlay.className = 'lvl-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'lvl-modal';

    const header = document.createElement('div');
    header.className = 'lvl-modal-header';
    header.innerHTML = `
      <div class="lvl-modal-header-text">
        <h2 class="lvl-modal-title">Selecionar Fase</h2>
        <p class="lvl-modal-subtitle">Escolha uma missão para iniciar</p>
      </div>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lvl-modal-close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';

    const closeHandler = () => this._close();
    closeBtn.addEventListener('click', closeHandler);
    this._handlers.push({ el: closeBtn, type: 'click', handler: closeHandler });
    header.appendChild(closeBtn);
    modal.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'lvl-modal-grid';

    for (const level of LEVEL_META) {
      const isUnlocked = level.id <= this.currentLevel;
      const isCompleted = this.completedLevels.includes(level.id);
      const glow = THEME_GLOW[level.theme] || 'var(--primary-container)';

      const card = document.createElement('div');
      card.className = `lvl-card${isUnlocked ? ' lvl-card--unlocked' : ' lvl-card--locked'}${isCompleted ? ' lvl-card--completed' : ''}`;
      card.style.setProperty('--card-glow', glow);
      card.dataset.level = level.id;

      if (!isUnlocked) {
        card.dataset.locked = '';
      }

      const bar = document.createElement('div');
      bar.className = 'lvl-card-bar';
      bar.style.background = glow;
      card.appendChild(bar);

      const content = document.createElement('div');
      content.className = 'lvl-card-content';

      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'lvl-card-icon-wrapper';
      iconWrapper.innerHTML = `<span class="material-symbols-outlined lvl-card-icon">${level.icon}</span>`;
      content.appendChild(iconWrapper);

      const num = document.createElement('span');
      num.className = 'lvl-card-number';
      num.textContent = `NÍVEL ${level.id}`;
      content.appendChild(num);

      const nameEl = document.createElement('h3');
      nameEl.className = 'lvl-card-name';
      nameEl.textContent = level.name;
      content.appendChild(nameEl);

      const desc = document.createElement('p');
      desc.className = 'lvl-card-desc';
      desc.textContent = level.desc;
      content.appendChild(desc);

      const status = document.createElement('span');
      if (isCompleted) {
        status.className = 'lvl-card-status lvl-card-status--completed';
        status.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Concluído';
      } else if (isUnlocked) {
        status.className = 'lvl-card-status lvl-card-status--available';
        status.innerHTML = '<span class="material-symbols-outlined">play_arrow</span> Jogar';
      } else {
        status.className = 'lvl-card-status lvl-card-status--locked';
        status.innerHTML = '<span class="material-symbols-outlined">lock</span> Bloqueado';
      }
      content.appendChild(status);

      card.appendChild(content);

      if (isUnlocked) {
        const cardHandler = () => {
          this._close(() => {
            if (this.onSelect) this.onSelect(level.id);
          });
        };
        card.addEventListener('click', cardHandler);
        this._handlers.push({ el: card, type: 'click', handler: cardHandler });
      }

      grid.appendChild(card);
    }

    modal.appendChild(grid);
    overlay.appendChild(modal);
    this.el = overlay;

    const overlayHandler = (e) => {
      if (e.target === overlay) this._close();
    };
    overlay.addEventListener('click', overlayHandler);
    this._handlers.push({ el: overlay, type: 'click', handler: overlayHandler });

    const escHandler = (e) => {
      if (e.key === 'Escape') this._close();
    };
    document.addEventListener('keydown', escHandler);
    this._handlers.push({ el: document, type: 'keydown', handler: escHandler });
  }

  show() {
    this._build();
    document.body.style.overflow = 'hidden';
    document.body.appendChild(this.el);
    requestAnimationFrame(() => {
      this.el.classList.add('active');
      const modal = this.el.querySelector('.lvl-modal');
      if (modal) modal.classList.add('active');
    });
  }
}

export { LevelSelectModal };
