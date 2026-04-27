---
name: Kissan Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#404943'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#42493f'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a6156'
  on-tertiary-container: '#d5dccd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#dee5d6'
  tertiary-fixed-dim: '#c2c9bb'
  on-tertiary-fixed: '#171d14'
  on-tertiary-fixed-variant: '#42493e'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style

The design system is anchored in the concept of "Digital Agriculture"—a bridge between the raw, tactile world of farming and the efficient, high-speed world of modern e-commerce. It evokes a sense of abundance, reliability, and freshness.

The visual style is **Modern/Corporate** with **Minimalist** influences. By prioritizing clarity and high-quality whitespace, the system ensures that the produce remains the hero. The interface uses subtle organic cues—soft corners and earthy tones—to feel approachable for farmers while maintaining the sophisticated performance expected by urban consumers. The emotional response is one of "Peace of Mind": knowing exactly where food comes from through a professional and transparent interface.

## Colors

The palette is led by a **Vibrant Earthy Green (#2D6A4F)**, chosen for its association with healthy crops and financial growth. This serves as the primary brand anchor for CTAs and active states.

- **Primary:** Deep emerald green for trust and brand recognition.
- **Secondary:** A harvest amber/gold for highlights, ratings, and secondary accents to represent the sun and ripeness.
- **Tertiary:** A very soft mint-white for large background surfaces to reduce eye strain and feel "fresh."
- **Neutrals:** Cool grays for typography and borders, ensuring high legibility and a professional atmosphere.
- **Semantic Colors:** Soft reds for "Cancelled," amber for "Pending," and the primary green for "Confirmed" or "Delivered."

## Typography

This design system utilizes **Plus Jakarta Sans** for its exceptional readability on mobile screens and its modern, geometric character. The typeface strikes a balance between professional utility and a friendly, open curve.

Headlines use a tighter letter-spacing and heavier weights to establish a clear hierarchy, while body text maintains a generous line height to ensure accessibility for users in outdoor environments with varying light conditions (e.g., farmers in the field). All labels use a semi-bold weight to ensure they remain legible even at smaller scales.

## Layout & Spacing

The design system employs a **Fluid Grid** model optimized for mobile devices. It follows a 4-column structure with a standard 16px outer margin. 

The spacing rhythm is built on a 4px baseline, ensuring all elements—from icons to card padding—are mathematically aligned. 
- Use `md (16px)` for standard padding within cards and containers.
- Use `lg (24px)` for vertical section spacing to maintain a clean, airy aesthetic.
- Components like produce listings should utilize the fluid 4-column grid, typically spanning 2 columns in a gallery view or 4 columns in a list view.

## Elevation & Depth

To maintain the "Modern & Clean" vibe, this design system avoids heavy shadows. Instead, it uses **Tonal Layers** and **Ambient Depth**.

- **Level 0 (Surface):** The background uses the Tertiary tint (#F1F8E9) to create a soft, natural base.
- **Level 1 (Cards/Inputs):** Elements are lifted using a pure white background with a very soft, diffused shadow (0px 4px 12px, 5% opacity of the neutral color) or a subtle 1px stroke in a light gray.
- **Level 2 (Modals/Floating Actions):** Elevated with a more pronounced shadow (0px 8px 24px, 10% opacity) to signify immediate interaction layers.

This approach creates a "stacked" physical metaphor that feels tactile but remains digitally crisp.

## Shapes

The shape language is **Rounded**, using a 0.5rem (8px) base radius. This level of rounding is used to soften the UI, making it feel more organic and less "industrial."

- **Small elements (Badges, Tags):** Use a pill-shape (full radius) to distinguish them from interactive containers.
- **Medium elements (Cards, Buttons):** Use the standard 8px radius.
- **Large elements (Bottom Sheets, Image Containers):** Use 16px (rounded-lg) or 24px (rounded-xl) for a modern, high-end mobile feel.

## Components

### Buttons
- **Primary:** High-contrast Green (#2D6A4F) with white text. Solid fill.
- **Secondary:** Amber (#D97706) or an outlined green version for less critical actions.
- **State:** 85% opacity on press; grayed-out for disabled states.

### Cards
- **Produce Listing:** Features a top-aligned image with an 8px radius, followed by title, price per unit (bold), and a small "+" icon button in the bottom right corner for quick-add.
- **Order Summary:** White background, subtle 1px border, using vertical stacks for item lists and bold green text for the "Total" amount.

### Status Badges
- **Format:** Small caps text, semi-bold, housed in a pill-shaped container.
- **Colors:** Uses 10% opacity of the status color for the background and 100% opacity for the text (e.g., Pending = Light Amber bg, Dark Amber text).

### Input Fields
- Understated borders with 8px corner radius. On focus, the border thickens to 2px using the primary Green. Labels are positioned above the field for clarity.

### Produce Category Chips
- Horizontal scrolling list of pill-shaped buttons. Active chips use the primary Green; inactive chips use a light gray stroke and neutral text.