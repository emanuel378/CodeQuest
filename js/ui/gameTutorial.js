const STEPS = [
  {
    title: 'Bem-vindo ao CodeQuest',
    icon: 'smart_toy',
    text: 'Em um mundo digital onde algoritmos governam tudo, a Cidade da Lógica está sob ameaça. Você é um programador em ascensão. Comande o robô Autômato através de desafios codificados e restaure a ordem no sistema.'
  },
  {
    title: 'Objetivo do Jogo',
    icon: 'flag',
    text: 'Cada nível tem um objetivo específico: alcance a bandeira, derrote todos os inimigos ou colete itens. Para isso, construa uma sequência de blocos de código que programe as ações do robô. Quanto mais eficiente seu código, maior sua pontuação!'
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
    this._enemyEl = null;
    this._goalEl = null;
    this._itemEl = null;
    this._obstacleEl = null;
    this._treeEl = null;
    this._enemyHpEl = null;
    this._cellSize = 80;

    this._demoIdx = 0;
    this._autoPlayTimer = null;

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
      this.hide();
      if (this._onComplete) this._onComplete();
    }
  }

  _prev() {
    if (this._currentStep > 0) this._goTo(this._currentStep - 1);
  }

  _skip() {
    this._stopAutoPlay();
    this.hide();
    if (this._onComplete) this._onComplete();
  }

  _goTo(index) {
    this._stopAutoPlay();
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
        this._renderDemoContent();
      } else {
        this._renderTextContent(step);
      }

      requestAnimationFrame(() => {
        this._contentEl.style.opacity = '1';
        this._contentEl.style.transform = 'translateX(0)';
        this._contentEl.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      if (step.hasDemo) {
        setTimeout(() => this._startAutoPlay(), 500);
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

  _renderDemoContent() {
    this._contentEl.innerHTML = `
      <div class="tutorial-step tutorial-step-demo" style="overflow:hidden;width:100%;">
        <h2 class="tutorial-title">Controles e Regras</h2>
        <p class="tutorial-text">${STEPS[2].text}</p>
        <div class="tutorial-demo">
          <div class="tutorial-demo-grid" id="tut-grid">
            <div class="tutorial-grid-bg"></div>
            <div class="tutorial-entity tutorial-tree" data-x="1" data-y="0" id="tut-tree">
              <span class="material-symbols-outlined">forest</span>
            </div>
            <div class="tutorial-entity tutorial-enemy" data-x="2" data-y="1" id="tut-enemy">
              <span class="material-symbols-outlined">bug_report</span>
              <span class="tutorial-enemy-hp" id="tut-enemy-hp">HP:1</span>
            </div>
            <div class="tutorial-entity tutorial-item" data-x="1" data-y="2" id="tut-item" style="display:none">
              <span class="material-symbols-outlined">diamond</span>
            </div>
            <div class="tutorial-entity tutorial-obstacle" data-x="1" data-y="1" id="tut-obstacle" style="display:none">
              <span class="material-symbols-outlined">boulder</span>
            </div>
            <div class="tutorial-entity tutorial-goal" data-x="2" data-y="2" id="tut-goal">
              <span class="material-symbols-outlined">flag</span>
            </div>
            <div class="tutorial-robot" id="tut-robot">
              <span class="material-symbols-outlined">smart_toy</span>
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
  }

  _setupGrid() {
    this._gridEl = this._el.querySelector('#tut-grid');
    this._robotEl = this._el.querySelector('#tut-robot');
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
      this._robotEl.style.transform = 'rotate(90deg)';
      this._robotEl.style.opacity = '1';
      this._robotEl.style.boxShadow = '';
      this._robotEl.classList.remove('tutorial-scan', 'tutorial-activate');
    }

    if (this._enemyEl) {
      this._enemyEl.style.display = 'flex';
      this._enemyEl.style.opacity = '1';
      this._enemyEl.classList.remove('tutorial-enemy-attacked');
    }
    if (this._enemyHpEl) this._enemyHpEl.textContent = 'HP:1';
    if (this._itemEl) this._itemEl.style.display = 'none';
    if (this._obstacleEl) this._obstacleEl.style.display = 'none';
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
    this._robotEl.style.transform = `rotate(${this._rdir * 90}deg)`;
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

    this._robotEl.style.transition = 'left 0.6s ease, top 0.6s ease, transform 0.5s ease';

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
        this._robotEl.style.transition = 'top 0.3s ease, left 0.5s ease, transform 0.5s ease';
        const cs = this._cellSize;
        this._robotEl.style.top = `${(this._ry - 0.5) * cs + cs * 0.15}px`;
        await this._delay(350);
        this._rx = Math.max(0, Math.min(2, this._rx + dx * 2));
        this._ry = Math.max(0, Math.min(2, this._ry + dy * 2));
        this._updateRobotPos();
        await this._delay(600);
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
