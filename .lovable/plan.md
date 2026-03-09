

# UI Audit & Redesign Plan — Engage Pages

## The Gold Standard: Keywords Page
The Keywords page sets the bar with:
- **Immersive hero section** — 60vh min-height, centered layout, gradient text title, animated background glow, pill badge, subtle floating animations
- **Quick stat cards** with icons inside glassmorphic containers
- **Quick filter pills** in a blurred container bar with active state highlighting
- **Dedicated filter bar** inside a Card with search, sort, view mode toggle
- **Rich content cards** with hover scale, gradient overlays, usage indicators, expandable content, action buttons
- **AnimatedBackground** component for ambient motion
- **Staggered entrance animations** on all elements
- **max-w-7xl centering** for content sections

## Current Engage Pages: Critique

### Common Issues Across All Engage Pages
1. **EngageHero is tiny** — just a flex row with an icon box and text. No visual impact. No immersive feeling. Compared to Keywords' 60vh hero with gradient text and animated glow, this feels like a breadcrumb.
2. **No AnimatedBackground** — Engage pages lack the ambient particle/gradient background that gives Keywords its premium depth.
3. **Stat cards are functional but small** — EngageStatGrid works but lacks the visual drama of Keywords' centered stat icons with labels.
4. **No quick filter pills** — Keywords has a beautiful filter bar with badges and counts. Engage pages use basic Input search with no visual filter system.
5. **Content lists are plain** — GlassCard rows with inline badges vs Keywords' rich cards with hover effects, gradient overlays, and expandable sections.
6. **Loading states are just text** — "Loading..." string vs Keywords' skeleton cards.

### Per-Page Issues

**Email Dashboard**
- Hero is a single line — no subtitle impact
- TabsList feels cramped with 7 tabs in a small bar
- No overview/summary visualization before tabs
- Missing search/filter above tab content

**Contacts**
- Table view is functional but visually flat — no card alternative
- Filter bar (search + tag badges) is unstyled, plain Input
- Pagination is basic buttons, no visual polish
- Empty state is good but hero area is weak

**Social Dashboard**
- Stat cards use a different pattern than EngageStatGrid (custom GlassCard grid) — inconsistent
- Connected Accounts section is useful but visually dense
- Post list is functional but cards lack the rich hover effects of Keywords
- Too many concerns on one page (publish, inbox, analytics, accounts, calendar)

**Journeys**
- EngageStatGrid with 5 columns gets cramped
- Journey cards are single-row GlassCards — no visual hierarchy, no preview of the flow
- Search bar is bare Input, no surrounding card/container

**Automations**
- Stats use a custom grid (not EngageStatGrid) — inconsistent
- The Recharts analytics section is good but buried
- Card list for automations is dense with badges but no visual breathing room
- Action bar at top has 4 buttons — cluttered

---

## Redesign Plan

### Phase 1: Shared Foundation (3 components)

#### 1A. Create `EngagePageHero` component
A new immersive hero matching Keywords' pattern:
- 40vh height (slightly smaller than Keywords since these are functional pages)
- Centered gradient text title + subtitle
- Animated background glow (reuse AnimatedBackground or inline gradient pulse)
- Pill badge at top (e.g., "Email Marketing", "Social Hub")
- Quick stat row with icon boxes centered below title
- Quick filter pills bar at bottom (optional per page)
- Action buttons integrated

#### 1B. Create `EngageFilterBar` component
Matching Keywords' filter card:
- Card with `bg-background/60 backdrop-blur-xl border-border/50`
- Search input with icon
- Sort dropdown
- View mode toggle (grid/list)
- Refresh button
- `max-w-7xl mx-auto`

#### 1C. Create `EngageContentCard` component
Rich card for list items (journeys, automations, social posts):
- `bg-background/60 backdrop-blur-xl border-border/50`
- Hover scale (1.02) + y shift (-2px)
- Gradient overlay on hover
- Status indicator pill (top-right, like KeywordCard usage count)
- Clean typography hierarchy
- Action buttons row at bottom

### Phase 2: Per-Page Redesign

#### 2A. Email Dashboard
- Replace EngageHero with EngagePageHero (blue/cyan gradient, "Email Marketing Suite" title)
- Add quick filter pills for tab switching (Inbox, Sent, Scheduled, Drafts, Templates, Campaigns, Reports) replacing the cramped TabsList
- Add AnimatedBackground
- Stat cards centered in hero area

#### 2B. Contacts
- Replace EngageHero with EngagePageHero (emerald/teal, "Contact Management")
- Wrap search + tag filters in EngageFilterBar card
- Add grid/list view toggle — card view option for contacts
- Skeleton loading states (not "Loading..." text)
- Styled pagination with page indicators

#### 2C. Social Dashboard
- Replace EngageHero with EngagePageHero (pink/purple, "Social Command Center")
- Unify stat cards to use EngageStatGrid pattern
- Move publish/inbox/analytics tabs into quick filter pills inside hero
- Clean up connected accounts into a collapsible section
- Add skeleton loading

#### 2D. Journeys
- Replace EngageHero with EngagePageHero (purple/blue, "Journey Builder")
- Cap stat grid to 4 columns (merge or prioritize)
- Wrap search in EngageFilterBar
- Journey cards: add mini flow preview (3-dot connector visualization)
- Skeleton loading

#### 2E. Automations
- Replace EngageHero with EngagePageHero (amber/orange, "Automation Engine")
- Consolidate action buttons into hero area cleanly
- Use EngageStatGrid (not custom grid) for stats
- Wrap search in EngageFilterBar
- EngageContentCard for automation items
- Skeleton loading

### Phase 3: Polish
- Add AnimatedBackground to all Engage pages (via EngageLayout or per-page)
- Staggered entrance animations matching Keywords pattern
- `max-w-7xl mx-auto` content centering on all pages
- Consistent empty states with large icon + gradient glow (already partially done)

---

## Files to Create
| File | Purpose |
|------|---------|
| `src/components/engage/shared/EngagePageHero.tsx` | Immersive hero matching Keywords style |
| `src/components/engage/shared/EngageFilterBar.tsx` | Glassmorphic filter/search bar |
| `src/components/engage/shared/EngageContentCard.tsx` | Rich hoverable content card |

## Files to Edit
| File | Change |
|------|--------|
| `src/components/engage/email/EmailDashboard.tsx` | Replace hero, add filter pills, AnimatedBackground |
| `src/components/engage/contacts/ContactsList.tsx` | Replace hero, EngageFilterBar, skeleton loading |
| `src/components/engage/social/SocialDashboard.tsx` | Replace hero, unify stats, restructure layout |
| `src/components/engage/journeys/JourneysList.tsx` | Replace hero, EngageFilterBar, enriched cards |
| `src/components/engage/automations/AutomationsList.tsx` | Replace hero, unify stats, EngageFilterBar |
| `src/components/engage/EngageLayout.tsx` | Add AnimatedBackground |

## Implementation Order
Given the scope, this should be done in 3-4 rounds:
1. Shared components (EngagePageHero, EngageFilterBar, EngageContentCard)
2. Email + Contacts redesign
3. Social + Journeys redesign
4. Automations + final polish

