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

## Brand & Style
This design system captures the essence of a high-stakes, interstellar computational frontier. The brand personality is rooted in the "Autômato" narrative—where code is the lifeblood of mechanical survival. The visual language blends heavy-tech industrialism with an ethereal digital glow.

The aesthetic utilizes **Glassmorphism** and **High-Contrast Neon** to create a sense of depth in the vacuum of deep space. Every element should feel like a holographic projection from a tactical command deck. The emotional response is one of focused adrenaline and intellectual mastery, transforming the act of logic-building into a high-fidelity gaming experience.

## Colors
The palette is centered on a "Deep Space" foundation. Gradients should transition from `#0b0f1a` (void blue) to `#02040a` (pure black) to simulate cosmic depth.

- **Primary (Neon Blue):** Reserved for primary actions, active code blocks, and navigational focus.
- **Secondary (Electric Purple):** Used for logic gates, sensor data, and rare power-ups.
- **Tertiary (Neon Green):** Specifically designated for "Run" states, successful logic execution, and system health.
- **Surface & Neutrals:** Surfaces use semi-transparent dark blues to allow background gradients to bleed through. Neutrals are cool-toned grays used for inactive states and metadata.

## Typography
The system employs a dual-font strategy. **Space Grotesk** provides the technical, geometric edge required for headlines and tactical labels, evoking a "hacker" aesthetic. **Inter** is used for body text and descriptive content to ensure high legibility during complex logic building.

All headlines should be rendered in high-contrast white or primary neon blue. Labels used for programming blocks or sensor readouts should be set in all-caps with slight letter spacing to mimic instrumentation panels.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure for the main dashboard and a sidebar-focused workspace for the visual programming area. 

Spacing is governed by a 4px base unit. Visual programming blocks (the "logic cards") utilize `sm` (8px) internal padding and `md` (16px) external gaps to maintain a tight, technical feel. Margins are generous (`xl`) to prevent the high-contrast elements from feeling cluttered. The interface should feel "breathable" despite its tech-heavy nature.

## Elevation & Depth
Depth is created through **Glassmorphism** and **Luminous Layering** rather than traditional shadows.

1.  **Level 0 (Background):** Deep space gradients with subtle star-field noise.
2.  **Level 1 (Panels):** Translucent dark surfaces (`rgba(11, 15, 26, 0.6)`) with a 12px backdrop-blur.
3.  **Level 2 (Active Blocks):** Elements gain a 1px solid border of the primary or secondary color and a soft `0px 0px 15px` outer glow (bloom effect).
4.  **Level 3 (Overlay/Modals):** High-opacity panels with "circuit-line" border details—thin lines that extend slightly past the corners of the box to suggest modular hardware components.

## Shapes
The shape language is "Advanced Industrial." While the base containers use a `0.5rem` to `1rem` (8px-16px) radius to feel modern and accessible, this is often interrupted by sharp technical details.

Buttons and logic blocks should feature "chamfered-style" or "notched" corners where possible, or thin 1px accents that run parallel to the borders. All borders must be thin and crisp. Programming blocks use a "puzzle-piece" interlocking shape language but maintain the glassmorphic style to feel like holographic modules rather than plastic toys.

## Components
- **Action Buttons:** Ghost-style buttons by default with 1px neon borders. On hover, the button fills with a low-opacity version of the neon color and the glow intensifies.
- **Programming Blocks:** Modular cards with a left-hand "accent bar" color-coded by function (Movement = Blue, Logic = Purple, Sensors = Green).
- **Status Chips:** Small, pill-shaped indicators with a pulsing dot icon to indicate "Active" or "Standby" states.
- **Glow-Line Icons:** Minimalist 2px stroke icons. When active, the stroke color matches the primary neon blue and emits a soft glow.
- **Data Visualizers:** Small sparklines or technical readouts using the secondary electric purple, displayed within the glassmorphic sidebars.
- **Input Fields:** Dark, recessed wells with a bottom-only neon border that illuminates fully when focused.