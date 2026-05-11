const STEPS = [
  {
    title: 'Bem-vindo ao CodeQuest',
    icon: 'smart_toy',
    text: 'Em um mundo digital onde algoritmos governam tudo, a Cidade da Lógica está sob ameaça. Você é um programador em ascensão. Comande o robô Autômato através de desafios codificados e restaure a ordem no sistema.'
  },
  {
    title: 'Objetivo do Jogo',
    icon: 'flag',
    text: 'Cada nível possui objetivos a serem cumpridos. Veja na prática como completá-los:',
    hasDemo: true,
    demoType: 'objective'
  },
  {
    title: 'Controles e Regras',
    icon: 'controller',
    text: 'Arraste blocos da paleta para o workspace e encaixe-os para formar programas sequenciais. Use blocos de controle como "Se" e "Repetir" para criar lógica avançada. Veja abaixo os blocos disponíveis:',
    hasDemo: true
  },
  {
    title: 'Prepare-se',
    icon: 'rocket_launch',
    text: 'O sistema está esperando. Cada linha de código que você escrever restaurará um pedaço da Cidade da Lógica. Mostre do que é feito, programador.'
  }
];

const DEMO_CATEGORIES = [
  {
    label: 'Movimento',
    color: 'var(--primary-container)',
    items: [
      { type: 'move', label: 'Mover Frente', icon: 'arrow_upward', desc: 'Move o robô 1 casa para frente' },
      { type: 'turnRight', label: 'Girar Direita', icon: 'rotate_right', desc: 'Gira o robô 90° para direita' },
      { type: 'turnLeft', label: 'Girar Esquerda', icon: 'rotate_left', desc: 'Gira o robô 90° para esquerda' },
      { type: 'jump', label: 'Pular', icon: 'keyboard_double_arrow_up', desc: 'Pula 2 casas à frente, ignorando obstáculos no meio' }
    ]
  },
  {
    label: 'Controle',
    color: 'var(--secondary-container)',
    items: [
      { type: 'if', label: 'Se / Senão', icon: 'call_split', desc: 'Executa blocos se uma condição for verdadeira; senão, executa alternativa' },
      { type: 'repeat', label: 'Repetir', icon: 'repeat', desc: 'Repete os blocos internos um número N de vezes' },
      { type: 'while', label: 'Enquanto', icon: 'loop', desc: 'Repete os blocos internos enquanto uma condição for verdadeira' }
    ]
  },
  {
    label: 'Combate',
    color: 'var(--error)',
    items: [
      { type: 'attack', label: 'Atacar', icon: 'swords', desc: 'Ataca o inimigo na casa à frente, causando 1 de dano' }
    ]
  },
  {
    label: 'Variáveis',
    color: 'var(--secondary)',
    items: [
      { type: 'custom_var', label: 'Variável', icon: 'data_object', desc: 'Bloco de variável personalizada criada na paleta' }
    ]
  }
];

const TOTAL_BLOCKS = DEMO_CATEGORIES.reduce((s, c) => s + c.items.length, 0);

const ALL_BLOCKS = [];
for (const cat of DEMO_CATEGORIES) {
  for (const item of cat.items) {
    ALL_BLOCKS.push({ ...item, catLabel: cat.label, catColor: cat.color });
  }
}

const DIR_SPRITES = [
  'assets/sprites/player/principalcostas.png',
  'assets/sprites/player/principaldireito.png',
  'assets/sprites/player/principal.png',
  'assets/sprites/player/principalesquerdo.png'
];

export class GameTutorial {
  constructor(onComplete) {
    this._onComplete = onComplete;
    this._currentStep = 0;
    this._autoPlaying = false;
    this._animating = false;

    this._rx = 0;
    this._ry = 1;
    this._rdir = 1;

    this._el = null;
    this._contentEl = null;
    this._dotsEl = null;
    this._prevBtn = null;
    this._nextBtn = null;

    this._gridEl = null;
    this._robotEl = null;
    this._robotImg = null;
    this._enemyEl = null;
    this._goalEl = null;
    this._itemEl = null;
    this._obstacleEl = null;
    this._treeEl = null;
    this._enemyHpEl = null;
    this._cellSize = 80;

    this._demoIdx = 0;
    this._autoPlayTimer = null;

    this._objDemoRunning = false;
    this._objDemoTimer = null;
    this._objDemoPhase = 0;

    this._build();
  }

