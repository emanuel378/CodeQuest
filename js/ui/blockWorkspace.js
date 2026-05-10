import { audioManager } from '../audio/audioManager.js';

let nextId = 1;

const CAT_COLORS = {
  movimento: 'var(--primary-container)',
  controle: 'var(--secondary-container)',
  sensor: 'var(--tertiary-container)',
  combate: 'var(--error)',
  variavel: 'var(--secondary)'
};

const CONTROL_TYPES = new Set(['if', 'repeat', 'while']);
const SNAP_DISTANCE = 90;

export class BlockWorkspace {
  constructor(containerEl) {
    this.ct = containerEl;
    this.zoom = 1;
    this.blocks = new Map();
    this._drag = null;

    this._ghostEl = null;
    this._scrollEl = document.createElement('div');
    this._scrollEl.className = 'sb-workspace-scroll';
    this.ct.appendChild(this._scrollEl);

    this._canvas = document.createElement('div');
    this._canvas.className = 'sb-canvas';
    this._scrollEl.appendChild(this._canvas);

    this._updateCanvasSize();
    this._setup();
    this._setupZoomControls();
  }

  createBlock(type, label, icon, category, params, x, y) {
    const id = `b${nextId++}`;
    const ctrl = CONTROL_TYPES.has(type);
    const b = {
      id, type, label, icon, category,
      value: params?.value,
      condition: params?.condition || (type === 'if' || type === 'while' ? 'obstacleDetected' : null),
      x: x ?? 40, y: y ?? (40 + this.blocks.size * 70),
      w: 220, h: ctrl ? 80 : 40,
      prev: null, next: null, parent: null,
      children: [], elseChildren: [], ctrl
    };
    const el = this._render(b);
    b.el = el;
    el.dataset.bid = id;
    this._canvas.appendChild(el);
    this._pos(b);
    this.blocks.set(id, b);
    this._updateCanvasSize();
    return b;
  }

  removeBlock(id) {
    const b = this.blocks.get(id);
    if (!b) return;
    if (b.parent) {
      const p = this.blocks.get(b.parent);
      if (p) {
        p.children = p.children.filter(c => c !== id);
        p.elseChildren = p.elseChildren.filter(c => c !== id);
      }
    }
    if (b.prev) {
      const p = this.blocks.get(b.prev);
      if (p) p.next = b.next;
    }
    if (b.next) {
      const n = this.blocks.get(b.next);
      if (n) n.prev = b.prev;
    }
    b.el.remove();
    this.blocks.delete(id);
    this._updateCanvasSize();
    this.save();
  }

  clear() {
    for (const [, b] of this.blocks) b.el.remove();
    this.blocks.clear();
    this._removeGhost();
    this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
    this._updateCanvasSize();
    localStorage.removeItem('codequest_workspace');
  }

  getAllBlocks() {
    const top = [];
    const seen = new Set();
    for (const [, b] of this.blocks) {
      if (seen.has(b.id) || b.parent || b.prev) continue;
      const chain = [];
      let cur = b;
      while (cur && !seen.has(cur.id)) {
        seen.add(cur.id);
        chain.push(cur);
        cur = cur.next ? this.blocks.get(cur.next) : null;
      }
      if (chain.length) top.push(chain);
    }
    return top;
  }

  getCommandTree() {
    const cmds = [];
    for (const chain of this.getAllBlocks()) {
      for (const b of chain) {
        const c = this._toCmd(b);
        if (c) cmds.push(c);
      }
    }
    return cmds;
  }

  _toCmd(b) {
    const c = { type: b.type, _blockId: b.id };
    if (b.value != null) c.value = b.value;
    if (b.condition) c.condition = b.condition;
    if (b.ctrl) {
      const kids = this._walk(b.children);
      if (kids.length) c.children = kids;
      if (b.type === 'if') {
        const els = this._walk(b.elseChildren);
        if (els.length) c.elseChildren = els;
      }
    }
    return c;
  }

  _walk(ids) {
    const r = [];
    for (const id of ids) {
      let cur = this.blocks.get(id);
      while (cur) {
        const c = this._toCmd(cur);
        if (c) r.push(c);
        cur = cur.next ? this.blocks.get(cur.next) : null;
      }
    }
    return r;
  }

