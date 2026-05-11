# BLOCKS.md

## Catálogo de Blocos

### Paleta de Blocos

A paleta (`js/ui/blockPalette.js`) é dividida em 5 categorias com abas e cores específicas:

| Categoria | Cor (Token CSS) | Cor (Nome) |
| --- | --- | --- |
| Movimento | `var(--primary-container)` | Ciano |
| Controle | `var(--secondary-container)` | Roxo |
| Sensores | `var(--tertiary-container)` | Verde |
| Combate | `var(--error)` | Vermelho |
| Variáveis | `var(--secondary)` | Roxo |

### Tabela de Blocos

| Bloco | Categoria | Desbloqueado | Descrição |
| --- | --- | --- | --- |
| Mover Frente | *Movimento* | 0 (Inicial) | Move o jogador 1 célula para frente na direção atual |
| Girar Direita | *Movimento* | 0 (Inicial) | Rotaciona o jogador 90° no sentido horário |
| Girar Esquerda | *Movimento* | 0 (Inicial) | Rotaciona o jogador 90° no sentido anti-horário |
| Pular | *Movimento* | 0 (Inicial) | Faz o jogador pular 2 células para frente |
| Se (if) | *Controle* | 1 | Executa o bloco `then` se a condição for verdadeira, senão executa `else` |
| Repetir | *Controle* | 2 | Repete os blocos internos N vezes (max 100) |
| Enquanto | *Controle* | 2 | Repete os blocos internos enquanto a condição for verdadeira (max 200 iterações) |
| Detectar obstáculo | *Sensores* | 0 (Inicial) | Retorna `true` se há obstáculo ou borda à frente |
| Detectar inimigo | *Sensores* | 0 (Inicial) | Retorna `true` se há inimigo num raio de 3 células (distância Manhattan) |
| Atacar | *Combate* | 0 (Inicial) | Ataca o inimigo na célula frontal, causando 1 de dano |
| Pegar | *Variáveis* | 0 (Inicial) | Pega um item da célula atual |
| Soltar | *Variáveis* | 0 (Inicial) | Solta o item que o herói carrega |
| Ativar | *Variáveis* | 0 (Inicial) | Ativa um mecanismo na célula atual |

### Condições Válidas

- `obstacleDetected` — usado nos blocos Se/Enquanto
- `enemyDetected` — usado nos blocos Se/Enquanto

Alterna entre as duas clicando no chip hexagonal do bloco.

### Workspace de Blocos

O workspace (`js/ui/blockWorkspace.js`) é a área onde os blocos são montados.

#### Funcionalidades

- **Drag & Drop nativo HTML5**: arraste blocos da paleta para o workspace
- **Snapping em cadeia**: blocos se encaixam verticalmente quando soltos próximos (distância 90px)
- **Aninhamento**: blocos de controle (Se/Repetir/Enquanto) aceitam blocos filhos nas áreas `then` e `else`
- **Zoom**: 0.25x a 2x via botões ou scroll com Ctrl/Cmd
- **Pan**: arrastar área vazia do workspace
- **Remoção**: botão X ou tecla Delete/Backspace
- **Persistência**: workspace salvo automaticamente em `localStorage` (`codequest_workspace`)
- **Restauração**: workspace restaurado ao entrar no jogo
- **Highlight de execução**: blocos recebem classe `executing` durante execução

#### Estrutura DOM

```
.sb-workspace
  .sb-zoom-controls (botões zoom in/out/fit + indicador %)
  .sb-workspace-scroll (scrollable)
    .sb-canvas (transform: scale(zoom))
      .sb-block (cada bloco, position: absolute)
        .sb-block-body
          .sb-headlight (indicador de categoria)
          .sb-content (label + icon + input/condição)
          .sb-child-area (para blocos de controle)
            .sb-child-hint (+)
          .sb-else-section (para if)
            .sb-else-area
        .sb-del (botão fechar)
```

### Persistência

```javascript
// localStorage: codequest_workspace
{
  version: 1,
  nextId: 10,
  blocks: [
    {
      id: "b1", type: "move", label: "Mover Frente",
      icon: "arrow_upward", category: "movimento",
      x: 40, y: 40, value: 1,
      prev: null, next: "b2", parent: null,
      children: [], elseChildren: [], ctrl: false
    }
  ]
}
```
