---
name: Midnight Transit
colors:
  surface: '#11131a'
  surface-dim: '#11131a'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e15'
  surface-container-low: '#191b22'
  surface-container: '#1d1f26'
  surface-container-high: '#282a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c3c6d6'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2e3038'
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
  tertiary: '#c3c6d2'
  on-tertiary: '#2c3039'
  tertiary-container: '#8d909c'
  on-tertiary-container: '#262a33'
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
  tertiary-fixed: '#dfe2ee'
  tertiary-fixed-dim: '#c3c6d2'
  on-tertiary-fixed: '#181c24'
  on-tertiary-fixed-variant: '#434750'
  background: '#11131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353c'
typography:
  display-time:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
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
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  margin-mobile: 20px
  margin-desktop: 48px
  gutter: 16px
---

## Brand & Style
The design system is centered on the concept of a "Sleep/Travel Companion." It facilitates a sense of security for commuters and travelers who need to rest without the anxiety of oversleeping their destination. 

The aesthetic is **Flat Modernism**, characterized by a deep, dark environment that minimizes eye strain during night travel or early mornings. By intentionally avoiding gradients and drop shadows, the UI achieves a "digital matte" finish that feels calm and dependable. The visual language relies on structural clarity, generous negative space, and subtle high-contrast borders to define hierarchy, ensuring the user feels in control even when semi-conscious.

## Colors
The palette uses a monochromatic foundation of deep blues to maintain a restful atmosphere. 
- **Primary (Blueberry):** Reserved for the most critical actions, such as "Set Alarm" or active toggle states.
- **Secondary (Periwinkle):** Used for supporting information, icons, and secondary text to provide legible contrast against the dark background.
- **Background (Midnight Blue):** The immersive base layer of the application.
- **Surface (Indigo Ink):** Used for cards and containers to create a clear distinction from the background without using shadows.
- **Borders:** A slightly lighter indigo is used for 1px outlines to define interactive zones.

## Typography
This design system utilizes **Inter** for its exceptional legibility and systematic feel. 
- **Display Time:** A massive, semi-bold weight used specifically for the "Estimated Arrival" or "Current Time" to ensure it is readable at a glance.
- **Headlines:** Clean and tight tracking for a modern, tech-forward look.
- **Labels:** Uppercase tracking is applied to small labels to differentiate them from body text without increasing size.
- **Readability:** All text must meet WCAG AA standards against the Midnight Blue and Indigo Ink surfaces.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high internal padding to prevent the UI from feeling "cramped," which can cause user anxiety. 
- **Rhythm:** A strict 8px baseline grid is used.
- **Margins:** Mobile views use a 20px safe area to ensure touch targets for buttons are easy to hit while walking or on a moving vehicle.
- **Structure:** Content is housed in "Floating Containers" (Indigo Ink surfaces) that span the full width or 2-column segments, keeping related data (like "Destination" and "Distance") grouped logically.

## Elevation & Depth
In accordance with the "Flat" requirement, depth is achieved solely through **Tonal Layering** and **Subtle Outlines**:
- **Layer 0 (Base):** Midnight Blue background.
- **Layer 1 (Cards/Sheet):** Indigo Ink surface with a 1px solid border (#3D424D). 
- **Layer 2 (Inputs/Buttons):** These sit "on top" of the surface using higher contrast colors (Blueberry) or thicker 2px strokes for secondary actions.
- **No Shadows:** Shadows are strictly prohibited. Depth is perceived through the contrast of color values.

## Shapes
The shape language is "Hyper-Soft." 
- **Containers:** Large cards and primary buttons use a 24px radius (`rounded-xl`) to feel friendly and organic.
- **Small Elements:** Chips and toggles use a 16px radius (`rounded-lg`).
- **Icons:** Must be outline-style with 1.5pt or 2pt stroke weights. Ends should be rounded to match the UI's corner radii.

## Components
- **Buttons:** Primary buttons are solid Blueberry (#4F86F7) with white text. Secondary buttons are Indigo Ink with a Periwinkle border and text.
- **Status Cards:** Use a 1px border. For the "Active Alarm," the border pulses slowly in Blueberry to show the app is running.
- **Input Fields:** Minimalist fields with only a bottom-border or a very subtle Indigo Ink background. Focus state is indicated by a Blueberry outline.
- **Toggles:** Large, tactile switches that use Periwinkle for the "Off" state and Blueberry for the "On" state.
- **Arrival Progress Bar:** A thick 8px track (Indigo Ink) with a Blueberry fill, using rounded end-caps.
- **Lists:** Items are separated by generous 24px gaps rather than thin divider lines to maintain the "calm" and airy aesthetic.