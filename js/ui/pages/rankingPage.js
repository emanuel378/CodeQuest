import { PageComponent } from './pageComponent.js';
import { router } from '../routes.js';

const RANKING_KEY = 'codequest_ranking';

class RankingPage extends PageComponent {
  _renderRows = 5;

  _getRanking() {
    try {
      const raw = localStorage.getItem(RANKING_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      const ranking = data.ranking || [];
      return ranking.sort((a, b) => b.score - a.score);
    } catch {
      return [];
    }
  }

  _buildPlaceholders(count) {
    return Array.from({ length: count }, () => ({
      score: 0,
      level: 0,
      time: null,
      _placeholder: true,
      _name: '---'
    }));
  }

  _formatPlayer(entry, index) {
    if (entry._placeholder) return entry._name;
    return `Nível ${entry.level}`;
  }

  _formatScore(score) {
    return Number(score).toLocaleString('pt-BR') + ' pts';
  }

  _populatePodium(ranking) {
    const items = this.el.querySelectorAll('.podium-item');

    for (let i = 0; i < items.length; i++) {
      const entry = ranking[i];
      const el = items[i];

      if (entry) {
        const nameEl = el.querySelector('.podium-name');
        const scoreEl = el.querySelector('.podium-score');
        if (nameEl) nameEl.textContent = this._formatPlayer(entry, i);
        if (scoreEl) scoreEl.textContent = this._formatScore(entry.score);
      } else {
        const nameEl = el.querySelector('.podium-name');
        const scoreEl = el.querySelector('.podium-score');
        if (nameEl) nameEl.textContent = '---';
        if (scoreEl) scoreEl.textContent = '0 pts';
      }
    }
  }

  _populateList(ranking) {
    const body = this.el.querySelector('#rank-list-body');
    if (!body) return;

    body.innerHTML = '';

    const rest = ranking.slice(3);
    const show = rest.slice(0, this._renderRows);
    const hasMore = rest.length > this._renderRows;

    if (rest.length === 0) {
      const emptyRow = document.createElement('div');
      emptyRow.className = 'rank-row rank-row-empty';
      emptyRow.innerHTML = '<span class="rank-empty-msg">Nenhuma pontuação ainda. Complete um nível!</span>';
      body.appendChild(emptyRow);
    } else {
      for (const entry of show) {
        const row = document.createElement('div');
        row.className = 'rank-row';

        const rankCell = document.createElement('span');
        rankCell.className = 'rank-cell rank-cell-rank';
        rankCell.textContent = ranking.indexOf(entry) + 1;

        const playerCell = document.createElement('span');
        playerCell.className = 'rank-cell rank-cell-player';
        playerCell.innerHTML = `<span class="material-symbols-outlined rank-avatar-icon">person</span>${this._formatPlayer(entry, ranking.indexOf(entry))}`;

        const scoreCell = document.createElement('span');
        scoreCell.className = 'rank-cell rank-cell-score';
        scoreCell.textContent = this._formatScore(entry.score);

        row.appendChild(rankCell);
        row.appendChild(playerCell);
        row.appendChild(scoreCell);
        body.appendChild(row);
      }
    }

    const btnMore = this.el.querySelector('#rank-btn-more');
    if (btnMore) {
      btnMore.style.display = hasMore ? 'inline-flex' : 'none';
    }
  }

  _render() {
    const template = document.getElementById('page-ranking');
    return template.content.cloneNode(true);
  }

  _onDomReady() {
    const ranking = this._getRanking();
    const padded = ranking.length >= 3 ? ranking : [...ranking, ...this._buildPlaceholders(3 - ranking.length)];
    this._populatePodium(padded);
    this._populateList(ranking);
  }

  _bindEvents() {
    this._handlers = [];

    const playBtn = this.el.querySelector('[data-action="play"]');
    if (playBtn) {
      const handler = () => router.navigate('/game');
      playBtn.addEventListener('click', handler);
      this._handlers.push({ el: playBtn, type: 'click', handler });
    }

    const btnMore = this.el.querySelector('#rank-btn-more');
    if (btnMore) {
      const handler = () => {
        this._renderRows += 10;
        const ranking = this._getRanking();
        this._populateList(ranking);
      };
      btnMore.addEventListener('click', handler);
      this._handlers.push({ el: btnMore, type: 'click', handler });
    }
  }

  _unbindEvents() {
    for (const { el, type, handler } of this._handlers) {
      el.removeEventListener(type, handler);
    }
    this._handlers = [];
  }
}

export { RankingPage };
