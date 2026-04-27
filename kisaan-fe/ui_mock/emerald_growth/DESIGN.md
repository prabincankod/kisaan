---
name: Emerald Growth
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4dd'
  on-surface: '#161d19'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#2b6954'
  on-secondary: '#ffffff'
  secondary-container: '#adedd3'
  on-secondary-container: '#306d58'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4dd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  gutter: 1.5rem
  margin: 2rem
---

## Brand & Style

This design system is anchored in a philosophy of **Modern Organicism**. It bridges the gap between digital precision and agricultural vitality. The brand personality is rooted in being an "Expert Partner"—knowledgeable and professional, yet deeply connected to nature and growth. 

The visual style follows a **Corporate Minimalist** aesthetic with soft, humanistic touches. It prioritizes high-clarity information density and expansive white space to evoke a sense of honesty and transparency. By removing tertiary distractions, the focus shifts entirely to the relationship between the primary emerald accents and clean, neutral surfaces, creating a focused user experience that feels both fresh and dependable.

## Colors

The palette is intentionally streamlined to reinforce trust and focus. 

*   **Primary (Emerald):** Used for key actions, progress indicators, and brand highlights. It represents growth and vitality.
*   **Secondary (Deep Forest):** A high-contrast dark green used for text emphasis, heavy borders, or "dark mode" components within the light UI.
*   **Neutral (Slate & Stone):** A sophisticated range of greys with slight blue undertones to keep the interface feeling cool and modern.
*   **Functional:** Success uses the primary emerald; warnings and errors utilize a standard soft amber and coral, though these are kept minimal to ensure the green remains the dominant semantic anchor.

The absence of a tertiary color ensures that every interactive element is clearly identifiable through the primary green hue.

## Typography

This design system exclusively utilizes **Plus Jakarta Sans** to capitalize on its friendly, modern geometry. 

- **Headlines:** Use tighter letter-spacing and heavier weights to create a strong visual anchor.
- **Body Text:** Standard weight (400) is used for maximum readability with generous line heights to prevent visual fatigue during long reading sessions.
- **Labels:** Semi-bold or Medium weights are used for UI metadata, navigation, and button text to provide clear hierarchy without needing large font sizes.

## Layout & Spacing

The layout utilizes a **Fixed-Width Grid** for desktop (12 columns, 1200px max-width) and a fluid 4-column grid for mobile devices. 

A 4px baseline grid ensures vertical rhythm. We favor generous internal padding within containers to maintain an "airy" and approachable feel. Content should be grouped logically using "whitespace-first" separation rather than heavy line dividers wherever possible.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and soft, ambient shadows. 

- **Level 0:** The neutral background (Slate-50).
- **Level 1:** White surfaces (Cards/Inputs) with a 1px soft border (Slate-200).
- **Level 2:** Elements requiring interaction (Buttons/Active Cards) feature a highly diffused, low-opacity shadow tinted with the primary emerald color (e.g., `rgba(16, 185, 129, 0.08)`).
- **Level 3:** Overlays and Modals use a backdrop blur (12px) to maintain context while focusing user attention.

## Shapes

The shape language is consistently **Rounded**, reflecting the soft edges found in nature. 

Standard components (Inputs, Buttons, Cards) use a 0.5rem (8px) radius. Larger containers like Modals or Featured Sections utilize the `rounded-xl` (24px) scale to create a friendly, "cradled" look. This avoids the harshness of sharp corners while remaining more professional than fully pill-shaped "playful" designs.

## Components

- **Buttons:** Primary buttons are solid Emerald with white text. Secondary buttons use a transparent background with an Emerald border. Interaction states (hover) involve a slight darkening to Forest Green.
- **Input Fields:** Use a subtle background fill (Slate-100) that transitions to white with an Emerald 2px border on focus.
- **Chips:** Highly rounded (pill-shaped) with light Emerald backgrounds and Forest Green text. No icons unless necessary for deletion.
- **Cards:** White surfaces with a 1px Slate-200 border. Elevation should only increase on hover to indicate interactivity.
- **Data Tables:** Clean, no vertical borders. Use Forest Green for header text to provide a clear distinction from the data rows.
- **Progress Indicators:** Always utilize the primary Emerald, using a thick 4px stroke to signify growth and completion.