  _render(b) {
    const div = document.createElement('div');
    div.className = `sb-block`;

    if (b.ctrl) div.classList.add('sb-control');

    const clr = CAT_COLORS[b.category] || 'var(--on-surface-variant)';
    div.style.setProperty('--cat-color', clr);
    div.style.width = b.w + 'px';

    const notch = document.createElement('div');
    notch.className = 'sb-notch';
    div.appendChild(notch);

    const body = document.createElement('div');
    body.className = 'sb-body';
    body.style.borderLeftColor = clr;

    if (b.ctrl) {
      body.innerHTML = this._ctrlHtml(b, clr);
    } else {
      body.innerHTML = this._simpleHtml(b, clr);
    }

    div.appendChild(body);

    if (!b.ctrl) {
      const bump = document.createElement('div');
      bump.className = 'sb-bump';
      div.appendChild(bump);
    }

    if (b.ctrl) {
      const childArea = document.createElement('div');
      childArea.className = 'sb-child-area';
      childArea.dataset.parent = b.id;
      const hint = document.createElement('div');
      hint.className = 'sb-child-hint';
      hint.textContent = '+';
      childArea.appendChild(hint);
      div.appendChild(childArea);

      if (b.type === 'if') {
        const esec = document.createElement('div');
        esec.className = 'sb-else-section';
        esec.innerHTML = '<div class="sb-else-label">senão</div>';
        const earea = document.createElement('div');
        earea.className = 'sb-else-area';
        earea.dataset.parent = b.id;
        earea.dataset.else = 'true';
        const ehint = document.createElement('div');
        ehint.className = 'sb-child-hint';
        ehint.textContent = '+';
        earea.appendChild(ehint);
        esec.appendChild(earea);
        div.appendChild(esec);
      }

      const footer = document.createElement('div');
      footer.className = 'sb-control-footer';
      div.appendChild(footer);

      div.style.height = 'auto';
    }

    const del = document.createElement('button');
    del.className = 'sb-del';
    del.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px">close</span>';
    del.addEventListener('click', (e) => { e.stopPropagation(); this.removeBlock(b.id); });
    del.addEventListener('mousedown', (e) => e.stopPropagation());
    del.addEventListener('touchstart', (e) => e.stopPropagation());
    div.appendChild(del);

    return div;
  }

  _simpleHtml(b, clr) {
    return `
      <span class="sb-icon" style="color:${clr}">
        <span class="material-symbols-outlined">${b.icon}</span>
      </span>
      <span class="sb-label">${b.label}</span>
      ${b.value != null ? `<input class="sb-input" type="text" value="${b.value}" data-bid="${b.id}">` : ''}
    `;
  }

  _ctrlHtml(b, clr) {
    const l = b.label;
    const ic = b.icon;
    const cond = b.condition === 'enemyDetected' ? 'Inimigo' : 'Obstáculo';
    let html = `
      <div class="sb-control-header">
        <span class="sb-icon" style="color:${clr}">
          <span class="material-symbols-outlined">${ic}</span>
        </span>
        <span class="sb-label">${l}</span>`;
    if (b.type === 'if' || b.type === 'while') {
      html += `
        <div class="sb-condition-chip" data-cond="${b.condition || 'obstacleDetected'}">
          <span class="cond-dot"></span>
          <span class="cond-text">${cond}</span>
        </div>`;
    }
    if (b.type === 'repeat') {
      html += `<input class="sb-input" type="text" value="${b.value || 5}" data-bid="${b.id}">`;
    }
    html += `</div>`;
    return html;
  }

  _pos(b, fast) {
    if (!b) return;
    if (b.el.style.position === 'relative') return;
    b.el.style.left = b.x + 'px';
    b.el.style.top = b.y + 'px';
    b.el.style.position = 'absolute';
  }

  _updateHeight(b) {
    if (!b || !b.el) return;
    const r = b.el.getBoundingClientRect();
    b.h = r.height;
  }

