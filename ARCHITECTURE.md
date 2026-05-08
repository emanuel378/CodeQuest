# Arquitetura

## Visão Geral

CodeQuest é um RPG de lógica baseado em blocos onde o jogador programa ações de um herói para superar desafios.

## Stack Tecnológica

- HTML5 (semântico, acessível)
- CSS3 (variáveis CSS, glassmorphism, grid/flexbox)
- JS ES6+ (vanilla, Classes, async/await, módulos type="module")
- ZERO frameworks runtime (sem React, Vue, jQuery, etc.)
- ZERO bibliotecas runtime
- Drag & Drop nativo HTML5 (sem bibliotecas de D&D)

## Mapa de Módulos

```text
CODEQUEST/
├── index.html                 # Templates SPA (#page-game, #page-landing, #page-ranking) + div#root
├── styles/
│   ├── main.css               # Orquestrador de imports
│   ├── design-system.css      # Tokens: cores, tipografia, glassmorfismo, espaçamento
│   ├── blockly.css            # Layout workspace (sb-layout), blocos (sb-block), paleta (sb-palette)
│   ├── stage.css              # Grid RPG, simulação, obstáculos, controles, log de erros
│   ├── pages.css              # Animações de transição de página, estilos do ranking
│   └── landing.css            # Landing page (hero, navegação, CTA)
├── js/
│   ├── engine/
│   │   ├── validator.js       # Validação de comandos (tipos, profundidade, limites)
│   │   └── runner.js          # Executor assíncrono com if/repeat/while
│   ├── ui/
│   │   ├── router.js          # HashRouter SPA — ciclo de vida mount/unmount
│   │   ├── routes.js          # Mapeamento de rotas → PageComponents
│   │   ├── pages/
│   │   │   ├── pageComponent.js   # Classe base com animações de transição
│   │   │   ├── landingPage.js     # Página inicial
│   │   │   ├── gamePage.js        # Tela do jogo (workspace + simulação)
│   │   │   └── rankingPage.js     # Pódio e lista de pontuações
│   │   ├── blockWorkspace.js  # Gerenciamento de blocos, snap, drag DOM nativo
│   │   ├── blockPalette.js    # Paleta de blocos por categoria com drag
│   │   └── gameErrorHandler.js # Validação de elementos essenciais + erro fatal
│   ├── actors/
│   │   └── player.js          # Estado do herói no grid (pos, dir, animação)
│   ├── stage/
│   │   └── stage.js           # Grid, obstáculos, colisão, objetivos da fase
│   ├── game/
│   │   ├── levels.js          # Definição das fases (mapa, objetivos, blocos liberados)
│   │   └── progression.js     # Desbloqueio de comandos, pontuação, ranking local
│   └── app.js                 # Init, escuta game:ready + ROUTE_CHANGE
├── assets/
│   └── sounds/                # Efeitos (snap, erro, vitória, desbloqueio)
├── opencode.json              # Config do projeto para opencode CLI
├── AGENTS.md
├── DESIGN.md
├── ARCHITECTURE.md
└── README.md
```

## Fluxo de Dados

```text
[Hash Router] → Rota / → LandingPage
              → Rota /game → GamePage → dispatches game:ready
                                        → app.js initGame()
                                          → BlockWorkspace + BlockPalette + Stage + Player
                                            → [Command Tree] → validator.js → runner.js
                                              → [Player/Stage state] → updateSimView()
```

## Invariantes Arquiteturais

- Arquivos em `engine/` NUNCA acessam DOM
- Arquivos em `ui/` NUNCA contêm lógica de jogo (condições de vitória/derrota, colisão, estado do herói)
- `app.js` é o único arquivo que pode importar engine e UI; apenas coordena execução, não adiciona lógica a nenhuma das camadas

## Mapa de Arquivos

| Arquivo | Função | Sem DOM? |
| --- | --- | --- |
| `engine/validator.js` | Validação de comandos (tipos, profundidade, limites) | Sim |
| `engine/runner.js` | Executa array de comandos com async/await | Sim |
| `actors/player.js` | Estado do herói (posição, direção, animação) | Sim |
| `stage/stage.js` | Grid, obstáculos, colisão, objetivos, vitória/derrota | Sim |
| `game/levels.js` | Config de fases (mapa, objetivos, blocos liberados) | Sim |
| `game/progression.js` | Sistema de desbloqueio, pontuação, ranking local | Sim |
| `ui/router.js` | HashRouter SPA — mount/unmount de páginas | Não (DOM) |
| `ui/routes.js` | Mapeamento path → PageComponent | Sim |
| `ui/pages/pageComponent.js` | Classe base com animações de transição | Não (DOM) |
| `ui/pages/landingPage.js` | Página inicial (hero, navegação) | Não (DOM) |
| `ui/pages/gamePage.js` | Tela do jogo (workspace + simulação) | Não (DOM) |
| `ui/pages/rankingPage.js` | Pódio e lista de pontuações | Não (DOM) |
| `ui/blockWorkspace.js` | Gerenciamento de blocos, snap, drag DOM nativo | Não (DOM) |
| `ui/blockPalette.js` | Paleta de blocos por categoria com drag | Não (DOM) |
| `ui/gameErrorHandler.js` | Validação de elementos + erro fatal | Não (DOM) |
| `app.js` | Init, escuta game:ready + ROUTE_CHANGE | Não (DOM) |

## Preocupações Transversais (Cross-Cutting)

- Game loop: app.js orquestra engine + UI
- Persistência: localStorage via progression.js
- NUNCA adicionar comentários desnecessários em código
- Must usar ES6+ Classes para todos os componentes com estado
- Event delegation para interações com múltiplos blocos
