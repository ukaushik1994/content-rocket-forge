

# Redesign Engage Hero Sections to Match Automations Style

## Current State
- **Automations**: Custom inline hero with amber/orange gradient, centered layout, glass-card badge, gradient title, action buttons with colored gradient, stat cards with colored icons. Looks great (the screenshot).
- **Journeys, Contacts, Social**: Use generic `EngagePageHero` component — similar structure but uses `text-primary` for everything (no unique color identity).
- **Email**: Custom inline hero — uses primary/blue gradient, similar structure but slightly different spacing.

## Plan

Replace the generic `EngagePageHero` usage in Journeys, Contacts, and Social with custom inline heroes matching the Automations pattern. Update Email's existing custom hero to follow the same pattern. Each gets a unique color scheme.

### Color Assignments
| Page | Gradient Colors | Icon Color | Glow Color |
|------|----------------|------------|------------|
| Automations | amber-500 → orange-500 | text-amber-400 | amber-500/[0.06] |
| Email | blue-400 → cyan-400 | text-blue-400 | blue-500/[0.06] |
| Journeys | purple-400 → violet-500 | text-purple-400 | purple-500/[0.06] |
| Contacts | emerald-400 → teal-400 | text-emerald-400 | emerald-500/[0.06] |
| Social | pink-400 → rose-500 | text-pink-400 | pink-500/[0.06] |

### Changes per file

**1. `src/components/engage/email/EmailDashboard.tsx`** (lines 96-200)
- Change ambient glow from `primary/10...blue-500/10` to `blue-500/[0.06]` radial centered glow
- Change badge icon color to `text-blue-400`
- Change title gradient to `from-foreground via-blue-400 to-cyan-400`
- Change CTA button gradient to `from-blue-400 to-cyan-400`
- Change stat icon colors to `text-blue-400`
- Match spacing/animation delays to Automations pattern

**2. `src/components/engage/journeys/JourneysList.tsx`** (lines 327-380)
- Replace `<EngagePageHero>` with inline hero matching Automations structure
- Purple/violet color scheme
- Badge: GitBranch icon + "Journey Builder" + green dot
- Title: "Journeys" with gradient `from-foreground via-purple-400 to-violet-500`
- Keep existing action buttons (New Journey dialog trigger), restyle primary CTA with `from-purple-400 to-violet-500`
- Keep existing stats, color icons with `text-purple-400`

**3. `src/components/engage/contacts/ContactsList.tsx`** (lines 256-268)
- Replace `<EngagePageHero>` with inline hero matching Automations structure
- Emerald/teal color scheme
- Badge: Users icon + "Contact Management" + green dot
- Title: "Contacts" with gradient `from-foreground via-emerald-400 to-teal-400`
- Keep existing action buttons (Export, Add Contact), restyle with emerald gradient
- Keep existing stats with emerald-colored icons

**4. `src/components/engage/social/SocialDashboard.tsx`** (lines 276-296)
- Replace `<EngagePageHero>` with inline hero matching Automations structure
- Pink/rose color scheme
- Badge: Share2 icon + "Social Command Center" + green dot
- Title: "Social Media" with gradient `from-foreground via-pink-400 to-rose-500`
- Move quickFilters (Publish/Inbox/Analytics tabs) below hero as a separate tab bar (they're functional navigation, not hero content)
- Keep stats with pink-colored icons

### Pattern (matching Automations exactly)
```text
┌─────────────────────────────────────────┐
│          [radial ambient glow]          │
│                                         │
│     ┌─ icon ── Badge Text ── 🟢 ─┐     │
│     └────────────────────────────┘      │
│                                         │
│           Colored Title                 │
│                                         │
│         Muted subtitle text             │
│                                         │
│    [CTA Button]  [Outline]  [Outline]   │
│                                         │
│     📊    📊    📊    📊               │
│     val   val   val   val               │
│     lbl   lbl   lbl   lbl              │
└─────────────────────────────────────────┘
```

### Files changed: 4
- `src/components/engage/email/EmailDashboard.tsx`
- `src/components/engage/journeys/JourneysList.tsx`
- `src/components/engage/contacts/ContactsList.tsx`
- `src/components/engage/social/SocialDashboard.tsx`

