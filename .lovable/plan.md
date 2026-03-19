

# Analyst Sidebar Redesign — Narrative Timeline with Glassmorphism

## What This Is

The uploaded spec describes a "Stitch-style" narrative analyst sidebar where each section is a **numbered story beat** with dynamic headlines, glass data cards, and decision buttons. We'll rebuild the sidebar to follow this pattern using your existing dark theme and glass-card recipe.

## Current vs New

| Current | New |
|---------|-----|
| Dashboard grid layout (metrics, charts, insights all at once) | Vertical narrative timeline — numbered sections that scroll like a story |
| Static section labels | Dynamic headlines with colored keyword highlights based on data state |
| All sections always visible | Conditional sections — only show what's relevant to the user's data |
| No decision prompts | "Narrative Prompt" cards with A/B action buttons that send AI chat messages |

## Design Language (Your Existing Theme)

All elements use your current palette — no new colors introduced:

| Element | Style |
|---------|-------|
| Section numbers | `text-primary` (purple `#9b87f5`) — dot + number + uppercase label |
| Headlines | `text-lg font-semibold text-foreground` with one keyword wrapped in a colored `<span>` (green=`text-emerald-400`, amber=`text-amber-400`, red=`text-red-400`, blue=`text-blue-400`) |
| Data cards | Existing `.glass-card` — `bg-white/[0.06] backdrop-blur-md border-white/[0.1] rounded-2xl` |
| Decision prompt cards | `.glass-card` with a subtle top-glow gradient (`bg-gradient-to-b from-primary/5 to-transparent`) |
| Action buttons | Two buttons side-by-side: primary = `bg-primary/20 text-primary hover:bg-primary/30`, secondary = ghost |
| Insight cards | `.glass-card` with a small colored dot (not left-border) for type indication |
| Charts | Same Recharts setup, wrapped in `.glass-card` |
| Explore pills | `bg-white/[0.04] border border-white/[0.06] rounded-full` |

## The 12 Sections (Conditional)

```text
┌──────────────────────────────────────┐
│  [X] ANALYST                         │  ← header with close
├──────────────────────────────────────┤
│                                      │
│  • 10. PREVIOUS SESSION              │  ← only if previous session data
│  "Continuing from your last session" │
│  [CONTINUE] [START FRESH]            │
│                                      │
│  • 1. HEALTH ASSESSMENT              │  ← always shows
│  "Our health is **thriving**"        │
│  ┌─────────┐ ┌─────────┐            │
│  │Pub Rate │ │Agg Score│            │  ← 2 glass cards max
│  └─────────┘ └─────────┘            │
│  [Decision prompt if critical]       │
│                                      │
│  • 2. PERFORMANCE TRAJECTORY         │  ← if trend data exists
│  "Reach is expanding **organically**"│
│  ┌──────────────────────┐            │
│  │ Area chart + badge   │            │
│  └──────────────────────┘            │
│  Explanatory paragraph               │
│                                      │
│  • 3. STRATEGIC DIVERGENCE           │  ← if anomalies/signals
│  "Anomalies demand **triage**"       │
│  [Insight card stack with dots]      │
│  [Decision prompt if actionable]     │
│                                      │
│  • 4. CONTENT INTELLIGENCE           │  ← if content discussed
│  • 5. KEYWORD LANDSCAPE              │  ← if keywords relevant
│  • 6. CAMPAIGN PULSE                 │  ← if campaigns exist
│  • 7. ENGAGEMENT METRICS             │  ← if engage discussed
│  • 8. COMPETITIVE POSITION           │  ← if competitors exist
│  • 9. GOAL PROGRESS                  │  ← if session goal
│  • 11. WEB INTELLIGENCE              │  ← if web search results
│                                      │
│  • 12. EXPLORE                       │  ← always last
│  "Continue exploring your data."     │
│  [pill] [pill] [pill]                │
│                                      │
└──────────────────────────────────────┘
```

## Implementation Plan

### Step 1: Create section components
Create a new folder `src/components/ai-chat/analyst-sections/` with reusable building blocks:
- **`AnalystSectionWrapper.tsx`** — numbered section container (dot + number + label + headline with highlighted keyword)
- **`NarrativePromptCard.tsx`** — decision card with question text and A/B action buttons
- **`AnalystDataCard.tsx`** — glass metric card (value + label + optional progress bar)
- **`AnalystInsightCard.tsx`** — glass card with colored dot + title + description + arrow

### Step 2: Create individual section components
Each section as its own file for maintainability:
- `HealthAssessmentSection.tsx` (Section 01)
- `PerformanceTrajectorySection.tsx` (Section 02)
- `StrategicDivergenceSection.tsx` (Section 03)
- `ContentIntelligenceSection.tsx` (Section 04)
- `KeywordLandscapeSection.tsx` (Section 05)
- `CampaignPulseSection.tsx` (Section 06)
- `EngagementMetricsSection.tsx` (Section 07)
- `CompetitivePositionSection.tsx` (Section 08)
- `GoalProgressSection.tsx` (Section 09)
- `PreviousSessionSection.tsx` (Section 10)
- `WebIntelligenceSection.tsx` (Section 11)
- `ExploreSection.tsx` (Section 12)

Each section receives `analystState` + `onSendMessage` and internally decides its headline variant, data cards, and whether to show a narrative prompt.

### Step 3: Create section orchestrator
- **`AnalystNarrativeTimeline.tsx`** — reads `analystState` and conditionally renders sections in the correct order (10→1→2→3→4-8→9→11→12). Handles the "which sections appear by user state" logic from the spec.

### Step 4: Refactor VisualizationSidebar
Replace the current dashboard-style content in `VisualizationSidebar.tsx` with `<AnalystNarrativeTimeline />` when in analyst mode. Keep the existing panel-switching logic (Content Wizard, Proposals, etc.) unchanged.

### Step 5: Dynamic headline logic
Each section component contains a `getHeadline()` function that returns the headline text + highlighted keyword + color based on the data conditions defined in the spec.

## Files

| Action | File |
|--------|------|
| Create | `src/components/ai-chat/analyst-sections/AnalystSectionWrapper.tsx` |
| Create | `src/components/ai-chat/analyst-sections/NarrativePromptCard.tsx` |
| Create | `src/components/ai-chat/analyst-sections/AnalystDataCard.tsx` |
| Create | `src/components/ai-chat/analyst-sections/AnalystInsightCard.tsx` |
| Create | `src/components/ai-chat/analyst-sections/HealthAssessmentSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/PerformanceTrajectorySection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/StrategicDivergenceSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/ContentIntelligenceSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/KeywordLandscapeSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/CampaignPulseSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/EngagementMetricsSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/CompetitivePositionSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/GoalProgressSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/PreviousSessionSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/WebIntelligenceSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/ExploreSection.tsx` |
| Create | `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx` |
| Modify | `src/components/ai-chat/VisualizationSidebar.tsx` — swap analyst content to use `AnalystNarrativeTimeline` |

This is a large change (17 new files + 1 modification). I'd recommend implementing it in phases — starting with the 4 building-block components + Section 01 (Health) + Section 12 (Explore) + the orchestrator, then adding remaining sections incrementally.

