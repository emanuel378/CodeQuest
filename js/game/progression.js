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
    this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        this.currentLevel = data.currentLevel || 0;
        this.completedLevels = data.completedLevels || [];
        this.totalXP = data.totalXP || 0;
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
        totalXP: this.totalXP
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
    this.totalXP += score;

    const ranking = this._loadGlobalRanking();
    const existing = ranking.findIndex(e => e.playerId === this.playerId && e.level === id);
    if (existing !== -1) {
      ranking[existing].score = score;
      ranking[existing].time = new Date().toISOString();
    } else {
      ranking.push({
        playerName: this.playerName,
        playerId: this.playerId,
        score,
        level: id,
        time: new Date().toISOString()
      });
    }
    this._saveGlobalRanking(ranking);

    this._syncUnlocked();
    this._save();
  }

  isCommandUnlocked(command) {
    return this.unlockedCommands.includes(command);
  }

  getUnlockedCommands() {
    return [...this.unlockedCommands];
  }

  getPlayerSkin() {
    const thresholds = [100, 80, 60, 20, 10, 0];
    for (const t of thresholds) {
      if (this.totalXP >= t) return `img/player_${t}xp.png`;
    }
    return 'img/player_0xp.png';
  }

  getGlobalRanking() {
    return this._loadGlobalRanking().sort((a, b) => b.score - a.score);
  }
}
