# GAME.md (Índice)

> Este arquivo é o índice principal da documentação do jogo. Cada sistema tem seu próprio arquivo em `docs/game/`.

## Sistemas do Jogo

| Sistema | Arquivo | Descrição |
| --- | --- | --- |
| Blocos (Catálogo, Paleta, Workspace) | `docs/game/BLOCKS.md` | Todos os blocos, categorias, drag-and-drop, snapping, zoom, persistência |
| Atributos | `docs/game/ATTRIBUTES.md` | Núcleo Lógico, Eficiência de Algoritmo, nível do personagem |
| Ranking | `docs/game/RANKING.md` | S/A/B/C, cálculo de XP, estrelas, ranking global |
| Inimigos | `docs/game/ENEMIES.md` | LaserBot, Turret, Patrol — comportamentos e atributos |
| Execução | `docs/game/EXECUTION.md` | Runner assíncrono, validação de comandos, limites de segurança |
| Progressão | `docs/game/PROGRESSION.md` | 10 níveis, tentativas, desbloqueio, level stats |
| Perfis | `docs/game/PROFILES.md` | PlayerManager, múltiplos perfis, localStorage |
| Áudio | `docs/game/AUDIO.md` | Músicas por tema, SFX, mute |
| Objetivos | `docs/game/OBJECTIVES.md` | 4 tipos de objetivo, regras de tracking |

## Regras para Agentes

- Sempre seguir o formato exato das tabelas nos documentos referenciados
- Usar números para níveis (0, 1, 2, 3...)
- Categorias de blocos: *Movimento*, *Controle*, *Combate*, *Variáveis*
- Obstáculos devem ser tipos específicos, nunca apenas "Contém"/"Não contém"
- Todo nível **deve** ter um array `objectives` com no mínimo `survive` + o objetivo principal
- IDs de objetivos: `reach_goal`, `defeat_enemies`, `collect_item`, `survive`
- Ao adicionar novo sistema, criar arquivo em `docs/game/` e adicionar referência na tabela acima

## Exemplo de Expansão

### Adicionar nova categoria de blocos

1. Adicionar categoria e blocos em `js/ui/blockPalette.js`
2. Adicionar cores em `CAT_COLORS` em `js/ui/blockWorkspace.js`
3. Atualizar `docs/game/BLOCKS.md` com os novos blocos na tabela
4. Garantir que `engine/validator.js` inclua os novos tipos em `VALID_COMMANDS`

### Adicionar novo nível

1. Adicionar objeto em `LEVELS` em `js/game/levels.js`
2. Atualizar `docs/game/PROGRESSION.md` com a nova linha na tabela
3. Se tiver inimigos inéditos, verificar `docs/game/ENEMIES.md`
4. Garantir `objectives` array com IDs válidos

### Adicionar novo tipo de inimigo

1. Adicionar case no switch de `enemy.tick()` em `js/actors/enemy.js`
2. Adicionar sprite handling em `renderSimGrid()` em `app.js`
3. Atualizar `docs/game/ENEMIES.md` com tabela de atributos e comportamento
