

# Fix: Redeploy enhanced-ai-chat + Harden all switch cases

## Problem
The `enhanced-ai-chat` Edge Function is **still crashing** with:
```
SyntaxError: Identifier 'solQuery' has already been declared (tools.ts:908)
```

The source code fix (adding `{ }` braces to `get_solutions` and `get_competitor_solutions`) was applied in the last round, but the **deployment did not take effect**. The function is still running the old code.

## Root Cause
The previous deployment either failed silently or was cached. The fix exists in source but isn't live.

## Plan

### 1. Add braces to ALL remaining unbraced case blocks (defensive hardening)
These cases currently lack `{ }` and will break if any future case reuses a variable name:
- `get_content_items` (line 664)
- `get_keywords` (line 679)
- `get_proposals` (line 692)
- `get_seo_scores` (line 719)
- `get_serp_analysis` (line 731)
- `get_competitors` (line 743)

Wrap each in `case 'name': { ... }` blocks.

### 2. Force redeploy the edge function
Re-deploy `enhanced-ai-chat` to ensure the fixed code actually goes live.

### 3. Verify via logs
Check edge function logs after deployment to confirm no more boot errors.

### Files changed
| File | Change |
|---|---|
| `supabase/functions/enhanced-ai-chat/tools.ts` | Add `{ }` braces to 6 unbraced case blocks |

### Impact
This fixes the complete inability of the AI chat to access any backend data (solutions, company info, competitors, content items, etc.).

