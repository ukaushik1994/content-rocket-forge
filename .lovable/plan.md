

# Harmonize Content Wizard with Analyst Panel Aesthetic

## Current State
The Content Wizard uses standard shadcn styling: `bg-primary/5` selected states, `border-primary` accents, plain `text-sm font-medium` headings, `Badge variant="outline"`, and generic `bg-muted/50` collapsible triggers. This clashes with the Analyst Panel's premium glassmorphism + warm gold editorial look.

## Design Tokens to Adopt

From the Analyst Panel:
- **Section labels:** `text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70` with leading dot (`w-1 h-1 rounded-full bg-muted-foreground/40`)
- **Cards/containers:** `glass-card` (`bg-white/[0.04] border border-white/[0.06] backdrop-blur-md rounded-2xl`)
- **Selected states:** `bg-white/[0.08] border-amber-300/30` instead of `border-primary bg-primary/5`
- **Badges:** `bg-white/[0.04] border-white/[0.06] text-muted-foreground/70` micro-pills
- **Progress/accents:** Amber gradient (`from-amber-300/60 to-amber-400/40`)

## Changes by File

### 1. `ContentWizardSidebar.tsx` — Shell & Header
- Panel background: replace `bg-background/95` with `bg-[rgba(12,12,18,0.95)] backdrop-blur-xl`
- Header title: use warm gold section label pattern for "Content Wizard"
- **Step indicator:** Replace colored circles with glass-card pills: inactive = `bg-white/[0.04]`, active = `bg-amber-300/20 border-amber-300/30`, completed = `bg-emerald-400/15`. Connector lines use `bg-white/[0.06]` / `bg-amber-300/30`
- Footer nav buttons: outline style with `border-white/[0.06]` ghost, Next button uses amber accent
- Resume draft prompt: restyle to `glass-card` with amber border

### 2. `WizardStepSolution.tsx` — Topic & Solution Step
- Section headings → warm gold uppercase labels with dot prefix
- Solution avatars: replace `border-primary ring-2 ring-primary/30` selected state with `border-amber-300/40 ring-2 ring-amber-300/20`
- Content format grid buttons: replace `border-primary bg-primary/5` with `bg-white/[0.08] border-amber-300/30`; inactive = `bg-white/[0.04] border-white/[0.06]`
- Input field: add `bg-white/[0.04] border-white/[0.06]` styling

### 3. `WizardStepResearch.tsx` — Research Step
- Section header + "selected" badge → analyst palette
- Collapsible triggers: `bg-white/[0.04] border border-white/[0.06]` instead of `bg-muted/50`
- Source badges: keep green/blue distinction but use glass-card micro-pill styling
- Checkboxes: keep functional, update label hover to `hover:bg-white/[0.04]`

### 4. `WizardStepOutline.tsx` — Outline Step
- Outline items: use `glass-card` styling for each draggable row
- Action buttons (Add, Regenerate): ghost style with amber icon accents

### 5. `WizardStepWordCount.tsx` — Config Step
- All option grids (Writing Style, Expertise, Article Type, Word Count): replace `border-primary bg-primary/5` selected with `bg-white/[0.08] border-amber-300/30`; inactive = `bg-white/[0.04] border-white/[0.06]`
- Section headings → warm gold uppercase labels
- Content Brief selects: add glass-card background treatment
- Solution notice banner: restyle from `bg-primary/5 border-primary/20` to `glass-card` with amber Sparkles icon

### 6. `WizardStepGenerate.tsx` — Generate Step
- Progress indicators: amber gradient progress bars
- Quality report cards: use `glass-card` containers
- Action buttons (Save, Publish): keep functional colors but glass-card container treatment
- Tabs: use analyst-style pill indicators

## Scope
- Purely cosmetic — no logic, state, or prop changes
- 6 files modified
- Consistent with existing `.glass-card` / `.glass-card-hover` CSS utilities

