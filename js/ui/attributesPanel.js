import { AttributeSystem } from '../game/attributes.js';

export class AttributesPanel {
  constructor(containerEl) {
    this._el = containerEl
    this._progression = null
    this._tooltipEl = null
    this._boundListeners = []
    this._render()
  }

  setProgression(progression) {
    this._progression = progression
    this._update()
  }

  setLastRank(rankLabel) {
    const rankEl = this._el.querySelector('.attr-rank-badge')
    if (rankEl) {
      const cfg = AttributeSystem.getRankConfig(rankLabel)
      rankEl.textContent = cfg.label
      rankEl.style.color = cfg.color
      rankEl.style.borderColor = cfg.color
      rankEl.style.display = 'inline-flex'
      rankEl.className = `attr-rank-badge rank-${cfg.label}`
    }
  }

  refresh() {
    this._update()
  }

  _render() {
    this._el.classList.add('sim-attributes')
    this._el.innerHTML = `
      <div class="sim-attributes-header">
        <span class="sim-attributes-title">Atributos do Personagem</span>
        <span class="attr-points-display" id="attr-points-display">
          <span class="material-symbols-outlined attr-points-icon">add_circle</span>
          <span class="attr-points-count">0</span>
        </span>
      </div>
      <div class="sim-attributes-hero">
        <div class="sim-attributes-hero-avatar">
          <img src="assets/sprites/player/principal_frente.png" alt="Herói" class="sim-attributes-hero-img" />
        </div>
      </div>
      <div class="player-level-section">
        <div class="player-level-header">
          <span class="player-level-label">Nível do Personagem</span>
          <span class="player-level-badge">
            <span class="material-symbols-outlined player-level-badge-icon">bolt</span>
            Lv.<span class="player-level-num">1</span>
          </span>
        </div>
        <div class="player-level-xp-row">
          <div class="player-level-xp-bar">
            <div class="player-level-xp-fill"></div>
          </div>
          <span class="player-level-xp-text">0/0 XP</span>
        </div>
      </div>
      <div class="sim-attributes-grid" id="attr-grid">
        ${this._renderAttr('nucleoLogico')}
        ${this._renderAttr('eficienciaAlgoritmo')}
      </div>
    `

    const tooltip = document.createElement('div')
    tooltip.className = 'attr-tooltip'
    tooltip.style.display = 'none'
    document.body.appendChild(tooltip)
    this._tooltipEl = tooltip
  }

  _renderAttr(attrId) {
    const def = AttributeSystem.getDef(attrId)
    if (!def) return ''

    return `
      <div class="sim-attr-item" data-attr="${attrId}">
        <div class="sim-attr-header">
          <div class="sim-attr-name-group">
            <span class="material-symbols-outlined sim-attr-icon" style="color:${def.color}">${def.icon}</span>
            <span class="sim-attr-label">${def.name}</span>
            <span class="sim-attr-info-btn" data-attr="${attrId}" title="O que é isso?">
              <span class="material-symbols-outlined">info</span>
            </span>
          </div>
          <span class="sim-attr-level-badge" style="color:${def.color}; border-color:${def.color}">
            <span class="material-symbols-outlined sim-attr-level-icon">bolt</span>
            Lv.<span class="attr-level-num">1</span>
          </span>
        </div>
        <div class="sim-attr-footer">
          <span class="sim-attr-detail"></span>
          <button class="sim-attr-plus-btn" data-attr="${attrId}" title="Gastar 1 ponto para evoluir">
            <span class="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
    `
  }

  _update() {
    if (!this._progression) return

    this._updatePlayerLevel()

    const grid = this._el.querySelector('#attr-grid')
    if (!grid) return

    const attrs = ['nucleoLogico', 'eficienciaAlgoritmo']
    for (const attrId of attrs) {
      const item = grid.querySelector(`[data-attr="${attrId}"]`)
      if (!item) continue

      const def = AttributeSystem.getDef(attrId)
      const data = this._progression.getAttribute(attrId)

      item.querySelector('.attr-level-num').textContent = data.level

      const detail = item.querySelector('.sim-attr-detail')
      if (attrId === 'nucleoLogico') {
        const allowed = this._progression.getAttemptsAllowed()
        const remaining = this._progression.getRemainingAttempts()
        detail.textContent = `Tentativas: ${remaining}/${allowed}`
      } else if (attrId === 'eficienciaAlgoritmo') {
        const mult = AttributeSystem.getXpMultiplier(data.level)
        detail.textContent = `Bônus: ×${mult.toFixed(1)} XP`
      }
    }

    const ptsEl = this._el.querySelector('.attr-points-count')
    if (ptsEl) ptsEl.textContent = this._progression.getAttributePoints()

    const pts = this._progression.getAttributePoints()
    for (const attrId of attrs) {
      const item = grid.querySelector(`[data-attr="${attrId}"]`)
      if (!item) continue
      const plusBtn = item.querySelector('.sim-attr-plus-btn')
      if (!plusBtn) continue
      const data = this._progression.getAttribute(attrId)
      const def = AttributeSystem.getDef(attrId)
      plusBtn.classList.toggle('visible', pts > 0 && data.level < def.maxLevel)
    }
  }

