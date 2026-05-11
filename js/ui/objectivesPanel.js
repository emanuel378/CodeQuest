const STORAGE_KEY = 'codequest_obj_panel_pos';
const DRAG_THRESHOLD = 5;

export class ObjectivesPanel {
  constructor() {
    this._isMobile = window.innerWidth <= 767;
    this._collapsed = window.innerWidth <= 575;
    this._total = 0;
    this._completed = 0;
    this._isDragging = false;
    this._wasDragged = false;
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._startPosX = 0;
    this._startPosY = 0;

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

    if (this._isMobile) {
      this._initMobile();
    }

    this._headerEl.addEventListener('click', () => {
      if (!this._wasDragged) this._toggleCollapse();
    });
  }

  _initMobile() {
    this._headerEl.addEventListener('mousedown', (e) => this._startDrag(e));
    this._headerEl.addEventListener('touchstart', (e) => this._startDrag(e), { passive: false });
    this._boundOnMove = (e) => this._onDrag(e);
    this._boundOnEnd = (e) => this._endDrag(e);
    this._loadPosition();
  }

  _startDrag(e) {
    this._wasDragged = false;
    this._isDragging = false;
    const pos = this._getEventPos(e);
    this._dragStartX = pos.x;
    this._dragStartY = pos.y;
    this._startPosX = this.el.offsetLeft;
    this._startPosY = this.el.offsetTop;
    this._headerEl.classList.add('dragging');
    document.addEventListener('mousemove', this._boundOnMove);
    document.addEventListener('mouseup', this._boundOnEnd);
    document.addEventListener('touchmove', this._boundOnMove, { passive: false });
    document.addEventListener('touchend', this._boundOnEnd);
    e.preventDefault();
  }

  _onDrag(e) {
    const pos = this._getEventPos(e);
    const dx = pos.x - this._dragStartX;
    const dy = pos.y - this._dragStartY;
    if (!this._isDragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      this._isDragging = true;
      this._wasDragged = true;
    }
    if (!this._isDragging) return;
    let newLeft = this._startPosX + dx;
    let newTop = this._startPosY + dy;
    newLeft = this._clampX(newLeft);
    newTop = this._clampY(newTop);
    this.el.style.left = newLeft + 'px';
    this.el.style.top = newTop + 'px';
    this.el.style.right = 'auto';
    this.el.style.bottom = 'auto';
    e.preventDefault();
  }

  _endDrag() {
    this._headerEl.classList.remove('dragging');
    if (this._isDragging) {
      this._savePosition();
    }
    this._isDragging = false;
    document.removeEventListener('mousemove', this._boundOnMove);
    document.removeEventListener('mouseup', this._boundOnEnd);
    document.removeEventListener('touchmove', this._boundOnMove);
    document.removeEventListener('touchend', this._boundOnEnd);
  }

  _getEventPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  _clampX(x) {
    const panelW = this.el.offsetWidth;
    const vw = window.innerWidth;
    return Math.max(0, Math.min(x, vw - panelW));
  }

  _clampY(y) {
    const panelH = this.el.offsetHeight;
    const vh = window.innerHeight;
    return Math.max(0, Math.min(y, vh - panelH));
  }

  _savePosition() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        left: this.el.style.left,
        top: this.el.style.top,
        vw: window.innerWidth,
        vh: window.innerHeight,
      }));
    } catch (_) {}
  }

  _loadPosition() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const pos = JSON.parse(saved);
        const savedWasMobile = pos.vw && pos.vw <= 767;
        if (!savedWasMobile) {
          this._setDefaultPosition();
          return;
        }
        if (pos.left && pos.top && pos.left !== 'auto' && pos.top !== 'auto') {
          this.el.style.left = pos.left;
          this.el.style.top = pos.top;
          this.el.style.right = 'auto';
          this.el.style.bottom = 'auto';
          const x = parseInt(pos.left, 10);
          const y = parseInt(pos.top, 10);
          if (!isNaN(x)) this.el.style.left = this._clampX(x) + 'px';
          if (!isNaN(y)) this.el.style.top = this._clampY(y) + 'px';
          return;
        }
      }
    } catch (_) {}
    this._setDefaultPosition();
  }

  _setDefaultPosition() {
    const viewport = document.querySelector('.sim-viewport');
    if (viewport) {
      const rect = viewport.getBoundingClientRect();
      this.el.style.top = Math.max(4, rect.top - 4) + 'px';
      this.el.style.right = '4px';
    } else {
      this.el.style.top = '62px';
      this.el.style.right = '4px';
    }
    this.el.style.left = 'auto';
    this.el.style.bottom = 'auto';
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
    if (!this._isMobile) {
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
    document.removeEventListener('mousemove', this._boundOnMove);
    document.removeEventListener('mouseup', this._boundOnEnd);
    document.removeEventListener('touchmove', this._boundOnMove);
    document.removeEventListener('touchend', this._boundOnEnd);
    this._objectiveEls = {};
  }
}
