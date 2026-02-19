

# Fix: Content Wizard Steps 3-5 Failing (Outline Empty, Generate Errors)

## Test Results Summary

| Step | Status | Notes |
|------|--------|-------|
| 1. Solution | PASS | Solutions load, selection works |
| 2. Research | PASS | SERP data loads correctly with "AI trends" keyword, FAQs and Content Gaps populated |
| 3. Outline | FAIL | Empty outline -- AI call returns 500 "Unauthorized", but no fallback is shown |
| 4. Words (Meta) | NOT TESTED | Same AI call pattern, likely same failure |
| 5. Generate | NOT TESTED | Same AI call pattern, likely same failure |

## Root Cause

Two separate issues:

### Issue A: Silent failure when AI returns error (Code Bug)

In `WizardStepOutline.tsx` line 67-87, when `supabase.functions.invoke()` returns a 500 error:
- `data` (aliased as `aiResult`) is `null`
- No exception is thrown (Supabase SDK doesn't throw on HTTP errors)
- `content` resolves to `''`, `jsonMatch` is `null`
- Code falls through without setting any outline
- The catch block never fires

The same pattern exists in `WizardStepGenerate.tsx`.

### Issue B: OpenAI API key "Unauthorized" 

The `ai-proxy` successfully retrieves the user's API key via `getApiKey()` but OpenAI rejects it. This is likely a user configuration issue (expired/invalid key), but our code should gracefully handle it.

## Fix

### File 1: `src/components/ai-chat/content-wizard/WizardStepOutline.tsx`

Add a fallback when the AI response is null/empty after the JSON parse attempt:

```typescript
// After line 87 (after the jsonMatch if-block), add an else:
} else {
  // AI failed or returned empty - use fallback outline
  onOutlineChange([
    { id: uuidv4(), title: `Introduction to ${keyword}`, level: 1 },
    { id: uuidv4(), title: `What is ${keyword}?`, level: 2 },
    { id: uuidv4(), title: `Key Benefits and Use Cases`, level: 1 },
    { id: uuidv4(), title: `How to Get Started`, level: 1 },
    { id: uuidv4(), title: `Best Practices`, level: 2 },
    { id: uuidv4(), title: `Conclusion`, level: 1 },
  ]);
}
```

Also check for the `error` return from `supabase.functions.invoke`:

Change line 67 from:
```typescript
const { data: aiResult } = await supabase.functions.invoke(...)
```
To:
```typescript
const { data: aiResult, error: aiError } = await supabase.functions.invoke(...)
if (aiError) throw new Error(aiError.message);
```

### File 2: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

Apply the same error handling pattern:
- Check for `error` from `supabase.functions.invoke` in `generateMeta()` and `generateContent()` 
- Add fallback when AI response is null/empty
- Show a toast notification when AI fails so the user knows what happened

## Summary

| File | Change |
|------|--------|
| `WizardStepOutline.tsx` | Add error checking from invoke + fallback outline when AI response is empty |
| `WizardStepGenerate.tsx` | Same error handling + fallback meta/content generation |

This ensures the wizard always progresses through all 5 steps even when the AI provider is misconfigured or temporarily unavailable, using sensible default content that the user can edit manually.

