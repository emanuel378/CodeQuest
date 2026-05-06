# AGENTS.md

## Game concept
CodeQuest é um RPG onde o jogador guia um herói por fases usando blocos de comando (Mover, Girar, Repetir, Se Sensor). Cada fase concluída desbloqueia novos blocos de comando para as fases seguintes. O objetivo é programar visualmente a sequência correta de ações para superar obstáculos e alcançar o objetivo de cada fase.

## Project overview
- `DesafioAlphaEdtech/` is the project root.
- `DESIGN.md` defines the design system — use the exact tokens, colors, typography, and component specs from there for all UI work.
- Protótipo visual no Google Stitch: https://stitch.withgoogle.com/projects/7811335591909664974

## Tech stack (ZERO frameworks)
- **HTML5** — semântico, acessível
- **CSS3** — variáveis CSS, glassmorphism, grid/flexbox
- **JS ES6+** — vanilla, Classes, async/await, módulos (type="module")
- **ZERO** frameworks runtime (sem React, Vue, jQuery, etc.)
- **ZERO** bibliotecas runtime
- **Drag & Drop nativo HTML5** — sem bibliotecas de DnD

## Folder structure
```
DesafioAlphaEdtech/
├── index.html
├── styles/
│   ├── design-system.css      # Cores, tipografia, glassmorfismo
│   ├── blocks.css             # Formatos de encaixe (notch/bump), dropzones
│   └── stage.css              # Grid RPG, ator, obstáculos, telemetry
├── js/
│   ├── engine/
│   │   ├── parser.js          # Converte blocos DOM → array de comandos
│   │   └── runner.js          # Executor assíncrono (async/await, delays)
│   ├── ui/
│   │   ├── dragDrop.js        # HTML5 Drag & Drop nativo
│   │   └── workspace.js       # Snap magnético, gerenciar pilha de blocos
│   ├── actors/
│   │   └── player.js          # Estado do herói no grid (pos, dir, animação)
│   ├── stage/
│   │   └── stage.js           # Grid, obstáculos, colisão, objetivos da fase
│   ├── game/
│   │   ├── levels.js          # Definição das fases (mapa, objetivos, blocos liberados)
│   │   └── progression.js     # Desbloqueio de comandos, pontuação, ranking local
│   └── app.js                 # Init, listeners, game loop
├── assets/
│   └── sounds/                # Efeitos (snap, erro, vitória, desbloqueio)
├── opencode.json              # Config do projeto para opencode CLI
├── AGENTS.md
├── DESIGN.md
└── README.md
```

## Architecture

### Engine vs UI separation (STRICT)
- **Engine** (`engine/`, `actors/`, `stage/`, `game/`): lógica pura, sem tocar no DOM.
- **UI** (`ui/`, `app.js`, `styles/`, `index.html`): renderização, eventos do usuário.
- Comunicação entre Engine e UI via **eventos customizados** (EventTarget/custom events).

### File responsibilities

| File | Role | DOM-free? |
|---|---|---|
| `engine/parser.js` | Lê workspace DOM → array de comandos | No (lê DOM) |
| `engine/runner.js` | Executa array de comandos com async/await | Yes |
| `actors/player.js` | Estado do herói (posição, direção, animação) | Yes |
| `stage/stage.js` | Grid, obstáculos, colisão, objetivos, vitória/derrota | Yes |
| `game/levels.js` | Config de fases (mapa, objetivos, blocos liberados) | Yes |
| `game/progression.js` | Sistema de desbloqueio, pontuação, ranking local | Yes |
| `ui/dragDrop.js` | Eventos dragstart/dragover/drop, snap visual | No (DOM) |
| `ui/workspace.js` | Gerenciar pilha de blocos no workspace | No (DOM) |
| `app.js` | Init, listeners de botões, coordena Engine + UI | No (DOM) |

## Design system
See `DESIGN.md` for full spec.

Quick reference:
- **Primary (neon cyan):** `#e1fdff` / `#00f2ff` — ações principais, blocos ativos
- **Secondary (electric purple):** `#ebb2ff` / `#b600f8` — lógica, sensores
- **Tertiary (neon green):** `#34fc0d` — Run state, vitória, sistema OK
- **Background:** `#0d1515` (deep dark)
- **Fonts:** Space Grotesk (headlines/labels), Inter (body/terminal)

### Block color coding (left accent bar)
- Movement: Blue
- Logic/Loops: Purple
- Sensors: Green

## Development
- Projeto 100% estático: basta abrir `index.html` no navegador
- Servidor local opcional (direto no navegador)

## Code conventions
- ES6+ Classes para componentes com estado
- async/await para runner (cadeia de execução)
- Event delegation para interações com múltiplos blocos
- **NUNCA** misturar DOM com lógica de jogo (engine não toca no DOM)
- **NUNCA** adicionar comentários desnecessários
- Nomes de arquivos em camelCase, classes em PascalCase

## Progression system
- `levels.js` define cada fase: grid layout, posição inicial do herói, objetivo, obstáculos, blocos disponíveis
- `progression.js` gerencia: fase atual, histórico de fases concluídas, quais blocos estão desbloqueados, pontuação local (ranking no localStorage)
- A cada fase concluída, `progression.js` libera novos blocos para as próximas fases
- Ranking local persiste via `localStorage`

## Stitch & MCP
- Protótipo visual no Google Stitch: https://stitch.withgoogle.com/projects/7811335591909664974
- MCP servers configurados em `opencode.json`:
  - **stitch** — servidor MCP do Google Stitch (proxy local, autenticação via `gcloud`)
  - **filesystem** — acesso ao sistema de arquivos para a IA
- Para ativar Stitch localmente: rodar `npx @_davideast/stitch-mcp init` uma vez (OAuth Google)
