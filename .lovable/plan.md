
## AI Chat Failure Audit (Root Cause + What’s Missing)

### 1) What is actually failing
The `enhanced-ai-chat` edge function is failing before normal AI processing, returning:
- `500 Internal server error`
- `details: "requiresVisualData is not defined"`

This is a backend runtime failure, not a frontend rendering issue.

### 2) Primary root cause
The runtime serving your function is **not the same code currently in the repo** (stale/old deployed build).

### 3) Evidence from your code + network
1. Current `enhanced-ai-chat/index.ts` includes `deployVersion` in error responses (lines ~3528-3533).
2. Your real failing network response does **not** include `deployVersion` (it only has `error/message/details`).
3. Current source has no bare `requiresVisualData` symbol usage that should throw in normal execution.
4. Therefore the error is coming from an older deployed artifact still running in Supabase edge, not the latest source snapshot.

### 4) Missing logic/rules/process causing repeated failure
1. **Missing deploy freshness guard**  
   No enforced “runtime version must match source version” check after edge updates.
2. **Missing post-deploy smoke verification**  
   No mandatory immediate test request that validates returned `deployVersion`.
3. **Missing strict deployment workflow**  
   Code edits happened, but runtime did not reliably move to the same build.
4. **Missing user-facing runtime diagnostics**  
   Frontend mostly surfaces generic errors; deploy fingerprint isn’t shown to quickly identify stale runtime.
5. **Missing defensive deployment strategy for large multi-file function**  
   This function has many imports and high complexity; edge deployment drift risk is higher.

### 5) Critical secondary findings (important before redeploy)
In current source, there are latent defects that can become the next runtime crash once fresh code is deployed:
1. `emitProgress(...)` is called outside `doProcessing` scope (around lines ~2087, ~2140), where it is undefined.
2. Several top-level branches return plain objects like `{ data, status }` instead of `Response` (e.g., around ~1937, ~1951, ~1969, ~2078, ~2084). At top-level handler, that is invalid behavior.
3. Duplicate intent logic exists (`index.ts` inlined analyzer + separate `query-analyzer.ts` file), increasing drift/confusion risk.

### 6) Step-by-step remediation plan
1. **Stabilize handler control flow**
   - Ensure all pre-processing that needs progress signaling is inside `doProcessing(emitProgress)`.
   - Remove/replace any out-of-scope `emitProgress` calls.
2. **Normalize return contract**
   - Top-level `serve` handler must always return `Response`.
   - Keep `{ data, status }` only as internal `doProcessing` return shape.
3. **Keep single analyzer source of truth**
   - Continue with inlined `analyzeQueryIntent` in `index.ts`.
   - Stop using `query-analyzer.ts` in runtime path to avoid module-resolution drift.
4. **Add hard runtime fingerprinting**
   - Include `deployVersion` in both success and error payloads consistently.
   - Optionally add `X-Deploy-Version` response header for easy Network inspection.
5. **Redeploy edge function explicitly**
   - Deploy `enhanced-ai-chat` after fixes (not just repo edits).
6. **Verify immediately (required)**
   - Send a test prompt and confirm Network response includes latest `deployVersion`.
   - Confirm no `requiresVisualData` ReferenceError.
7. **Regression checks**
   - Test simple greeting path, normal data query (“Tell me about my solutions”), and one tool/action query.
   - Validate both preview and published domains.

### 7) Expected result after this plan
- Current `requiresVisualData` runtime crash disappears.
- Future stale-runtime incidents become easy to detect within one request.
- Handler becomes structurally safe (no out-of-scope progress function, no invalid return objects), reducing new 500s.

### 8) Implementation priority
1. Fix control-flow defects (`emitProgress` scope + return types)  
2. Add runtime fingerprinting everywhere  
3. Redeploy explicitly  
4. Run end-to-end validation in preview + published
