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
├── ARCHITECTURE.md
└── README.md
```

## Fluxo de Dados

```text
[Workspace DOM] → parser.js → [Command Array] → runner.js → [Player/Stage state]
```

## Invariantes Arquiteturais

- Arquivos em `engine/` NUNCA acessam DOM (exceto parser.js para leitura)
- Arquivos em `ui/` NUNCA contêm lógica de jogo (condições de vitória/derrota, colisão, estado do herói)
- `app.js` é o único arquivo que pode importar engine e UI; apenas coordena execução, não adiciona lógica a nenhuma das camadas

## Mapa de Arquivos

| Arquivo | Função | Sem DOM? |
| --- | --- | --- |
| `engine/parser.js` | Lê workspace DOM → array de comandos | Não (lê DOM) |
| `engine/runner.js` | Executa array de comandos com async/await | Sim |
| `actors/player.js` | Estado do herói (posição, direção, animação) | Sim |
| `stage/stage.js` | Grid, obstáculos, colisão, objetivos, vitória/derrota | Sim |
| `game/levels.js` | Config de fases (mapa, objetivos, blocos liberados) | Sim |
| `game/progression.js` | Sistema de desbloqueio, pontuação, ranking local | Sim |
| `ui/dragDrop.js` | Eventos dragstart/dragover/drop, snap visual | Não (DOM) |
| `ui/workspace.js` | Gerenciar pilha de blocos no workspace | Não (DOM) |
| `app.js` | Init, listeners de botões, coordena Engine + UI | Não (DOM) |

## Preocupações Transversais (Cross-Cutting)

- Game loop: app.js orquestra engine + UI
- Persistência: localStorage via progression.js
- NUNCA adicionar comentários desnecessários em código
- Must usar ES6+ Classes para todos os componentes com estado
- Event delegation para interações com múltiplos blocos
