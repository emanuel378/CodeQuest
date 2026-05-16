import { audioManager } from '../audio/audioManager.js';

let nextId = 1;

const CAT_COLORS = {
  movimento: 'var(--primary-container)',
  controle: 'var(--secondary-container)',
  combate: 'var(--error)',
  variavel: 'var(--secondary)'
};

const CONTROL_TYPES = new Set(['if', 'repeat', 'while']);
const SNAP_DISTANCE = 90;
const WORKSPACE_PAD = 400;

export class BlockWorkspace {
  constructor(containerEl, palette, options = {}) {
    this.ct = containerEl;
    this.palette = palette;
    this.onError = options.onError || null;
    this.zoom = 1;
    this.blocks = new Map();
    this._drag = null;

    this._ghostEl = null;
    this._paletteGhostEl = null;
    this._paletteDragData = null;
    this._scrollEl = document.createElement('div');
    this._scrollEl.className = 'sb-workspace-scroll';
    this.ct.appendChild(this._scrollEl);

    this._canvas = document.createElement('div');
    this._canvas.className = 'sb-canvas';
    this._scrollEl.appendChild(this._canvas);

    this._updateCanvasSize();
    this._setup();
    this._setupZoomControls();
    this._centerScroll();
  }

  createBlock(type, label, icon, category, params, x, y) {
    const id = `b${nextId++}`;
    const ctrl = CONTROL_TYPES.has(type);
    const b = {
      id, type, label, icon, category,
      value: params?.value,
      varName: params?.varName || null,
      condition: params?.condition || (type === 'if' || type === 'while' ? 'obstacleDetected' : null),
      x: x ?? 40, y: y ?? (40 + this.blocks.size * 70),
      w: type === 'custom_var' ? 80 : type === 'set_var' || type === 'change_var' ? 260 : 220, h: ctrl ? 80 : 40,
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
    this._removePaletteGhost();
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
    if (b.varName) c.varName = b.varName;
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
    div.className = 'sb-block';

    if (b.ctrl) div.classList.add('sb-control');
    if (b.type === 'custom_var') div.classList.add('sb-block-variable');

    const clr = CAT_COLORS[b.category] || 'var(--on-surface-variant)';
    div.style.setProperty('--cat-color', clr);
    if (b.type !== 'set_var' && b.type !== 'change_var') div.style.width = b.w + 'px';

    const body = document.createElement('div');
    body.className = 'sb-block-body';

    const headlight = document.createElement('div');
    headlight.className = 'sb-headlight';
    headlight.dataset.cat = b.category;
    const lens = document.createElement('div');
    lens.className = 'sb-headlight-lens';
    headlight.appendChild(lens);
    body.appendChild(headlight);

    const content = document.createElement('div');
    content.className = 'sb-content';
    body.appendChild(content);

    div.appendChild(body);

    if (b.ctrl) {
      content.classList.add('sb-control-content');
      content.innerHTML = this._ctrlHtml(b, clr);

      const childArea = document.createElement('div');
      childArea.className = 'sb-child-area';
      childArea.dataset.parent = b.id;
      const hint = document.createElement('div');
      hint.className = 'sb-child-hint';
      hint.textContent = '+';
      childArea.appendChild(hint);
      content.appendChild(childArea);

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
        content.appendChild(esec);
      }

      div.style.height = 'auto';
    } else if (b.type === 'change_var') {
      div.classList.add('sb-block-changevar');
      this._renderChangeVarBlock(content, b, clr);
    } else if (b.type === 'set_var') {
      div.classList.add('sb-block-setvar');
      this._renderSetVarBlock(content, b, clr);
    } else {
      content.innerHTML = this._simpleHtml(b, clr);
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
      ${b.value != null && !['move','turnRight','turnLeft'].includes(b.type) ? `<input class="sb-input sb-input-circle" type="text" value="${b.value}" data-bid="${b.id}">` : ''}
    `;
  }

  _renderSetVarBlock(content, b, clr) {
    content.innerHTML = `
      <span class="sb-icon" style="color:${clr};flex-shrink:0">
        <span class="material-symbols-outlined">${b.icon}</span>
      </span>
      <span class="sb-label" style="flex-shrink:0">${b.label}</span>
      <select class="sb-var-select" data-bid="${b.id}"></select>
      <span class="sb-var-eq" style="flex-shrink:0">recebe</span>
      <input class="sb-input sb-input-circle" type="text" value="${b.value ?? 0}" data-bid="${b.id}" style="margin-left:0;flex-shrink:0">
    `;
    const select = content.querySelector('.sb-var-select');
    if (select) this._populateVarSelect(select, b);
  }

  _populateVarSelect(select, b) {
    const vars = this.palette ? this.palette.getVariables() : [];
    const currentValue = b.varName || '';
    select.innerHTML = '';
    if (vars.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '--';
      select.appendChild(opt);
    } else {
      for (const v of vars) {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      }
    }
    select.value = vars.includes(currentValue) ? currentValue : '';
  }

  _renderChangeVarBlock(content, b, clr) {
    content.innerHTML = `
      <span class="sb-icon" style="color:${clr};flex-shrink:0">
        <span class="material-symbols-outlined">${b.icon}</span>
      </span>
      <span class="sb-label" style="flex-shrink:0">${b.label}</span>
      <select class="sb-var-select" data-bid="${b.id}"></select>
      <span class="sb-var-to" style="flex-shrink:0">para</span>
      <input class="sb-input sb-input-circle" type="text" value="${b.value ?? 0}" data-bid="${b.id}" style="margin-left:0;flex-shrink:0">
    `;
    const select = content.querySelector('.sb-var-select');
    if (select) this._populateChangeVarSelect(select, b);
  }

  _populateChangeVarSelect(select, b) {
    const assignedVars = new Set();
    for (const block of this.blocks.values()) {
      if (block.type === 'set_var' && block.varName) {
        assignedVars.add(block.varName);
      }
    }
    const currentValue = b.varName || '';
    select.innerHTML = '';
    if (assignedVars.size === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '--';
      select.appendChild(opt);
    } else {
      for (const v of assignedVars) {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      }
    }
    select.value = assignedVars.has(currentValue) ? currentValue : '';
  }

  _refreshVarSelects() {
    for (const [, b] of this.blocks) {
      if (!b.el) continue;
      const select = b.el.querySelector('.sb-var-select');
      if (!select) continue;
      if (b.type === 'change_var') {
        this._populateChangeVarSelect(select, b);
      } else {
        this._populateVarSelect(select, b);
      }
    }
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
      if (b.varName) {
        html += `<span class="sb-var-slot sb-var-slot-filled" data-bid="${b.id}">
          <span class="sb-var-slot-name">${b.varName}</span>
          <button class="sb-var-slot-clear" data-bid="${b.id}">&times;</button>
        </span>`;
      } else {
        html += `<span class="sb-var-slot" data-bid="${b.id}"><span class="sb-var-slot-placeholder">var</span></span>`;
      }
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

  _applyInlineContentStyles(el, apply) {
    const content = el?.querySelector('.sb-content');
    if (!content) return;
    const isCtrl = el.classList.contains('sb-control');
    if (apply && !isCtrl) {
      const isNested = el.classList.contains('sb-nested');
      content.style.flexDirection = 'row';
      content.style.alignItems = 'center';
      content.style.gap = isNested ? '4px' : '8px';
      content.style.padding = isNested ? '4px 6px' : '8px 12px';
      content.style.fontSize = isNested ? '11px' : '12px';
    } else {
      content.style.flexDirection = '';
      content.style.alignItems = '';
      content.style.gap = '';
      content.style.padding = '';
      content.style.fontSize = '';
    }
  }

  _updateHeight(b) {
    if (!b || !b.el) return;
    const r = b.el.getBoundingClientRect();
    b.h = r.height;
  }

  drop(data, clientX, clientY) {
    if (data.type === 'custom_var') {
      const varName = data.params?.varName;
      if (varName && this._isVariableDefined(varName)) {
        const slotResult = this._findVarSlot(clientX, clientY);
        if (slotResult) {
          this._dockVariableToRepeat(slotResult.repeatBlock, slotResult.slotEl, varName);
          audioManager.playSfx('snap');
          return slotResult.repeatBlock;
        }
      } else if (varName && !this._isVariableDefined(varName)) {
        audioManager.playSfx('error');
        if (this.onError) this.onError(`A variável "${varName}" precisa ser definida com um bloco "Definir" antes de usar no "Repetir".`);
      }
    }

    const { x: mx, y: my } = this._clientToCanvas(clientX, clientY);

    const childArea = this._findChildArea(clientX, clientY);
    if (childArea) {
      const b = this._dropChild(childArea, data);
      this.save();
      return b;
    }

    const b = this.createBlock(data.type, data.label, data.icon, data.category, data.params, mx - 110, my - 20);
    this._trySnap(b.id, mx, my, [b.id]);
    audioManager.playSfx('snap');
    this.save();
    return b;
  }

  _findChildArea(cx, cy) {
    for (const [, b] of this.blocks) {
      if (!b.ctrl || !b.parent || !b.el) continue;
      const r = b.el.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        const ca = b.el.querySelector('.sb-child-area');
        const cr = ca ? ca.getBoundingClientRect() : null;
        const ea = b.el.querySelector('.sb-else-area');
        const er = ea ? ea.getBoundingClientRect() : null;

        const inCa = cr && cx >= cr.left && cx <= cr.right && cy >= cr.top && cy <= cr.bottom;
        const inEa = er && cx >= er.left && cx <= er.right && cy >= er.top && cy <= er.bottom;

        if (inCa) return ca;
        if (inEa) return ea;
      }
    }
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

    const b = this.createBlock(data.type, data.label, data.icon, data.category, data.params, 0, 0);
    b.parent = pd.id;
    if (isElse) pd.elseChildren.push(b.id);
    else pd.children.push(b.id);

    b.el.style.position = 'relative';
    b.el.style.left = '';
    b.el.style.top = '';
    b.el.classList.add('sb-nested');
    area.appendChild(b.el);
    this._applyInlineContentStyles(b.el, true);
    this._updateHeight(pd);
    audioManager.playSfx('snap');
    return b;
  }

  _dropChainInChild(area, chainIds) {
    for (const cid of chainIds) {
      const block = this.blocks.get(cid);
      if (block && block.el && block.el.contains(area)) {
        return;
      }
    }

    const isElse = area.classList.contains('sb-else-area');
    const pe = area.closest('.sb-block');
    if (!pe) return;
    const pd = this.blocks.get(pe.dataset.bid);
    if (!pd) return;

    let prevBlockId = null;
    for (const cid of chainIds) {
      const block = this.blocks.get(cid);
      if (!block) continue;

      block.parent = pd.id;
      block.prev = prevBlockId;
      if (prevBlockId) {
        const prevB = this.blocks.get(prevBlockId);
        if (prevB) prevB.next = block.id;
      }

      block.el.style.position = 'relative';
      block.el.style.left = '';
      block.el.style.top = '';
      block.el.classList.add('sb-nested');
      this._applyInlineContentStyles(block.el, true);
      area.appendChild(block.el);

      if (!prevBlockId) {
        if (isElse) pd.elseChildren.push(block.id);
        else pd.children.push(block.id);
      }

      prevBlockId = block.id;
    }

    this._updateHeight(pd);
    for (const cid of chainIds) {
      const block = this.blocks.get(cid);
      if (block && block.ctrl) this._updateHeight(block);
    }
    audioManager.playSfx('snap');
  }

  _trySnap(id, mx, my, chainIds) {
    const b = this.blocks.get(id);
    if (!b || b.type === 'custom_var') return false;

    chainIds = chainIds || [id];
    const chainSet = new Set(chainIds);
    const sn = SNAP_DISTANCE / this.zoom;
    const chainH = chainIds.length > 1 ? this._getChainHeight(chainIds) : (b.el ? b.el.offsetHeight / this.zoom : (b.h || 40));
    let bestBelow = null;
    let bestDistBelow = sn;
    let bestAbove = null;
    let bestDistAbove = sn;

    for (const [, o] of this.blocks) {
      if (chainSet.has(o.id) || o.parent) continue;
      const or = o.el.getBoundingClientRect();
      const crt = this._canvas.getBoundingClientRect();
      const ox = (or.left - crt.left) / this.zoom;
      const oy = (or.top - crt.top) / this.zoom;
      const oWidth = or.width / this.zoom;
      const oHeight = or.height / this.zoom;

      const ddx = Math.abs(mx - (ox + oWidth / 2));
      if (ddx >= sn) continue;

      const ddy = my - (oy + oHeight);
      if (ddy >= 0 && ddy < bestDistBelow) {
        if (o.ctrl) {
          const ca = o.el.querySelector('.sb-child-area');
          if (ca) {
            const cr = ca.getBoundingClientRect();
            const cdy = my - (cr.top - crt.top) / this.zoom;
            if (cdy >= 0 && cdy < ca.offsetHeight) continue;
          }
        }
        bestBelow = { target: o };
        bestDistBelow = ddy;
      }

      const ddyAbove = oy - my;
      if (ddyAbove >= 0 && ddyAbove < bestDistAbove) {
        if (o.ctrl) {
          const ca = o.el.querySelector('.sb-child-area');
          if (ca) {
            const cr = ca.getBoundingClientRect();
            const cdy = my - (cr.top - crt.top) / this.zoom;
            if (cdy >= 0 && cdy < ca.offsetHeight) continue;
          }
        }
        bestAbove = { target: o };
        bestDistAbove = ddyAbove;
      }
    }

    const useAbove = bestAbove && (!bestBelow || bestDistAbove < bestDistBelow);

    const repositionChain = () => {
      if (this._drag && this._drag.offsets) {
        for (const off of this._drag.offsets) {
          if (off.id === b.id) continue;
          const block = this.blocks.get(off.id);
          if (!block) continue;
          block.x = b.x + off.dx;
          block.y = b.y + off.dy;
          this._pos(block);
        }
      } else {
        for (const cid of chainIds) {
          if (cid === b.id) continue;
          const block = this.blocks.get(cid);
          if (block) this._pos(block);
        }
      }
    };

    if (useAbove) {
      const o = bestAbove.target;
      const or = o.el.getBoundingClientRect();
      const crt = this._canvas.getBoundingClientRect();
      b.x = (or.left - crt.left) / this.zoom;
      b.y = (or.top - crt.top) / this.zoom - chainH;

      const oldPrevId = o.prev;
      const lastId = chainIds[chainIds.length - 1];

      if (lastId !== id) {
        const lastBlock = this.blocks.get(lastId);
        if (lastBlock) lastBlock.next = o.id;
      } else {
        b.next = o.id;
      }
      o.prev = lastId;
      b.prev = null;

      if (oldPrevId) {
        const oldPrev = this.blocks.get(oldPrevId);
        if (oldPrev) {
          oldPrev.next = b.id;
          b.prev = oldPrevId;
        }
      }

      this._pos(b);
      repositionChain();
      return true;
    }

    if (bestBelow) {
      const o = bestBelow.target;
      const or = o.el.getBoundingClientRect();
      const crt = this._canvas.getBoundingClientRect();
      b.x = (or.left - crt.left) / this.zoom;
      b.y = (or.top - crt.top) / this.zoom + or.height / this.zoom;
      b.prev = o.id;
      o.next = b.id;
      this._pos(b);
      repositionChain();
      return true;
    }

    return false;
  }

  _createGhost(b, x, y, chainIds) {
    this._removeGhost();
    if (chainIds && chainIds.length > 1) {
      const firstB = this.blocks.get(chainIds[0]);
      if (!firstB) return;
      const els = [];
      for (const cid of chainIds) {
        const block = this.blocks.get(cid);
        if (!block) continue;
        const ghost = this._render(block);
        ghost.classList.add('sb-block-ghost');
        const dx = block.x - firstB.x;
        const dy = block.y - firstB.y;
        ghost.style.left = (x + dx) + 'px';
        ghost.style.top = (y + dy) + 'px';
        ghost.style.position = 'absolute';
        const del = ghost.querySelector('.sb-del');
        if (del) del.remove();
        this._canvas.appendChild(ghost);
        els.push(ghost);
      }
      this._ghostEls = els;
    } else {
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
  }

  _removeGhost() {
    if (this._ghostEls) {
      for (const el of this._ghostEls) el.remove();
      this._ghostEls = null;
    }
    if (this._ghostEl) {
      this._ghostEl.remove();
      this._ghostEl = null;
    }
  }

  _createPaletteGhost(data, x, y) {
    this._removePaletteGhost();
    const isSetVar = data.type === 'set_var';
    const temp = {
      type: data.type,
      label: data.label,
      icon: data.icon,
      category: data.category,
      ctrl: CONTROL_TYPES.has(data.type),
      w: isSetVar ? 260 : 220,
      h: CONTROL_TYPES.has(data.type) ? 80 : 40,
      value: data.params?.value,
      varName: data.params?.varName || null,
      condition: data.params?.condition || null,
      children: [],
      elseChildren: []
    };
    const ghost = this._render(temp);
    ghost.classList.add('sb-block-ghost');
    ghost.style.left = x + 'px';
    ghost.style.top = y + 'px';
    ghost.style.position = 'absolute';
    const del = ghost.querySelector('.sb-del');
    if (del) del.remove();
    this._canvas.appendChild(ghost);
    this._paletteGhostEl = ghost;
  }

  _removePaletteGhost() {
    if (this._paletteGhostEl) {
      this._paletteGhostEl.remove();
      this._paletteGhostEl = null;
    }
  }

  _isVariableDefined(varName) {
    for (const [, b] of this.blocks) {
      if (b.type === 'set_var' && b.varName === varName) return true;
    }
    return false;
  }

  _findVarSlot(cx, cy) {
    for (const [, b] of this.blocks) {
      if (b.type === 'repeat' && !b.varName && b.el) {
        const slot = b.el.querySelector('.sb-var-slot:not(.sb-var-slot-filled)');
        if (slot) {
          const r = slot.getBoundingClientRect();
          if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
            return { repeatBlock: b, slotEl: slot };
          }
        }
      }
    }
    return null;
  }

  _dockVariableToRepeat(repeatBlock, slotEl, varName) {
    repeatBlock.varName = varName;
    slotEl.outerHTML = `<span class="sb-var-slot sb-var-slot-filled" data-bid="${repeatBlock.id}">
      <span class="sb-var-slot-name">${varName}</span>
      <button class="sb-var-slot-clear" data-bid="${repeatBlock.id}">&times;</button>
    </span>`;
    this.save();
  }

  _showSlotVarPicker(repeatBlock, slotEl) {
    const vars = this.palette ? this.palette.getVariables() : [];
    if (vars.length === 0) {
      if (this.onError) this.onError('Crie uma variável na paleta antes de usá-la no bloco Repetir.');
      return;
    }

    const assignedVars = new Set();
    for (const [, b] of this.blocks) {
      if (b.type === 'set_var' && b.varName) {
        assignedVars.add(b.varName);
      }
    }

    const availableVars = vars.filter(v => assignedVars.has(v));
    if (availableVars.length === 0) {
      if (this.onError) this.onError('Defina uma variável com o bloco "Definir" antes de usá-la no "Repetir".');
      return;
    }

    const picker = document.createElement('div');
    picker.className = 'sb-var-picker';
    picker.innerHTML = `
      <div class="sb-var-picker-label">Escolha a variável</div>
      <div class="sb-var-picker-list">
        ${availableVars.map(v => `<button class="sb-var-picker-item" data-name="${v}">${v}</button>`).join('')}
      </div>
    `;

    const rect = slotEl.getBoundingClientRect();
    const scrollRect = this._scrollEl.getBoundingClientRect();
    picker.style.left = (rect.left - scrollRect.left + this._scrollEl.scrollLeft) + 'px';
    picker.style.top = (rect.bottom - scrollRect.top + this._scrollEl.scrollTop + 4) + 'px';

    this._canvas.appendChild(picker);

    const closePicker = () => {
      picker.remove();
      document.removeEventListener('click', outsideClick);
    };

    const outsideClick = (ev) => {
      if (!picker.contains(ev.target)) closePicker();
    };

    setTimeout(() => document.addEventListener('click', outsideClick), 10);

    picker.querySelectorAll('.sb-var-picker-item').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const varName = btn.dataset.name;
        this._dockVariableToRepeat(repeatBlock, slotEl, varName);
        closePicker();
        audioManager.playSfx('snap');
      });
    });
  }

  _showPaletteGuide(cx, cy) {
    this._removeGhost();
    const crt = this._canvas.getBoundingClientRect();
    const mx = (cx - crt.left) / this.zoom;
    const my = (cy - crt.top) / this.zoom;
    if (!this._paletteDragData) return;

    this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));

    for (const [, o] of this.blocks) {
      if (!o.ctrl || !o.parent || !o.el) continue;
      const r = o.el.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        const ca = o.el.querySelector('.sb-child-area');
        const cr = ca ? ca.getBoundingClientRect() : null;
        const ea = o.el.querySelector('.sb-else-area');
        const er = ea ? ea.getBoundingClientRect() : null;

        const inCa = cr && cx >= cr.left && cx <= cr.right && cy >= cr.top && cy <= cr.bottom;
        const inEa = er && cx >= er.left && cx <= er.right && cy >= er.top && cy <= er.bottom;

        if (inCa && ca) ca.classList.add('sb-snap-target');
        if (inEa && ea) ea.classList.add('sb-snap-target');
      }
    }

    if (this._paletteDragData.type === 'custom_var') {
      const varName = this._paletteDragData.params?.varName;
      if (varName) {
        for (const [, ob] of this.blocks) {
          if (ob.type === 'repeat' && !ob.varName && ob.el) {
            const slot = ob.el.querySelector('.sb-var-slot:not(.sb-var-slot-filled)');
            if (slot) {
              const sr = slot.getBoundingClientRect();
              if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) {
                if (this._isVariableDefined(varName)) {
                  slot.classList.add('sb-snap-target');
                  this._removePaletteGhost();
                } else {
                  slot.classList.add('sb-var-slot-reject');
                  setTimeout(() => slot.classList.remove('sb-var-slot-reject'), 300);
                  audioManager.playSfx('error');
                  if (this.onError) this.onError(`A variável "${varName}" precisa ser definida com um bloco "Definir" antes de usar no "Repetir".`);
                }
                return;
              }
            }
          }
        }
      }
    }

    const sn = SNAP_DISTANCE / this.zoom;
    const ghostH = CONTROL_TYPES.has(this._paletteDragData.type) ? 80 : 40;

    let inChildArea = false;
    let bestBelow = null;
    let bestDistBelow = sn;
    let bestAbove = null;
    let bestDistAbove = sn;

    for (const [, o] of this.blocks) {
      if (o.ctrl && o.el) {
        const ca = o.el.querySelector('.sb-child-area');
        if (ca) {
          const cr = ca.getBoundingClientRect();
          if (cx >= cr.left && cx <= cr.right && cy >= cr.top && cy <= cr.bottom) {
            ca.classList.add('sb-snap-target');
            inChildArea = true;
          }
        }
        const ea = o.el.querySelector('.sb-else-area');
        if (ea) {
          const er = ea.getBoundingClientRect();
          if (cx >= er.left && cx <= er.right && cy >= er.top && cy <= er.bottom) {
            ea.classList.add('sb-snap-target');
            inChildArea = true;
          }
        }
      }

      if (o.parent || o.type === 'custom_var') continue;
      const or = o.el.getBoundingClientRect();
      const ox = (or.left - crt.left) / this.zoom;
      const oy = (or.top - crt.top) / this.zoom;
      const oWidth = or.width / this.zoom;
      const oHeight = or.height / this.zoom;

      const ddx = Math.abs(mx - (ox + oWidth / 2));
      if (ddx >= sn) continue;

      const ddy = my - (oy + oHeight);
      if (ddy >= 0 && ddy < bestDistBelow) {
        if (o.ctrl) {
          const ca = o.el.querySelector('.sb-child-area');
          if (ca) {
            const cr2 = ca.getBoundingClientRect();
            const cdy = my - (cr2.top - crt.top) / this.zoom;
            if (cdy >= 0 && cdy < ca.offsetHeight / this.zoom) continue;
          }
        }
        bestBelow = { target: o, ox, oy, height: oHeight };
        bestDistBelow = ddy;
      }

      const ddyAbove = oy - my;
      if (ddyAbove >= 0 && ddyAbove < bestDistAbove) {
        if (o.ctrl) {
          const ca = o.el.querySelector('.sb-child-area');
          if (ca) {
            const cr2 = ca.getBoundingClientRect();
            const cdy = my - (cr2.top - crt.top) / this.zoom;
            if (cdy >= 0 && cdy < ca.offsetHeight / this.zoom) continue;
          }
        }
        bestAbove = { target: o, ox, oy, height: oHeight };
        bestDistAbove = ddyAbove;
      }
    }

    const useAbove = bestAbove && (!bestBelow || bestDistAbove < bestDistBelow);

    if (useAbove) {
      if (inChildArea) {
        this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
      }
      const gx = bestAbove.ox;
      const gy = bestAbove.oy - ghostH;
      if (!this._paletteGhostEl) {
        this._createPaletteGhost(this._paletteDragData, gx, gy);
      } else {
        this._paletteGhostEl.style.left = gx + 'px';
        this._paletteGhostEl.style.top = gy + 'px';
      }
    } else if (bestBelow) {
      if (inChildArea) {
        this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
      }
      const gx = bestBelow.ox;
      const gy = bestBelow.oy + bestBelow.height;
      if (!this._paletteGhostEl) {
        this._createPaletteGhost(this._paletteDragData, gx, gy);
      } else {
        this._paletteGhostEl.style.left = gx + 'px';
        this._paletteGhostEl.style.top = gy + 'px';
      }
    } else {
      this._removePaletteGhost();
    }
  }

  _getChain(id) {
    const ids = [];
    let cur = this.blocks.get(id);
    while (cur) {
      ids.push(cur.id);
      cur = cur.next ? this.blocks.get(cur.next) : null;
    }
    return ids;
  }

  _getChainHeight(chainIds) {
    let h = 0;
    for (const cid of chainIds) {
      const block = this.blocks.get(cid);
      if (block) h += block.el ? block.el.offsetHeight / this.zoom : (block.h || 40);
    }
    return h;
  }

  startDrag(id, cx, cy) {
    const b = this.blocks.get(id);
    if (!b) return;

    const chainIds = this._getChain(id);

    if (b.parent) {
      const p = this.blocks.get(b.parent);
      if (p) {
        p.children = p.children.filter(c => c !== id);
        p.elseChildren = p.elseChildren.filter(c => c !== id);
      }
    }

    if (b.prev) {
      const p = this.blocks.get(b.prev);
      if (p) p.next = null;
    }
    b.prev = null;
    b.parent = null;

    const cr = this._canvas.getBoundingClientRect();
    const br = b.el.getBoundingClientRect();

    const baseX = (br.left - cr.left) / this.zoom;
    const baseY = (br.top - cr.top) / this.zoom;

    const offsets = [];
    for (const cid of chainIds) {
      const block = this.blocks.get(cid);
      if (!block) continue;
      const blockRect = block.el.getBoundingClientRect();
      offsets.push({
        id: cid,
        dx: (blockRect.left - cr.left) / this.zoom - baseX,
        dy: (blockRect.top - cr.top) / this.zoom - baseY
      });
      block.el.style.position = 'absolute';
      block.el.style.left = block.x + 'px';
      block.el.style.top = block.y + 'px';
      block.el.classList.remove('sb-nested');
      block.el.style.minWidth = '';
      block.el.style.width = block.w + 'px';
      this._applyInlineContentStyles(block.el, false);
      this._canvas.appendChild(block.el);
    }

    b.x = baseX;
    b.y = baseY;
    this._pos(b);

    this._drag = {
      id, chainIds, offsets,
      ox: (cx - cr.left) / this.zoom - b.x,
      oy: (cy - cr.top) / this.zoom - b.y
    };
    b.el.classList.add('dragging');
  }

  moveDrag(cx, cy) {
    if (!this._drag) return;
    const b = this.blocks.get(this._drag.id);
    if (!b) return;
    const cr = this._canvas.getBoundingClientRect();
    const newX = (cx - cr.left) / this.zoom - this._drag.ox;
    const newY = (cy - cr.top) / this.zoom - this._drag.oy;
    const dx = newX - b.x;
    const dy = newY - b.y;

    b.x = newX;
    b.y = newY;
    this._pos(b);

    for (const cid of this._drag.chainIds) {
      if (cid === this._drag.id) continue;
      const block = this.blocks.get(cid);
      if (!block) continue;
      block.x += dx;
      block.y += dy;
      this._pos(block);
    }

    this._showSnapGuide(b.id, cx, cy, this._drag.chainIds);
  }

  _showSnapGuide(id, cx, cy, chainIds) {
    this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
    this._removeGhost();

    const crt = this._canvas.getBoundingClientRect();
    const mx = (cx - crt.left) / this.zoom;
    const my = (cy - crt.top) / this.zoom;
    const b = this.blocks.get(id);
    if (!b) return;

    chainIds = chainIds || (this._drag ? this._drag.chainIds : null) || [id];
    const chainSet = new Set(chainIds);

    for (const [, o] of this.blocks) {
      if (!o.ctrl || !o.parent || !o.el) continue;
      const r = o.el.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        const ca = o.el.querySelector('.sb-child-area');
        const cr = ca ? ca.getBoundingClientRect() : null;
        const ea = o.el.querySelector('.sb-else-area');
        const er = ea ? ea.getBoundingClientRect() : null;

        const inCa = cr && cx >= cr.left && cx <= cr.right && cy >= cr.top && cy <= cr.bottom;
        const inEa = er && cx >= er.left && cx <= er.right && cy >= er.top && cy <= er.bottom;

        if (inCa && ca) ca.classList.add('sb-snap-target');
        if (inEa && ea) ea.classList.add('sb-snap-target');
      }
    }

    if (b.type === 'custom_var') {
      for (const [, ob] of this.blocks) {
        if (ob.type === 'repeat' && !ob.varName && ob.el) {
          const slot = ob.el.querySelector('.sb-var-slot:not(.sb-var-slot-filled)');
          if (slot) {
            const sr = slot.getBoundingClientRect();
            if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) {
              if (this._isVariableDefined(b.varName)) {
                slot.classList.add('sb-snap-target');
              } else {
                slot.classList.add('sb-var-slot-reject');
                setTimeout(() => slot.classList.remove('sb-var-slot-reject'), 300);
                audioManager.playSfx('error');
                if (this.onError) this.onError(`A variável "${b.varName}" precisa ser definida com um bloco "Definir" antes de usar no "Repetir".`);
              }
              return;
            }
          }
        }
      }
    }

    const sn = SNAP_DISTANCE / this.zoom;
    const chainH = chainIds.length > 1 ? this._getChainHeight(chainIds) : (b.el ? b.el.offsetHeight / this.zoom : (b.h || 40));

    let inChildArea = false;
    let bestBelow = null;
    let bestDistBelow = sn;
    let bestAbove = null;
    let bestDistAbove = sn;

    for (const [, o] of this.blocks) {
      if (o.ctrl && o.el) {
        const ca = o.el.querySelector('.sb-child-area');
        if (ca) {
          const cr = ca.getBoundingClientRect();
          if (cx >= cr.left && cx <= cr.right && cy >= cr.top && cy <= cr.bottom) {
            ca.classList.add('sb-snap-target');
            inChildArea = true;
          }
        }
        const ea = o.el.querySelector('.sb-else-area');
        if (ea) {
          const er = ea.getBoundingClientRect();
          if (cx >= er.left && cx <= er.right && cy >= er.top && cy <= er.bottom) {
            ea.classList.add('sb-snap-target');
            inChildArea = true;
          }
        }
      }

      if (chainSet.has(o.id) || o.parent || o.type === 'custom_var') continue;
      const or = o.el.getBoundingClientRect();
      const ox = (or.left - crt.left) / this.zoom;
      const oy = (or.top - crt.top) / this.zoom;
      const oWidth = or.width / this.zoom;
      const oHeight = or.height / this.zoom;

      const ddx = Math.abs(mx - (ox + oWidth / 2));
      if (ddx >= sn) continue;

      const ddy = my - (oy + oHeight);
      if (ddy >= 0 && ddy < bestDistBelow) {
        if (o.ctrl) {
          const ca = o.el.querySelector('.sb-child-area');
          if (ca) {
            const cr2 = ca.getBoundingClientRect();
            const cdy = my - (cr2.top - crt.top) / this.zoom;
            if (cdy >= 0 && cdy < ca.offsetHeight / this.zoom) continue;
          }
        }
        bestBelow = { target: o, ox, oy, height: oHeight };
        bestDistBelow = ddy;
      }

      const ddyAbove = oy - my;
      if (ddyAbove >= 0 && ddyAbove < bestDistAbove) {
        if (o.ctrl) {
          const ca = o.el.querySelector('.sb-child-area');
          if (ca) {
            const cr2 = ca.getBoundingClientRect();
            const cdy = my - (cr2.top - crt.top) / this.zoom;
            if (cdy >= 0 && cdy < ca.offsetHeight / this.zoom) continue;
          }
        }
        bestAbove = { target: o, ox, oy, height: oHeight };
        bestDistAbove = ddyAbove;
      }
    }

    const useAbove = bestAbove && (!bestBelow || bestDistAbove < bestDistBelow);

    if (useAbove) {
      if (inChildArea) {
        this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
      }
      const gx = bestAbove.ox;
      const gy = bestAbove.oy - chainH;
      this._createGhost(b, gx, gy, chainIds);
    } else if (bestBelow) {
      if (inChildArea) {
        this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
      }
      const gx = bestBelow.ox;
      const gy = bestBelow.oy + bestBelow.height;
      this._createGhost(b, gx, gy, chainIds);
    }
  }

  endDrag(cx, cy) {
    if (!this._drag) return;
    const b = this.blocks.get(this._drag.id);
    try {
      if (b) {
        b.el.classList.remove('dragging');
        const chainIds = this._drag.chainIds || [b.id];

        if (b.type === 'custom_var') {
          const varName = b.varName;
          if (varName && this._isVariableDefined(varName)) {
            const slotResult = this._findVarSlot(cx, cy);
            if (slotResult) {
              for (const cid of chainIds) this.removeBlock(cid);
              this._dockVariableToRepeat(slotResult.repeatBlock, slotResult.slotEl, varName);
              audioManager.playSfx('snap');
              return;
            }
          } else if (varName && !this._isVariableDefined(varName)) {
            audioManager.playSfx('error');
            if (this.onError) this.onError(`A variável "${varName}" precisa ser definida com um bloco "Definir" antes de usar no "Repetir".`);
          }
        }

        const childArea = this._findChildArea(cx, cy);
        if (childArea) {
          const pe = childArea.closest('.sb-block');
          const isCycle = chainIds.some(cid => {
            const cb = this.blocks.get(cid);
            return cb && cb.el && (cb.el.contains(pe) || cb.el.contains(childArea));
          });
          if (!isCycle) {
            this._dropChainInChild(childArea, chainIds);
          } else {
            const { x: mx, y: my } = this._clientToCanvas(cx, cy);
            this._trySnap(b.id, mx, my, chainIds);
          }
        } else {
          const { x: mx, y: my } = this._clientToCanvas(cx, cy);
          this._trySnap(b.id, mx, my, chainIds);
        }
      }
    } finally {
      this._removeGhost();
      this._drag = null;
      this._canvas.querySelectorAll('.sb-snap-target').forEach(el => el.classList.remove('sb-snap-target'));
      this.save();
    }
  }

  save() {
    const data = [];
    for (const [, b] of this.blocks) {
      data.push({
        id: b.id, type: b.type, label: b.label, icon: b.icon,
        category: b.category, x: b.x, y: b.y,
        value: b.value, varName: b.varName, condition: b.condition,
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
        b.el.style.position = 'relative';
        b.el.style.left = '';
        b.el.style.top = '';
        b.el.classList.add('sb-nested');
        area.appendChild(b.el);
        this._applyInlineContentStyles(b.el, true);
      }

      for (const [, b] of this.blocks) {
        if (b.ctrl) this._updateHeight(b);
      }

      this._updateCanvasSize();
      this.save();
      this._centerScroll();
      return true;
    } catch { return false; }
  }

  _createFromData(bd) {
    const b = {
      id: bd.id, type: bd.type, label: bd.label, icon: bd.icon,
      category: bd.category, x: bd.x, y: bd.y,
      w: bd.w || 220, h: bd.h || (bd.ctrl ? 80 : 40),
      value: bd.value, varName: bd.varName, condition: bd.condition,
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
    let maxX = WORKSPACE_PAD;
    let maxY = WORKSPACE_PAD;
    for (const [, b] of this.blocks) {
      const right = b.x + (b.w || 220);
      const bottom = b.y + (b.h || 40);
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    }
    if (this._scrollEl) {
      const vw = this._scrollEl.clientWidth / this.zoom;
      const vh = this._scrollEl.clientHeight / this.zoom;
      if (vw > maxX) maxX = vw;
      if (vh > maxY) maxY = vh;
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

  _centerScroll() {
    this._scrollEl.scrollLeft = WORKSPACE_PAD / this.zoom;
    this._scrollEl.scrollTop = WORKSPACE_PAD / this.zoom;
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

    this.ct.addEventListener('change', (e) => {
      const select = e.target.closest('.sb-var-select');
      if (!select) return;
      const pe = select.closest('.sb-block');
      if (!pe) return;
      const b = this.blocks.get(pe.dataset.bid);
      if (b) b.varName = select.value;
      this.save();
    });

    this.ct.addEventListener('mousedown', (e) => {
      const select = e.target.closest('.sb-var-select');
      if (select) {
        const pe = select.closest('.sb-block');
        if (pe) {
          const b = this.blocks.get(pe.dataset.bid);
          if (b) {
            if (b.type === 'change_var') {
              this._populateChangeVarSelect(select, b);
            } else {
              this._populateVarSelect(select, b);
            }
          }
        }
      }
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
      const clearBtn = e.target.closest('.sb-var-slot-clear');
      if (clearBtn) {
        const bid = clearBtn.dataset.bid;
        const b = this.blocks.get(bid);
        if (b && b.type === 'repeat') {
          b.varName = null;
          const slot = clearBtn.closest('.sb-var-slot');
          if (slot) {
            const parent = slot.parentNode;
            const newSlot = document.createElement('span');
            newSlot.className = 'sb-var-slot';
            newSlot.dataset.bid = bid;
            newSlot.innerHTML = '<span class="sb-var-slot-placeholder">var</span>';
            parent.replaceChild(newSlot, slot);
          }
          this.save();
        }
        return;
      }

      const emptySlot = e.target.closest('.sb-var-slot:not(.sb-var-slot-filled)');
      if (emptySlot) {
        const pe = emptySlot.closest('.sb-block');
        if (pe) {
          const b = this.blocks.get(pe.dataset.bid);
          if (b && b.type === 'repeat') {
            this._showSlotVarPicker(b, emptySlot);
          }
        }
        return;
      }

      this.ct.querySelectorAll('.sb-block.selected').forEach(el => el.classList.remove('selected'));
      const block = e.target.closest('.sb-block');
      if (block && !e.target.closest('.sb-del, .sb-input, .sb-condition-chip, .sb-var-select, .sb-var-eq, .sb-var-slot-clear')) {
        block.classList.add('selected');
      }
    });

    this.ct.addEventListener('mousedown', (e) => {
      if (e.target.closest('.sb-zoom-controls, .btn-zoom')) return;
      const block = e.target.closest('.sb-block');
      if (!block) return;
      if (e.target.closest('.sb-del, .sb-input, .sb-condition-chip, .sb-var-select, .sb-var-eq, .sb-var-slot-clear')) return;
      const b = this.blocks.get(block.dataset.bid);
      if (!b) return;
      this._dragStartPos = { x: e.clientX, y: e.clientY };
      this._dragCandidate = b.id;
    });

    this.ct.addEventListener('mousedown', (e) => {
      if (e.target.closest('.sb-block, .sb-zoom-controls, .btn-zoom')) return;
      this._panning = {
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: this._scrollEl.scrollLeft,
        scrollTop: this._scrollEl.scrollTop
      };
      this.ct.classList.add('panning');
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
        return;
      }
      if (this._panning) {
        const dx = e.clientX - this._panning.startX;
        const dy = e.clientY - this._panning.startY;
        this._scrollEl.scrollLeft = this._panning.scrollLeft - dx;
        this._scrollEl.scrollTop = this._panning.scrollTop - dy;
      }
    });

    document.addEventListener('mouseup', (e) => {
      this._dragCandidate = null;
      if (this._panning) {
        this._panning = null;
        this.ct.classList.remove('panning');
      }
      if (!this._drag) return;
      this.endDrag(e.clientX, e.clientY);
    });

    document.addEventListener('dragstart', (e) => {
      const block = e.target.closest('.sb-palette-block');
      if (!block) return;
      try {
        this._paletteDragData = {
          type: block.dataset.type,
          label: block.dataset.label,
          icon: block.dataset.icon,
          category: block.dataset.category,
          params: JSON.parse(block.dataset.params || '{}')
        };
      } catch {}
    });

    document.addEventListener('dragend', () => {
      this._removePaletteGhost();
      this._paletteDragData = null;
    });

    this.ct.addEventListener('dragenter', (e) => {
      e.preventDefault();
    });

    this.ct.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.ct.classList.add('drag-over');
      if (this._paletteDragData) {
        this._showPaletteGuide(e.clientX, e.clientY);
      }
    });

    this.ct.addEventListener('dragleave', (e) => {
      if (!this.ct.contains(e.relatedTarget)) {
        this.ct.classList.remove('drag-over');
        this._removePaletteGhost();
        this._paletteDragData = null;
      }
    });

    this.ct.addEventListener('drop', (e) => {
      e.preventDefault();
      this.ct.classList.remove('drag-over');
      this._removePaletteGhost();
      const data = this._paletteDragData;
      this._paletteDragData = null;
      if (!data) return;
      this.drop(data, e.clientX, e.clientY);
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
