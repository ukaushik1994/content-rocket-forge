

# Phase 3: AI Chat Completion -- Inline Visualizations + Markdown Fix

## Current Status
The Universal Action Engine is fully wired (streaming + Phase 2 tool execution, confirmation cards, capabilities discovery). However, two critical gaps remain that prevent the AI Chat from feeling "complete":

1. **Tool result visualizations don't render inline** -- When `enhanced-ai-chat` returns charts, metrics, or dashboards, the data is saved on the message but never displayed in the chat bubble.
2. **Markdown tables render as raw pipes** -- The `FormattedResponseRenderer` uses `react-markdown` but tables display as plain text instead of styled HTML tables.

## Plan

### Step 1: Render VisualData Inline in Message Bubbles

The `EnhancedMessageBubble` currently only renders SERP analysis inline. For all other visual data types (charts, metrics, workflows, campaign dashboards, queue status, etc.), the data exists on the message but is only pushed to the sidebar.

**Change in `EnhancedMessageBubble.tsx`**:
- After the normal message content card, add a `VisualDataRenderer` block that renders when `message.visualData` exists and type is NOT `serp_analysis` (which already renders separately).
- Import `VisualDataRenderer` from `./VisualDataRenderer`.
- This gives tool results (charts, metric cards, tables, campaign dashboards) a proper inline visualization right below the text.

### Step 2: Fix Markdown Table Rendering

The `FormattedResponseRenderer` uses `react-markdown` but tables appear as raw pipe-separated text. This is likely because custom `components` overrides for `table`, `thead`, `tbody`, `tr`, `th`, `td` are either missing or broken.

**Change in `FormattedResponseRenderer.tsx`**:
- Add proper `components` prop to the `ReactMarkdown` renderer with styled `table`, `thead`, `tbody`, `tr`, `th`, `td` elements using Tailwind classes.
- Ensure the table container has horizontal scroll for mobile.

### Step 3: Action Buttons from Tool Results

When `enhanced-ai-chat` returns `actions` array, these are saved on the message and rendered by `ModernActionButtons`. However, the `navigate:` prefix in action strings needs to work with the router. Verify `handleAction` in `useEnhancedAIChatDB.ts` handles all action prefixes (`navigate:`, `send:`, `workflow:`). This is already implemented -- just needs verification.

## Technical Details

### File Changes

| File | Change |
|------|--------|
| `src/components/ai-chat/EnhancedMessageBubble.tsx` | Add inline `VisualDataRenderer` for non-SERP visualData on assistant messages (~10 lines) |
| `src/components/ai-chat/FormattedResponseRenderer.tsx` | Add styled `components` overrides for markdown tables in `ReactMarkdown` (~30 lines) |

### EnhancedMessageBubble.tsx -- New Block

After the existing SERP data rendering block (around line 258), add:

```text
// Inline visualization for tool results (charts, metrics, dashboards)
if message.visualData exists AND type !== 'serp_analysis':
  render <VisualDataRenderer data={message.visualData} onAction={...} />
```

This ensures every tool result with visual data (charts, metric cards, campaign dashboards, queue status) renders beautifully inline in the chat.

### FormattedResponseRenderer.tsx -- Table Components

Add a `components` object to `ReactMarkdown` with:
- `table`: Wrapped in a scrollable container with border
- `thead`: With bottom border and background
- `th`: With padding and font-weight
- `td`: With padding and border
- `tr`: With alternating row colors

### What This Enables

After these changes, the AI Chat will:
- Show charts and metric cards inline when tools return visual data
- Render markdown tables as proper styled HTML tables
- Display campaign dashboards and queue status inline
- Keep the sidebar auto-open behavior for expanded views
- Handle all action button clicks (navigate, send message, workflow)

### Testing Plan

1. Ask "Show my content performance" -- should render inline chart + metrics
2. Ask "Create a blog post about AI" -- should execute tool and show success card
3. Ask the AI to compare things (triggers markdown tables) -- should render styled tables
4. Type `/help` -- should show capabilities card
5. Ask "Send an email to test@example.com" -- should show confirmation card

