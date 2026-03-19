

# Apply Analyst Theme to Remaining Content Wizard Elements

## What's Left

After reviewing all 6 files, the gold labels and glass-card containers were applied in the previous round, but **WizardStepGenerate.tsx** (1592 lines) still has many elements using old `primary`, `bg-muted`, `border-border` styles instead of the analyst glassmorphism palette. The other 5 files are fully themed.

## Changes — `WizardStepGenerate.tsx` only

### 1. Inputs & Textareas (lines 1139, 1155, 1165, 1304, 1314, 1321, 1431)
- Add `bg-white/[0.04] border-white/[0.06]` to Title, Meta Title, Meta Description inputs, refinement input, and editor textarea

### 2. Generate / Regenerate Buttons (lines 1179, 1585)
- Primary "Generate Content" button: `bg-amber-300/20 hover:bg-amber-300/30 text-amber-300 border border-amber-300/30`
- "Regenerate" outline button: add `border-white/[0.06] hover:bg-white/[0.04]`

### 3. Save / Publish Buttons (lines 1510, 1516)
- "Save as Draft": amber accent style instead of default primary
- "Publish" secondary button: glass-card outline style

### 4. Tabs (TabsList/TabsTrigger, lines 1218-1224)
- TabsList: `bg-white/[0.04] border border-white/[0.06]`
- Active TabsTrigger: `data-[state=active]:bg-white/[0.08] data-[state=active]:text-amber-300`

### 5. Collapsible Triggers (lines 1049, 1378, 1453)
- Quality Report, Compliance, SEO Checklist triggers: wrap in `glass-card` pill style `bg-white/[0.04] border border-white/[0.06] rounded-2xl px-3 py-2`

### 6. AI Quality Grade Badge (lines 1336-1343)
- Replace `bg-primary/15 text-primary border-primary/30` grades with:
  - A: `bg-emerald-400/15 text-emerald-400 border-emerald-400/30`
  - B: `bg-amber-300/15 text-amber-300 border-amber-300/30`
  - C/D: keep yellow/destructive

### 7. Progress bars (lines 1190, 1367, 1401)
- Already partially themed (generation progress uses amber). Quality/Compliance progress bars: style track as `bg-white/[0.06]`

### 8. Repurpose Buttons (lines 1108-1116)
- Replace `border-border/30 bg-muted/30 hover:bg-primary/5 hover:border-primary/30` with `bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] hover:border-amber-300/30`

### 9. Success Screen (lines 1032-1123)
- "What's next?" buttons: add `border-white/[0.06]` outline style
- "Continue Editing" default button: amber accent
- Loading spinners: replace `text-primary` with `text-amber-300`

### 10. Badges (lines 1227-1263)
- Word count Badge: `bg-white/[0.04] border-white/[0.06] text-muted-foreground/70`
- Reading time Badge: same glass micro-pill style

### 11. SEO Check icons (lines 1064, 1465)
- Replace `text-primary` checkmarks with `text-emerald-400`

## Scope
- 1 file modified: `WizardStepGenerate.tsx`
- Purely cosmetic — no logic changes
- ~25 class string replacements across the file

