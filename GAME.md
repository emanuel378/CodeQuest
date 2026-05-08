# GAME.md

## Catálogo de Blocos

| Bloco | Categoria (Cor no DESIGN.md) | Desbloqueado no Nível | Descrição |
| --- | --- | --- | --- |
| Mover Frente | *Movimento* (Blue) | 0 (Inicial) | Move o jogador para frente |
| Girar Direita | *Movimento* (Blue) | 0 (Inicial) | Gira a rotação do jogador para a direita |
| Girar Esquerda | *Movimento* (Blue) | 0 (Inicial) | Gira a rotação do jogador para a esquerda |
| Pular | *Movimento* (Blue) | 0 (Inicial) | Faz o jogador pular 2 quadrados do grid |
| Se (if) | *Controle* (Purple) | 1 | Cria uma condição que se cumprida, executa o bloco de código contido dentro dela |
| Senão (else) | *Controle* (Purple) | 1 | Caso a condição do bloco Se não seja cumprida, o bloco contido no Senão será executado |
| Repetir | *Controle* (Purple) | 2 | Repete o bloco contido nele por N vezes |
| Enquanto | *Controle* (Purple) | 2 | Repete o bloco contido enquanto que uma condição for verdadeira |
| Detectar obstáculo | *Sensores* (Green) | 0 (Inicial) | Detecta obstáculos pelo caminho do jogador |
| Detectar inimigo | *Sensores* (Green) | 0 (Inicial) | Detecta um inimigo a 'distância de 3' |
| Atacar | *Ações* | 0 (Inicial) | Ataca um inimigo a uma 'distância de 1' |
| Pegar | *Ações* | 0 (Inicial) | Pega um 'item' |
| Soltar | *Ações* | 0 (Inicial) | Solta um 'item' |
| Ativar | *Ações* | 0 (Inicial) | 'Ativa algo' |

### Formato para Novos Blocos

Para adicionar novos blocos, siga exatamente:

1. **Bloco**: Nome exato (ex: "Mover Frente")
2. **Categoria**: *Movimento* / *Controle* / *Sensores* / *Ações*
3. **Nível**: Número do nível (0 = Inicial, 1, 2, 3...)
4. **Descrição**: O que o bloco faz

Exemplo:
```markdown
| Novo Bloco | *Categoria* | N | Descrição do que faz |
```

Cores das categorias (definidas no DESIGN.md):
- *Movimento* → Blue (`var(--primary)`)
- *Controle* → Purple (`var(--secondary)`)
- *Sensores* → Green (`var(--tertiary)`)
- *Ações* → Sem cor específica no DESIGN.md

---

## Progressão de Níveis

| Nível | Nome da Fase | Tema Visual | Novos Blocos Desbloqueados | Objetivo | Tamanho da Grade | Obstáculos |
| --- | --- | --- | --- | --- | --- | --- |
| 0 (Inicial) | Tutorial | `ocean` | Mover Frente, Girar Direita, Girar Esquerda, Pular, Detectar obstáculo, Detectar inimigo, Atacar, Pegar, Soltar, Ativar | Aprender controles básicos | 5x5 | Nenhum |
| 1 | Cidade da Lógica | `ocean` | Se (if), Senão (else) | Mover até o inimigo e Atacar | 5x5 | Nenhum |
| 2 | Floresta dos Algoritmos | `forest` | Repetir, Enquanto | Chegar ao inimigo, tomar decisões automaticamente e atacar apenas quando necessário | 5x5 | Pedras, Árvores |
| 3 | Núcleo de Logicron | `void` | Nenhum | Chegar ao núcleo e Derrotar o boss final | 5x5 | Pedras, Árvores, Inimigos móveis |

### Tipos de Obstáculos

- **Pedras**: Bloqueiam movimento, podem ser detectadas por "Detectar obstáculo"
- **Árvores**: Bloqueiam movimento, podem ser puladas com "Pular"
- **Água**: Bloqueia movimento, dana o jogador se entrar
- **Inimigos**: Podem atacar o jogador, devem ser detectados por "Detectar inimigo"
- **Boss**: Inimigo final no Nível 3, requer múltiplos ataques

---

## Sistema de Progressão

- `levels.js` define cada nível:
  - Grid layout (ex: 5x5)
  - Posição inicial do herói (x, y, direção)
  - Objetivo (ex: "Derrotar o boss final")
  - Obstáculos (tipos e posições no grid)
  - Blocos disponíveis para aquele nível
  - `theme` — token visual que define o esquema de cores do nível (`ocean`, `forest`, `void`)

- `progression.js` gerencia:
  - Nível atual
  - Histórico de níveis concluídos
  - Quais blocos estão desbloqueados
  - Pontuação local (ranking no localStorage)
  - Eventos que disparam desbloqueio (ex: ao completar Nível 1, desbloqueia blocos de Controle)

- A cada nível concluído, `progression.js` libera novos blocos para as próximas fases
- Ranking local persiste via `localStorage` com chave `codequest_ranking`

### Formato do localStorage

```javascript
// Estrutura dos dados no localStorage
{
  "currentLevel": 2,
  "completedLevels": [0, 1],
  "unlockedBlocks": ["Mover Frente", "Girar Direita", ..., "Repetir"],
  "ranking": [
    { "score": 1500, "level": 3, "time": "2026-05-06T10:30:00Z" },
    ...
  ]
}
```

## Exemplo de Expansão

### Adicionar Nível 4

1. Adicionar linha na tabela "Progressão de Níveis":
```markdown
| 4 | Caverna dos Loops | `cave` | Para Cada (for), Enquanto (while) | Completar o labirinto usando loops | 7x7 | Pedras, Água, Inimigos |
```

2. Adicionar novos blocos na tabela "Catálogo de Blocos":
```markdown
| Para Cada (for) | *Controle* (Purple) | 4 | Itera sobre uma lista de itens |
| Enquanto (while) | *Controle* (Purple) | 4 | Executa enquanto condição for verdadeira |
```

3. Atualizar `levels.js` com configuração do grid e obstáculos
4. Atualizar `progression.js` para desbloquear blocos ao completar Nível 3

### Regras para Agentes

- Sempre seguir o formato exato das tabelas acima
- Usar números para níveis (0, 1, 2, 3...)
- Categorias devem ser: *Movimento*, *Controle*, *Sensores*, *Ações*
- Obstáculos devem ser tipos específicos, nunca apenas "Contém"/"Não contém"
