const STORAGE_KEY = 'codequest_ranking';

const LEVEL_UNLOCKS = {
  0: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
  1: [],
  2: [],
  3: []
};

export class Progression {
  constructor() {
    this.currentLevel = 0;
    this.completedLevels = [];
    this.unlockedCommands = [];
    this.ranking = [];
    this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.currentLevel = data.currentLevel || 0;
        this.completedLevels = data.completedLevels || [];
        this.ranking = data.ranking || [];
      }
    } catch { }

    this._syncUnlocked();
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentLevel: this.currentLevel,
        completedLevels: this.completedLevels,
        unlockedCommands: this.unlockedCommands,
        ranking: this.ranking
      }));
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

  completeLevel(id, score = 0) {
    if (!this.completedLevels.includes(id)) {
      this.completedLevels.push(id);
    }
    if (id >= this.currentLevel) {
      this.currentLevel = id + 1;
    }
    this.ranking.push({
      score,
      level: id,
      time: new Date().toISOString()
    });
    this._syncUnlocked();
    this._save();
  }

  isCommandUnlocked(command) {
    return this.unlockedCommands.includes(command);
  }

  getUnlockedCommands() {
    return [...this.unlockedCommands];
  }

  addScore(entry) {
    this.ranking.push(entry);
    this._save();
  }

  getRanking() {
    return [...this.ranking].sort((a, b) => b.score - a.score);
  }
}
