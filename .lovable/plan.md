

# Unify Analyst Sidebar Colors to Hero Theme

## Problem
The analyst sidebar still uses `emerald-400` (green), `rose-300/400` (red), and `cyan-400` across headlines, data cards, insight cards, strategic stance, badges, and chart gradients. These should all use the hero's palette: `primary` (#9b87f5 purple), `neon-blue` (#33C3F0), and opacity variations.

## Color mapping
- `text-emerald-400/80` (positive) → `text-primary/80`
- `text-rose-300` (negative/warning) → `text-primary/50` (dimmed primary for contrast)
- `text-cyan-400` → `text-neon-blue`
- `bg-emerald-400/60` → `bg-primary/60`
- `bg-rose-300/60` → `bg-primary/30`
- `border-emerald-400` → `border-primary`
- `border-rose-400` → `border-primary/40`
- Chart gradients: replace `#06b6d4` (cyan) → `#9b87f5`, `#22c55e` (green) → `#33C3F0`

## Files & changes

### 1. `AnalystDataCard.tsx`
- `trendColorMap.up`: `text-emerald-400/80` → `text-primary/80`
- `trendColorMap.down`: `text-rose-300` → `text-primary/50`
- `progressColorMap.green`: `bg-emerald-400/60` → `bg-primary/60`
- `progressColorMap.red`: `bg-rose-300/60` → `bg-primary/30`

### 2. `AnalystInsightCard.tsx`
- `iconColorMap.green`: `text-emerald-400/70` → `text-primary/70`
- `iconColorMap.red`: `text-rose-300/70` → `text-primary/50`
- Urgent label: `text-rose-400` → `text-primary/60`

### 3. `StrategicStanceSection.tsx`
- `stop-creating` config: `text-rose-300` → `text-primary/60`, `bg-rose-400/10` → `bg-primary/10`, `border-rose-400/20` → `border-primary/20`
- `accelerate` config: `text-emerald-400` → `text-neon-blue`, `bg-emerald-400/10` → `bg-neon-blue/10`, `border-emerald-400/20` → `border-neon-blue/20`
- `build-foundation` config: `text-cyan-400` → `text-neon-blue`, `bg-cyan-400/10` → `bg-neon-blue/10`, `border-cyan-400/20` → `border-neon-blue/20`
- Headlines: replace `text-rose-300`, `text-emerald-400/80`, `text-cyan-400` → `text-primary/60`, `text-neon-blue`, `text-neon-blue`

### 4. `HealthAssessmentSection.tsx`
- Headlines: `text-emerald-400/80` → `text-primary/80`, `text-rose-300` → `text-primary/50`
- Factor bars: `bg-rose-300/50` → `bg-primary/30`

### 5. `PerformanceTrajectorySection.tsx`
- Headlines: `text-emerald-400/80` → `text-primary/80`, `text-rose-300` → `text-primary/50`
- Badge: `text-emerald-400/80 border-emerald-400/15 bg-emerald-500/5` → `text-primary/80 border-primary/15 bg-primary/5`
- Badge negative: `text-rose-300 border-rose-300/15 bg-rose-300/5` → `text-primary/50 border-primary/15 bg-primary/5`
- Chart gradients: `#06b6d4` → `#9b87f5`, `#22c55e` → `#33C3F0`, keep `#a855f7`
- Gradient IDs: rename to match

### 6. `ContentIntelligenceSection.tsx`
- Headlines: `text-rose-300` → `text-primary/50`, `text-emerald-400/80` → `text-primary/80`

### 7. `GoalProgressSection.tsx`
- Headlines: `text-emerald-400/80` → `text-primary/80`

### 8. `CompetitivePositionSection.tsx`
- Headlines: `text-emerald-400/80` → `text-primary/80`, `text-rose-300` → `text-primary/50`

### 9. `KeywordLandscapeSection.tsx`
- Headlines: `text-emerald-400/80` → `text-primary/80`, `text-rose-300` → `text-primary/50`

### 10. `StrategicDivergenceSection.tsx`
- Headlines: `text-rose-300` → `text-primary/50`

### 11. `CampaignPulseSection.tsx`
- Headlines: `text-rose-300` → `text-primary/50`, `text-emerald-400/80` → `text-primary/80`

### 12. `EngagementMetricsSection.tsx`
- Headlines: `text-emerald-400/80` → `text-primary/80`

## Result
Every color in the analyst sidebar will use only `primary` (with opacity variations for semantic differences) and `neon-blue` as an accent — matching the AI chat hero gradient palette exactly. No more green, red, or cyan.

