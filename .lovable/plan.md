

# Refine Analyst Sidebar: Minimal Premium Theme

## What's changing
Replace the amber/gold color scheme across all analyst section components with the primary theme color (blue/purple `text-primary`) used in the AI chat hero. Reduce sizing for a tighter, more minimal feel.

## Core component changes

### 1. `AnalystSectionWrapper.tsx` — Section labels
- Section label: `text-amber-300/70` → `text-primary/50`
- Headline: `text-2xl` → `text-lg`, `mb-6` → `mb-3`, `mb-3` → `mb-2`
- Content gap: `space-y-4` → `space-y-3`

### 2. `AnalystDataCard.tsx` — Data cards
- Progress colors: all `amber-300` references → `primary/60` (keep green/red semantic)
- Blue color map entry: `bg-amber-300/60` → `bg-primary/50`
- Card padding: `p-5` → `p-3.5`
- Value size: `text-2xl` → `text-lg`

### 3. `AnalystInsightCard.tsx` — Insight cards
- Icon color: `text-amber-300/70` (amber/blue) → `text-primary/60`
- Icon container: `w-10 h-10` → `w-8 h-8`
- Card padding: `p-4` → `p-3`

### 4. `NarrativePromptCard.tsx` — Prompt cards
- Border accent: `border-cyan-400/40` → `border-primary/30`
- Card padding: `p-5` → `p-3.5`
- Button padding: `py-2.5` → `py-2`

### 5. All section files — Headline accent spans
Replace `text-amber-300` with `text-primary/80` in headline highlights across:
- `HealthAssessmentSection.tsx`
- `GoalProgressSection.tsx`
- `KeywordLandscapeSection.tsx`
- `StrategicDivergenceSection.tsx`
- `CompetitivePositionSection.tsx`
- `PreviousSessionSection.tsx`
- `ExploreSection.tsx`
- `WebIntelligenceSection.tsx`
- `StrategicStanceSection.tsx` (amber → primary, keep rose/emerald/cyan semantic)
- `CampaignPulseSection.tsx`

### 6. `GoalProgressSection.tsx` — Milestone dots
- `bg-amber-300/60` → `bg-primary/50`

### 7. `HealthAssessmentSection.tsx` — Progress bars
- `bg-amber-300/50`, `bg-amber-300/40` → `bg-primary/50`, `bg-primary/40`

## Files changed (18 files)
All in `src/components/ai-chat/analyst-sections/`:
- `AnalystSectionWrapper.tsx`
- `AnalystDataCard.tsx`
- `AnalystInsightCard.tsx`
- `NarrativePromptCard.tsx`
- `HealthAssessmentSection.tsx`
- `GoalProgressSection.tsx`
- `KeywordLandscapeSection.tsx`
- `StrategicDivergenceSection.tsx`
- `CompetitivePositionSection.tsx`
- `PreviousSessionSection.tsx`
- `ExploreSection.tsx`
- `WebIntelligenceSection.tsx`
- `StrategicStanceSection.tsx`
- `CampaignPulseSection.tsx`
- `PerformanceTrajectorySection.tsx`
- `ContentIntelligenceSection.tsx`
- `EngagementMetricsSection.tsx`

