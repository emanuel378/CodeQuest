const ENEMY_TYPE_MAP = [
  { name: 'LaserBot', sprite: 'assets/sprites/enemies/laser.png', color: 'var(--primary-container)' },
  { name: 'Turret', sprite: 'assets/sprites/enemies/turret/turret_frente.png', color: 'var(--secondary-container)' },
  { name: 'Patrol', sprite: 'assets/sprites/enemies/patrol.png', color: 'var(--error)' }
];

class EnemyInfoPanel {
  constructor(container, { onGlossaryRequest }) {
    this._container = container;
    this._onGlossaryRequest = onGlossaryRequest;
    this._handlers = [];
    this._highlightedId = null;
  }

  update(enemies) {
    if (!this._container) return;

    this._container.innerHTML = '';
    const aliveEnemies = (enemies || []).filter(e => e && e.alive);

    if (aliveEnemies.length === 0) {
      this._container.classList.add('hidden');
      return;
    }

    this._container.classList.remove('hidden');

    for (const enemy of aliveEnemies) {
      const card = this._renderCard(enemy);
      this._container.appendChild(card);
    }
  }

  _renderCard(enemy) {
    const typeInfo = ENEMY_TYPE_MAP[enemy.type ?? 0] || ENEMY_TYPE_MAP[0];
    const maxHp = enemy.maxHp || enemy.hp || 1;
    const currentHp = enemy.hp || 0;

    const card = document.createElement('div');
    card.className = 'sim-enemy-info-card';
    card.dataset.enemyId = enemy.id;

    const spriteBox = document.createElement('div');
    spriteBox.className = 'sim-enemy-info-sprite';
    const img = document.createElement('img');
    img.src = enemy.sprite || typeInfo.sprite;
    img.alt = typeInfo.name;
    img.className = 'sim-sprite';
    spriteBox.appendChild(img);

    const nameRow = document.createElement('div');
    nameRow.className = 'sim-enemy-info-name';
    nameRow.textContent = typeInfo.name;
    nameRow.style.color = typeInfo.color;

    const hpText = document.createElement('span');
    hpText.className = 'sim-enemy-info-hp-text';
    hpText.textContent = `HP ${currentHp}/${maxHp}`;

    const glossaryBtn = document.createElement('button');
    glossaryBtn.className = 'sim-enemy-info-glossary-btn';
    glossaryBtn.title = `Ver ${typeInfo.name} no glossário`;
    glossaryBtn.textContent = '?';
    glossaryBtn.addEventListener('click', () => {
      if (this._onGlossaryRequest) this._onGlossaryRequest(typeInfo.name);
    });

    card.appendChild(spriteBox);
    card.appendChild(nameRow);
    card.appendChild(hpText);
    card.appendChild(glossaryBtn);

    const enterHandler = () => this._onCardHover(enemy.id);
    const leaveHandler = () => this._onCardLeave(enemy.id);
    card.addEventListener('mouseenter', enterHandler);
    card.addEventListener('mouseleave', leaveHandler);
    this._handlers.push({ el: card, type: 'mouseenter', handler: enterHandler });
    this._handlers.push({ el: card, type: 'mouseleave', handler: leaveHandler });

    return card;
  }

  _onCardHover(id) {
    this._highlightedId = id;
    if (!this._container) return;

    const gridEnemy = document.querySelector(`.sim-enemy[data-enemy-id="${id}"]`);
    if (gridEnemy) gridEnemy.classList.add('sim-enemy-highlight');

    const card = this._container.querySelector(`.sim-enemy-info-card[data-enemy-id="${id}"]`);
    if (card) card.classList.add('highlight');
  }

  _onCardLeave(id) {
    this._highlightedId = null;
    if (!this._container) return;

    const gridEnemy = document.querySelector(`.sim-enemy[data-enemy-id="${id}"]`);
    if (gridEnemy) gridEnemy.classList.remove('sim-enemy-highlight');

    const card = this._container.querySelector(`.sim-enemy-info-card[data-enemy-id="${id}"]`);
    if (card) card.classList.remove('highlight');
  }

  highlightById(id) {
    if (!this._container) return;
    this._onCardHover(id);
  }

  clearHighlight() {
    if (!this._container) return;
    if (this._highlightedId) {
      this._onCardLeave(this._highlightedId);
    }
  }

  destroy() {
    for (const { el, type, handler } of this._handlers) {
      el.removeEventListener(type, handler);
    }
    this._handlers = [];
    if (this._container) {
      this._container.innerHTML = '';
      this._container.classList.add('hidden');
    }
    this._highlightedId = null;
  }
}

export { EnemyInfoPanel };
