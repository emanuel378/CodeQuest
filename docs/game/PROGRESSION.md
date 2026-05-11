# PROGRESSION.md

## Progressão de Níveis

### Tabela de Níveis

| Nível | Nome | Tema | Blocos Desbloqueados | Inimigos | Objetivos | Blocos Ideais | Complexidade | Dificuldade | Obstáculos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Tutorial | `ocean` | move, turnRight, turnLeft, jump, attack, custom_var | — | reach_goal, survive | 6 | 1 | ★ | — |
| 1 | Cidade da Lógica | `ocean` | if, else | 1 Turret (1HP) | defeat_enemies, survive | 8 | 2 | ★★ | — |
| 2 | Nível 2 | `ocean` | repeat, while | — | reach_goal, survive | 6 | 1 | ★ | — |
| 3 | Nível 3 | `ocean` | — | — | reach_goal, survive | 6 | 1 | ★ | — |
| 4 | Floresta dos Algoritmos | `forest` | — | 1 LaserBot (1HP) | defeat_enemies, survive | 10 | 4 | ★★ | 3 (1 rock, 2 trees) |
| 5 | Nível 5 | `forest` | — | — | reach_goal, survive | 6 | 1 | ★ | — |
| 6 | Nível 6 | `forest` | — | — | reach_goal, survive | 6 | 1 | ★ | — |
| 7 | Núcleo de Logicron | `void` | — | 1 LaserBot (3HP) + 1 Patrol (2HP) | reach_goal, defeat_enemies, survive | 18 | 8 | ★★★ | 3 (rock, tree, rock) |
| 8 | Nível 8 | `void` | — | — | reach_goal, survive | 6 | 1 | ★ | — |
| 9 | Nível 9 | `void` | — | — | reach_goal, survive | 6 | 1 | ★ | — |

### Desbloqueio de Comandos

O sistema de desbloqueio (`js/game/progression.js`) usa `LEVEL_UNLOCKS` baseado no nível concluído:

```javascript
LEVEL_UNLOCKS = {
  0: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'if', 'else', 'repeat', 'while'],
  1: [],
  2: [],
  3: []
}
```

Na prática, todos os comandos são desbloqueados desde o início. O `if/else` fica disponível no nível 1 e `repeat/while` no nível 2 conforme a tabela acima (controlado pela paleta filtrar por comandos desbloqueados).

### Sistema de Tentativas

- Cada jogador tem um número de tentativas por fase baseado no nível do **Núcleo Lógico**
- Tentativas são **consumidas** quando:
  - Validação de comandos falha (erro de sintaxe/profundidade)
  - Execução termina sem vitória
  - Erro inesperado durante execução
- Tentativas **não** são consumidas quando:
  - Jogador clica em LIMPAR
  - Execução é interrompida manualmente
- Quando as tentativas **zeram**: modal "Núcleo Lógico Esgotado" → fase marcada como `failedLevel` → jogador redirecionado à **última fase concluída**
- Tentativas são **resetadas** ao:
  - Concluir uma fase com sucesso
  - Carregar um nível

### Level Stats

Para cada fase concluída, o progresso salva:

```javascript
levelStats: {
  "0": { stars: 3, bestScore: 1200, bestBlocks: 4, bestTime: 15, blocksUsed: 4, idealBlocks: 6 },
  "1": { stars: 2, bestScore: 800, bestBlocks: 6, bestTime: 20, blocksUsed: 6, idealBlocks: 8 }
}
```

### Implementação

- Definição de níveis: `js/game/levels.js`
- Progressão: `js/game/progression.js`
- Atributos e cálculos: `js/game/attributes.js`
