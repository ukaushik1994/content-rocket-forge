

# Fix: Edge Function Crash + Remove "What can you access?" Button

## Root Cause

The `enhanced-ai-chat` edge function is **completely broken** — it fails to boot with:
```
Uncaught SyntaxError: Identifier 'solQuery' has already been declared (tools.ts:908)
```

Two `case` blocks in the same `switch` scope both declare `let solQuery`:
- Line 707: `case 'get_solutions'` → `let solQuery = ...`
- Line 767: `case 'get_competitor_solutions'` → `let solQuery = ...`

JavaScript switch/case shares scope across cases, so the second `let solQuery` is a redeclaration error. This means **every single chat message has been failing** since the last deployment — the AI literally cannot respond with any tool-backed data.

## Fix

### File: `supabase/functions/enhanced-ai-chat/tools.ts`

**Wrap both case blocks in braces** to create independent block scopes:

- `case 'get_solutions': { let solQuery = ...; return ...; }`  (lines 706-716)
- `case 'get_competitor_solutions': { let solQuery = ...; return ...; }` (lines 766-807)

This is the standard fix for `let`/`const` in switch cases.

### File: `src/components/ai-chat/EnhancedQuickActions.tsx`

Remove the "What can you access?" button per user request (line 17).

### Deployment

Re-deploy the `enhanced-ai-chat` edge function after the fix.

## Files Changed

| File | Change |
|---|---|
| `supabase/functions/enhanced-ai-chat/tools.ts` | Add block scoping braces to `get_solutions` and `get_competitor_solutions` case blocks |
| `src/components/ai-chat/EnhancedQuickActions.tsx` | Remove "What can you access?" quick action |