  _build() {
    this._el = document.createElement('div');
    this._el.className = 'tutorial-overlay';
    this._el.innerHTML = `
      <div class="tutorial-modal">
        <button class="tutorial-skip-btn" id="tut-skip">Pular tutorial</button>
        <div class="tutorial-content" id="tut-content"></div>
        <div class="tutorial-footer">
          <div class="tutorial-dots" id="tut-dots"></div>
          <div class="tutorial-nav">
            <button class="tutorial-btn tutorial-btn-ghost" id="tut-prev">Voltar</button>
            <button class="tutorial-btn tutorial-btn-primary" id="tut-next">Próximo</button>
          </div>
        </div>
      </div>
    `;

    this._contentEl = this._el.querySelector('#tut-content');
    this._dotsEl = this._el.querySelector('#tut-dots');
    this._prevBtn = this._el.querySelector('#tut-prev');
    this._nextBtn = this._el.querySelector('#tut-next');

    this._prevBtn.addEventListener('click', () => this._prev());
    this._nextBtn.addEventListener('click', () => this._next());
    this._skipBtn = this._el.querySelector('#tut-skip');
    this._skipBtn.addEventListener('click', () => this._skip());

    this._renderDots();
  }

  show() {
    document.body.appendChild(this._el);
    requestAnimationFrame(() => this._el.classList.add('active'));
    this._renderStep(0);
  }

  hide() {
    this._stopAutoPlay();
    this._stopObjDemo();
    this._el.classList.remove('active');
    this._el.addEventListener('transitionend', () => {
      if (this._el.parentNode) this._el.parentNode.removeChild(this._el);
    }, { once: true });
  }

  _next() {
    if (this._currentStep < STEPS.length - 1) {
      this._goTo(this._currentStep + 1);
    } else {
      this._stopAutoPlay();
      this._stopObjDemo();
      this.hide();
      if (this._onComplete) this._onComplete();
    }
  }

  _prev() {
    if (this._currentStep > 0) this._goTo(this._currentStep - 1);
  }

  _skip() {
    this._stopAutoPlay();
    this._stopObjDemo();
    this.hide();
    if (this._onComplete) this._onComplete();
  }

  _goTo(index) {
    this._stopAutoPlay();
    this._stopObjDemo();
    this._currentStep = index;
    this._updateDots();
    this._updateNav();
    this._renderStep(index);
  }

