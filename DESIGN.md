---
name: Cyber-Logic Nexus
colors:
  surface: '#0d1515'
  surface-dim: '#0d1515'
  surface-bright: '#333b3b'
  surface-container-lowest: '#080f10'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#232b2c'
  surface-container-highest: '#2e3637'
  on-surface: '#dce4e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dce4e4'
  inverse-on-surface: '#2a3232'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#ebb2ff'
  on-secondary: '#520072'
  secondary-container: '#b600f8'
  on-secondary-container: '#fff6fc'
  tertiary: '#e4ffd6'
  on-tertiary: '#053900'
  tertiary-container: '#34fc0d'
  on-tertiary-container: '#106f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#f8d8ff'
  secondary-fixed-dim: '#ebb2ff'
  on-secondary-fixed: '#320047'
  on-secondary-fixed-variant: '#74009f'
  tertiary-fixed: '#79ff5b'
  tertiary-fixed-dim: '#2ae500'
  on-tertiary-fixed: '#022100'
  on-tertiary-fixed-variant: '#095300'
  background: '#0d1515'
  on-background: '#dce4e4'
  surface-variant: '#2e3637'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  code-label:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  terminal-small:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  container-max: 1440px
---
# DESIGN.md

## Forma e Estilo

Glassmorphism + High-Contrast Neon sobre fundo Deep Space. Todo elemento deve parecer uma projeção holográfica de um deck de comando tático. Profundidade via camadas translúcidas com backdrop-blur, não sombras tradicionais.

## Cores

Background: usar token `background` do YAML frontmatter.
Gradientes devem partir de `var(--background)` usando variações de `surface-*`.

- **Primary (tokens: `primary` / `primary-container`):** Ações primárias, blocos de código ativos, foco de navegação
- **Secondary (tokens: `secondary` / `secondary-container`):** Portas lógicas, dados, power-ups
- **Tertiary (tokens: `tertiary` / `tertiary-container`):** Estados de execução, execução bem-sucedida, saúde do sistema
- **Surfaces (tokens: `surface-*`):** Camadas escuras semitransparentes; `surface-container` para painéis base

## Tipografia

- **Space Grotesk:** manchetes e rótulos táticos (estética "hacker")
- **Inter:** corpo de texto e conteúdo descritivo

Manchetes: branco alto contraste ou `var(--primary)`.
Rótulos em blocos: maiúsculas com `letter-spacing: 0.05em` (token `code-label`).

## Layout e Espaçamento

Grid Fluido com 12 colunas (dashboard) + sidebar (programação visual).
Unidade base: 4px (token `spacing.unit`).
Blocos: padding `sm` (8px), gap `md` (16px). Margens: `xl` (40px).

## Elevação e Profundidade

Glassmorphism + Camadas Luminosas (sem sombras tradicionais).

1. **Nível 0 (Background):** Gradientes espaço profundo + ruído estelar
2. **Nível 1 (Painéis):** `background: rgba(13, 21, 21, 0.6)` + `backdrop-filter: blur(12px)`
3. **Nível 2 (Blocos Ativos):** Borda 1px `var(--primary)` ou `var(--secondary)` + `box-shadow: 0 0 15px var(--primary-container)`
4. **Nível 3 (Overlay/Modais):** Alta opacidade + borda "circuit-line"

## Formas

"Industrial Avançado": containers base `0.5rem`-`1rem` (tokens `rounded`), interrompidos por detalhes técnicos.

- Botões/blocos: cantos "chanfrados" ou acentos finos de 1px paralelos às bordas
- Bordas: finas e nítidas
- Blocos: formas entrelaçadas (CSS `clip-path` ou pseudo-elementos com notch/bump), mantendo glassmorfismo

## Componentes

- **Action Buttons:** Ghost, borda neon 1px, hover preenche com baixa opacidade + brilho intenso
- **Programming Blocks:** Cards modulares com barra esquerda por função (Movement=`var(--primary)`, Logic=`var(--secondary)`)
- **Status Chips:** Pílula com ponto pulsante ("Active" / "Standby")
- **Glow-Line Icons:** Stroke 2px, ativo: `var(--primary)` com brilho
- **Data Visualizers:** Sparklines com `var(--secondary)`, sidebars glassmórficas
- **Input Fields:** Poços rebaixados, borda neon apenas inferior, ilumina ao focar

## Como Aplicar Tokens (CSS)

```css
/* Cores */
background: var(--background);
color: var(--on-background);
.panel { background: var(--surface-container); }
.primary-btn { color: var(--primary); border: 1px solid var(--primary); }

/* Tipografia */
.heading { font-family: Space Grotesk; font-weight: 700; }
.body-text { font-family: Inter; font-weight: 400; }

/* Espaçamento */
.block { padding: var(--spacing-sm); margin: var(--spacing-xl); }

/* Bordas */
.rounded-sm { border-radius: var(--rounded-sm); }
.rounded-md { border-radius: var(--rounded-md); }
```
