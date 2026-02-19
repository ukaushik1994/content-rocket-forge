

# Fix: Content Wizard Sidebar Not Opening from Chat

## Root Cause

The `launch_content_wizard` tool correctly returns `visualData: { type: 'content_wizard', keyword, ... }` in its tool result. However, this data gets lost because:

1. The tool result is stringified and sent back to the AI for the second call
2. The AI generates a text response ("Opening content wizard...") but does NOT include the `visualData` JSON block in its text
3. The `parseResponseWithFallback` function only extracts `visualData` from JSON blocks inside the AI's text
4. The fallback chart generator (`generateFallbackChartFromToolResults`) has no case for `launch_content_wizard`
5. Result: `visualData` is always `undefined` for this tool, so the sidebar never opens with the wizard

## Fix

Add a **visualData promotion** step in `index.ts` (similar to the existing `promotedActions` pattern) that extracts `visualData` from tool results when the tool itself provides it.

### File: `supabase/functions/enhanced-ai-chat/index.ts`

**Change 1** (~line 2067, inside the tool result promotion loop):

Add logic to extract `visualData` from tool results alongside the existing action promotion:

```
let requestPromotedVisualData: any = null;

// Inside the existing tool result loop:
for (const result of toolResults) {
  try {
    const parsed = JSON.parse(result.content);
    
    // NEW: Promote visualData from tool results (e.g., launch_content_wizard)
    if (parsed?.visualData && !requestPromotedVisualData) {
      requestPromotedVisualData = parsed.visualData;
      console.log('📊 Promoted visualData from tool result:', parsed.visualData.type);
    }
    
    // ... existing action promotion logic ...
  } catch (_e) { /* not JSON, skip */ }
}
```

**Change 2** (~line 2964, where fallback chart data is injected):

Add the promoted visualData as highest priority:

```
// Promoted tool visualData takes priority (e.g., content_wizard)
if (!visualData && requestPromotedVisualData) {
  console.log('📊 Using promoted visualData from tool result');
  visualData = requestPromotedVisualData;
}

// Existing fallback chart logic
if (!visualData && requestFallbackChartData) {
  ...
}
```

**Change 3**: Ensure `content_wizard` type bypasses chart validation/auto-conversion (~line 2585):

The auto-convert logic (`if (visualData && visualData.type !== 'chart'...`) would try to convert or strip the `content_wizard` type. Add an exclusion:

```
if (visualData && visualData.type !== 'chart' 
    && visualData.type !== 'content_wizard'  // <-- NEW
    && chartRequest.type !== 'table_explicit') {
```

## Summary

| File | Change |
|------|--------|
| `index.ts` | Add `requestPromotedVisualData` variable + extraction in tool result loop + injection before fallback + bypass auto-conversion for `content_wizard` type |

Total: ~10 lines changed in 1 file. No new files needed.

After this fix, when a user says "create a blog about AI trends":
1. Intent detector triggers `launch_content_wizard`
2. Tool returns `visualData: { type: 'content_wizard', keyword: 'AI trends' }`
3. **New**: visualData is promoted from tool result to response
4. Frontend receives `visualData.type === 'content_wizard'`
5. `VisualizationSidebar` renders `ContentWizardSidebar` with the 5-step wizard