  drop(data, clientX, clientY) {
    const { x: mx, y: my } = this._clientToCanvas(clientX, clientY);

    const childArea = this._findChildArea(clientX, clientY);
    if (childArea) {
      const b = this._dropChild(childArea, data);
      this.save();
      return b;
    }

    const b = this.createBlock(data.type, data.label, data.icon, data.category, data.params, mx - 110, my - 20);
    this._trySnap(b.id, mx, my);
    audioManager.playSfx('snap');
    this.save();
    return b;
  }

  _findChildArea(cx, cy) {
    for (const [, b] of this.blocks) {
      if (!b.ctrl || !b.el) continue;
      const ca = b.el.querySelector('.sb-child-area');
      if (ca) {
        const r = ca.getBoundingClientRect();
        if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
          return ca;
        }
      }
      const ea = b.el.querySelector('.sb-else-area');
      if (ea) {
        const r = ea.getBoundingClientRect();
        if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
          return ea;
        }
      }
    }
    return null;
  }

  _dropChild(area, data) {
    const isElse = area.classList.contains('sb-else-area');
    const pe = area.closest('.sb-block');
    if (!pe) return null;
    const pd = this.blocks.get(pe.dataset.bid);
    if (!pd) return null;

    const hint = area.querySelector('.sb-child-hint');
    if (hint) hint.remove();

    const b = this.createBlock(data.type, data.label, data.icon, data.category, data.params, 0, 0);
    b.parent = pd.id;
    if (isElse) pd.elseChildren.push(b.id);
    else pd.children.push(b.id);

    b.el.style.position = 'relative';
    b.el.style.left = '';
    b.el.style.top = '';
    b.el.classList.add('sb-nested');
    area.appendChild(b.el);
    this._updateHeight(pd);
    audioManager.playSfx('snap');
    return b;
  }

  _createGhost(b, x, y) {
    this._removeGhost();
    const ghost = this._render(b);
    ghost.classList.add('sb-block-ghost');
    ghost.style.left = x + 'px';
    ghost.style.top = y + 'px';
    ghost.style.position = 'absolute';
    const del = ghost.querySelector('.sb-del');
    if (del) del.remove();
    this._canvas.appendChild(ghost);
    this._ghostEl = ghost;
  }

  _removeGhost() {
    if (this._ghostEl) {
      this._ghostEl.remove();
      this._ghostEl = null;
    }
  }

  _trySnap(id, mx, my) {
    const b = this.blocks.get(id);
    if (!b) return false;

    const sn = SNAP_DISTANCE / this.zoom;
    let best = null;
    let bestDist = sn;

    for (const [, o] of this.blocks) {
      if (o.id === id || o.parent) continue;
      const or = o.el.getBoundingClientRect();
      const crt = this._canvas.getBoundingClientRect();
      const ox = (or.left - crt.left) / this.zoom;
      const oy = (or.top - crt.top) / this.zoom;
      const oHeight = or.height / this.zoom;

      const ddx = Math.abs(mx - (ox + o.w / 2));
      const ddy = my - (oy + oHeight);

      if (ddx < sn && ddy >= 0 && ddy < bestDist) {
        if (o.ctrl) {
          const ca = o.el.querySelector('.sb-child-area');
          if (ca) {
            const cr = ca.getBoundingClientRect();
            const cdy = my - (cr.top - crt.top) / this.zoom;
            if (cdy >= 0 && cdy < ca.offsetHeight) continue;
          }
        }
        best = { target: o, dy: ddy };
        bestDist = ddy;
      }
    }

    if (best) {
      const o = best.target;
      const or = o.el.getBoundingClientRect();
      const crt = this._canvas.getBoundingClientRect();
      b.x = (or.left - crt.left) / this.zoom;
      b.y = (or.top - crt.top) / this.zoom + or.height / this.zoom;
      b.prev = o.id;
      o.next = b.id;
      this._pos(b);
      return true;
    }

    return false;
  }

  startDrag(id, cx, cy) {
    const b = this.blocks.get(id);
    if (!b) return;

    if (b.parent) {
      const p = this.blocks.get(b.parent);
      if (p) {
        p.children = p.children.filter(c => c !== id);
        p.elseChildren = p.elseChildren.filter(c => c !== id);
      }
    }
    if (b.prev) {
      const p = this.blocks.get(b.prev);
      if (p) p.next = b.next;
    }
    if (b.next) {
      const n = this.blocks.get(b.next);
      if (n) n.prev = b.prev;
    }
    b.prev = null;
    b.next = null;
    b.parent = null;

    const cr = this._canvas.getBoundingClientRect();

    const br = b.el.getBoundingClientRect();
    b.x = (br.left - cr.left) / this.zoom;
    b.y = (br.top - cr.top) / this.zoom;

    b.el.style.position = 'absolute';
    b.el.style.left = b.x + 'px';
    b.el.style.top = b.y + 'px';
    b.el.classList.remove('sb-nested');
    this._canvas.appendChild(b.el);

    this._drag = { id, ox: (cx - cr.left) / this.zoom - b.x, oy: (cy - cr.top) / this.zoom - b.y };
    b.el.classList.add('dragging');
  }

  moveDrag(cx, cy) {
    if (!this._drag) return;
    const b = this.blocks.get(this._drag.id);
    if (!b) return;
    const cr = this._canvas.getBoundingClientRect();
    b.x = (cx - cr.left) / this.zoom - this._drag.ox;
    b.y = (cy - cr.top) / this.zoom - this._drag.oy;
    this._pos(b);
    this._showSnapGuide(b.id, cx, cy);
  }

  _showSnapGuide(id, cx, cy) {
    this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
    this._removeGhost();

    const crt = this._canvas.getBoundingClientRect();
    const mx = (cx - crt.left) / this.zoom;
    const my = (cy - crt.top) / this.zoom;
    const b = this.blocks.get(id);
    if (!b) return;

    const sn = SNAP_DISTANCE / this.zoom;

    // Check if cursor is inside a control block's child/else area → nest snap
    for (const [, o] of this.blocks) {
      if (!o.ctrl || !o.el) continue;
      const ca = o.el.querySelector('.sb-child-area');
      if (ca) {
        const cr = ca.getBoundingClientRect();
        if (cx >= cr.left && cx <= cr.right && cy >= cr.top && cy <= cr.bottom) {
          ca.classList.add('sb-snap-target');
          return;
        }
      }
      const ea = o.el.querySelector('.sb-else-area');
      if (ea) {
        const er = ea.getBoundingClientRect();
        if (cx >= er.left && cx <= er.right && cy >= er.top && cy <= er.bottom) {
          ea.classList.add('sb-snap-target');
          return;
        }
      }
    }

    // Check for chain snap below a block → show ghost
    for (const [, o] of this.blocks) {
      if (o.id === id || o.parent) continue;
      const or = o.el.getBoundingClientRect();
      const ox = (or.left - crt.left) / this.zoom;
      const oy = (or.top - crt.top) / this.zoom;
      const ddx = Math.abs(mx - (ox + o.w / 2));
      const ddy = my - (oy + or.height / this.zoom);

      if (ddx < sn && ddy >= 0 && ddy < sn) {
        const gx = ox;
        const gy = oy + or.height / this.zoom;
        this._createGhost(b, gx, gy);
        return;
      }
    }
  }

  endDrag(cx, cy) {
    if (!this._drag) return;
    const b = this.blocks.get(this._drag.id);
    if (b) {
      b.el.classList.remove('dragging');
      const childArea = this._findChildArea(cx, cy);
      if (childArea) {
        const data = { type: b.type, label: b.label, icon: b.icon, category: b.category, params: { value: b.value, condition: b.condition } };
        this.removeBlock(b.id);
        this._dropChild(childArea, data);
      } else {
        const { x: mx, y: my } = this._clientToCanvas(cx, cy);
        this._trySnap(b.id, mx, my);
      }
    }
    this._removeGhost();
    this._drag = null;
    this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
    this.save();
  }

  save() {
    const data = [];
    for (const [, b] of this.blocks) {
      data.push({
        id: b.id, type: b.type, label: b.label, icon: b.icon,
        category: b.category, x: b.x, y: b.y,
        value: b.value, condition: b.condition,
        prev: b.prev, next: b.next, parent: b.parent,
        children: b.children, elseChildren: b.elseChildren, ctrl: b.ctrl
      });
    }
    localStorage.setItem('codequest_workspace', JSON.stringify({ version: 1, nextId, blocks: data }));
  }

  restore() {
    const raw = localStorage.getItem('codequest_workspace');
    if (!raw) return false;
    try {
      const saved = JSON.parse(raw);
      if (!saved.blocks?.length) return false;

      const maxNum = saved.blocks.reduce((m, bd) => {
        const n = parseInt(bd.id?.slice(1), 10);
        return n > m ? n : m;
      }, 0);
      if (maxNum + 1 > nextId) nextId = maxNum + 2;

      this.clear();

      for (const bd of saved.blocks) this._createFromData(bd);

      for (const [, b] of this.blocks) {
        if (!b.parent) continue;
        const p = this.blocks.get(b.parent);
        if (!p || !p.el) continue;
        const isElse = p.elseChildren.includes(b.id);
        const area = p.el.querySelector(isElse ? '.sb-else-area' : '.sb-child-area');
        if (!area) continue;
        const hint = area.querySelector('.sb-child-hint');
        if (hint) hint.remove();
        b.el.style.position = 'relative';
        b.el.style.left = '';
        b.el.style.top = '';
        b.el.classList.add('sb-nested');
        area.appendChild(b.el);
      }

      for (const [, b] of this.blocks) {
        if (b.ctrl) this._updateHeight(b);
      }

      this._updateCanvasSize();
      this.save();
      return true;
    } catch { return false; }
  }

  _createFromData(bd) {
    const b = {
      id: bd.id, type: bd.type, label: bd.label, icon: bd.icon,
      category: bd.category, x: bd.x, y: bd.y,
      w: bd.w || 220, h: bd.h || (bd.ctrl ? 80 : 40),
      value: bd.value, condition: bd.condition,
      prev: bd.prev, next: bd.next, parent: bd.parent,
      children: [...(bd.children || [])],
      elseChildren: [...(bd.elseChildren || [])],
      ctrl: bd.ctrl
    };
    const el = this._render(b);
    b.el = el;
    el.dataset.bid = b.id;
    this._canvas.appendChild(el);
    this._pos(b);
    this.blocks.set(b.id, b);
  }

  getBlockAt(cx, cy) {
    for (const [, b] of this.blocks) {
      const r = b.el.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        return b;
      }
    }
    return null;
  }

  _clientToCanvas(cx, cy) {
    const r = this._canvas.getBoundingClientRect();
    return { x: (cx - r.left) / this.zoom, y: (cy - r.top) / this.zoom };
  }

  _updateCanvasSize() {
    let maxX = 2000;
    let maxY = 2000;
    for (const [, b] of this.blocks) {
      const right = b.x + (b.w || 220);
      const bottom = b.y + (b.h || 40);
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    }
    maxX += 600;
    maxY += 600;
    if (this._scrollEl) {
      const sr = this._scrollEl.getBoundingClientRect();
      const ww = sr.width / this.zoom;
      const wh = sr.height / this.zoom;
      if (ww > maxX) maxX = ww;
      if (wh > maxY) maxY = wh;
    }
    this._canvas.style.width = maxX + 'px';
    this._canvas.style.height = maxY + 'px';
    this._canvas.style.transform = `scale(${this.zoom})`;
  }

  _updateZoomDisplay() {
    const el = this.ct.querySelector('.sb-zoom-level');
    if (el) el.textContent = Math.round(this.zoom * 100) + '%';
  }

  _setupZoomControls() {
    const onZoom = (e) => {
      const btn = e.target.closest('.btn-zoom');
      if (!btn) return;
      const action = btn.dataset.zoom;
      if (action === 'in') this.zoomIn();
      else if (action === 'out') this.zoomOut();
      else if (action === 'fit') this.resetZoom();
    };

    this.ct.addEventListener('click', onZoom);

    this.ct.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) this.zoomIn();
      else this.zoomOut();
    }, { passive: false });
  }

  setZoom(level) {
    const old = this.zoom;
    this.zoom = Math.max(0.25, Math.min(2, level));
    const ratio = this.zoom / old;
    this._scrollEl.scrollLeft *= ratio;
    this._scrollEl.scrollTop *= ratio;
    this._updateCanvasSize();
    this._updateZoomDisplay();
  }

  zoomIn() {
    const levels = [0.25, 0.33, 0.5, 0.67, 0.75, 0.85, 1, 1.15, 1.25, 1.5, 1.75, 2];
    let next = this.zoom * 1.2;
    for (const l of levels) { if (l > this.zoom + 0.01) { next = l; break; } }
    this.setZoom(Math.min(2, next));
  }

  zoomOut() {
    const levels = [0.25, 0.33, 0.5, 0.67, 0.75, 0.85, 1, 1.15, 1.25, 1.5, 1.75, 2];
    let next = this.zoom / 1.2;
    for (let i = levels.length - 1; i >= 0; i--) { if (levels[i] < this.zoom - 0.01) { next = levels[i]; break; } }
    this.setZoom(Math.max(0.25, next));
  }

  resetZoom() {
    this.setZoom(1);
  }

  _setup() {
    this.ct.addEventListener('click', (e) => {
      const chip = e.target.closest('.sb-condition-chip');
      if (!chip) return;
      const pe = chip.closest('.sb-block');
      if (!pe) return;
      const b = this.blocks.get(pe.dataset.bid);
      if (!b) return;
      const cur = b.condition || 'obstacleDetected';
      const next = cur === 'obstacleDetected' ? 'enemyDetected' : 'obstacleDetected';
      b.condition = next;
      chip.dataset.cond = next;
      const txt = chip.querySelector('.cond-text');
      if (txt) txt.textContent = next === 'enemyDetected' ? 'Inimigo' : 'Obstáculo';
      this.save();
    });

    this.ct.addEventListener('input', (e) => {
      const inp = e.target.closest('.sb-input');
      if (!inp) return;
      const pe = inp.closest('.sb-block');
      if (!pe) return;
      const b = this.blocks.get(pe.dataset.bid);
      if (b) b.value = inp.value;
      this.save();
    });

    this.ct.addEventListener('click', (e) => {
      this.ct.querySelectorAll('.sb-block.selected').forEach(el => el.classList.remove('selected'));
      const block = e.target.closest('.sb-block');
      if (block && !e.target.closest('.sb-del, .sb-input, .sb-condition-chip')) {
        block.classList.add('selected');
      }
    });

    this.ct.addEventListener('mousedown', (e) => {
      if (e.target.closest('.sb-zoom-controls, .btn-zoom')) return;
      const block = e.target.closest('.sb-block');
      if (!block) return;
      if (e.target.closest('.sb-del, .sb-input, .sb-condition-chip')) return;
      const b = this.blocks.get(block.dataset.bid);
      if (!b) return;
      this._dragStartPos = { x: e.clientX, y: e.clientY };
      this._dragCandidate = b.id;
    });

    document.addEventListener('mousemove', (e) => {
      if (this._drag) {
        e.preventDefault();
        this.moveDrag(e.clientX, e.clientY);
        return;
      }
      if (this._dragCandidate) {
        const dx = Math.abs(e.clientX - this._dragStartPos.x);
        const dy = Math.abs(e.clientY - this._dragStartPos.y);
        if (dx > 4 || dy > 4) {
          this.startDrag(this._dragCandidate, e.clientX, e.clientY);
          this._dragCandidate = null;
        }
      }
    });

    document.addEventListener('mouseup', (e) => {
      this._dragCandidate = null;
      if (!this._drag) return;
      this.endDrag(e.clientX, e.clientY);
    });

    this.ct.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.ct.classList.add('drag-over');
    });

    this.ct.addEventListener('dragleave', (e) => {
      if (!this.ct.contains(e.relatedTarget)) {
        this.ct.classList.remove('drag-over');
      }
    });

    this.ct.addEventListener('drop', (e) => {
      e.preventDefault();
      this.ct.classList.remove('drag-over');
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        this.drop(data, e.clientX, e.clientY);
      } catch { }
    });

    this.ct.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sel = this.ct.querySelector('.sb-block.selected');
        if (sel) {
          this.removeBlock(sel.dataset.bid);
        }
      }
    });
  }
}
