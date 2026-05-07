---
name: architecture-compliance
description: Garante separação estrita de camadas entre engine/, ui/ e app.js seguindo as regras de ARCHITECTURE.md
---

# Skill de Conformidade Arquitetural

## Precedência
1. `AGENTS.md` (Constituição - maior prioridade)
2. Esta Skill (aplica-se apenas dentro do domínio arquitetural)
3. Em caso de conflito → SEMPRE deferir ao `AGENTS.md`

## Instrução
Antes de aplicar estas regras, **LEIA sempre a versão mais recente de `ARCHITECTURE.md`**.
Esta skill é um guia complementar - `ARCHITECTURE.md` é a fonte da verdade.

## Regras Críticas (do ARCHITECTURE.md)

### 1. Arquivos em `engine/` NUNCA acessam DOM
- Proibido: `document`, `window`, eventos DOM
- Exceção: `parser.js` pode ler DOM para conversão
- **Violação é erro crítico**

### 2. Arquivos em `ui/` NUNCA contêm lógica de jogo
- Proibido: condições de vitória/derrota, colisão, estado do herói
- **Violação é erro crítico**

### 3. `app.js` é o único arquivo que pode importar engine e UI
- Apenas coordena execução
- Não adiciona lógica a nenhuma das camadas
- **Violação é erro crítico**

## Checklist de Verificação
- [ ] engine/*.js tem zero referências ao DOM (exceto parser.js para leitura)?
- [ ] ui/*.js tem zero lógica de jogo?
- [ ] app.js apenas coordena, não adiciona lógica às camadas?
- [ ] Novos arquivos seguem o padrão de camada correto?

## Mapa de Arquivos (Referência Rápida)
| Arquivo | Função | Sem DOM? |
| --- | --- | --- |
| `engine/parser.js` | Lê workspace DOM → array de comandos | Não (lê DOM) |
| `engine/runner.js` | Executa array de comandos | Sim |
| `actors/player.js` | Estado do herói | Sim |
| `stage/stage.js` | Grid, obstáculos, colisão | Sim |
| `game/levels.js` | Config de fases | Sim |
| `game/progression.js` | Sistema de desbloqueio | Sim |
| `ui/dragDrop.js` | Eventos drag & drop | Não (DOM) |
| `ui/workspace.js` | Gerencia pilha de blocos | Não (DOM) |
| `app.js` | Coordena Engine + UI | Não (DOM) |
