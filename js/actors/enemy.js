const DIRECTION_VECTORS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];

const TURRET_SPRITES = {
  0: 'assets/sprites/enemies/turret/turret_costas.png',
  1: 'assets/sprites/enemies/turret/turret_direita.png',
  2: 'assets/sprites/enemies/turret/turret_frente.png',
  3: 'assets/sprites/enemies/turret/turret_esquerda.png'
};

const ENEMY_SPRITES = {
  0: 'assets/sprites/enemies/laser.png',
  2: 'assets/sprites/enemies/patrol.png'
};

const INITIAL_ROTATION = {
  0: { 0: 180, 1: 270, 2: 0, 3: 90 },
  1: { 0: 0, 1: 0, 2: 0, 3: 0 },
  2: { 0: 0, 1: 0, 2: 0, 3: 0 }
};

export class Enemy {
  constructor(config = {}) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.hp = config.hp ?? 1;
    this.maxHp = config.hp ?? 1;
    this.type = config.type ?? 0;
    this.direction = config.direction ?? 2;
    if (this.type === 1) {
      this.sprite = TURRET_SPRITES[this.direction];
    } else {
      this.sprite = config.sprite ?? ENEMY_SPRITES[this.type] ?? null;
    }
    this.tickCounter = 0;
    this.alive = true;
    this._lastAttack = null;
    this._visualRotation = (INITIAL_ROTATION[this.type] && INITIAL_ROTATION[this.type][this.direction]) ?? 0;
  }

  tick(stage) {
    if (!this.alive) return null;
    this.tickCounter++;
    this._lastAttack = null;

    switch (this.type) {
      case 0: 
        this._lastAttack = this._tickLaserBot(stage);
        break;
      case 1: 
        this._lastAttack = this._tickTurret(stage);
        break;
      case 2: 
        this._lastAttack = this._tickPatrol(stage);
        break;
    }

    return this._lastAttack;
  }

  _tickLaserBot(stage) {
    if (this.tickCounter % 2 === 0) {
      const cells = this._raycast(stage);
      if (cells.length > 0) {
        return {
          type: 'laser',
          cells,
          damage: 1,
          enemyId: this.id,
          enemyX: this.x,
          enemyY: this.y,
          direction: this.direction
        };
      }
    }
    return null;
  }

  _tickTurret(stage) {
    this.direction = (this.direction + 1) % 4;
    this.sprite = TURRET_SPRITES[this.direction];
    const target = this._cellAhead();

    if (stage.isInBounds(target.x, target.y)) {
      return {
        type: 'melee',
        cells: [target],
        damage: 1,
        enemyId: this.id,
        enemyX: this.x,
        enemyY: this.y,
        direction: this.direction
      };
    }
    return null;
  }

  _tickPatrol(stage) {
    if (!stage.player) return null;

    const dx = stage.player.x - this.x;
    const dy = stage.player.y - this.y;
    const dist = Math.abs(dx) + Math.abs(dy);

    if (dist === 1) {
      if (dx > 0) this.direction = 1;
      else if (dx < 0) this.direction = 3;
      else if (dy > 0) this.direction = 2;
      else if (dy < 0) this.direction = 0;

      return {
        type: 'melee',
        cells: [{ x: stage.player.x, y: stage.player.y }],
        damage: 1,
        enemyId: this.id,
        enemyX: this.x,
        enemyY: this.y,
        direction: this.direction
      };
    }

    if (this.tickCounter % 2 === 0) {
      return this._moveTowardPlayer(stage, dx, dy);
    }

    return null;
  }

  _moveTowardPlayer(stage, dx, dy) {
    let nx = this.x;
    let ny = this.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx !== 0) nx += dx > 0 ? 1 : -1;
      else if (dy !== 0) ny += dy > 0 ? 1 : -1;
    } else {
      if (dy !== 0) ny += dy > 0 ? 1 : -1;
      else if (dx !== 0) nx += dx > 0 ? 1 : -1;
    }

    if (nx === this.x && ny === this.y) return null;

    if (!stage.isInBounds(nx, ny)) return null;
    if (stage.isObstacleAt(nx, ny)) return null;
    if (stage.enemies.some(e => e !== this && e.alive && e.x === nx && e.y === ny)) return null;
    if (stage.player && stage.player.x === nx && stage.player.y === ny) return null;

    const oldX = this.x;
    const oldY = this.y;
    this.x = nx;
    this.y = ny;

    if (nx > oldX) this.direction = 1;
    else if (nx < oldX) this.direction = 3;
    else if (ny > oldY) this.direction = 2;
    else if (ny < oldY) this.direction = 0;

    return {
      type: 'move',
      cells: [],
      damage: 0,
      enemyId: this.id,
      enemyX: oldX,
      enemyY: oldY,
      direction: this.direction
    };
  }

  takeDamage(amount = 1) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  _cellAhead() {
    const [dx, dy] = this._directionVector();
    return { x: this.x + dx, y: this.y + dy };
  }

  _directionVector() {
    return DIRECTION_VECTORS[this.direction % 4];
  }

  _raycast(stage) {
    const [dx, dy] = this._directionVector();
    const cells = [];
    let cx = this.x + dx;
    let cy = this.y + dy;

    while (stage.isInBounds(cx, cy)) {
      cells.push({ x: cx, y: cy });
      if (stage.isObstacleAt(cx, cy)) break;
      cx += dx;
      cy += dy;
    }

    return cells;
  }
}
