

## Root Cause Analysis: `requiresVisualData is not defined`

### The Real Problem

The source code is **correct** -- `requiresVisualData` is properly declared in `query-analyzer.ts` and properly accessed in `index.ts`. Four rounds of code fixes haven't resolved this because **the problem is not in the code logic**. The problem is in **how the edge function is deployed/bundled**.

**Evidence:**
- Error happens on **every prompt**, in **both environments**
- The error is a `ReferenceError` (bare variable not found), not `TypeError` (property of undefined)
- Multiple code changes to `index.ts` have had zero effect on the runtime error
- There is a [known Supabase issue](https://github.com/supabase/cli/issues/3831) where edge functions serve stale code despite redeployment

**The edge function `enhanced-ai-chat` has 20+ separate `.ts` files** imported from `index.ts` (query-analyzer.ts, tools.ts, json-parser.ts, etc.). The Supabase edge function deployment guideline states: **"keep all code in index.ts"**. The import of `query-analyzer.ts` -- which declares the `requiresVisualData` variable inside `analyzeQueryIntent()` -- is failing to resolve at runtime in the deployed environment, causing the `ReferenceError`.

### Fix Plan

**Inline the `analyzeQueryIntent` function and `QueryIntent` interface directly into `index.ts`**, removing the import from `query-analyzer.ts`. This eliminates the module resolution dependency that is breaking at deploy time.

#### Step 1: Remove the import
In `index.ts`, remove:
```typescript
import { analyzeQueryIntent } from './query-analyzer.ts';
```

#### Step 2: Copy `QueryIntent` interface and `analyzeQueryIntent` function into `index.ts`
Paste the full `QueryIntent` interface (lines 1-10 of query-analyzer.ts) and the complete `analyzeQueryIntent` function (lines 12-233 of query-analyzer.ts) directly into `index.ts`, near the top of the file after other type definitions.

#### Step 3: Verify no other imports from query-analyzer.ts exist
Search for any other references to `query-analyzer.ts` and ensure they are all resolved.

#### Step 4: Force redeploy
Update the deploy version comment to trigger a fresh deployment.

### Why This Will Work

The error is a runtime import resolution failure. By inlining the code, there is no external module to resolve -- `requiresVisualData` will be a local variable in the same file scope as the code that uses it, guaranteed to be defined.

### Risk Assessment

Low risk. The function body is being moved, not changed. All logic remains identical. The `query-analyzer.ts` file can be kept for reference but will no longer be imported.

