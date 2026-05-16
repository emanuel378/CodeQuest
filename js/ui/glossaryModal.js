const CATEGORIES = [
  {
    id: 'movimento',
    label: 'Movimento',
    color: 'var(--primary-container)',
    icon: 'navigation',
    blocks: [
      { type: 'move', icon: 'arrow_upward', label: 'Mover Frente', desc: 'Move o jogador 1 célula para frente na direção atual', unlock: 0 },
      { type: 'turnRight', icon: 'rotate_right', label: 'Girar Direita', desc: 'Rotaciona o jogador 90° no sentido horário', unlock: 0 },
      { type: 'turnLeft', icon: 'rotate_left', label: 'Girar Esquerda', desc: 'Rotaciona o jogador 90° no sentido anti-horário', unlock: 0 },
      { type: 'jump', icon: 'keyboard_double_arrow_up', label: 'Pular', desc: 'Faz o jogador pular 2 células para frente', unlock: 0 }
    ]
  },
  {
    id: 'controle',
    label: 'Controle',
    color: 'var(--secondary-container)',
    icon: 'settings_ethernet',
    blocks: [
      { type: 'if', icon: 'call_split', label: 'Se (if)', desc: 'Executa os blocos internos se a condição for verdadeira, senão executa o bloco else', unlock: 1 },
      { type: 'repeat', icon: 'repeat', label: 'Repetir', desc: 'Repete os blocos internos N vezes (máx. 100)', unlock: 2 },
      { type: 'while', icon: 'loop', label: 'Enquanto', desc: 'Repete os blocos internos enquanto a condição for verdadeira (máx. 200 iterações)', unlock: 2 }
    ]
  },
  {
    id: 'combate',
    label: 'Combate',
    color: 'var(--error)',
    icon: 'swords',
    blocks: [
      { type: 'attack', icon: 'swords', label: 'Atacar', desc: 'Ataca o inimigo na célula frontal, causando 1 de dano', unlock: 0 }
    ]
  },
  {
    id: 'variavel',
    label: 'Variáveis',
    color: 'var(--secondary)',
    icon: 'data_object',
    blocks: [
      { type: 'set_var', icon: 'assignment', label: 'Definir', desc: 'Atribui um valor a uma variável', unlock: 0 },
      { type: 'change_var', icon: 'edit', label: 'Alterar', desc: 'Modifica o valor de uma variável existente', unlock: 0 },
      { icon: 'data_object', label: 'Variável customizada', desc: 'Bloco de variável criado pelo usuário via input na paleta', unlock: 0 }
    ]
  }
];

const ENEMIES = [
  {
    name: 'LaserBot',
    sprite: 'assets/sprites/enemies/laser.png',
    color: 'var(--primary-container)',
    hp: 'Configurável (1-3)',
    behavior: 'Atira laser a cada 2 ticks na direção que está virado',
    attack: 'Laser — raio em linha reta até obstáculo ou borda do grid; todas as células no caminho são atingidas',
    damage: 1,
    movement: 'Estático (não se move)',
    desc: 'Inimigo de longo alcance que dispara lasers periódicos. O laser atravessa múltiplas células, exigindo que o jogador se proteja atrás de obstáculos.'
  },
  {
    name: 'Turret',
    sprite: 'assets/sprites/enemies/turret/turret_frente.png',
    color: 'var(--secondary-container)',
    hp: 1,
    behavior: 'Rotaciona 90° no sentido horário a cada tick e ataca a célula imediatamente à frente',
    attack: 'Melee — atinge apenas a célula à frente da torreta',
    damage: 1,
    movement: 'Estático',
    desc: 'Torreta giratória que alterna sua direção de ataque a cada tick. Previsível, mas perigosa em corredores estreitos.'
  },
  {
    name: 'Patrol',
    sprite: 'assets/sprites/enemies/patrol.png',
    color: 'var(--error)',
    hp: 'Configurável (1-2)',
    behavior: 'Move-se em direção ao jogador usando distância Manhattan; prioriza o eixo com maior diferença',
    attack: 'Melee — quando adjacente ao jogador (distância 1), ataca em vez de se mover',
    damage: 1,
    movement: 'Ativo — caminha pelo grid, evitando obstáculos e outros inimigos',
    desc: 'Inimigo perseguidor que se move a cada 2 ticks em direção ao jogador. Exige planejamento de rota para evitar ser encurralado.'
  }
];

