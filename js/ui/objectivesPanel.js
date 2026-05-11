export class ObjectivesPanel {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'objectives-panel';
    this.el.innerHTML = `
      <div class="objectives-header">
        <span class="material-symbols-outlined objectives-header-icon">checklist</span>
        <span class="objectives-title">OBJETIVOS</span>
      </div>
      <div class="objectives-list"></div>
    `;
    this._objectiveEls = {};
  }

  setObjectives(objectives) {
    const list = this.el.querySelector('.objectives-list');
    list.innerHTML = '';
    this._objectiveEls = {};

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
  }

  updateState(completedIds) {
    for (const [id, el] of Object.entries(this._objectiveEls)) {
      const isCompleted = completedIds.includes(id);
      el.classList.toggle('objective-checked', isCompleted);
      const icon = el.querySelector('.objective-check');
      icon.textContent = isCompleted ? 'check_circle' : 'radio_button_unchecked';
    }
  }

  reset() {
    this.updateState([]);
  }

  mount(container) {
    container.appendChild(this.el);
  }

  destroy() {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this._objectiveEls = {};
  }
}
