const ATTRIBUTE_DEFS = {
  nucleoLogico: {
    id: 'nucleoLogico',
    name: 'Núcleo Lógico',
    icon: 'memory',
    description: 'Controla quantas tentativas você tem por fase. Cada erro consome uma tentativa. Se zerar, você volta à fase anterior.',
    color: 'var(--primary-container)',
    maxLevel: 4,
    attemptsPerLevel: [5, 7, 9, 12]
  },
  eficienciaAlgoritmo: {
    id: 'eficienciaAlgoritmo',
    name: 'Eficiência de Algoritmo',
    icon: 'speed',
    description: 'Avalia quantos blocos você usou comparado ao ideal da fase. Menos blocos = rank maior = mais XP!',
    color: 'var(--tertiary-container)',
    maxLevel: 5,
    xpMultiplierPerLevel: [1.0, 1.1, 1.2, 1.3, 1.5]
  }
}

const RANK_CONFIG = {
  S: { minRatio: 0.8, xpMultiplier: 2.0, attrXP: 40, label: 'S', color: 'var(--color-gold)' },
  A: { minRatio: 0.55, xpMultiplier: 1.5, attrXP: 25, label: 'A', color: 'var(--primary-container)' },
  B: { minRatio: 0.3, xpMultiplier: 1.0, attrXP: 10, label: 'B', color: 'var(--secondary)' },
  C: { minRatio: 0, xpMultiplier: 0.5, attrXP: 0, label: 'C', color: 'var(--error)' }
}

const PLAYER_XP_THRESHOLDS = [0, 200, 500, 900, 1400, 2000, 2700, 3500]
const PLAYER_MAX_LEVEL = 8

export class AttributeSystem {
  static getDef(attrId) {
    return ATTRIBUTE_DEFS[attrId] || null
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

  static getDefs() {
    return ATTRIBUTE_DEFS
  }

  static getPlayerLevelFromXp(xp) {
    let level = 1
    for (let i = 1; i < PLAYER_XP_THRESHOLDS.length; i++) {
      if (xp >= PLAYER_XP_THRESHOLDS[i]) level = i + 1
      else break
    }
    return level
  }

  static getPlayerXpProgress(xp) {
    const level = this.getPlayerLevelFromXp(xp)
    if (level >= PLAYER_MAX_LEVEL) {
      return { current: PLAYER_XP_THRESHOLDS[PLAYER_MAX_LEVEL - 1], needed: PLAYER_XP_THRESHOLDS[PLAYER_MAX_LEVEL - 1], progress: 1 }
    }
    const currentThreshold = PLAYER_XP_THRESHOLDS[level - 1]
    const nextThreshold = PLAYER_XP_THRESHOLDS[level]
    const current = xp - currentThreshold
    const needed = nextThreshold - currentThreshold
    return { current, needed, progress: needed > 0 ? current / needed : 1 }
  }

  static getPlayerMaxLevel() {
    return PLAYER_MAX_LEVEL
  }

  static getPlayerXpThresholds() {
    return PLAYER_XP_THRESHOLDS
  }

  static createDefaultAttributes() {
    return {
      nucleoLogico: { level: 1 },
      eficienciaAlgoritmo: { level: 1 }
    }
  }
}
