import { Enemy } from '../actors/enemy.js';

export class Stage {
  constructor(gridSize = 5) {
    this.gridSize = gridSize;
    this.obstacles = [];
    this.enemies = [];
    this.items = [];
    this.goal = null;
    this.player = null;
    this._enemyIdCounter = 0;
    this.objectives = [];
    this._objectiveStates = {};
    this._toggledObstacles = new Set();
    this._originalSwitchable = [];
  }

  loadLevel(levelConfig) {
    this.gridSize = levelConfig.gridSize || 5;
    this.obstacles = (levelConfig.obstacles || []).map(o => ({ ...o }));
    this._originalSwitchable = this.obstacles
      .filter(o => o.switchable)
      .map(o => ({ x: o.x, y: o.y, type: o.type, sprite: o.sprite }));
    this._toggledObstacles = new Set();
    this.enemies = (levelConfig.enemies || []).map((e, i) => {
      const enemy = new Enemy({
        x: e.x,
        y: e.y,
        hp: e.hp || 1,
        type: e.type ?? 0,
        direction: e.direction ?? 2,
        sprite: e.sprite || null
      });
      enemy.id = `enemy_${this._enemyIdCounter++}_${i}`;
      return enemy;
    });
    this.items = (levelConfig.items || []).map(i => ({ ...i }));
    this.goal = levelConfig.goal ? { ...levelConfig.goal } : null;
    this.objectives = (levelConfig.objectives || []).map(o => ({ ...o }));
    this._resetObjectiveStates();
  }

  _resetObjectiveStates() {
    this._objectiveStates = {};
    for (const obj of this.objectives) {
      this._objectiveStates[obj.id] = false;
    }
  }

  getObjectiveStates() {
    return { ...this._objectiveStates };
  }

  getCompletedObjectiveIds() {
    return Object.entries(this._objectiveStates)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }

  checkAllObjectives() {
    let changed = false;
    for (const obj of this.objectives) {
      const completed = this._evaluateObjective(obj.id);
      if (completed !== this._objectiveStates[obj.id]) {
        this._objectiveStates[obj.id] = completed;
        changed = true;
      }
    }
    return changed;
  }

  finalizeSurviveObjective() {
    if ('survive' in this._objectiveStates) {
      this._objectiveStates.survive = this.player ? this.player.isAlive() : true;
    }
  }

  _evaluateObjective(id) {
    switch (id) {
      case 'reach_goal': return this.isGoalReached();
      case 'defeat_enemies': return this.isEnemiesCleared();
      case 'collect_item': return this.player ? this.player.hasItem : false;
      case 'require_item': return this.player ? (this.isGoalReached() && this.player.hasItem) : false;
      case 'survive': return false;
      default: return false;
    }
  }

  activate() {
    let toggled = false;
    for (const obs of this.obstacles) {
      if (obs.switchable) {
        const key = `${obs.x},${obs.y}`;
        if (this._toggledObstacles.has(key)) {
          this._toggledObstacles.delete(key);
        } else {
          this._toggledObstacles.add(key);
        }
        toggled = true;
      }
    }
    return toggled;
  }

  isObstacleRemoved(x, y) {
    return this._toggledObstacles.has(`${x},${y}`);
  }

  isObstacleAt(x, y) {
    const obs = this.obstacles.find(o => o.x === x && o.y === y);
    if (!obs) return false;
    if (obs.switchable && this._toggledObstacles.has(`${x},${y}`)) return false;
    return true;
  }

  getActiveObstacles() {
    return this.obstacles.filter(obs => {
      if (obs.switchable && this._toggledObstacles.has(`${obs.x},${obs.y}`)) return false;
      return true;
    });
  }

  setPlayer(player) {
    this.player = player;
  }

  isEnemyAt(x, y) {
    return this.enemies.some(e => e.alive && e.x === x && e.y === y);
  }

  isItemAt(x, y) {
    return this.items.some(i => i.x === x && i.y === y);
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  canMoveTo(x, y) {
    return this.isInBounds(x, y) && !this.isObstacleAt(x, y);
  }

  detectObstacleAhead() {
    if (!this.player) return false;
    const ahead = this.player.peekForward();
    return this.isObstacleAt(ahead.x, ahead.y) || !this.isInBounds(ahead.x, ahead.y);
  }

  detectEnemyNearby(range = 3) {
    if (!this.player) return false;
    return this.enemies.some(e => {
      if (!e.alive) return false;
      const dist = Math.abs(e.x - this.player.x) + Math.abs(e.y - this.player.y);
      return dist <= range;
    });
  }

  attackEnemy() {
    if (!this.player) return false;
    const ahead = this.player.peekForward();
    const idx = this.enemies.findIndex(e => e.alive && e.x === ahead.x && e.y === ahead.y);
    if (idx !== -1) {
      const died = this.enemies[idx].takeDamage(1);
      if (died) {
        this.enemies.splice(idx, 1);
      }
      return true;
    }
    return false;
  }


  isGoalReached() {
    if (!this.goal || !this.player) return false;
    return this.player.x === this.goal.x && this.player.y === this.goal.y;
  }

  isEnemiesCleared() {
    return this.enemies.length === 0 || this.enemies.every(e => !e.alive);
  }

  checkVictory() {
    if (this.goal) {
      const hasRequireItem = this.objectives.some(o => o.id === 'require_item');
      if (hasRequireItem) {
        return this.isGoalReached() && this.player && this.player.hasItem;
      }
      return this.isGoalReached();
    }
    return this.isEnemiesCleared();
  }

  isPlayerAlive() {
    return this.player ? this.player.isAlive() : true;
  }

  tickEnemies() {
    const allAttacks = [];

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const attack = enemy.tick(this);
      if (attack) {
        allAttacks.push(attack);
        this._resolveAttack(attack);
      }
    }

    return allAttacks;
  }

  _resolveAttack(attack) {
    if (attack.damage <= 0) return null;
    if (!this.player) return null;

    for (const cell of attack.cells) {
      if (this.player.x === cell.x && this.player.y === cell.y) {
        this.player.takeDamage(attack.damage);
        return attack;
      }
    }
    return null;
  }
}
