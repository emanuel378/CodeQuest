---
name: game-logic
description: Aplica regras de GAME.md para níveis, blocos, progressão e sistema de jogo do CodeQuest
---

# Skill de Lógica de Jogo

## Precedência
1. `AGENTS.md` (Constituição - maior prioridade)
2. Esta Skill (aplica-se apenas dentro do domínio de jogo)
3. Em caso de conflito → SEMPRE deferir ao `AGENTS.md`

## Instrução
**LEIA sempre a versão mais recente de `GAME.md` antes de trabalhar com lógica de jogo**.
Esta skill é um **atalho inteligente** - `GAME.md` é a fonte da verdade.

## Quick Reference (NÃO substitui GAME.md)

### Categorias de Blocos
- *Movimento* → Blue (`var(--primary)`)
- *Controle* → Purple (`var(--secondary)`)
- *Sensores* → Green (`var(--tertiary)`)
- *Ações* → Sem cor específica

### Tipos de Obstáculos
- **Pedras**: Bloqueiam movimento, detectáveis por "Detectar obstáculo"
- **Árvores**: Bloqueiam movimento, puláveis com "Pular"
- **Água**: Bloqueia movimento, dana o jogador se entrar
- **Inimigos**: Atacam o jogador, detectáveis por "Detectar inimigo"
- **Boss**: Inimigo final no Nível 3, requer múltiplos ataques

### Progressão de Níveis
| Nível | Tema | Blocos Novos | Objetivo |
| --- | --- | --- | --- |
| 0 | Tutorial | Mover Frente, Girar Dir/Esq, Pular, Detectar, Atacar, Pegar, Soltar, Ativar | Aprender controles |
| 1 | Cidade da Lógica | Se (if), Senão (else) | Mover até inimigo e Atacar |
| 2 | Floresta dos Algoritmos | Repetir, Enquanto | Chegar ao inimigo, atacar quando necessário |
| 3 | Núcleo de Logicron | Nenhum | Derrotar o boss final |

### Arquivos de Lógica de Jogo
- `game/levels.js`: Define cada nível (grid, posição inicial, objetivo, obstáculos, blocos disponíveis)
- `game/progression.js`: Gerencia nível atual, histórico, blocos desbloqueados, pontuação (localStorage)

### Formato do localStorage
```javascript
{
  "currentLevel": 2,
  "completedLevels": [0, 1],
  "unlockedBlocks": ["Mover Frente", "Girar Direita", ...],
  "ranking": [
    { "score": 1500, "level": 3, "time": "2026-05-06T10:30:00Z" }
  ]
}
```

## Regras para Agentes (do GAME.md)
- Sempre seguir o formato exato das tabelas do GAME.md
- Usar números para níveis (0, 1, 2, 3...)
- Categorias devem ser: *Movimento*, *Controle*, *Sensores*, *Ações*
- Obstáculos devem ser tipos específicos, nunca apenas "Contém"/"Não contém"

## Checklist de Verificação
- [ ] Novo nível segue formato exato da tabela "Progressão de Níveis"?
- [ ] Novo bloco segue formato exato da tabela "Catálogo de Blocos"?
- [ ] Nível, categorias e obstáculos estão corretos?
- [ ] `levels.js` e `progression.js` atualizados conforme necessário?
