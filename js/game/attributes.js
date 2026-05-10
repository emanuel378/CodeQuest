const ATTRIBUTE_DEFS = {
  nucleoLogico: {
    id: 'nucleoLogico',
    name: 'Núcleo Lógico',
    icon: 'memory',
    description: 'Controla quantas tentativas você tem por fase. Cada erro consome uma tentativa. Se zerar, você volta à fase anterior.',
    color: 'var(--primary-container)',
    xpThresholds: [0, 60, 150, 300, 500],
    maxLevel: 5,
    attemptsPerLevel: [5, 6, 7, 8, 10]
  },
  eficienciaAlgoritmo: {
    id: 'eficienciaAlgoritmo',
    name: 'Eficiência de Algoritmo',
    icon: 'speed',
    description: 'Avalia quantos blocos você usou comparado ao ideal da fase. Menos blocos = rank maior = mais XP!',
    color: 'var(--tertiary-container)',
    xpThresholds: [0, 60, 150, 300, 500],
    maxLevel: 5,
    xpMultiplierPerLevel: [1.0, 1.1, 1.2, 1.3, 1.5]
  }
}

const RANK_CONFIG = {
  S: { minRatio: 0.9, xpMultiplier: 2.0, attrXP: 40, label: 'S', color: 'var(--color-gold)' },
  A: { minRatio: 0.65, xpMultiplier: 1.5, attrXP: 25, label: 'A', color: 'var(--primary-container)' },
  B: { minRatio: 0.4, xpMultiplier: 1.0, attrXP: 10, label: 'B', color: 'var(--secondary)' },
  C: { minRatio: 0, xpMultiplier: 0.5, attrXP: 0, label: 'C', color: 'var(--error)' }
}

const ATTRIBUTE_POINT_XP = 30

export class AttributeSystem {
  static getDef(attrId) {
    return ATTRIBUTE_DEFS[attrId] || null
  }

  static getXpForLevel(attrId, level) {
    const def = ATTRIBUTE_DEFS[attrId]
    if (!def) return Infinity
    const idx = Math.min(level - 1, def.xpThresholds.length - 1)
    return def.xpThresholds[idx]
  }

  static getLevelFromXp(attrId, xp) {
    const def = ATTRIBUTE_DEFS[attrId]
    if (!def) return 1
    let level = 1
    for (let i = 1; i < def.xpThresholds.length; i++) {
      if (xp >= def.xpThresholds[i]) level = i + 1
      else break
    }
    return level
  }

  static getXpProgress(attrId, xp) {
    const def = ATTRIBUTE_DEFS[attrId]
    if (!def) return { current: 0, needed: 1, progress: 0 }
    const level = this.getLevelFromXp(attrId, xp)
    if (level >= def.maxLevel) {
      return { current: def.xpThresholds[def.maxLevel - 1], needed: def.xpThresholds[def.maxLevel - 1], progress: 1 }
    }
    const currentThreshold = def.xpThresholds[level - 1]
    const nextThreshold = def.xpThresholds[level]
    const current = xp - currentThreshold
    const needed = nextThreshold - currentThreshold
    return { current, needed, progress: needed > 0 ? current / needed : 1 }
  }

  static getAttemptsAllowed(level) {
    const def = ATTRIBUTE_DEFS.nucleoLogico
    const idx = Math.min(level - 1, def.attemptsPerLevel.length - 1)
    return def.attemptsPerLevel[idx]
  }

  static getXpMultiplier(level) {
    const def = ATTRIBUTE_DEFS.eficienciaAlgoritmo
    const idx = Math.min(level - 1, def.xpMultiplierPerLevel.length - 1)
    return def.xpMultiplierPerLevel[idx]
  }

  static calculateRank(blocksUsed, idealBlocks) {
    if (!idealBlocks || idealBlocks <= 0) return RANK_CONFIG.C
    const ratio = idealBlocks / Math.max(blocksUsed, 1)
    for (const rank of ['S', 'A', 'B']) {
      if (ratio >= RANK_CONFIG[rank].minRatio) return RANK_CONFIG[rank]
    }
    return RANK_CONFIG.C
  }

  static calculateEfficiencyXP(blocksUsed, idealBlocks) {
    const rank = this.calculateRank(blocksUsed, idealBlocks)
    return rank.attrXP
  }

  static getRankConfig(rankLabel) {
    return RANK_CONFIG[rankLabel] || RANK_CONFIG.C
  }

  static getPointValue() {
    return ATTRIBUTE_POINT_XP
  }

  static getDefs() {
    return ATTRIBUTE_DEFS
  }

  static createDefaultAttributes() {
    return {
      nucleoLogico: { xp: 0, level: 1 },
      eficienciaAlgoritmo: { xp: 0, level: 1 }
    }
  }
}
