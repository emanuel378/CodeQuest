import { AttributeSystem } from './attributes.js';

const GLOBAL_RANKING_KEY = 'codequest_ranking';

const LEVEL_UNLOCKS = {
  0: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
  1: [],
  2: [],
  3: []
};

export class Progression {
  constructor(playerId = 'default', playerName = 'Anônimo') {
    this.playerId = playerId;
    this.playerName = playerName;
    this._storageKey = `codequest_player_${playerId}`;
    this.currentLevel = 0;
    this.completedLevels = [];
    this.unlockedCommands = [];
    this.totalXP = 0;
    this.attributes = AttributeSystem.createDefaultAttributes();
    this.attributePoints = 0;
    this.currentAttempts = 5;
    this._levelUpListeners = [];
    this._failedLevels = [];
    this._load();
    this.resetAttempts();
  }

  _load() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        this.currentLevel = data.currentLevel || 0;
        this.completedLevels = data.completedLevels || [];
        this.totalXP = data.totalXP || 0;
        if (data.attributes) {
          this.attributes = {
            nucleoLogico: data.attributes.nucleoLogico || { xp: 0, level: 1 },
            eficienciaAlgoritmo: data.attributes.eficienciaAlgoritmo || { xp: 0, level: 1 }
          };
        }
        this.attributePoints = data.attributePoints || 0;
        this._failedLevels = data.failedLevels || [];
      }
    } catch { }

    this._syncUnlocked();
  }

  _save() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify({
        currentLevel: this.currentLevel,
        completedLevels: this.completedLevels,
        unlockedCommands: this.unlockedCommands,
        totalXP: this.totalXP,
        attributes: this.attributes,
        attributePoints: this.attributePoints,
        failedLevels: this._failedLevels
      }));
    } catch { }
  }

  _loadGlobalRanking() {
    try {
      const raw = localStorage.getItem(GLOBAL_RANKING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _saveGlobalRanking(ranking) {
    try {
      localStorage.setItem(GLOBAL_RANKING_KEY, JSON.stringify(ranking));
    } catch { }
  }

  _syncUnlocked() {
    const set = new Set(LEVEL_UNLOCKS[0] || []);
    for (const id of this.completedLevels) {
      const next = LEVEL_UNLOCKS[id + 1];
      if (next) next.forEach(c => set.add(c));
    }
    this.unlockedCommands = [...set];
  }

  onLevelUp(callback) {
    this._levelUpListeners.push(callback);
  }

  _emitLevelUp(attrId, newLevel) {
    for (const cb of this._levelUpListeners) {
      cb(attrId, newLevel);
    }
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  setCurrentLevel(level) {
    this.currentLevel = level;
    this._syncUnlocked();
    this._save();
  }

  isLevelCompleted(id) {
    return this.completedLevels.includes(id);
  }

  consumeAttempt() {
    if (this.currentAttempts > 0) {
      this.currentAttempts--
    }
    return this.currentAttempts
  }

  resetAttempts() {
    this.currentAttempts = this.getAttemptsAllowed()
  }

  getAttemptsAllowed() {
    const level = this.attributes.nucleoLogico.level || 1
    return AttributeSystem.getAttemptsAllowed(level)
  }

  getRemainingAttempts() {
    return this.currentAttempts
  }

  spendAttributePoint(attrId) {
    if (this.attributePoints <= 0) return false
    const attr = this.attributes[attrId]
    if (!attr) return false
    const def = AttributeSystem.getDef(attrId)
    if (!def) return false
    if (attr.level >= def.maxLevel) return false

    this.attributePoints--
    attr.xp += AttributeSystem.getPointValue()
    const newLevel = AttributeSystem.getLevelFromXp(attrId, attr.xp)
    if (newLevel > attr.level) {
      attr.level = newLevel
      this._emitLevelUp(attrId, newLevel)
    }
    this._save()
    return true
  }

  addAttributeXP(attrId, xpAmount) {
    const attr = this.attributes[attrId]
    if (!attr) return false
    const def = AttributeSystem.getDef(attrId)
    if (!def) return false
    if (attr.level >= def.maxLevel) return false

    attr.xp += xpAmount
    const newLevel = AttributeSystem.getLevelFromXp(attrId, attr.xp)
    if (newLevel > attr.level) {
      attr.level = newLevel
      this._emitLevelUp(attrId, newLevel)
    }
    this._save()
    return true
  }

  getAttribute(attrId) {
    return this.attributes[attrId] || { xp: 0, level: 1 }
  }

  getAttributePoints() {
    return this.attributePoints
  }

  completeLevel(id, score = 0, blocksUsed = 0, idealBlocks = 0) {
    const isNew = !this.completedLevels.includes(id)
    if (isNew) {
      this.completedLevels.push(id)
    }
    if (id >= this.currentLevel) {
      this.currentLevel = id + 1
    }
    this.totalXP += score

    const ranking = this._loadGlobalRanking()
    const existing = ranking.findIndex(e => e.playerId === this.playerId && e.level === id)
    if (existing !== -1) {
      ranking[existing].score = score
      ranking[existing].time = new Date().toISOString()
    } else {
      ranking.push({
        playerName: this.playerName,
        playerId: this.playerId,
        score,
        level: id,
        time: new Date().toISOString()
      })
    }
    this._saveGlobalRanking(ranking)

    if (isNew) {
      const pointLevels = [0, 2, 4, 6, 8]
      if (pointLevels.includes(id)) {
        this.attributePoints++
      }
    }

    const remaining = this.currentAttempts
    const nucleoXP = remaining * 10
    this.addAttributeXP('nucleoLogico', nucleoXP)

    const eficienciaXP = AttributeSystem.calculateEfficiencyXP(blocksUsed, idealBlocks)
    this.addAttributeXP('eficienciaAlgoritmo', eficienciaXP)

    this.unmarkLevelFailed(id)

    this._syncUnlocked()
    this._save()
  }

  hasFailedLevel(levelId) {
    return this._failedLevels.includes(levelId)
  }

  markLevelFailed(levelId) {
    if (!this._failedLevels.includes(levelId)) {
      this._failedLevels.push(levelId)
      this._save()
    }
  }

  unmarkLevelFailed(levelId) {
    this._failedLevels = this._failedLevels.filter(id => id !== levelId)
  }

  getLastCompletedLevel() {
    if (this.completedLevels.length === 0) return 0
    return Math.max(...this.completedLevels)
  }

  isCommandUnlocked(command) {
    return this.unlockedCommands.includes(command)
  }

  getUnlockedCommands() {
    return [...this.unlockedCommands]
  }

  getPlayerSkin() {
    const thresholds = [100, 80, 60, 20, 10, 0]
    for (const t of thresholds) {
      if (this.totalXP >= t) return `img/player_${t}xp.png`
    }
    return 'img/player_0xp.png'
  }

  getGlobalRanking() {
    return this._loadGlobalRanking().sort((a, b) => b.score - a.score)
  }
}
