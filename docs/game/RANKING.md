# RANKING.md

## Sistema de Ranking

### Rankings por Fase

Ao concluir uma fase, o jogador é classificado com base na proporção entre blocos usados e blocos ideais da fase:

`ratio = idealBlocks / max(blocksUsed, 1)`

| Rank | Proporção Mínima | Multiplicador XP | XP de Atributo | Estrelas |
| --- | --- | --- | --- | --- |
| S | ≥90% | ×2.0 | 40 | 3 |
| A | ≥65% | ×1.5 | 25 | 2 |
| B | ≥40% | ×1.0 | 10 | 1 |
| C | <40% | ×0.5 | 0 | 1 |

### Cálculo de XP

```
baseXP = max(100, (levelId + 1) * 30 + complexity * 30)
finalScore = baseXP * rankMultiplier * eficienciaMultiplier
```

Onde:
- `levelId`: ID do nível (0-9)
- `complexity`: valor definido no nível (1-8)
- `rankMultiplier`: 2.0 (S), 1.5 (A), 1.0 (B), 0.5 (C)
- `eficienciaMultiplier`: bônus do atributo Eficiência de Algoritmo (1.0x a 1.5x)

### Ranking Global

- Persistido em `localStorage` com chave `codequest_ranking`
- Ordenado por score decrescente
- Cada entrada contém: `playerName`, `playerId`, `score`, `level`, `time`
- Exibido na página de ranking (`/ranking`) em formato de pódio (top 3) + lista

### Estrelas na Fase

O número de estrelas exibidas no HUD reflete a **dificuldade** da fase, definida pelo campo `difficulty` no level config (`js/game/levels.js`):
- ★ = 1 estrela (fácil)
- ★★ = 2 estrelas (médio)
- ★★★ = 3 estrelas (difícil)

Isso é independente do ranking de desempenho (S/A/B/C) — as estrelas no header são um indicador visual de dificuldade, não de performance.

### Implementação

- Cálculo: `js/game/attributes.js` (`AttributeSystem.calculateRank`)
- Persistência: `js/game/progression.js` (`completeLevel`, `_loadGlobalRanking`, `_saveGlobalRanking`)
- Modal de vitória: `app.js` (`showVictoryModal`)

### Formato localStorage

```javascript
// codequest_ranking
[
  { "playerName": "Jogador 1", "playerId": "abc123", "score": 1500, "level": 3, "time": "2026-05-06T10:30:00Z" }
]
```
