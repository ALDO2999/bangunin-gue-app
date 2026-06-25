---
name: Nocturnal Precision
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#c3c6d6'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#8c909f'
  outline-variant: '#424653'
  surface-tint: '#b0c6ff'
  primary: '#b0c6ff'
  on-primary: '#002d6f'
  primary-container: '#568dfe'
  on-primary-container: '#002661'
  inverse-primary: '#0c58c8'
  secondary: '#c2c2f5'
  on-secondary: '#2b2c55'
  secondary-container: '#444570'
  on-secondary-container: '#b4b4e6'
  tertiary: '#c0c1ff'
  on-tertiary: '#232479'
  tertiary-container: '#8688e1'
  on-tertiary-container: '#1b1c72'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00429c'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c2c2f5'
  on-secondary-fixed: '#16173f'
  on-secondary-fixed-variant: '#42436d'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#0a0565'
  on-tertiary-fixed-variant: '#3b3d90'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 20px
  gutter-mobile: 12px
---

## Brand & Style

The brand personality focuses on reliability, tranquility, and technical precision. As a location-based utility, it must evoke a sense of "watchful peace"—the app works silently in the background so the user can rest or commute without anxiety.

The design style is **Corporate Modern** with a focus on **Tonal Layering**. It utilizes a deep, dark-mode-first aesthetic to minimize eye strain during late-night or early-morning use. The interface is characterized by high legibility, generous touch targets, and a systematic use of blue-spectrum hues to reinforce the "night" and "travel" themes. The visual language avoids unnecessary clutter, favoring functional clarity and smooth transitions that reflect the movement of travel.

## Colors

The palette is anchored in deep cool tones to establish a calm, professional environment. 

- **Primary (Blueberry):** Used for critical actions, active toggles, and current location markers. It provides the necessary "pop" against the dark background.
- **Secondary (Periwinkle):** Used for subtle accents, secondary text, and inactive states. Its lower contrast compared to white makes it ideal for non-critical information.
- **Neutral (Indigo Ink):** Acts as the surface color for cards and elevated elements, creating a clear distinction from the base background.
- **Background (Midnight Blue):** The foundation of the app, providing a deep, immersive canvas that feels premium and reliable.

## Typography

This design system utilizes **Inter** for its exceptional legibility on mobile screens and its neutral, systematic feel. 

- **Headlines:** Use Semi-Bold weights with slight negative letter-spacing to create a compact, modern appearance.
- **Body Text:** Maintained at 16px for optimal readability. Secondary body text uses the Periwinkle color to create hierarchy.
- **Labels:** Used for buttons, category headers, and small metadata. These are slightly heavier (Medium) to ensure they stand out even at small sizes.
- **Numerical Data:** For distance tracking or time remaining, use the Title or Headline styles to ensure the most important data is glanceable.

## Layout & Spacing

The system follows a fluid 8pt grid logic to ensure consistent alignment. 

- **Mobile Layout:** Uses a 4-column fluid grid with 20px side margins. This provides a "safe zone" for thumb interaction.
- **Touch Targets:** All interactive elements (buttons, toggles, list items) must maintain a minimum height of 48px.
- **Vertical Rhythm:** Use 16px (md) spacing between related items within a card, and 24px (lg) spacing between distinct sections or cards.
- **Reflow:** On larger mobile devices or foldables, cards should expand to fill width until reaching a maximum content width of 600px, at which point they center.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** supplemented by **Ambient Shadows**.

1.  **Level 0 (Base):** Midnight Blue (#191970). This is the "floor" of the application.
2.  **Level 1 (Cards/Containers):** Indigo Ink (#282C35). These surfaces appear to float slightly above the base.
3.  **Shadows:** Shadows are soft, using a deep Indigo tint instead of pure black to maintain color harmony. Use a Blur of 12px and Y-offset of 4px at 30% opacity.
4.  **Interaction:** When a card is pressed, it should scale down slightly (98%) and the shadow should decrease in spread, simulating physical pressure.

## Shapes

The shape language is friendly yet structured.

- **Primary Radius:** 16px (rounded-lg) is the standard for all main containers and cards to create a soft, approachable feel.
- **Secondary Radius:** 8px (standard) for smaller components like input fields and buttons.
- **Pill Shapes:** Used exclusively for status indicators (e.g., "Active," "Arriving") and the main "Add Alarm" FAB (Floating Action Button).

## Components

- **Buttons:** 
    - *Primary:* Blueberry background with White text. 16px padding (horizontal).
    - *Secondary:* Indigo Ink background with Periwinkle border (1px) and Periwinkle text.
- **Cards:** 16px rounded corners. Background is Indigo Ink. Inside, use 16px padding. Include a subtle 1px border of Periwinkle at 10% opacity to define edges against the Midnight Blue background.
- **Inputs:** 8px rounded corners. Background is a shade darker than the card. Focus state uses a 2px Blueberry border.
- **Location Icons:** Use thick-stroke (2px) line icons. The "Active Tracking" icon should pulse with a Blueberry glow effect.
- **Lists:** Items separated by a thin Periwinkle line (5% opacity). Each list item should have a chevron to indicate navigation.
- **Toggles:** Use the Blueberry color for the "On" state. The toggle handle should be pure White for maximum contrast.
- **Progress Ring:** For distance-to-destination, use a Blueberry stroke on a dark Indigo track.