# Design System: BlogVerse

This is the source of truth for all future frontend pages and components.
The Home page is the canonical reference screen for visual language, component tone, and layout rhythm.

## Project Identity

BlogVerse is a whimsical editorial product with a hand-drawn spirit and modern usability.
Every screen should feel bubbly, expressive, and cosy.

Design intent:
- Storybook warmth, not toy-like UI
- Bold forms and playful accents, balanced with clear reading hierarchy
- Character-rich visuals that still feel production-grade for serious writing

## Home Page As Canon

The Home page defines the brand signature:
- A soft thematic canvas using user-selected background color
- A punchy accent-driven hero with thick borders, rounded geometry, and playful iconography
- Editorial feed cards with cartoon-like outlines and strong typographic titles
- Cheerful supporting modules (trending tags, daily prompt, star authors)
- Decorative but restrained doodle motifs in header and footer

When designing new pages, inherit this exact relationship:
- Structural clarity first
- Personality layered through accent, shape, and icon motion
- Reading comfort preserved through spacing and typography

## Theming Architecture

Use runtime theme values from useThemeStore for all page-level color behavior.

Required pattern:

const theme = useThemeStore((state) => state.getTheme())

Primary runtime tokens:
- theme.primary: main accent color for actions, active states, highlights, and brand moments
- theme.homeBackground: page-level canvas color

Alpha utilities:
- Use hexToRgba(theme.primary, alpha) for borders, tints, shadows, hover fills, separators

Rule:
- Do not introduce fixed hex values for new page-level accents when a theme token can serve the role
- Prefer semantic usage of theme.primary plus opacity variants over one-off custom colors

## Color System And Roles

### Runtime Theme Families

Available themes in themeConfig:
- Plain: primary #334155, background #edf2f9
- Sunshine: primary #d97706, background #fff1c7
- Midnight: primary #4f46e5, background #dfe5ff
- Ocean Breeze: primary #0891b2, background #d8f7ff
- Cotton Candy: primary #db2777, background #ffe0f0
- Forest Adventure: primary #059669, background #daf7e9

Usage:
- Primary is the emotional driver and interaction color
- Home background is the atmospheric canvas
- Settings variants are translucent derivatives for layered settings surfaces

### Supporting Accent Set

Current supporting accents from Tailwind config:
- Accent Orange #f97316
- Accent Teal #2dd4bf
- Secondary Cyan #06b6d4

Usage guidance:
- Use supporting accents as occasional category/topic differentiators
- Keep theme.primary as the dominant brand signal

### Neutral Editorial Scale

Use slate range for text and framing:
- Headline and key UI text: slate-900 range
- Body text: slate-600 to slate-500 range
- Meta and tertiary text: slate-400 to slate-300 range
- Surfaces: white with subtle tinted borders/shadows

## Typography Rules

Base family:
- Plus Jakarta Sans for UI and editorial shell

Display behavior:
- Heavy display weights (700-800) for hero and section headlines
- bouncy-text treatment for key headings and brand labels
- Slightly tightened tracking on expressive headers

Editorial readability:
- Keep body copy moderate in contrast and generous in line-height
- Preserve clear size steps between hero, section titles, card titles, and metadata

Voice in type:
- Friendly, confident, and energetic
- Avoid overly clinical typography or minimalist austerity

## Geometry And Shape Language

Core shape profile:
- Generous rounding across major containers (xl and lg)
- Pill-shaped chips for tags, filters, and compact controls
- Thick strokes for hero and feature modules to preserve cartoon confidence

Component shape intent:
- Hero and major cards: rounded-xl with visible framing
- Chips and badges: rounded-full
- Action buttons: rounded-full for primary actions, rounded-lg or xl for utility controls

## Depth, Shadows, And Layering

Depth style is playful and tactile:
- Prefer visible, readable elevation over ultra-subtle flatness
- Home hero and key cards use pronounced shadow and border combinations
- Primary CTA can use stacked shadow to simulate physical press depth

Layering guidance:
- Decorative icons remain low-opacity and non-interactive
- Content surfaces should remain foreground-dominant and readable
- Use tinted shadows derived from theme.primary for brand cohesion

## Component Stylings

### Navbar

- Sticky top bar with dashed bottom divider
- Brand mark uses slight rotation for hand-drawn personality
- Search input is rounded-pill with tinted background and accent icon
- Navigation text stays minimal while active state is accent-colored

### Hero Section

- Two-column layout on desktop, stacked on smaller screens
- Soft gradient wash derived from theme.primary alpha
- Thick border and rounded frame for visual anchoring
- Bold welcoming headline with accented brand word
- Large, pill CTA with strong shadow depth

### Feed Tabs

- Underline tab model with high-contrast active indicator
- Accent-colored active tab text and border
- Neutral inactive tabs with calm slate tone

### Blog Cards

- White card surface with cartoon-border outline
- Large thumbnail with rounded corners
- Category pill + read-time metadata at top
- Strong title and concise excerpt
- Footer row with author and reaction metrics

### Sidebar Modules

- Trending topics: chip cloud with playful color variety
- Daily prompt: accent-filled card with slight rotation for whimsy
- Star authors: compact profile list, clear follow affordance

### Footer

- Dashed top border and tinted background panel
- Decorative doodles as ambient layer
- Multi-column informational layout with compact social icon buttons

## Motion And Interaction

Interaction behavior should feel buoyant, not flashy:
- Subtle scale-up on hover for buttons/chips where appropriate
- Gentle press-down behavior on primary CTA
- Smooth color transitions on hover/focus
- Keep animation durations short and purposeful

Do not over-animate body text or primary reading surfaces.

## Layout Principles

Desktop rhythm:
- Main content constrained to max-width 1280px
- Comfortable horizontal padding (24px to 40px depending breakpoint)
- Large section spacing to maintain editorial breathing room

Structure pattern:
- Hero first, feed second, sidebar supporting
- Single primary narrative flow with secondary modules to the right
- Consistent vertical rhythm via repeated spacing tokens

Responsive behavior:
- Collapse two-column structures to single-column stacks on smaller screens
- Preserve headline prominence and CTA clarity
- Maintain chip/button tap comfort on touch devices

## Content Tone And Iconography

Voice:
- Warm, imaginative, creator-first language
- Encouraging microcopy over sterile utility phrasing

Icon style:
- Material Symbols Outlined
- Icons support meaning and character, never dominate legibility
- Decorative icons use reduced opacity and stay non-blocking

## Implementation Rules For New Screens

1. Start from theme runtime tokens, not static color picks.
2. Keep one dominant accent (theme.primary) and use support accents sparingly.
3. Preserve rounded, bubbly geometry and tactile borders.
4. Use expressive heading hierarchy with strong readability.
5. Keep page backgrounds soft and atmospheric, never flat and lifeless.
6. Ensure every new screen feels like a sibling of Home, not a separate product.
7. Prioritize clarity of reading and interaction over visual noise.

## Quick Build Checklist

- Uses useThemeStore and theme.primary/theme.homeBackground
- Uses hexToRgba for translucent derivatives
- Preserves BlogVerse shape language (rounded, pill, cartoon-border)
- Includes bold editorial hierarchy and cosy spacing
- Applies playful but restrained interaction motion
- Matches Home page balance: expressive, warm, and readable
