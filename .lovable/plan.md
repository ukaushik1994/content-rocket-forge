

# Apple Design Refinement Plan — Creaiter

Based on the DOM audit, the core problem is **5 different card recipes across 10 pages**, inconsistent typography hierarchy, and missing motion. The essence — dark theme, glassmorphism, bold heroes — stays. We unify and polish.

## Scope

This is a large effort. I recommend splitting into **3 implementation rounds** to keep changes reviewable and avoid regressions.

---

## Round 1: Design Token Unification (Foundation)

### 1A. Unified Card System in `index.css`

The existing `.glass-card` class is already close to the audit's "gold standard" (Repository-style). Update it to be THE single card recipe:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-card-hover {
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}
```

### 1B. Standardize border-radius

All inline card styles across pages need to use `rounded-2xl` (16px) consistently. Email page uses `12px` — fix to `16px`.

### 1C. Page-by-page card migration

Replace inline card styles on these pages to use `glass-card`:
- **Email** (`rgba(9,9,11,0.3)` + `blur(4px)` → `glass-card`)
- **Social/Contacts/Automations/Journeys** (`rgba(9,9,11,0.6)` + `blur(24px)` → `glass-card`)
- **Keywords** (solid `rgb(9,9,11)` → `glass-card`)
- **Campaigns** (no card wrapping → add `glass-card` wrappers)
- **Calendar** (already close, minor tweak to match)

**Files affected:** `Engage.tsx` sub-components, keyword cards, campaign content containers, calendar card wrapper. Each page's main content components need identification and update.

### 1D. Typography scale

Add CSS custom properties and utility classes in `index.css`:
- `--type-hero: 34px` / weight 700 / letter-spacing `-0.02em`
- `--type-title: 22px` / weight 600
- `--type-headline: 17px` / weight 500
- `--type-body: 15px` / weight 400
- `--type-subhead: 13px` / weight 400
- `--type-caption: 11px` / weight 400

Create `.text-hero`, `.text-title`, `.text-headline` utility classes. Apply to section headers across pages (sidebar labels already addressed in previous work).

### 1E. Sidebar depth

Add a `1px` right border on the sidebar: `border-right: 1px solid rgba(255, 255, 255, 0.06)`.

---

## Round 2: Motion & Depth

### 2A. Page transitions

Add a `fadeUp` animation to page content wrappers — `0.3s` ease with `translateY(8px)` origin. Apply via a shared `PageContainer` wrapper or directly on each page's root `motion.div`.

### 2B. Card entrance stagger

On list pages (Repository, Keywords, Campaigns), add staggered `fadeUp` with `0.05s` delay per card using framer-motion's `staggerChildren`.

### 2C. Button micro-interactions

Add `active:scale-[0.97]` and `transition-transform duration-100` to the base Button component.

### 2D. Tab transitions

For segmented controls / tab switches, add an animated underline or pill indicator using framer-motion `layoutId`.

---

## Round 3: Hero Elevation & Empty States

### 3A. Hero refinement

For each page hero section (kept as-is per user request), refine:
- Title: `34px` / `700` / `-0.02em` letter-spacing / `line-height: 1.1`
- Subtitle: `17px` / `400` / `60%` opacity
- Gradient: replace hard stops with `radial-gradient` ambient glow
- Feature pills: `glass-card` style with `9999px` radius

### 3B. Empty states

Create a reusable `EmptyState` component with:
- 48x48 icon
- Title at `22px/600`
- Description at `15px/400/60%` opacity
- Primary CTA button + optional secondary text link

Apply to: Email tabs, Social, Contacts, Analytics, Calendar empty days.

---

## Technical Notes

- The existing `.glass-card` in `index.css` (line 164) will be updated as the single source of truth
- The existing `.glass-panel` can remain for layout panels (sidebar, modals) vs content cards
- `card-3d` and `holographic-border` classes are too heavy for Apple aesthetic — will not be removed but won't be used on standardized cards
- framer-motion is already installed and used extensively — no new dependencies needed
- Total estimated files to touch: ~30-40 across all 3 rounds

