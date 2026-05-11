# EXECUTION.md

## Sistema de Execução

### Runner Assíncrono

O runner (`js/engine/runner.js`) executa a árvore de comandos montada no workspace usando `async/await` com delay configurável entre comandos (default 500ms).

#### Fluxo de Execução

```text
commands[] → for each command → executeCommand()
  → dispatch command:start
  → switch type:
      'if' → evaluate condition → execute then/else branch
      'repeat' → loop N times (max 100)
      'while' → loop while condition (max 200)
      default → call handler[type]
  → delay(delayMs)
  → dispatch command:end
```

#### Handlers (definidos em app.js)

Cada comando tem um handler que:
1. Executa a ação no stage/player
2. Chama `updateSimView()` para refletir no DOM
3. Aguarda delay
4. Chama `tickEnemiesAndSync()` — inimigos agem e sincroniza DOM

### Limites de Segurança

| Limite | Valor | Descrição |
| --- | --- | --- |
| `MAX_DEPTH` | 6 | Profundidade máxima de aninhamento (blocos dentro de blocos) |
| `MAX_TOTAL_COMMANDS` | 500 | Comandos totais executados (incluindo repetições) |
| `MAX_REPEAT` | 100 | Número máximo de repetições num bloco Repetir |
| `MAX_WHILE` | 200 | Número máximo de iterações num bloco Enquanto |

### Validação

O validador (`js/engine/validator.js`) verifica a árvore de comandos antes da execução:

#### Comandos Válidos

```
move, turnRight, turnLeft, jump,
attack, custom_var,
if, repeat, while
```

#### Regras de Validação

- **Tipo**: comando deve ser um objeto com `type` válido
- **Profundidade**: máximo 6 níveis de aninhamento
- **Blocos de controle**:
  - `if`: deve ter condição definida; pode ter `children` (then) e `elseChildren` (else)
  - `repeat`: deve ter valor numérico positivo; se exceder 100, aviso
  - `while`: deve ter condição definida; detecta loops potencialmente infinitos (sem movimento dentro)
- **Condições**: apenas `obstacleDetected` e `enemyDetected`

#### Resultado da Validação

```javascript
{
  valid: true/false,
  errors: ["mensagens de erro"],    // impede execução
  warnings: ["mensagens de aviso"]  // permite execução com aviso
}
```

### Eventos de Execução

| Evento | Disparado | Detail |
| --- | --- | --- |
| `command:start` | Antes de executar comando | `{ command, blockId }` |
| `command:end` | Após executar comando | `{ command, blockId }` |
| `command:error` | Erro durante execução | `{ command, error }` |
| `command:limit` | Limite de while atingido | `{ type: 'while', limit: 200 }` |

### Pausa e Parada

- **Pausar**: `gs.shouldPause = true` — execução entra em loop de espera até `shouldPause = false`
- **Parar**: `gs.shouldStop = true` — lança `'Execution stopped'` que interrompe a cadeia
- **Botão LIMPAR**: para execução + limpa workspace + reseta level

### Implementação

- Runner: `js/engine/runner.js`
- Validador: `js/engine/validator.js`
- Orquestração: `app.js` (handlers, eventos, controle de fluxo)
