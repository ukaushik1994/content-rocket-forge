

# Analyst Panel: Continuous Intelligence Companion

## Current State
The Analyst panel is a passive sidebar that only displays data when the AI happens to include `visualData` in its response. The `analystActive` flag tells the backend to include charts, but there is no mechanism for the Analyst to **continuously and proactively** update based on the evolving conversation.

## Problem
1. Analyst only updates when a new assistant message contains `visualData` -- it does not independently analyze the conversation
2. No accumulation of insights across messages -- each response replaces the previous visualization
3. No automatic web search or data-pull triggered by the Analyst independent of the chat response
4. Empty state just shows static prompt pills with no live data

## Proposed Architecture

```text
┌─────────────────────┐     ┌──────────────────────┐
│   Chat Messages     │────▶│  Analyst Aggregator   │
│  (conversation)     │     │  (useAnalystEngine)   │
└─────────────────────┘     │                       │
                            │  - Scans each new msg │
                            │  - Extracts topics    │
                            │  - Accumulates stats  │
                            │  - Triggers data pull │
                            └──────────┬───────────┘
                                       │
                            ┌──────────▼───────────┐
                            │  Analyst Sidebar      │
                            │  - Running insights   │
                            │  - Cumulative metrics │
                            │  - Topic timeline     │
                            │  - Action suggestions │
                            └──────────────────────┘
```

## Changes

### 1. New Hook: `src/hooks/useAnalystEngine.ts`
A dedicated hook that watches the `messages` array and builds a cumulative analyst state:

- **Topic Extraction**: Scans each new message for discussed topics (keywords, competitors, content types, campaigns)
- **Insight Accumulation**: Collects all `visualData`, `metricCards`, `insights`, and `actionableItems` from every assistant message into a running feed -- not just the latest one
- **Contextual Data Fetch**: When new topics appear (e.g., user asks about "email campaigns"), the engine calls Supabase to pull relevant stats (campaign open rates, contact counts, content counts) via lightweight read queries
- **Web Search Digest**: When the AI response includes SERP/web search data, extracts key stats and trends into the analyst feed
- **State Shape**:
  ```typescript
  {
    topics: string[];              // Running list of discussed topics
    insightsFeed: InsightItem[];   // Chronological feed of all insights
    cumulativeMetrics: MetricCard[]; // Aggregated metrics across conversation
    suggestedActions: Action[];    // Context-aware next steps
    dataPoints: DataPoint[];       // All chart-worthy data accumulated
    lastUpdated: Date;
  }
  ```

### 2. Backend: Add `analyst-context` data enrichment in `enhanced-ai-chat/index.ts`
When `analystActive` is true, after the main AI response is generated:

- Extract the topics discussed so far from the conversation
- Query platform data relevant to those topics (content counts, campaign stats, keyword rankings)
- Include a structured `analystContext` object in the SSE `done` payload alongside the existing `visualData`
- This gives the frontend real data to populate the Analyst without relying solely on the AI's text output

### 3. Refactor `VisualizationSidebar.tsx` Analyst mode
Replace the current empty-state + single-visualization pattern with a **continuous feed layout**:

- **Live Insights Feed**: A scrollable list of insight cards that grows as the conversation progresses, showing timestamped entries like "Content performance: 12 articles published this month" or "Email open rate trending up 15%"
- **Cumulative Metric Strip**: Top-level metric cards that aggregate across the conversation (total topics discussed, data points surfaced, actions suggested)
- **Topic Tags**: Visual pills showing what topics have been covered, clickable to filter insights
- **Smart Suggestions**: Context-aware prompts that update based on what hasn't been explored yet (e.g., if user discussed content but not competitors, suggest "How do my competitors compare?")
- **Data Waterfall**: When the AI returns chart data, it stacks in the feed rather than replacing the previous chart

### 4. Wire up in `EnhancedChatInterface.tsx`
- Initialize `useAnalystEngine` with the current `messages` array
- Pass the engine's state to `VisualizationSidebar` as a new `analystState` prop
- When analyst is active, the sidebar switches to feed mode instead of single-chart mode

### 5. Update `useEnhancedAIChatDB.ts`
- Parse the new `analystContext` field from the SSE `done` payload
- Store it on the `EnhancedChatMessage` type so the analyst engine can consume it

## What This Achieves
- Analyst panel becomes a **living dashboard** that builds up intelligence as you chat
- Every message enriches the panel -- no more empty states after the first exchange
- Platform data (content counts, campaign stats, keyword data) is pulled automatically based on conversation topics
- Web search results are distilled into the analyst feed
- The panel accumulates rather than replaces, giving a full session summary

## Files to Create/Modify
- **Create**: `src/hooks/useAnalystEngine.ts`
- **Modify**: `supabase/functions/enhanced-ai-chat/index.ts` (analyst context enrichment)
- **Modify**: `src/components/ai-chat/VisualizationSidebar.tsx` (feed layout for analyst mode)
- **Modify**: `src/components/ai-chat/EnhancedChatInterface.tsx` (wire engine)
- **Modify**: `src/hooks/useEnhancedAIChatDB.ts` (parse analystContext)
- **Modify**: `src/types/enhancedChat.ts` (add analystContext to message type)

