export class ObjectivesPanel {
  constructor() {
    this._isMobile = window.innerWidth <= 767;
    this._collapsed = false;
    this._total = 0;
    this._completed = 0;

    this.el = document.createElement('div');
    this.el.className = this._isMobile ? 'objectives-panel objectives-panel--mobile' : 'objectives-panel';
    if (this._collapsed) this.el.classList.add('collapsed');
    this.el.innerHTML = `
      <div class="objectives-header">
        <span class="material-symbols-outlined objectives-header-icon">checklist</span>
        <span class="objectives-title">OBJETIVOS</span>
        <span class="objectives-counter">0/0</span>
        <span class="material-symbols-outlined objectives-toggle-icon">${this._collapsed ? 'expand_more' : 'expand_less'}</span>
      </div>
      <div class="objectives-list"></div>
    `;
    this._objectiveEls = {};

    this._headerEl = this.el.querySelector('.objectives-header');

    if (!this._isMobile) {
      this._headerEl.addEventListener('click', () => {
        this._toggleCollapse();
      });
    }
  }

  _toggleCollapse() {
    this._collapsed = !this._collapsed;
    this.el.classList.toggle('collapsed', this._collapsed);
    const icon = this.el.querySelector('.objectives-toggle-icon');
    icon.textContent = this._collapsed ? 'expand_more' : 'expand_less';
  }

  _updateCounter() {
    const counter = this.el.querySelector('.objectives-counter');
    if (counter) counter.textContent = `${this._completed}/${this._total}`;
  }

  setObjectives(objectives) {
    const list = this.el.querySelector('.objectives-list');
    list.innerHTML = '';
    this._objectiveEls = {};
    this._total = objectives.length;
    this._completed = 0;
    for (const obj of objectives) {
      const item = document.createElement('div');
      item.className = 'objective-item';
      item.dataset.objectiveId = obj.id;
      item.innerHTML = `
        <span class="objective-check material-symbols-outlined">radio_button_unchecked</span>
        <span class="objective-desc">${obj.description}</span>
      `;
      list.appendChild(item);
      this._objectiveEls[obj.id] = item;
    }
    this._updateCounter();
  }

  updateState(completedIds) {
    this._completed = 0;
    for (const [id, el] of Object.entries(this._objectiveEls)) {
      const isCompleted = completedIds.includes(id);
      el.classList.toggle('objective-checked', isCompleted);
      const icon = el.querySelector('.objective-check');
      icon.textContent = isCompleted ? 'check_circle' : 'radio_button_unchecked';
      if (isCompleted) this._completed++;
    }
    this._updateCounter();
  }

  reset() {
    this.updateState([]);
  }

  mount(container) {
    container.appendChild(this.el);
    if (!this._isMobile || container.classList.contains('sim-viewport')) {
      this.el.style.top = '';
      this.el.style.right = '';
      this.el.style.left = '';
      this.el.style.bottom = '';
    }
  }

  destroy() {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this._objectiveEls = {};
  }
}
