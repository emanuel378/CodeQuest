import { AttributeSystem } from './attributes.js';

const GLOBAL_RANKING_KEY = 'codequest_ranking';

const CATEGORY_COMMANDS = {
  movimento: ['move', 'turnRight', 'turnLeft', 'jump'],
  combate: ['attack'],
  controle: ['if', 'repeat', 'while'],
  variavel: ['set_var', 'change_var', 'custom_var']
};

const CATEGORY_MILESTONES = [
  { completedLevelId: 0, category: 'combate', icon: 'swords' },
  { completedLevelId: 4, category: 'controle', icon: 'settings_ethernet' }
];

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
    this.playerLevel = 1;
    this.playerXP = 0;
    this.currentAttempts = 5;
    this._levelUpListeners = [];
    this._playerLevelUpListeners = [];
    this._failedLevels = [];
    this.levelStats = {};
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
            nucleoLogico: { level: (data.attributes.nucleoLogico && data.attributes.nucleoLogico.level) || 1 },
            eficienciaAlgoritmo: { level: (data.attributes.eficienciaAlgoritmo && data.attributes.eficienciaAlgoritmo.level) || 1 }
          };
        }
        this.attributePoints = data.attributePoints || 0;
        this.playerLevel = data.playerLevel || 1;
        this.playerXP = data.playerXP || 0;
        this._failedLevels = data.failedLevels || [];
        this.levelStats = data.levelStats || {};
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
        playerLevel: this.playerLevel,
        playerXP: this.playerXP,
        failedLevels: this._failedLevels,
        levelStats: this.levelStats
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
    const set = new Set();
    this._addCategoryCommands(set, 'movimento');
    this._addCategoryCommands(set, 'variavel');
    if (this.completedLevels.includes(0)) {
      this._addCategoryCommands(set, 'combate');
    }
    if (this.completedLevels.includes(4)) {
      this._addCategoryCommands(set, 'controle');
    }
    this.unlockedCommands = [...set];
  }

  _addCategoryCommands(set, category) {
    const cmds = CATEGORY_COMMANDS[category];
    if (cmds) cmds.forEach(c => set.add(c));
  }

  _getNewCategoryUnlock(completedLevelId) {
    for (const milestone of CATEGORY_MILESTONES) {
      if (milestone.completedLevelId === completedLevelId) {
        const cmds = CATEGORY_COMMANDS[milestone.category] || [];
        const isNew = cmds.some(c => !this.unlockedCommands.includes(c));
        if (isNew) return milestone.category;
      }
    }
    return null;
  }

  onLevelUp(callback) {
    this._levelUpListeners.push(callback);
  }

  _emitLevelUp(attrId, newLevel) {
    for (const cb of this._levelUpListeners) {
      cb(attrId, newLevel);
    }
  }

  onPlayerLevelUp(callback) {
    this._playerLevelUpListeners.push(callback);
  }

  _emitPlayerLevelUp(newLevel) {
    for (const cb of this._playerLevelUpListeners) {
      cb(newLevel);
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
    attr.level++
    if (attrId === 'nucleoLogico') {
      this.resetAttempts()
    }
    this._emitLevelUp(attrId, attr.level)
    this._save()
    return true
  }

  getAttribute(attrId) {
    return this.attributes[attrId] || { level: 1 }
  }

  getAttributePoints() {
    return this.attributePoints
  }

  getPlayerLevel() {
    return this.playerLevel
  }

  getPlayerXP() {
    return this.playerXP
  }

  addPlayerXP(amount) {
    this.playerXP += amount
    const newLevel = AttributeSystem.getPlayerLevelFromXp(this.playerXP)
    if (newLevel > this.playerLevel) {
      const levelsGained = newLevel - this.playerLevel
      for (let i = 0; i < levelsGained; i++) {
        this.attributePoints++
      }
      this.playerLevel = newLevel
      this._emitPlayerLevelUp(newLevel)
    }
    this._save()
    return true
  }

  completeLevel(id, score = 0, blocksUsed = 0, idealBlocks = 0, rankLabel = 'C', timeElapsed = 0) {
    const isNew = !this.completedLevels.includes(id)
    const newCategoryUnlock = isNew ? this._getNewCategoryUnlock(id) : null;
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

    this.addPlayerXP(score)

    const stars = rankLabel === 'S' ? 3 : rankLabel === 'A' ? 2 : 1
    this.saveLevelStats(id, { stars, score, blocksUsed, idealBlocks, timeElapsed })

    this.unmarkLevelFailed(id)

    this._syncUnlocked()
    this._save()

    return newCategoryUnlock;
  }

  saveLevelStats(id, { stars, score, blocksUsed, idealBlocks, timeElapsed }) {
    if (!this.levelStats) this.levelStats = {}
    const existing = this.levelStats[id] || {}
    this.levelStats[id] = {
      stars: Math.max(stars, existing.stars || 0),
      bestScore: Math.max(score, existing.bestScore || 0),
      bestBlocks: existing.bestBlocks ? Math.min(blocksUsed, existing.bestBlocks) : blocksUsed,
      bestTime: existing.bestTime ? Math.min(timeElapsed, existing.bestTime) : timeElapsed,
      blocksUsed,
      idealBlocks
    }
  }

  getLevelStats(id) {
    return this.levelStats?.[id] || null
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

  getGlobalRanking() {
    return this._loadGlobalRanking().sort((a, b) => b.score - a.score)
  }

  static getCategoryLabel(category) {
    const labels = {
      combate: 'Combate',
      controle: 'Condições'
    };
    return labels[category] || category;
  }

  static getCategoryIcon(category) {
    const icons = {
      combate: 'swords',
      controle: 'settings_ethernet'
    };
    return icons[category] || 'lock';
  }
}