  _renderStep(index) {
    const step = STEPS[index];

    this._contentEl.style.opacity = '0';
    this._contentEl.style.transform = 'translateX(30px)';

    setTimeout(() => {
      if (step.hasDemo) {
        if (step.demoType === 'objective') {
          this._renderObjectiveDemoContent();
        } else {
          this._renderDemoContent();
        }
      } else {
        this._renderTextContent(step);
      }

      requestAnimationFrame(() => {
        this._contentEl.style.opacity = '1';
        this._contentEl.style.transform = 'translateX(0)';
        this._contentEl.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      if (step.hasDemo) {
        if (step.demoType === 'objective') {
          setTimeout(() => this._startObjDemo(), 500);
        } else {
          setTimeout(() => this._startAutoPlay(), 500);
        }
      }
    }, 250);
  }

  _renderTextContent(step) {
    this._contentEl.innerHTML = `
      <div class="tutorial-step tutorial-step-text">
        <div class="tutorial-icon-wrapper">
          <span class="material-symbols-outlined tutorial-icon">${step.icon}</span>
        </div>
        <h2 class="tutorial-title">${step.title}</h2>
        <p class="tutorial-text">${step.text}</p>
      </div>
    `;
  }

  _renderObjectiveDemoContent() {
    this._contentEl.innerHTML = `
      <div class="tutorial-step tutorial-step-demo" style="overflow:hidden;width:100%;">
        <h2 class="tutorial-title">Objetivo do Jogo</h2>
        <p class="tutorial-text">Cada nível possui objetivos a serem cumpridos. Observe:</p>
        <div class="tutorial-obj-demo">
          <div class="tutorial-obj-demo-row">
            <div class="tutorial-demo-grid" id="tut-obj-grid">
              <div class="tutorial-grid-bg"></div>
              <div class="tutorial-entity tutorial-enemy" data-x="1" data-y="1" id="tut-obj-enemy">
                <img class="tut-entity-img" src="assets/sprites/enemies/laser.png">
                <span class="tutorial-enemy-hp" id="tut-obj-enemy-hp">HP:1</span>
              </div>
              <div class="tutorial-entity tutorial-goal" data-x="2" data-y="1" id="tut-obj-goal">
                <img class="tut-entity-img" src="assets/sprites/goal/portalciano.png">
              </div>
              <div class="tutorial-robot" id="tut-obj-robot">
                <img class="tut-entity-img" id="tut-obj-robot-img" src="assets/sprites/player/principaldireito.png">
              </div>
            </div>
            <div class="tut-obj-demo-panel" id="tut-obj-demo-panel">
              <div class="tut-obj-demo-header">
                <span class="material-symbols-outlined tut-obj-demo-header-icon">checklist</span>
                <span class="tut-obj-demo-title">OBJETIVOS</span>
              </div>
              <div class="tut-obj-demo-list" id="tut-obj-demo-list">
                <div class="tut-obj-demo-item" data-tut-obj-id="reach_goal">
                  <span class="material-symbols-outlined tut-obj-demo-check">radio_button_unchecked</span>
                  <span class="tut-obj-demo-desc">Alcance o portal de saída</span>
                </div>
                <div class="tut-obj-demo-item" data-tut-obj-id="defeat_enemies">
                  <span class="material-symbols-outlined tut-obj-demo-check">radio_button_unchecked</span>
                  <span class="tut-obj-demo-desc">Derrote os inimigos</span>
                </div>
              </div>
            </div>
          </div>
          <div class="tut-obj-demo-status" id="tut-obj-status">Preparando...</div>
          <div class="tutorial-demo-card-row">
            <button class="tutorial-demo-play-btn" id="tut-obj-replay" title="Repetir">
              <span class="material-symbols-outlined">replay</span>
            </button>
          </div>
        </div>
      </div>
    `;

    for (const el of this._contentEl.querySelectorAll('.tutorial-entity, .tutorial-robot')) {
      el.style.opacity = '0';
    }
  }

  _setupObjGrid() {
    this._gridEl = this._el.querySelector('#tut-obj-grid');
    this._robotEl = this._el.querySelector('#tut-obj-robot');
    this._robotImg = this._el.querySelector('#tut-obj-robot-img');
    this._enemyEl = this._el.querySelector('#tut-obj-enemy');
    this._enemyHpEl = this._el.querySelector('#tut-obj-enemy-hp');
    this._goalEl = this._el.querySelector('#tut-obj-goal');
    this._cellSize = this._gridEl ? this._gridEl.offsetWidth / 3 : 80;

    const cs = this._cellSize;
    for (const el of this._gridEl.querySelectorAll('.tutorial-entity')) {
      const x = parseInt(el.dataset.x) || 0;
      const y = parseInt(el.dataset.y) || 0;
      el.style.left = `${x * cs}px`;
      el.style.top = `${y * cs}px`;
      el.style.width = `${cs}px`;
      el.style.height = `${cs}px`;
    }

    this._resetObjGrid();

    for (const el of this._gridEl.querySelectorAll('.tutorial-entity, .tutorial-robot')) {
      el.style.opacity = '1';
    }

    const replayBtn = this._el.querySelector('#tut-obj-replay');
    if (replayBtn) replayBtn.addEventListener('click', () => this._replayObjDemo());
  }

  _resetObjGrid() {
    this._rx = 0;
    this._ry = 1;
    this._rdir = 1;

    const cs = this._cellSize;
    const pad = cs * 0.15;
    const sz = cs * 0.7;

    if (this._robotEl) {
      this._robotEl.style.transition = 'none';
      this._robotEl.style.left = `${this._rx * cs + pad}px`;
      this._robotEl.style.top = `${this._ry * cs + pad}px`;
      this._robotEl.style.width = `${sz}px`;
      this._robotEl.style.height = `${sz}px`;
      this._robotEl.style.opacity = '1';
      this._robotEl.style.boxShadow = '';
      this._robotEl.classList.remove('tutorial-scan');
    }
    if (this._robotImg) this._robotImg.src = DIR_SPRITES[this._rdir];

    if (this._enemyEl) {
      this._enemyEl.style.display = 'flex';
      this._enemyEl.style.opacity = '1';
      this._enemyEl.classList.remove('tutorial-enemy-attacked');
    }
    if (this._enemyHpEl) this._enemyHpEl.textContent = 'HP:1';
    if (this._goalEl) this._goalEl.style.display = 'flex';

    this._resetObjDemoChecks();
  }

  _resetObjDemoChecks() {
    const list = this._el.querySelector('#tut-obj-demo-list');
    if (!list) return;
    const items = list.querySelectorAll('.tut-obj-demo-item');
    for (const item of items) {
      item.classList.remove('tut-obj-demo-checked');
      const icon = item.querySelector('.tut-obj-demo-check');
      if (icon) icon.textContent = 'radio_button_unchecked';
    }
  }

  async _startObjDemo() {
    this._objDemoRunning = true;
    this._setupObjGrid();
    await this._delay(500);

    this._objDemoPhase = 0;
    await this._runObjDemoPhase(0);
  }

  async _runObjDemoPhase(phase) {
    if (!this._objDemoRunning) return;
    this._objDemoPhase = phase;

    const statusEl = this._el.querySelector('#tut-obj-status');
    const list = this._el.querySelector('#tut-obj-demo-list');

    if (!this._robotEl || !this._enemyEl) return;

    switch (phase) {
      case 0: {
        if (statusEl) statusEl.textContent = 'Derrote o inimigo bloqueando o caminho...';

        this._robotEl.classList.add('tutorial-scan');
        await this._delay(400);
        this._robotEl.classList.remove('tutorial-scan');

        this._enemyEl.classList.add('tutorial-enemy-attacked');
        await this._delay(350);
        this._enemyEl.style.display = 'none';
        if (this._enemyHpEl) this._enemyHpEl.textContent = 'HP:0';

        const defeatItem = list ? list.querySelector('[data-tut-obj-id="defeat_enemies"]') : null;
        if (defeatItem) {
          defeatItem.classList.add('tut-obj-demo-checked');
          const icon = defeatItem.querySelector('.tut-obj-demo-check');
          if (icon) icon.textContent = 'check_circle';
        }

        await this._delay(1200);
        if (this._objDemoRunning) this._runObjDemoPhase(1);
        break;
      }

      case 1: {
        if (statusEl) statusEl.textContent = 'Agora ande até o portal de saída...';

        this._robotEl.style.transition = 'left 0.5s ease, top 0.5s ease';
        this._rx = 1;
        this._ry = 1;
        this._updateObjRobotPos();
        await this._delay(600);

        if (!this._objDemoRunning) return;

        this._rx = 2;
        this._ry = 1;
        this._updateObjRobotPos();
        await this._delay(600);

        if (!this._objDemoRunning) return;

        const reachItem = list ? list.querySelector('[data-tut-obj-id="reach_goal"]') : null;
        if (reachItem) {
          reachItem.classList.add('tut-obj-demo-checked');
          const icon = reachItem.querySelector('.tut-obj-demo-check');
          if (icon) icon.textContent = 'check_circle';
        }

        await this._delay(800);
        if (this._objDemoRunning) this._runObjDemoPhase(2);
        break;
      }

      case 2: {
        if (statusEl) statusEl.textContent = 'Missão cumprida! Você completou todos os objetivos!';
        this._objDemoRunning = false;

        const icon = this._el.querySelector('#tut-obj-replay .material-symbols-outlined');
        if (icon) icon.textContent = 'replay';
        break;
      }
    }
  }

  _updateObjRobotPos() {
    if (!this._robotEl) return;
    const cs = this._cellSize;
    this._robotEl.style.left = `${this._rx * cs + cs * 0.15}px`;
    this._robotEl.style.top = `${this._ry * cs + cs * 0.15}px`;
    this._robotEl.style.width = `${cs * 0.7}px`;
    this._robotEl.style.height = `${cs * 0.7}px`;
  }

  _replayObjDemo() {
    if (this._objDemoRunning) return;
    this._objDemoRunning = true;
    this._resetObjGrid();
    this._objDemoPhase = 0;
    this._runObjDemoPhase(0);
  }

  _stopObjDemo() {
    this._objDemoRunning = false;
    if (this._objDemoTimer) {
      clearTimeout(this._objDemoTimer);
      this._objDemoTimer = null;
    }
  }

  _renderDemoContent() {
    this._contentEl.innerHTML = `
      <div class="tutorial-step tutorial-step-demo" style="overflow:hidden;width:100%;">
        <h2 class="tutorial-title">Controles e Regras</h2>
        <p class="tutorial-text">${STEPS[2].text}</p>
        <div class="tutorial-demo">
          <div class="tutorial-demo-grid" id="tut-grid">
            <div class="tutorial-grid-bg"></div>
            <div class="tutorial-entity tutorial-tree" data-x="1" data-y="0" id="tut-tree">
              <img class="tut-entity-img" src="assets/sprites/obstacles/barril.png">
            </div>
            <div class="tutorial-entity tutorial-enemy" data-x="1" data-y="2" id="tut-enemy">
              <img class="tut-entity-img" src="assets/sprites/enemies/laser.png">
              <span class="tutorial-enemy-hp" id="tut-enemy-hp">HP:1</span>
            </div>
            <div class="tutorial-entity tutorial-item" data-x="1" data-y="2" id="tut-item" style="display:none">
              <img class="tut-entity-img" src="assets/sprites/items/bau.png">
            </div>
            <div class="tutorial-entity tutorial-obstacle" data-x="1" data-y="1" id="tut-obstacle" style="display:none">
              <img class="tut-entity-img" src="assets/sprites/obstacles/barreira.png">
            </div>
            <div class="tutorial-entity tutorial-goal" data-x="2" data-y="1" id="tut-goal">
              <img class="tut-entity-img" src="assets/sprites/goal/portalciano.png">
            </div>
            <div class="tutorial-robot" id="tut-robot">
              <img class="tut-entity-img" id="tut-robot-img" src="assets/sprites/player/principaldireito.png">
            </div>
          </div>
          <div class="tutorial-demo-info">
            <span class="tutorial-demo-category" id="tut-category">Movimento</span>
            <span class="tutorial-demo-counter" id="tut-counter">1/${TOTAL_BLOCKS}</span>
          </div>
          <div class="tutorial-demo-card-row">
            <button class="tutorial-demo-arrow" id="tut-arrow-prev" title="Bloco anterior">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <div class="tutorial-demo-block-card" id="tut-card">
              <span class="material-symbols-outlined tutorial-demo-block-icon" id="tut-card-icon">arrow_upward</span>
              <span class="tutorial-demo-block-label" id="tut-card-label">Mover Frente</span>
            </div>
            <button class="tutorial-demo-arrow" id="tut-arrow-next" title="Próximo bloco">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
            <button class="tutorial-demo-play-btn" id="tut-play-btn" title="Auto-play">
              <span class="material-symbols-outlined" id="tut-play-icon">pause</span>
            </button>
          </div>
          <p class="tutorial-demo-desc" id="tut-desc">Move o robô 1 casa para frente</p>
        </div>
      </div>
    `;

    for (const el of this._contentEl.querySelectorAll('.tutorial-entity, .tutorial-robot')) {
      el.style.opacity = '0';
    }
  }

  _setupGrid() {
    this._gridEl = this._el.querySelector('#tut-grid');
    this._robotEl = this._el.querySelector('#tut-robot');
    this._robotImg = this._el.querySelector('#tut-robot-img');
    this._enemyEl = this._el.querySelector('#tut-enemy');
    this._enemyHpEl = this._el.querySelector('#tut-enemy-hp');
    this._goalEl = this._el.querySelector('#tut-goal');
    this._itemEl = this._el.querySelector('#tut-item');
    this._obstacleEl = this._el.querySelector('#tut-obstacle');
    this._treeEl = this._el.querySelector('#tut-tree');

    const prevBtn = this._el.querySelector('#tut-arrow-prev');
    const nextBtn = this._el.querySelector('#tut-arrow-next');
    const playBtn = this._el.querySelector('#tut-play-btn');

    if (prevBtn) prevBtn.addEventListener('click', () => this._demoPrev());
    if (nextBtn) nextBtn.addEventListener('click', () => this._demoNext());
    if (playBtn) playBtn.addEventListener('click', () => this._demoTogglePlay());

    this._cellSize = this._gridEl ? this._gridEl.offsetWidth / 3 : 80;

    const cs = this._cellSize;
    for (const el of this._gridEl.querySelectorAll('.tutorial-entity')) {
      const x = parseInt(el.dataset.x) || 0;
      const y = parseInt(el.dataset.y) || 0;
      el.style.left = `${x * cs}px`;
      el.style.top = `${y * cs}px`;
      el.style.width = `${cs}px`;
      el.style.height = `${cs}px`;
    }

    this._resetGrid();

    for (const el of this._gridEl.querySelectorAll('.tutorial-entity, .tutorial-robot')) {
      el.style.opacity = '1';
    }
  }

  _resetGrid() {
    this._rx = 0;
    this._ry = 1;
    this._rdir = 1;

    const cs = this._cellSize;
    const pad = cs * 0.15;
    const sz = cs * 0.7;

    if (this._robotEl) {
      this._robotEl.style.transition = 'none';
      this._robotEl.style.left = `${this._rx * cs + pad}px`;
      this._robotEl.style.top = `${this._ry * cs + pad}px`;
      this._robotEl.style.width = `${sz}px`;
      this._robotEl.style.height = `${sz}px`;
      this._robotEl.style.opacity = '1';
      this._robotEl.style.boxShadow = '';
      this._robotEl.classList.remove('tutorial-scan', 'tutorial-activate', 'tutorial-damaged');
    }
    if (this._robotImg) this._robotImg.src = DIR_SPRITES[this._rdir];

    if (this._enemyEl) {
      this._enemyEl.style.display = 'flex';
      this._enemyEl.style.opacity = '1';
      this._enemyEl.classList.remove('tutorial-enemy-attacked');
    }
    if (this._enemyHpEl) this._enemyHpEl.textContent = 'HP:1';
    if (this._itemEl) this._itemEl.style.display = 'none';
    if (this._obstacleEl) {
      this._obstacleEl.style.display = 'none';
      const img = this._obstacleEl.querySelector('img');
      if (img) img.src = 'assets/sprites/obstacles/barreira.png';
    }
    if (this._treeEl) this._treeEl.style.display = 'flex';
    if (this._goalEl) this._goalEl.style.display = 'flex';
  }

  _updateRobotPos() {
    if (!this._robotEl) return;
    const cs = this._cellSize;
    this._robotEl.style.left = `${this._rx * cs + cs * 0.15}px`;
    this._robotEl.style.top = `${this._ry * cs + cs * 0.15}px`;
    this._robotEl.style.width = `${cs * 0.7}px`;
    this._robotEl.style.height = `${cs * 0.7}px`;
    if (this._robotImg) this._robotImg.src = DIR_SPRITES[this._rdir];
  }

  _delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  _isAlive() {
    return this._autoPlaying && this._el && this._el.parentNode;
  }

  async _startAutoPlay() {
    this._autoPlaying = true;
    this._setupGrid();
    await this._delay(400);

    this._demoIdx = 0;
    await this._showCurrentBlock();
    this._scheduleNext();
  }

  _scheduleNext() {
    this._clearSchedule();
    if (!this._autoPlaying) return;
    this._autoPlayTimer = setTimeout(() => {
      if (!this._autoPlaying) return;
      this._demoIdx = (this._demoIdx + 1) % ALL_BLOCKS.length;
      this._showCurrentBlock().then(() => {
        if (this._autoPlaying) this._scheduleNext();
      });
    }, 3800);
  }

  _clearSchedule() {
    if (this._autoPlayTimer) {
      clearTimeout(this._autoPlayTimer);
      this._autoPlayTimer = null;
    }
  }

  _stopAutoPlay() {
    this._autoPlaying = false;
    this._clearSchedule();
  }

  async _showCurrentBlock() {
    const block = ALL_BLOCKS[this._demoIdx];
    const displayIdx = this._demoIdx + 1;

    const categoryEl = this._el.querySelector('#tut-category');
    const counterEl = this._el.querySelector('#tut-counter');
    const cardEl = this._el.querySelector('#tut-card');
    const iconEl = this._el.querySelector('#tut-card-icon');
    const labelEl = this._el.querySelector('#tut-card-label');
    const descEl = this._el.querySelector('#tut-desc');

    if (categoryEl) {
      categoryEl.textContent = block.catLabel;
      categoryEl.style.color = block.catColor;
    }
    if (counterEl) counterEl.textContent = `${displayIdx}/${TOTAL_BLOCKS}`;
    if (iconEl) iconEl.textContent = block.icon;
    if (labelEl) labelEl.textContent = block.label;
    if (descEl) descEl.textContent = block.desc;

    if (cardEl) {
      cardEl.style.borderLeftColor = block.catColor;
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'scale(0.9)';
      requestAnimationFrame(() => {
        cardEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        cardEl.style.opacity = '1';
        cardEl.style.transform = 'scale(1)';
      });
    }

    this._resetGrid();
    await this._delay(600);
    await this._runAnimation(block.type);
    await this._delay(900);
  }

  async _runAnimation(type) {
    if (!this._robotEl) return;

    const dx = [0, 1, 0, -1][this._rdir];
    const dy = [-1, 0, 1, 0][this._rdir];

    this._robotEl.style.transition = 'left 0.6s ease, top 0.6s ease';

    switch (type) {
      case 'move': {
        this._rx = Math.max(0, Math.min(2, this._rx + dx));
        this._ry = Math.max(0, Math.min(2, this._ry + dy));
        this._updateRobotPos();
        await this._delay(700);
        break;
      }

      case 'turnRight': {
        this._rdir = (this._rdir + 1) % 4;
        this._updateRobotPos();
        await this._delay(600);
        break;
      }

      case 'turnLeft': {
        this._rdir = (this._rdir + 3) % 4;
        this._updateRobotPos();
        await this._delay(600);
        break;
      }

      case 'jump': {
        const cs = this._cellSize;

        if (this._obstacleEl) {
          const img = this._obstacleEl.querySelector('img');
          if (img) img.src = 'assets/sprites/obstacles/laser.png';
          this._obstacleEl.style.display = 'flex';
          this._obstacleEl.style.opacity = '1';
          await this._delay(450);
        }

        this._robotEl.style.transition = 'left 0.4s ease, top 0.4s ease';
        this._rx = 1;
        this._ry = 1;
        this._updateRobotPos();
        await this._delay(400);

        this._robotEl.classList.add('tutorial-damaged');
        await this._delay(500);
        this._robotEl.classList.remove('tutorial-damaged');

        this._robotEl.style.transition = 'none';
        this._rx = 0;
        this._ry = 1;
        this._updateRobotPos();
        await this._delay(250);

        this._robotEl.style.transition = 'top 0.3s ease, left 0.5s ease';
        this._robotEl.style.top = `${(this._ry - 0.5) * cs + cs * 0.15}px`;
        await this._delay(350);

        this._rx = Math.max(0, Math.min(2, this._rx + dx * 2));
        this._ry = Math.max(0, Math.min(2, this._ry + dy * 2));
        this._updateRobotPos();
        await this._delay(600);

        if (this._obstacleEl) {
          this._obstacleEl.style.display = 'none';
        }
        break;
      }

      case 'if': {
        if (this._obstacleEl) {
          this._obstacleEl.style.display = 'flex';
          this._obstacleEl.style.opacity = '0';
          await this._delay(50);
          this._obstacleEl.style.transition = 'opacity 0.3s ease';
          this._obstacleEl.style.opacity = '1';
          await this._delay(350);
        }
        if (this._robotEl) {
          this._robotEl.classList.add('tutorial-scan');
          await this._delay(600);
          this._robotEl.classList.remove('tutorial-scan');
        }
        if (this._obstacleEl) {
          this._obstacleEl.style.display = 'none';
        }
        break;
      }

      case 'repeat': {
        for (let i = 0; i < 3; i++) {
          if (!this._isAlive()) return;
          this._robotEl.style.transition = 'left 0.4s ease, top 0.4s ease';
          const nx = Math.max(0, Math.min(2, this._rx + dx));
          const ny = Math.max(0, Math.min(2, this._ry + dy));
          if (nx === this._rx && ny === this._ry) break;
          this._rx = nx;
          this._ry = ny;
          this._updateRobotPos();
          await this._delay(500);
        }
        break;
      }

      case 'while': {
        this._robotEl.style.transition = 'left 0.4s ease, top 0.4s ease';
        let steps = 0;
        while (steps < 3 && this._isAlive()) {
          const nx = Math.max(0, Math.min(2, this._rx + dx));
          const ny = Math.max(0, Math.min(2, this._ry + dy));
          if (nx === this._rx && ny === this._ry) break;
          this._rx = nx;
          this._ry = ny;
          this._updateRobotPos();
          await this._delay(500);
          steps++;
        }
        break;
      }

      case 'attack': {
        if (this._robotEl) {
          const cs = this._cellSize;
          const pad = cs * 0.15;
          this._robotEl.style.transition = 'left 0.5s ease, top 0.5s ease';
          this._robotEl.style.left = `${(this._rx + 1) * cs + pad}px`;
          await this._delay(500);
          this._robotEl.style.transition = 'none';
        }
        this._rx = 1;
        this._rdir = 2;
        if (this._robotImg) this._robotImg.src = DIR_SPRITES[this._rdir];
        await this._delay(300);
        if (this._enemyEl) {
          this._enemyEl.classList.add('tutorial-enemy-attacked');
          await this._delay(300);
          this._enemyEl.style.display = 'none';
        }
        if (this._enemyHpEl) this._enemyHpEl.textContent = 'HP:0';
        await this._delay(300);
        break;
      }

      case 'custom_var': {
        if (this._robotEl) {
          this._robotEl.classList.add('tutorial-scan');
          await this._delay(400);
          this._robotEl.classList.remove('tutorial-scan');
        }
        break;
      }
    }
  }

  _demoPrev() {
    this._clearSchedule();
    this._demoIdx = (this._demoIdx - 1 + ALL_BLOCKS.length) % ALL_BLOCKS.length;
    this._showCurrentBlock();
  }

  _demoNext() {
    this._clearSchedule();
    this._demoIdx = (this._demoIdx + 1) % ALL_BLOCKS.length;
    this._showCurrentBlock();
  }

  _demoTogglePlay() {
    if (this._autoPlaying) {
      this._stopAutoPlay();
      const icon = this._el.querySelector('#tut-play-icon');
      if (icon) icon.textContent = 'play_arrow';
    } else {
      this._autoPlaying = true;
      this._scheduleNext();
      const icon = this._el.querySelector('#tut-play-icon');
      if (icon) icon.textContent = 'pause';
    }
  }

  _renderDots() {
    this._dotsEl.innerHTML = STEPS.map((_, i) => `
      <span class="tutorial-dot ${i === 0 ? 'active' : ''}"></span>
    `).join('');
  }

  _updateDots() {
    const dots = this._dotsEl.querySelectorAll('.tutorial-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === this._currentStep));
  }

  _updateNav() {
    this._prevBtn.style.display = this._currentStep === 0 ? 'none' : 'inline-flex';
    this._nextBtn.textContent = this._currentStep === STEPS.length - 1 ? 'Começar Jogo' : 'Próximo';
  }
}
