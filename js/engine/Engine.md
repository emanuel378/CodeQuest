# AGENTS.md — CODEQUEST ENGINE

## Finalidade
Documento exclusivo para responsáveis pelo **ENGINE** do CodeQuest. Escopo restrito a:
```
js/engine/
├── parser.js
└── runner.js
```

**FORA DO ESCOPO (NÃO MEXER):**
- UI (`ui/`, `app.js`, `index.html`)
- Estilos (`styles/`)
- Outros módulos JS (`actors/`, `stage/`, `game/`)

---

## Entregáveis
1. `parser.js` — Conversão de blocos DOM → array de comandos
2. `runner.js` — Execução assíncrona de comandos com controle de fluxo

---

## Status Atual
✅ `parser.js` implementado conforme requisitos
✅ `runner.js` implementado conforme requisitos

---

## Especificações dos Módulos

### 1. parser.js
**Responsabilidade:** Apenas ler blocos do DOM no `#workspace` e converter para array de strings.
- Exporta `parseCommands()` como ES Module
- Usa `document.getElementById('workspace')` para acessar o workspace
- Usa `querySelectorAll('.block[data-command]')` para encontrar blocos
- Extrai `data-command` de cada bloco, retorna array (ex: `["move", "turnRight"]`)
- Retorna array vazio se `#workspace` não existir
- Preparado para leitura de blocos aninhados (loops) futuros

**Exemplo de uso:**
```javascript
import { parseCommands } from './engine/parser.js';
const commands = parseCommands(); // ["move", "turnRight", "move"]
```

---

### 2. runner.js
**Responsabilidade:** Apenas executar array de comandos em sequência com controle de fluxo.
- Exporta `runCommands(commands, options)` como ES Module
- Usa `async/await` para execução assíncrona
- Cria `delay(ms)` via `Promise` + `setTimeout`
- Executa comandos em ordem usando `for...of`
- Valida comandos inválidos (lista: `['move', 'turnRight', 'attack']`)
- Tratamento de erros com `try/catch`, logs no console
- Emite eventos customizados para UI:
  - `command:start` — início de comando
  - `command:end` — fim de comando
  - `command:error` — erro de execução
- Aceita `handlers` customizados para lógica de cada comando

**Exemplo de uso:**
```javascript
import { runCommands } from './engine/runner.js';

const handlers = {
  move: async () => { /* lógica implementada em outro módulo */ },
  turnRight: async () => { /* lógica de rotação */ }
};

await runCommands(commands, { handlers, delayMs: 500 });
```

---

## Regras de Arquitetura
1. **Separação Estrita:**
   - `parser.js` é o único arquivo do engine que toca no DOM (apenas leitura)
   - `runner.js` é 100% DOM-free (lógica pura)
2. **Sem mistura de responsabilidades:** Parser apenas interpreta blocos, Runner apenas executa
3. **Zero dependências:** Apenas JavaScript ES6+ nativo
4. **Validação:** Impedir execução de comandos inválidos, não quebrar a aplicação
5. **Eventos:** Runner usa `EventTarget` para comunicação com UI sem acoplamento

---

## Roadmap Futuro (ENGINE)
Preparar suporte para:
- Comando `repeat` (loops)
- Comando `if` (condicionais)
- Leitura de estruturas aninhadas no parser
- Handlers dinâmicos para novos comandos

---

## Convenções de Código
- Nomes de arquivos: camelCase
- ES Modules nativos (`export`/`import`)
- async/await para fluxo assíncrono
- Sem comentários desnecessários no código
- Tratamento de erro obrigatório em execuções