  _updatePlayerLevel() {
    const level = this._progression.getPlayerLevel()
    const xp = this._progression.getPlayerXP()
    const progress = AttributeSystem.getPlayerXpProgress(xp)
    const maxLevel = AttributeSystem.getPlayerMaxLevel()

    const numEl = this._el.querySelector('.player-level-num')
    if (numEl) numEl.textContent = level

    const fill = this._el.querySelector('.player-level-xp-fill')
    if (fill) {
      const pct = Math.min(progress.progress * 100, 100)
      fill.style.width = `${pct}%`
    }

    const xpText = this._el.querySelector('.player-level-xp-text')
    if (xpText) {
      if (level >= maxLevel) {
        xpText.textContent = 'MÁXIMO'
        if (fill) fill.style.width = '100%'
      } else {
        xpText.textContent = `${progress.current}/${progress.needed} XP`
      }
    }
  }

  _spendPoint(attrId) {
    if (!this._progression) return
    const prevLevel = this._progression.getAttribute(attrId).level
    const success = this._progression.spendAttributePoint(attrId)
    if (success) {
      this._update()
    }
  }

  _playPlayerLevelUp(newLevel) {
    this._update()
    const section = this._el.querySelector('.player-level-section')
    if (!section) return

    section.classList.add('player-levelup')

    const burst = document.createElement('div')
    burst.className='attr-levelup-burst'
    burst.innerHTML=`<span class="attr-levelup-text">LEVEL UP!<br>Lv.${newLevel}</span>`
    section.appendChild(burst)

    setTimeout(() => {
      burst.remove()
      section.classList.remove('player-levelup')
    }, 1600)

    try {
      const audio = new Audio('assets/sounds/SFX/Vitória/vitoria.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch {}
  }

  _showTooltip(attrId, btnEl) {
    const def = AttributeSystem.getDef(attrId)
    if (!def) return

    const data = this._progression ? this._progression.getAttribute(attrId) : { level: 1 }
    const allowed = AttributeSystem.getAttemptsAllowed(data.level)
    const mult = AttributeSystem.getXpMultiplier(data.level)

    let bonusInfo = ''
    if (attrId === 'nucleoLogico') {
      bonusInfo = `Nível ${data.level} = ${allowed} tentativas por fase`
    } else {
      bonusInfo = `Nível ${data.level} = ×${mult.toFixed(1)} XP`
    }

    const tip = this._tooltipEl
    tip.innerHTML = `
      <div class="attr-tooltip-header">
        <span class="material-symbols-outlined" style="color:${def.color}">${def.icon}</span>
        <strong>${def.name}</strong>
      </div>
      <div class="attr-tooltip-body">${def.description}</div>
      <div class="attr-tooltip-footer">
        <span class="material-symbols-outlined attr-tooltip-tip">lightbulb</span>
        ${bonusInfo}
      </div>
    `
    tip.style.display = 'block'

    const rect = btnEl.getBoundingClientRect()
    tip.style.left = `${rect.left + rect.width / 2}px`
    tip.style.top = `${rect.bottom + 4}px`
  }

  _hideTooltip() {
    if (this._tooltipEl) {
      this._tooltipEl.style.display = 'none'
    }
  }

  setupEvents() {
    const grid = this._el.querySelector('#attr-grid')
    if (!grid) return

    const infoHandler = (e) => {
      const btn = e.target.closest('.sim-attr-info-btn')
      if (btn) {
        const attrId = btn.dataset.attr
        this._showTooltip(attrId, btn)
      }
    }

    const hideHandler = () => this._hideTooltip()

    grid.addEventListener('mouseover', infoHandler)
    grid.addEventListener('mouseout', hideHandler)

    const plusHandler = (e) => {
      const btn = e.target.closest('.sim-attr-plus-btn')
      if (btn) {
        const attrId = btn.dataset.attr
        this._spendPoint(attrId)
      }
    }

    grid.addEventListener('click', plusHandler)

    this._boundListeners.push(
      { el: grid, type: 'mouseover', handler: infoHandler },
      { el: grid, type: 'mouseout', handler: hideHandler },
      { el: grid, type: 'click', handler: plusHandler }
    )
  }

  destroy() {
    for (const { el, type, handler } of this._boundListeners) {
      el.removeEventListener(type, handler)
    }
    this._boundListeners = []
    if (this._tooltipEl) {
      this._tooltipEl.remove()
      this._tooltipEl = null
    }
    this._el.innerHTML = ''
    this._progression = null
  }
}
