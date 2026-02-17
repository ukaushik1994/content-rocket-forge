

# Fix Plan: Remaining Issues from Today's Implementation

## Issues Found

### Issue 1: `requestPromotedActions` Scoping Bug (CRITICAL)

The variable `requestPromotedActions` is **declared at line 2468** (in the response parsing section), but **assigned at line 2091** (inside the `if (toolCalls)` block that ends at line 2294). Since `let` is block-scoped and the declaration is outside and after the assignment, the assignment at line 2091 either:
- Creates an implicit global (non-strict mode)
- Throws a ReferenceError (strict mode)

Either way, promoted actions from tool results **never reach the response merge** at line 3016.

**Fix:** Move `let requestPromotedActions: any[] = [];` to **before** the `if (toolCalls)` block (around line 1996), so it's in scope for both the assignment (line 2091) and the merge (line 3016).

### Issue 2: `globalThis.__fallbackChartData` Pollution (MODERATE)

Same pattern that was fixed for promoted actions still exists for fallback chart data:
- Set at line 2293: `(globalThis as any).__fallbackChartData = fallbackChartData;`
- Read at line 2962: `if (!visualData && (globalThis as any).__fallbackChartData)`

This has the same race condition risk across requests sharing a Deno isolate.

**Fix:** Replace with a request-scoped `let fallbackChartData` variable declared before the `if (toolCalls)` block and used directly at line 2962.

---

## Files to Modify

| File | Change |
|---|---|
| `supabase/functions/enhanced-ai-chat/index.ts` | Move `requestPromotedActions` declaration before `if (toolCalls)` block; replace `globalThis.__fallbackChartData` with request-scoped variable |

## Technical Details

### index.ts Changes

**Before line 1997** (before `if (toolCalls && toolCalls.length > 0)`), add:
```
let requestPromotedActions: any[] = [];
let requestFallbackChartData: any = null;
```

**Line 2091:** Already correct (`requestPromotedActions = promotedActions;`) -- will now reference the outer declaration.

**Line 2293:** Change from `(globalThis as any).__fallbackChartData = fallbackChartData;` to `requestFallbackChartData = fallbackChartData;`

**Line 2468:** Remove `let requestPromotedActions: any[] = [];` (moved up).

**Lines 2962-2966:** Replace `(globalThis as any).__fallbackChartData` references with `requestFallbackChartData`. Remove the `delete` line (not needed for local variables).

## Deployment
- Redeploy `enhanced-ai-chat` edge function after changes.

## Everything Else is Complete
- ModernActionButtons: fully supports confirm, navigate, send-message, destructive styling
- useEnhancedAIChat: request body format, response field names, colon-separated parsing all correct
- Content Builder sessionStorage bridge: already reads and consumes `contentBuilderPayload`
- Cache invalidation: write tool mapping in tools.ts is complete
- Destructive action safety guard: CONFIRMED prefix check in index.ts is correct
