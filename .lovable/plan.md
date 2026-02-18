

# Landing Page Hero Redesign — Category-Driven Showcase

## Vision

Replace the current generic "Self-Learning Content Engine" hero with a structured showcase that communicates the 5 product pillars visitors will encounter once logged in: **Content**, **Marketing**, **Audience**, **Analytics**, and **AI Chat** (the central command). Each pillar gets its own themed glassmorphic card with a distinct color from the palette, arranged in a visually striking layout.

The AI Chat is positioned as the central nervous system — "do everything from one conversation" — while the other 4 categories show the manual control surfaces.

## Theme Colors per Category

| Category | Color | Tailwind Token |
|----------|-------|----------------|
| Content | Purple (primary) | `primary` / `neon-purple` (#9b87f5) |
| Marketing | Pink | `neon-pink` (#D946EF) |
| Audience | Blue | `neon-blue` (#33C3F0) |
| Analytics | Orange | `neon-orange` (#F97316) |
| AI Chat (hero center) | Gradient (purple to blue) | `from-primary to-neon-blue` |

## Layout Structure

```text
+-------------------------------------------------------+
|  Badge: "Your Content Operating System"                |
|                                                        |
|  Headline: "One Platform.                              |
|             Every Content Operation."                  |
|  Subtitle: Take action from AI Chat or dive into      |
|            each module directly.                       |
|                                                        |
|  [Start Free]  [See How It Works]                     |
+-------------------------------------------------------+
|                                                        |
|  +--AI Chat Card (wide, centered)--+                  |
|  | gradient border, glass bg       |                  |
|  | "Command everything from one    |                  |
|  |  conversation"                  |                  |
|  | sparkle icon + 3 capability     |                  |
|  | chips                           |                  |
|  +----------------------------------+                  |
|                                                        |
|  +--Content--+  +--Marketing-+  +--Audience--+  +--Analytics--+
|  | purple    |  | pink       |  | blue       |  | orange      |
|  | glass     |  | glass      |  | glass      |  | glass       |
|  | icon+3    |  | icon+3     |  | icon+3     |  | icon+3      |
|  | features  |  | features   |  | features   |  | features    |
|  +-----------+  +------------+  +------------+  +-------------+
|                                                        |
|  Trust indicators row                                  |
+-------------------------------------------------------+
```

## Detailed Changes

### 1. LandingHero.tsx — Complete Rewrite

**Remove:**
- Rotating `heroMessages` array and `AnimatePresence` headline cycling
- `FloatingKeywords` background component (visual noise for new positioning)
- `HeroDashboardPreview` right-column visual (replaced by category cards)
- Two-column `grid lg:grid-cols-2` layout
- Stats row (Early Access / 4.9 / AI-Powered)

**New structure — single centered column:**

**Top section:**
- Badge: `bg-primary/10 border border-primary/20` pill with Brain icon — "Your Content Operating System"
- Headline: `text-5xl lg:text-6xl font-bold text-foreground` — "One Platform." then line break with gradient text `bg-gradient-to-r from-primary via-neon-blue to-neon-pink` — "Every Content Operation."
- Subtitle: `text-lg text-muted-foreground` — "Take action from AI Chat, or dive into each module directly. Create, market, analyze, and grow — all in one place."
- CTA buttons: Primary `bg-gradient-to-r from-primary to-neon-blue` + outline `border-primary/30`

**AI Chat hero card (full-width, glassmorphic):**
- Container: `bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl` with a subtle gradient glow behind it (`bg-gradient-to-r from-primary/15 to-neon-blue/15 blur-3xl` as absolute positioned pseudo-element)
- Left side: `MessageSquare` icon in a `bg-gradient-to-r from-primary to-neon-blue` circle + title "AI Chat — Your Command Center" in `text-foreground` + description "Create content, launch campaigns, analyze performance, and manage your audience — all from a single conversation."
- Right side: 3 small glass chips showing capabilities: "Write a blog post", "Launch email campaign", "Show me analytics" — each with `bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-2`

**4 Category Cards (grid-cols-2 on mobile, grid-cols-4 on desktop):**

Each card is a `GlassCard` with the category's accent color:
- Container: `bg-white/[0.03] backdrop-blur-md border border-{color}/20 rounded-2xl p-6 hover:border-{color}/40 transition-all`
- Top: Icon in a `bg-{color}/10 rounded-xl p-3` container with `text-{color}` icon color
- Title: `text-foreground font-semibold text-lg`
- 3 feature bullets: each with a small `text-{color}` check icon and `text-muted-foreground text-sm`
- Bottom: small label like "5 tools" in `text-{color}/60 text-xs`

Card data:

| Card | Icon | Features |
|------|------|----------|
| Content | `Puzzle` (primary) | AI Writer, Keyword Research, Content Strategy |
| Marketing | `Send` (neon-pink) | Email Campaigns, Social Publishing, Automations |
| Audience | `Users` (neon-blue) | Contact Management, Smart Segments, Activity Feed |
| Analytics | `BarChart3` (neon-orange) | Performance Dashboards, Content Insights, ROI Tracking |

**Trust indicators row (kept, simplified):**
- 3 inline items with themed icons: `Star` (primary), `Users` (neon-blue), `RefreshCw` (neon-pink)

### 2. Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/landing/LandingHero.tsx` | Full rewrite — new category-based hero |

No other files change. The rest of the landing page sections (ProblemSolution, ValuePropositions, FeaturesCarousel, etc.) remain untouched.

### 3. Glassmorphism Standards (matching existing `GlassCard`)

All cards use:
- `bg-white/[0.03]` base with `backdrop-blur-md`
- `border border-white/[0.06]` default, category color on hover (`hover:border-{color}/30`)
- `shadow-sm` on rest, no heavy shadows
- Subtle hover lift: `hover:-translate-y-0.5 transition-all duration-300`
- No `whileHover scale` animations — flat and still (Apple-inspired)

### 4. Color Usage Philosophy

This is NOT monotone. Each category card has its signature color for:
- Icon background tint (`bg-{color}/10`)
- Icon color (`text-{color}`)
- Border hover state (`hover:border-{color}/30`)
- Feature check icons (`text-{color}/70`)
- Bottom label (`text-{color}/60`)

The AI Chat card uses the full gradient (`from-primary to-neon-blue`) for its icon circle and a gradient glow behind it.

The headline uses the tri-color gradient (`from-primary via-neon-blue to-neon-pink`) for the highlighted text.

### 5. Responsive Behavior

- **Desktop (lg+)**: 4 category cards in a row, AI Chat card full-width above them
- **Tablet (md)**: 2x2 grid for category cards
- **Mobile**: Single column stack — AI Chat card then 4 cards stacked vertically
- All text centers on mobile, left-aligns on desktop

