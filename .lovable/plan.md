

# Email Page — Keywords Page Theme Alignment

## The Gap

The **Keywords page** uses an immersive centered layout: 60vh hero with large gradient text, a glassmorphic badge, centered stats, a CTA button, quick filter pills, and a glassmorphic filter/search bar — all centered with generous spacing.

The **Email page** (screenshot) uses a compact left-aligned header card, a horizontal tab bar, and a bordered content box. It feels like a settings panel, not a feature page.

## Plan — 1 File

### Transform `EmailDashboard.tsx` to mirror Keywords structure:

**1. Replace header card with a centered hero section**
- Glassmorphic badge pill: `Mail` icon + "Email Hub" + pulsing dot (matches Keywords' "Keyword Repository" badge)
- Large gradient title: `text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent` centered
- Subtitle paragraph centered below
- Action buttons (Compose, New Campaign) centered like Keywords' "Create Content" CTA
- Stats row (Threads, Delivery, Active) as centered icon+label cards below CTA

**2. Convert tab bar into Keywords-style quick filters**
- Centered `flex justify-center` with glassmorphic container (`bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50`)
- Each tab styled as a filter pill with icon + label, active state = `bg-primary text-primary-foreground shadow-lg`
- Same hover/tap animations as Keywords filters

**3. Remove bordered content wrapper**
- Content renders directly below filters with `max-w-7xl mx-auto` like Keywords
- No glassmorphic border box around content — let it breathe
- Keep `AnimatePresence` for tab transitions

**4. Add staggered entry animations**
- Badge: delay 0, Hero text: delay 0.2, CTA: delay 0.4, Stats: delay 0.6, Filters: delay 0.8 — matching Keywords page timing

### File to edit
| File | Changes |
|------|---------|
| `EmailDashboard.tsx` | Full restructure to centered hero + filter pills + open content area |

1 file. No new dependencies. Pure layout transformation.

