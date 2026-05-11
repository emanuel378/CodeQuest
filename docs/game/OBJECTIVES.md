# OBJECTIVES.md

## Sistema de Objetivos da Fase

Cada fase possui um painel de objetivos no canto superior direito da workspace. Os objetivos são definidos por nível e trackeados durante a execução dos comandos.

### Tipos de Objetivo

| ID | Descrição | Quando é Avaliado |
| --- | --- | --- |
| `reach_goal` | Alcançar o portal de saída do nível | Tempo real (a cada comando executado) |
| `defeat_enemies` | Derrotar todos os inimigos da fase | Tempo real (a cada comando executado) |
| `collect_item` | Coletar um item do grid | Tempo real (a cada comando executado) |
| `survive` | Manter o herói vivo até o fim | **Final da execução** — ignorado durante os ticks; só é marcado como concluído se o jogador chegar vivo ao `checkVictory` |

### Regras

- Todo nível **deve** ter um array `objectives` em sua config em `levels.js`
- Cada objetivo tem o formato `{ id, description }`
- Objetivos de tempo real (`reach_goal`, `defeat_enemies`, `collect_item`) são checados a cada `tickEnemiesAndSync()` via `stage.checkAllObjectives()`
- O objetivo `survive` retorna `false` durante toda a execução; seu estado real é definido por `stage.finalizeSurviveObjective()` chamado **antes** da checagem de vitória
- Quando o jogador falha (morre, esgota tentativas, ou clica em Limpar), todos os objetivos são resetados via `panel.reset()`

### Implementação

- **Painel**: `js/ui/objectivesPanel.js` — painel `position: absolute` dentro do workspace
- **Tracking**: `js/stage/stage.js` — método `checkAllObjectives()` avalia cada objetivo, `getCompletedObjectiveIds()` retorna os concluídos
- **Survive**: `finalizeSurviveObjective()` é chamado em `app.js` antes de `checkVictory()`

### Formato para Adicionar Objetivos a Novos Níveis

```javascript
{
  id: 10,
  objectives: [
    { id: 'reach_goal', description: 'Alcance o portal dourado' },
    { id: 'survive', description: 'Mantenha o herói vivo' }
  ]
}
```

Para níveis sem goal (apenas derrotar inimigos):

```javascript
{
  id: 11,
  goal: null,
  enemies: [...],
  objectives: [
    { id: 'defeat_enemies', description: 'Derrote todos os inimigos' },
    { id: 'survive', description: 'Mantenha o herói vivo' }
  ]
}
```
