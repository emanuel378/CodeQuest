---
name: design-system
description: Aplica tokens do DESIGN.md (cores, tipografia, espaçamento) no CSS e componentes UI do CodeQuest
---

# Skill de Design System

## Precedência
1. `AGENTS.md` (Constituição - maior prioridade)
2. Esta Skill (aplica-se apenas dentro do domínio de design)
3. Em caso de conflito → SEMPRE deferir ao `AGENTS.md`

## Instrução
Antes de aplicar estas regras, **LEIA sempre a versão mais recente de `DESIGN.md`**.
Esta skill é um guia complementar - o YAML frontmatter de `DESIGN.md` é a fonte da verdade para tokens.

## Regras Obrigatórias

### 1. Uso Exclusivo de Variáveis CSS
- **NUNCA** usar cores hardcoded (ex: `#0d1515`, `rgb(...)`)
- **NUNCA** usar espaçamentos hardcoded (ex: `16px` onde existe token)
- Usar **sempre**: `var(--background)`, `var(--primary)`, etc.

### 2. Tokens de Cores (do YAML do DESIGN.md)
```css
/* Background */
background: var(--background);
color: var(--on-background);

/* Primary */
.panel { background: var(--surface-container); }
.primary-btn { color: var(--primary); border: 1px solid var(--primary); }

/* Superfícies */
.surface-panel { background: var(--surface-container); }
```

### 3. Tokens de Tipografia
- **Space Grotesk**: manchetes e rótulos táticos
- **Inter**: corpo de texto e conteúdo descritivo
- Manchetes: alto contraste ou `var(--primary)`
- Rótulos em blocos: maiúsculas com `letter-spacing: 0.05em` (token `code-label`)

### 4. Tokens de Espaçamento
- Unidade base: 4px (token `spacing.unit`)
- Blocos: padding `sm` (8px), gap `md` (16px)
- Margens: `xl` (40px)

### 5. Bordas e Raio
```css
.rounded-sm { border-radius: var(--rounded-sm); }
.rounded-md { border-radius: var(--rounded-md); }
```

### 6. Elevação e Profundidade (Glassmorphism)
- **Nível 0 (Background)**: Gradientes espaço profundo
- **Nível 1 (Painéis)**: `background: rgba(13, 21, 21, 0.6)` + `backdrop-filter: blur(12px)`
- **Nível 2 (Blocos Ativos)**: Borda 1px `var(--primary)` + `box-shadow: 0 0 15px var(--primary-container)`
- **Nível 3 (Overlay/Modais)**: Alta opacidade + borda "circuit-line"

### 7. Estilo dos Blocos de Programação
- Cantos: `0.5rem`-`1rem` (tokens `rounded`)
- Barra esquerda por função:
  - Movement = `var(--primary)`
  - Logic = `var(--secondary)`

- Formas entrelaçadas (CSS `clip-path` ou pseudo-elementos)

## Checklist de Verificação
- [ ] CSS usa apenas variáveis do frontmatter de `DESIGN.md`?
- [ ] Nenhuma cor hardcoded?
- [ ] Nenhum espaçamento hardcoded onde existe token?
- [ ] Tipografia segue Space Grotesk (manchetes) e Inter (corpo)?
- [ ] Glassmorphism aplicado corretamente (sem sombras tradicionais)?
