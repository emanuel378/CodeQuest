const STORAGE_KEY = 'codequest_players';
const ACTIVE_KEY = 'codequest_active_player';

export class PlayerManager {
  constructor() {
    this.players = [];
    this.activePlayerId = null;
    this._load();
  }

  refresh() {
    this._load();
  }

  getPlayers() {
    return [...this.players];
  }

  getActivePlayer() {
    return this.players.find(p => p.id === this.activePlayerId) || null;
  }

  getActivePlayerId() {
    return this.activePlayerId;
  }

  addPlayer(name) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const player = { id, name, createdAt: new Date().toISOString() };
    this.players.push(player);
    if (this.players.length === 1) this.activePlayerId = id;
    this._save();
    this._saveActive();
    return player;
  }

  setActivePlayer(id) {
    if (!this.players.find(p => p.id === id)) return;
    this.activePlayerId = id;
    this._saveActive();
  }

  deletePlayer(id) {
    const idx = this.players.findIndex(p => p.id === id);
    if (idx === -1) return;
    this.players.splice(idx, 1);
    localStorage.removeItem(`codequest_player_${id}`);
    this._removeRankingEntries(id);
    if (this.activePlayerId === id) {
      this.activePlayerId = this.players.length > 0 ? this.players[0].id : null;
    }
    this._save();
    this._saveActive();
  }

  _removeRankingEntries(playerId) {
    try {
      const raw = localStorage.getItem('codequest_ranking');
      if (!raw) return;
      const data = JSON.parse(raw);
      const entries = Array.isArray(data) ? data : (data.ranking || []);
      const filtered = entries.filter(e => e.playerId !== playerId);
      localStorage.setItem('codequest_ranking', JSON.stringify(filtered));
    } catch { }
  }

  getPlayerStorageKey(id) {
    return `codequest_player_${id}`;
  }

  getActiveStorageKey() {
    return this.activePlayerId ? `codequest_player_${this.activePlayerId}` : null;
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.players = JSON.parse(raw);
      this.activePlayerId = localStorage.getItem(ACTIVE_KEY) || null;
    } catch {
      this.players = [];
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.players));
    } catch { }
  }

  _saveActive() {
    try {
      if (this.activePlayerId) {
        localStorage.setItem(ACTIVE_KEY, this.activePlayerId);
      } else {
        localStorage.removeItem(ACTIVE_KEY);
      }
    } catch { }
  }
}
