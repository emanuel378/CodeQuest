const CATEGORIES = [
  {
    id: 'movimento',
    label: 'Movimento',
    icon: 'navigation',
    blocks: [
      { type: 'move', label: 'Mover Frente', icon: 'arrow_upward', params: { value: 1 } },
      { type: 'turnRight', label: 'Girar Direita', icon: 'rotate_right', params: { value: 90 } },
      { type: 'turnLeft', label: 'Girar Esquerda', icon: 'rotate_left', params: { value: 90 } },
      { type: 'jump', label: 'Pular', icon: 'keyboard_double_arrow_up' }
    ]
  },
  {
    id: 'controle',
    label: 'Controle',
    icon: 'settings_ethernet',
    blocks: [
      { type: 'if', label: 'Se', icon: 'call_split', params: { condition: 'obstacleDetected' } },
      { type: 'repeat', label: 'Repetir', icon: 'repeat', params: { value: 5 } },
      { type: 'while', label: 'Enquanto', icon: 'loop', params: { condition: 'obstacleDetected' } }
    ]
  },
  {
    id: 'sensor',
    label: 'Sensores',
    icon: 'sensors',
    blocks: [
      { type: 'detectObstacle', label: 'Detectar obstáculo', icon: 'block' },
      { type: 'detectEnemy', label: 'Detectar inimigo', icon: 'dangerous' }
    ]
  },
  {
    id: 'combate',
    label: 'Combate',
    icon: 'swords',
    blocks: [
      { type: 'attack', label: 'Atacar', icon: 'swords' }
    ]
  },
  {
    id: 'variavel',
    label: 'Variáveis',
    icon: 'data_object',
    blocks: [
      { type: 'pickup', label: 'Pegar', icon: 'back_hand' },
      { type: 'drop', label: 'Soltar', icon: 'do_not_disturb_on' },
      { type: 'activate', label: 'Ativar', icon: 'power_settings_new' }
    ]
  }
];

const CATEGORY_COLORS = {
  movimento: 'var(--primary-container)',
  controle: 'var(--secondary-container)',
  sensor: 'var(--tertiary-container)',
  combate: 'var(--error)',
  variavel: 'var(--secondary)'
};

export class BlockPalette {
  constructor(containerEl) {
    this.container = containerEl;
    this.activeCategory = null;
    this._render();
    this._setupDrag();
  }

  _render() {
    this.container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'sb-palette-header';
    header.innerHTML = '<h2>Blocos</h2>';
    this.container.appendChild(header);

    const tabs = document.createElement('div');
    tabs.className = 'sb-category-tabs';

    for (const cat of CATEGORIES) {
      const tab = document.createElement('button');
      tab.className = 'sb-cat-tab';
      tab.dataset.cat = cat.id;
      tab.innerHTML = `
        <span class="material-symbols-outlined" style="color:${CATEGORY_COLORS[cat.id] || 'var(--on-surface)'}">${cat.icon}</span>
        <span>${cat.label}</span>
      `;
      tab.addEventListener('click', () => this._selectCategory(cat.id));
      tabs.appendChild(tab);
    }

    this.container.appendChild(tabs);

    const content = document.createElement('div');
    content.className = 'sb-palette-content';
    this.container.appendChild(content);

    this._content = content;
    this._selectCategory(CATEGORIES[0].id);
  }

  _selectCategory(catId) {
    this.activeCategory = catId;

    this.container.querySelectorAll('.sb-cat-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.cat === catId);
    });

    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return;

    this._content.innerHTML = '';

    for (const blockDef of cat.blocks) {
      const el = document.createElement('div');
      el.className = `sb-palette-block sb-cat-${catId}`;
      el.draggable = true;
      el.dataset.type = blockDef.type;
      el.dataset.label = blockDef.label;
      el.dataset.icon = blockDef.icon;
      el.dataset.category = catId;
      el.dataset.params = JSON.stringify(blockDef.params || {});

      const color = CATEGORY_COLORS[catId] || 'var(--on-surface-variant)';
      el.innerHTML = `
        <span class="material-symbols-outlined" style="color:${color}">${blockDef.icon}</span>
        <span>${blockDef.label}</span>
      `;

      this._content.appendChild(el);
    }
  }

  _setupDrag() {
    this._content.addEventListener('dragstart', (e) => {
      const block = e.target.closest('.sb-palette-block');
      if (!block) return;

      e.dataTransfer.setData('application/json', JSON.stringify({
        type: block.dataset.type,
        label: block.dataset.label,
        icon: block.dataset.icon,
        category: block.dataset.category,
        params: JSON.parse(block.dataset.params || '{}')
      }));
      e.dataTransfer.effectAllowed = 'copy';
    });
  }

  filterByUnlocked(unlockedCommands) {
    this._content.querySelectorAll('.sb-palette-block').forEach(el => {
      const type = el.dataset.type;
      el.style.display = !type || unlockedCommands.includes(type) ? '' : 'none';
    });
  }
}
