---
name: code-style
description: Garante convenções de código do CodeQuest (ES6+ Classes, PascalCase, camelCase, sem comentários desnecessários)
---

# Skill de Estilo de Código

## Precedência
1. `AGENTS.md` (Constituição - maior prioridade)
2. Esta Skill (aplica-se apenas dentro do domínio de estilo de código)
3. Em caso de conflito → SEMPRE deferir ao `AGENTS.md`

## Instrução
**LEIA sempre a versão mais recente de `AGENTS.md`** (seção "Convenções de código") antes de escrever código.
Esta skill é um guia complementar - `AGENTS.md` é a fonte da verdade.

## Regras Obrigatórias

### 1. ES6+ Classes para Componentes com Estado
```javascript
// CORRETO
class Player {
  constructor() {
    this.position = { x: 0, y: 0 }
  }
}

// ERRADO - função para componente com estado
function Player() { ... }
```

### 2. Nomenclatura
- **Arquivos**: camelCase (ex: `dragDrop.js`, `workspace.js`)
- **Classes**: PascalCase (ex: `Player`, `Stage`, `DragDrop`)
- **NUNCA** misturar padrões

### 3. Sem Comentários Desnecessários
```javascript
// CORRETO
class Player {
  moveForward() {
    this.position.x++
  }
}

// ERRADO - comentário desnecessário
class Player {
  // Move the player forward
  moveForward() {
    this.position.x++
  }
}
```

### 4. async/await para Runner
```javascript
// Runner usa cadeia de execução assíncrona
async execute(commands) {
  for (const cmd of commands) {
    await this.runCommand(cmd)
  }
}
```

### 5. Event Delegation para Múltiplos Blocos
```javascript
// CORRETO - delegação de eventos
workspace.addEventListener('click', (e) => {
  const block = e.target.closest('.block')
  if (block) this.handleBlockClick(block)
})

// ERRADO - listener em cada bloco individual
document.querySelectorAll('.block').forEach(block => {
  block.addEventListener('click', ...)
})
```

### 6. ZERO Frameworks Runtime
- Proibido: React, Vue, jQuery, etc.
- Vanilla JS ES6+ apenas
- Módulos `type="module"`

## Checklist de Verificação
- [ ] Arquivos em camelCase?
- [ ] Classes em PascalCase?
- [ ] zero comentários desnecessários?
- [ ] async/await usado no runner?
- [ ] Event delegation para interações com múltiplos blocos?
- [ ] Zero frameworks detectados?