const UNLOCK_LABELS = {
  0: 'Inicial',
  1: 'Fase 1',
  2: 'Fase 2'
};

class GlossaryModal {
  constructor(onClosed) {
    this._onClosed = onClosed;
    this._el = null;
    this._handlers = [];
    this._closing = false;
    this._closeTimer = null;
  }

  _close(callback) {
    if (!this._el || this._closing) return;
    this._closing = true;

    const modal = this._el.querySelector('.glossary-modal');
    if (modal) modal.classList.remove('active');
    this._el.classList.remove('active');

    const transHandler = () => {
      this._destroy();
      if (callback) callback();
    };
    this._el.addEventListener('transitionend', transHandler, { once: true });

    this._closeTimer = setTimeout(() => {
      if (this._el && this._el.parentNode) {
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

    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    document.body.style.overflow = '';
    this._el = null;
    this._closing = false;

    if (this._onClosed) this._onClosed();
  }

  _build() {
    const overlay = document.createElement('div');
    overlay.className = 'glossary-overlay';

    overlay.innerHTML = `
      <div class="glossary-modal">
        <div class="glossary-header">
          <div class="glossary-header-left">
            <span class="material-symbols-outlined glossary-header-icon">menu_book</span>
            <h2 class="glossary-title">Glossário</h2>
          </div>
          <button class="glossary-close" aria-label="Fechar">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="glossary-tabs">
          <button class="glossary-tab active" data-tab="blocks">
            <span class="material-symbols-outlined glossary-tab-icon">widgets</span>
            Blocos
          </button>
          <button class="glossary-tab" data-tab="enemies">
            <span class="material-symbols-outlined glossary-tab-icon">smartphone</span>
            Inimigos
          </button>
        </div>

        <div class="glossary-body">
          <div class="glossary-panel active" id="glossary-panel-blocks"></div>
          <div class="glossary-panel" id="glossary-panel-enemies"></div>
        </div>
      </div>
    `;

    this._el = overlay;
    this._buildBlocksPanel();
    this._buildEnemiesPanel();
  }

  _buildBlocksPanel() {
    const panel = this._el.querySelector('#glossary-panel-blocks');
    if (!panel) return;

    for (const cat of CATEGORIES) {
      const section = document.createElement('div');
      section.className = 'glossary-category';

      const header = document.createElement('div');
      header.className = 'glossary-category-header';

      const dot = document.createElement('span');
      dot.className = 'glossary-category-dot';
      dot.style.background = cat.color;
      header.appendChild(dot);

      const label = document.createElement('span');
      label.className = 'glossary-category-label';
      label.style.color = cat.color;
      label.textContent = cat.label;
      header.appendChild(label);

      section.appendChild(header);

      for (const block of cat.blocks) {
        const item = document.createElement('div');
        item.className = 'glossary-block-item';
        item.style.setProperty('--item-color', cat.color);
        if (block.type) item.dataset.blockType = block.type;

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined glossary-block-icon';
        icon.style.color = cat.color;
        icon.textContent = block.icon;
        item.appendChild(icon);

        const info = document.createElement('div');
        info.className = 'glossary-block-info';

        const name = document.createElement('span');
        name.className = 'glossary-block-name';
        name.textContent = block.label;
        info.appendChild(name);

        const desc = document.createElement('span');
        desc.className = 'glossary-block-desc';
        desc.textContent = block.desc;
        info.appendChild(desc);

        item.appendChild(info);

        const badge = document.createElement('span');
        badge.className = `glossary-badge${block.unlock === 0 ? ' glossary-badge--unlocked' : ''}`;
        badge.textContent = UNLOCK_LABELS[block.unlock] || `Fase ${block.unlock}`;
        item.appendChild(badge);

        section.appendChild(item);
      }

      panel.appendChild(section);
    }
  }

  _buildEnemiesPanel() {
    const panel = this._el.querySelector('#glossary-panel-enemies');
    if (!panel) return;

    for (const enemy of ENEMIES) {
      const item = document.createElement('div');
      item.className = 'glossary-enemy-item';
      item.dataset.enemyName = enemy.name;
      item.style.setProperty('--item-color', enemy.color);

      const sprite = document.createElement('div');
      sprite.className = 'glossary-enemy-sprite';
      sprite.innerHTML = `<img src="${enemy.sprite}" alt="${enemy.name}" loading="lazy">`;
      item.appendChild(sprite);

      const info = document.createElement('div');
      info.className = 'glossary-enemy-info';

      const name = document.createElement('div');
      name.className = 'glossary-enemy-name';
      name.textContent = enemy.name;
      info.appendChild(name);

      const stats = document.createElement('div');
      stats.className = 'glossary-enemy-stats';

      const statDefs = [
        { label: 'HP', value: enemy.hp },
        { label: 'Dano', value: enemy.damage },
        { label: 'Ataque', value: enemy.attack },
        { label: 'Movimento', value: enemy.movement }
      ];

      for (const stat of statDefs) {
        const statEl = document.createElement('div');
        statEl.className = 'glossary-stat';

        const statLabel = document.createElement('span');
        statLabel.className = 'glossary-stat-label';
        statLabel.textContent = stat.label;
        statEl.appendChild(statLabel);

        const statValue = document.createElement('span');
        statValue.className = 'glossary-stat-value';
        statValue.textContent = stat.value;
        statEl.appendChild(statValue);

        stats.appendChild(statEl);
      }

      info.appendChild(stats);

      const desc = document.createElement('p');
      desc.className = 'glossary-enemy-desc';
      desc.textContent = enemy.desc;
      info.appendChild(desc);

      item.appendChild(info);
      panel.appendChild(item);
    }
  }

  _setupEvents() {
    const overlayHandler = (e) => {
      if (e.target === this._el) this._close();
    };
    this._el.addEventListener('click', overlayHandler);
    this._handlers.push({ el: this._el, type: 'click', handler: overlayHandler });

    const escHandler = (e) => {
      if (e.key === 'Escape') this._close();
    };
    document.addEventListener('keydown', escHandler);
    this._handlers.push({ el: document, type: 'keydown', handler: escHandler });

    const closeBtn = this._el.querySelector('.glossary-close');
    if (closeBtn) {
      const closeHandler = () => this._close();
      closeBtn.addEventListener('click', closeHandler);
      this._handlers.push({ el: closeBtn, type: 'click', handler: closeHandler });
    }

    const tabs = this._el.querySelectorAll('.glossary-tab');
    for (const tab of tabs) {
      const tabHandler = () => this._switchTab(tab.dataset.tab);
      tab.addEventListener('click', tabHandler);
      this._handlers.push({ el: tab, type: 'click', handler: tabHandler });
    }
  }

  _switchTab(tabId) {
    const tabs = this._el.querySelectorAll('.glossary-tab');
    for (const t of tabs) {
      t.classList.toggle('active', t.dataset.tab === tabId);
    }

    const panels = this._el.querySelectorAll('.glossary-panel');
    for (const p of panels) {
      p.classList.toggle('active', p.id === `glossary-panel-${tabId}`);
    }
  }

  _switchToEnemy(enemyName) {
    this._switchTab('enemies');
    const target = this._el.querySelector(`.glossary-enemy-item[data-enemy-name="${enemyName}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('glossary-enemy-highlight');
      setTimeout(() => target.classList.remove('glossary-enemy-highlight'), 1500);
    }
  }

  _switchToBlock(blockType) {
    this._switchTab('blocks');
    const target = this._el.querySelector(`.glossary-block-item[data-block-type="${blockType}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('glossary-block-highlight');
      setTimeout(() => target.classList.remove('glossary-block-highlight'), 2000);
    }
  }

  show(options = {}) {
    this._build();
    this._setupEvents();
    document.body.style.overflow = 'hidden';
    document.body.appendChild(this._el);

    const init = () => {
      this._el.classList.add('active');
      const modal = this._el.querySelector('.glossary-modal');
      if (modal) modal.classList.add('active');

      if (options.tab) {
        this._switchTab(options.tab);
      }
      if (options.scrollToEnemy) {
        requestAnimationFrame(() => {
          this._switchToEnemy(options.scrollToEnemy);
        });
      }
      if (options.scrollToBlock) {
        requestAnimationFrame(() => {
          this._switchToBlock(options.scrollToBlock);
        });
      }
    };

    requestAnimationFrame(init);
  }
}

export { GlossaryModal };
