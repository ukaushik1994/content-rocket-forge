

# Analyst Panel — Plus Menu Integration

## What It Does

Adds an **"Analyst"** item to the chat `+` menu that opens the existing `VisualizationSidebar` in its default chart/analytics mode. When first opened, it shows an empty state prompting the user to ask data questions. As the conversation progresses and the AI generates analytics responses, the sidebar auto-populates with relevant charts, metrics, and insights. The AI's context is enriched with the fact that the Analyst panel is open, so it can proactively provide structured chart data in responses.

## How It Works

The sidebar already renders charts/metrics/insights as its **default mode** (when `visualData.type` is not `content_wizard`, `research_intelligence`, etc.). The "Analyst" toggle simply opens the sidebar with `type: 'analyst'` — which falls through to the default chart view. The key addition is:

1. **Empty state**: When opened via the menu with no chart data, show a clean empty state with suggested prompts
2. **Context injection**: When Analyst is active, flag it in the chat context so the AI knows to return structured `visual_data` 
3. **Coexistence**: Analyst coexists with other panels — opening it replaces what's currently in the sidebar (same swap behavior as Content Wizard vs Research Intelligence)

## Files to Change

### 1. `src/components/ai-chat/PlusMenuDropdown.tsx`
- Add `onAnalyst` prop
- Add "Analyst" menu item with `BarChart3` icon, label "Analyst", description "Charts & insights companion"

### 2. `src/components/ai-chat/ContextAwareMessageInput.tsx`
- Add `onOpenAnalyst` prop
- Pass it to `PlusMenuDropdown` as `onAnalyst`

### 3. `src/components/ai-chat/EnhancedChatInterface.tsx`
- Add `onOpenAnalyst` handler that calls `handleSetVisualization({ type: 'analyst' })`
- Pass it to `ContextAwareMessageInput`
- Track `analystActive` state — set true when Analyst is opened, false when sidebar closes
- Inject analyst context flag into `sendMessage` so the edge function knows to return chart data

### 4. `src/components/ai-chat/VisualizationSidebar.tsx`
- Add `type === 'analyst'` handling — falls through to the default chart view but with a custom empty state
- When `visualData?.type === 'analyst'` and there's no chart data, show a premium empty state with:
  - `BarChart3` icon (48px)
  - Title: "Analyst"
  - Subtitle: "Ask me about your data and I'll visualize it here"
  - 3-4 suggested prompt pills (e.g., "Show content performance", "Campaign health", "Keyword rankings")
  - Clicking a pill sends the message via `onSendMessage`
- When chart data exists (from subsequent AI responses), render the standard chart view

### 5. `supabase/functions/enhanced-ai-chat/index.ts` (context injection)
- When the request includes `analystActive: true`, append a system instruction telling the AI to include structured `visual_data` in responses with chart configurations, metric cards, and insights
- This ensures the AI proactively returns data that auto-populates the sidebar

## Technical Notes
- No new dependencies needed
- No database changes needed
- The sidebar swap behavior is already handled — opening Analyst replaces any current panel
- The auto-open logic in `EnhancedChatInterface` (lines 171-180) already handles updating the sidebar when new messages contain `visual_data`
- The Analyst empty state uses the same `glass-card` styling from Round 1

