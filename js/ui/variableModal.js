export class VariableModal {
  constructor(palette, workspace, onClose) {
    this.palette = palette;
    this.workspace = workspace;
    this.onClose = onClose || (() => {});
    this._el = null;
    this._overlay = null;
    this._suggestions = ['contador', 'passos', 'total', 'temporizador'];
  }

  show() {
    if (this._el) return;

    this._overlay = document.createElement('div');
    this._overlay.className = 'var-modal-overlay';

    this._el = document.createElement('div');
    this._el.className = 'var-modal';

    const header = document.createElement('div');
    header.className = 'var-modal-header';
    header.innerHTML = `
      <span class="material-symbols-outlined" style="color:var(--secondary)">data_object</span>
      <h3>Variáveis</h3>
      <button class="var-modal-close" title="Fechar">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;
    this._el.appendChild(header);

    const body = document.createElement('div');
    body.className = 'var-modal-body';

    const inputRow = document.createElement('div');
    inputRow.className = 'var-modal-input-row';
    inputRow.innerHTML = `
      <input type="text" class="var-modal-input" placeholder="Nome da variável..." maxlength="20" autocomplete="off">
      <button class="var-modal-create-btn">Criar</button>
    `;
    body.appendChild(inputRow);

    const input = inputRow.querySelector('.var-modal-input');
    const createBtn = inputRow.querySelector('.var-modal-create-btn');

    const doCreate = () => {
      const name = input.value.trim();
      if (!name) return;
      if (!/^[a-zA-Z_]\w*$/.test(name)) return;
      if (this.palette.getVariables().includes(name)) return;
      this._addVariable(name);
      input.value = '';
      input.focus();
    };

    createBtn.addEventListener('click', doCreate);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doCreate();
    });

    const chips = document.createElement('div');
    chips.className = 'var-modal-chips';

    const chipsLabel = document.createElement('span');
    chipsLabel.className = 'var-modal-chips-label';
    chipsLabel.textContent = 'Sugestões';
    chips.appendChild(chipsLabel);

    const chipsList = document.createElement('div');
    chipsList.className = 'var-modal-chips-list';
    for (const s of this._suggestions) {
      const chip = document.createElement('button');
      chip.className = 'var-modal-chip';
      chip.textContent = s;
      chip.addEventListener('click', () => {
        input.value = s;
        input.focus();
      });
      chipsList.appendChild(chip);
    }
    chips.appendChild(chipsList);
    body.appendChild(chips);

    const listLabel = document.createElement('div');
    listLabel.className = 'var-modal-list-label';
    listLabel.textContent = 'Variáveis criadas';
    body.appendChild(listLabel);

    const list = document.createElement('div');
    list.className = 'var-modal-list';
    this._listEl = list;
    body.appendChild(list);

    this._renderList();

    const hint = document.createElement('div');
    hint.className = 'var-modal-hint';
    hint.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:14px">info</span>
      <span>As variáveis criadas aparecem na paleta para uso nos blocos <b>Definir</b> e <b>Alterar</b>.</span>
    `;
    body.appendChild(hint);

    this._el.appendChild(body);

    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.hide();
    });

    header.querySelector('.var-modal-close').addEventListener('click', () => this.hide());

    document.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') this.hide();
    });

    document.body.appendChild(this._overlay);
    document.body.appendChild(this._el);

    requestAnimationFrame(() => {
      this._el.classList.add('active');
      this._overlay.classList.add('active');
    });

    input.focus();
  }

  _addVariable(name) {
    this.palette._variables.push(name);
    this.palette._appendVariableBlock(name);
    this._renderList();
    document.dispatchEvent(new CustomEvent('variable:created', { detail: { name } }));
    if (this.workspace) {
      this.workspace._refreshVarSelects();
    }
  }

  _removeVariable(name) {
    const idx = this.palette._variables.indexOf(name);
    if (idx > -1) {
      this.palette._variables.splice(idx, 1);
      const blockEl = this.palette._varBlocksEl.querySelector(`[data-label="${name}"]`);
      if (blockEl) blockEl.remove();
      this._renderList();
      document.dispatchEvent(new CustomEvent('variable:removed', { detail: { name } }));
      if (this.workspace) {
        this.workspace._refreshVarSelects();
      }
    }
  }

  _renderList() {
    const vars = this.palette.getVariables();
    this._listEl.innerHTML = '';
    if (vars.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'var-modal-empty';
      empty.textContent = 'Nenhuma variável criada ainda.';
      this._listEl.appendChild(empty);
      return;
    }
    for (const v of vars) {
      const row = document.createElement('div');
      row.className = 'var-modal-item';
      row.innerHTML = `
        <span class="var-modal-item-name">${v}</span>
        <button class="var-modal-item-delete" data-name="${v}" title="Remover">
          <span class="material-symbols-outlined">delete</span>
        </button>
      `;
      row.querySelector('.var-modal-item-delete').addEventListener('click', () => this._removeVariable(v));
      this._listEl.appendChild(row);
    }
  }

  hide() {
    if (!this._el) return;
    this._el.classList.remove('active');
    this._overlay.classList.remove('active');
    setTimeout(() => {
      if (this._el) {
        this._el.remove();
        this._el = null;
      }
      if (this._overlay) {
        this._overlay.remove();
        this._overlay = null;
      }
      if (this._escHandler) {
        document.removeEventListener('keydown', this._escHandler);
        this._escHandler = null;
      }
      this.onClose();
    }, 200);
  }
}
