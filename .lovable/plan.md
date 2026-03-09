

# Automations Page — Keywords-Style Visual Overhaul

## Current State
The Automations page uses a compact left-aligned header (icon + title + dropdown), an inline stats bar (`GlassCard`), and `EngageFilterBar` — functional but visually flat compared to the Email Dashboard's new immersive hero.

## Plan — 1 File

### Transform the header section (lines 662–797) to mirror the Email/Keywords centered hero layout:

**1. Centered Hero with Glassmorphic Badge**
- Replace the compact `flex items-center justify-between` header with a centered hero section
- Glassmorphic badge pill: `Zap` icon + "Automation Hub" + pulsing amber dot
- Large gradient title: `text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-amber-500 to-orange-500 bg-clip-text text-transparent`
- Centered subtitle paragraph
- Centered action buttons (New Automation, Templates, Run Now) with glassmorphic styling and hover animations

**2. Centered Stats as Glassmorphic Icon-Cards**
- Replace the inline stats bar with centered glassmorphic stat cards (like Email Dashboard)
- 4 cards: Active, Paused, Total Runs, Success Rate — each with icon, value, and label
- `bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl` styling

**3. Glassmorphic Filter Bar**
- Keep existing `EngageFilterBar` but wrap in the same centered layout
- Status filter pills (All/Active/Paused) stay but get the same glassmorphic treatment

**4. Staggered Entry Animations**
- Badge: delay 0, Title: delay 0.2, CTAs: delay 0.4, Stats: delay 0.6, Filters: delay 0.8
- Consistent with Email Dashboard timing

**5. Analytics Chart Section**
- Keep the collapsible analytics chart but move the toggle into the stats row area
- Chart container gets the same glassmorphic treatment

### File to edit

| File | Changes |
|------|---------|
| `AutomationsList.tsx` | Replace compact header + stats bar with centered hero, glassmorphic stats cards, animated entry — lines ~662-797 |

1 file. No new dependencies. Same pattern as Email Dashboard overhaul.

