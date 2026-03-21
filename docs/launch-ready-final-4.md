# Launch Ready — Final 4 Fixes

> **For:** Lovable.dev
> **Time:** ~35 min total
> **After this:** Nothing left. Launch clean.

---

## Fix 1: Dynamic Temperature (10 min)

**Why:** User asks "how many articles?" twice → gets different phrasing each time because temperature is 0.7 for everything. Data lookups should be near-deterministic. Content generation should be creative.

**Backend — File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where the AI call params are built (where `temperature` is set — likely hardcoded to 0.7 or 0.5). There may be multiple places. Add this logic BEFORE the AI call:

```ts
// Dynamic temperature based on task type
let requestTemperature = 0.7; // default

// Data lookups — be consistent
if (queryIntent.scope === 'lookup' || queryIntent.scope === 'summary') {
  requestTemperature = 0.2;
}

// Conversational chat — balanced
if (queryIntent.isConversational) {
  requestTemperature = 0.4;
}

// Content generation — be creative
const generationTools = ['generate_full_content', 'improve_content', 'reformat_content', 'repurpose_for_social'];
if (queryIntent.categories?.some((c: string) => c === 'content') &&
    relevantToolNames?.some((t: string) => generationTools.includes(t))) {
  requestTemperature = 0.8;
}
```

Then use `requestTemperature` instead of any hardcoded temperature in the AI call params. Search for every place `temperature:` is set in the file and replace with `requestTemperature` (or pass it through to the ai-proxy call).

**Frontend:** No changes.

**Test:** Ask "how many articles do I have?" twice → same answer. Ask "write me a blog intro about AI" twice → different creative results.

---

## Fix 2: Hide start_content_builder From AI (5 min)

**Why:** AI sometimes calls `start_content_builder` (deprecated) instead of `generate_full_content` or `launch_content_wizard`. The tool still works but gives a worse experience.

**Backend — File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where `toolsToUse` is finalized (after intent filtering, after the `< 3` safety net fix). Add right after:

```ts
// Hide deprecated tools — backend still handles them if called, but AI shouldn't pick them
toolsToUse = toolsToUse.filter((t: any) => t.name !== 'start_content_builder');
```

That's it. One line. The tool still works if called from the frontend directly — we're just removing it from what the AI sees.

**Frontend:** No changes.

**Test:** Ask "write me a blog post" → AI should call `generate_full_content` or `launch_content_wizard`, never `start_content_builder`.

---

## Fix 3: Verify email_campaigns Workspace Filter (5 min)

**Why:** The `email_campaigns` query in the analyst uses `workspace_id` filtering. Need to confirm this actually isolates per user and doesn't show other users' data.

**Frontend — File:** `src/hooks/useAnalystEngine.ts`

Find the `email_campaigns` query in `fetchPlatformData` (~line 1321). It currently looks like:

```ts
const { count } = await supabase
  .from('email_campaigns')
  .select('id', { count: 'exact', head: true })
  .eq('workspace_id', tm.workspace_id);
```

The issue is: what is `tm.workspace_id`? If the workspace lookup fails or returns a shared workspace, it could leak data.

**Add a fallback to user_id:**

```ts
// Try workspace-based filter first, fallback to user_id
let emailCount = 0;
try {
  if (tm?.workspace_id) {
    const { count } = await supabase
      .from('email_campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', tm.workspace_id);
    emailCount = count || 0;
  } else {
    // Fallback: filter by user_id directly
    const { count } = await supabase
      .from('email_campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    emailCount = count || 0;
  }
} catch {
  emailCount = 0;
}
```

Use `emailCount` in the platformData push instead of the raw query result.

**Backend:** No changes.

**Test:** Check the analyst sidebar email campaign count → should match only YOUR campaigns, not all users'.

---

## Fix 4: Content-Based Anomaly IDs (15 min)

**Why:** Same warning ("5 stale drafts") appears multiple times in analyst feed because IDs use `Date.now()` which changes every 2 minutes on refresh.

**Frontend — File:** `src/hooks/useAnalystEngine.ts`

Find every anomaly and cross-signal ID that uses `${now.getTime()}`. Replace with stable content-based IDs:

**Anomalies (in `detectAnomalies` function):**

Find and replace each:

```ts
// Low SEO anomaly:
// FIND:   id: `anomaly-low-seo-${now.getTime()}`
// CHANGE: id: `anomaly-low-seo`

// Stale drafts:
// FIND:   id: `anomaly-stale-drafts-${now.getTime()}`
// CHANGE: id: `anomaly-stale-drafts`

// Empty calendar:
// FIND:   id: `anomaly-empty-calendar-${now.getTime()}`
// CHANGE: id: `anomaly-empty-calendar`

// Stale published content:
// FIND:   id: `anomaly-stale-content-${now.getTime()}`
// CHANGE: id: `anomaly-stale-content`
```

**Cross-signals (in `computeCrossSignals` function):**

```ts
// SEO declining:
// FIND:   id: `cross-seo-declining-${now.getTime()}`
// CHANGE: id: `cross-seo-declining`

// SEO improving:
// FIND:   id: `cross-seo-improving-${now.getTime()}`
// CHANGE: id: `cross-seo-improving`

// Publishing gap:
// FIND:   id: `cross-publish-gap-${now.getTime()}`
// CHANGE: id: `cross-publish-gap`

// Topic concentration:
// FIND:   id: `cross-topic-concentration-${now.getTime()}`
// CHANGE: id: `cross-topic-concentration-${kw}`
// (keep the keyword variable — different keywords = different alerts)

// Cannibalization:
// FIND:   id: `cross-cannibalization-${kw}-${now.getTime()}`
// CHANGE: id: `cross-cannibalization-${kw}`

// Keyword ratio:
// FIND:   id: `cross-keyword-ratio-${now.getTime()}`
// CHANGE: id: `cross-keyword-ratio`

// Accountability:
// FIND:   id: `cross-accountability-${now.getTime()}`
// CHANGE: id: `cross-accountability`

// Seasonal gap (if still exists):
// FIND:   id: `cross-seasonal-gap-${now.getTime()}`
// CHANGE: id: `cross-seasonal-gap`
```

The pattern: remove `${now.getTime()}` from every ID. Keep any variable part that makes the alert unique (like keyword name). Remove the timestamp part that makes it change every refresh.

**Backend:** No changes.

**Test:** Open analyst sidebar → wait 5 minutes → anomaly list should NOT have duplicate warnings. Each warning appears once.

---

## Summary

| # | Fix | File | Backend | Frontend | Time |
|---|-----|------|---------|----------|------|
| 1 | Dynamic temperature | `enhanced-ai-chat/index.ts` | Yes | No | 10 min |
| 2 | Hide deprecated tool | `enhanced-ai-chat/index.ts` | Yes | No | 5 min |
| 3 | Email campaigns filter | `useAnalystEngine.ts` | No | Yes | 5 min |
| 4 | Anomaly IDs stable | `useAnalystEngine.ts` | No | Yes | 15 min |
| **Total** | | **2 backend, 1 frontend** | | | **35 min** |

**After this: launch clean. Nothing blocking.**
