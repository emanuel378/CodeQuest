# ENEMIES.md

## Catálogo de Inimigos

### Direções

| Valor | Direção |
| --- | --- |
| 0 | Cima |
| 1 | Direita |
| 2 | Baixo |
| 3 | Esquerda |

### Tipos de Inimigo

#### LaserBot (type 0)

| Atributo | Valor |
| --- | --- |
| HP | Configurável (1-3) |
| Comportamento | Atira laser a cada 2 ticks na direção que está virado |
| Ataque | **Laser** — raystack em linha reta até encontrar obstáculo ou borda do grid; todas as células no caminho são atingidas |
| Dano | 1 |
| Movimento | Estático (não se move) |
| Sprite | `assets/sprites/enemies/laser.png` |

#### Turret (type 1)

| Atributo | Valor |
| --- | --- |
| HP | 1 |
| Comportamento | Rotaciona 90° no sentido horário a cada tick, depois ataca a célula à frente |
| Ataque | **Melee** — atinge apenas a célula imediatamente à frente |
| Dano | 1 |
| Movimento | Estático |
| Rotação visual | Usa sprites direcionais: `turret_costas.png`, `turret_direita.png`, `turret_frente.png`, `turret_esquerda.png` |

#### Patrol (type 2)

| Atributo | Valor |
| --- | --- |
| HP | Configurável (1-2) |
| Comportamento | Move-se em direção ao jogador usando distância Manhattan; prioriza o eixo com maior diferença |
| Ataque | **Melee** — quando adjacente ao jogador (distância 1), ataca em vez de se mover |
| Dano | 1 |
| Movimento | **Ativo** — caminha pelo grid, evitando obstáculos e outros inimigos |
| Sprite | `assets/sprites/enemies/patrol.png` |

### Comportamento de Tick

A cada comando executado pelo jogador, `stage.tickEnemies()` é chamado. Cada inimigo vivo executa seu comportamento:

1. **LaserBot**: a cada 2 ticks, dispara laser
2. **Turret**: rotaciona e ataca (todo tick)
3. **Patrol**: move-se ou ataca (todo tick)

### Efeitos Visuais

- **Laser**: células atingidas recebem overlay `laser-cell` por 400ms
- **Melee**: célula atingida recebe overlay `melee-cell` por 350ms
- **Dano no jogador**: robô recebe classe `player-damaged` por 400ms
- **Morte de inimigo**: entidade recebe classe `enemy-dying` por 400ms antes de remover
- **Ataque**: inimigo recebe classe `enemy-attacking` por 350ms

### Implementação

- Classe: `js/actors/enemy.js` (`Enemy`)
- Tick: `stage.tickEnemies()` em `js/stage/stage.js`
- Efeitos visuais: `app.js` (`tickEnemiesAndSync`, `flashLaserCells`, `flashMeleeCell`, `syncSimEntities`)
