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
const SNAP_DISTANCE = 28;

export class BlockWorkspace {
  constructor(containerEl) {
    this.ct = containerEl;
    this.blocks = new Map();
    this._drag = null;
    this._setup();
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
    this.ct.appendChild(el);
    this._pos(b);
    this.blocks.set(id, b);
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
  }

  clear() {
    for (const [, b] of this.blocks) b.el.remove();
    this.blocks.clear();
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
      <div class="sb-bump"></div>
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
    const rect = this.ct.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const childArea = this._findChildArea(clientX, clientY);
    if (childArea) {
      return this._dropChild(childArea, data);
    }

    const b = this.createBlock(data.type, data.label, data.icon, data.category, data.params, mx - 110, my - 20);
    this._trySnap(b.id, mx, my);
    audioManager.playSfx('snap');
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

  _trySnap(id, mx, my) {
    const b = this.blocks.get(id);
    if (!b) return false;

    let best = null;
    let bestDist = SNAP_DISTANCE;

    for (const [, o] of this.blocks) {
      if (o.id === id || o.parent) continue;
      const or = o.el.getBoundingClientRect();
      const pr = this.ct.getBoundingClientRect();
      const ox = or.left - pr.left;
      const oy = or.top - pr.top;

      const ddx = Math.abs(mx - (ox + o.w / 2));
      const ddy = my - (oy + o.h);

      if (ddx < SNAP_DISTANCE && ddy >= 0 && ddy < bestDist) {
        if (o.ctrl) {
          const ca = o.el.querySelector('.sb-child-area');
          if (ca) {
            const cr = ca.getBoundingClientRect();
            const cdy = my - cr.top;
            if (cdy >= 0 && cdy < ca.offsetHeight) continue;
          }
        }
        best = { target: o, dx: 0, dy: ddy };
        bestDist = ddy;
      }
    }

    if (best) {
      const o = best.target;
      b.x = o.x;
      b.y = o.y + o.h;
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

    const rect = this.ct.getBoundingClientRect();
    b.el.style.position = 'absolute';
    b.el.classList.remove('sb-nested');
    this.ct.appendChild(b.el);

    this._drag = { id, ox: cx - rect.left - b.x, oy: cy - rect.top - b.y };
    b.el.classList.add('dragging');
  }

  moveDrag(cx, cy) {
    if (!this._drag) return;
    const b = this.blocks.get(this._drag.id);
    if (!b) return;
    const rect = this.ct.getBoundingClientRect();
    b.x = cx - rect.left - this._drag.ox;
    b.y = cy - rect.top - this._drag.oy;
    this._pos(b);
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
        const rect = this.ct.getBoundingClientRect();
        const mx = cx - rect.left;
        const my = cy - rect.top;
        this._trySnap(b.id, mx, my);
      }
    }
    this._drag = null;
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
    });

    this.ct.addEventListener('input', (e) => {
      const inp = e.target.closest('.sb-input');
      if (!inp) return;
      const pe = inp.closest('.sb-block');
      if (!pe) return;
      const b = this.blocks.get(pe.dataset.bid);
      if (b) b.value = inp.value;
    });

    this.ct.addEventListener('click', (e) => {
      this.ct.querySelectorAll('.sb-block.selected').forEach(el => el.classList.remove('selected'));
      const block = e.target.closest('.sb-block');
      if (block && !e.target.closest('.sb-del, .sb-input, .sb-condition-chip')) {
        block.classList.add('selected');
      }
    });

    this.ct.addEventListener('mousedown', (e) => {
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
