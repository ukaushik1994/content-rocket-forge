
# Fix: Content Wizard Falsely Triggering on AI Response Text

## Problem Found During Testing

When user types "create a blog":
1. Phase 1 (streaming): AI correctly asks "What topic do you want to write about?" 
2. Phase 2 (intent detection): `detectActionIntent("create a blog")` correctly returns `null` (no keyword found)
3. **Fallback bug**: `detectActionIntent(fullContent)` runs the same user-message patterns against the AI's response text ("To create a blog, I'll need..."), matches it, extracts garbage keyword "you!", and launches the wizard incorrectly

## Root Cause

The fallback that checks the AI response (`fullContent`) uses the SAME general patterns meant for user messages. The AI's response naturally contains phrases like "create a blog" which match the user-intent patterns, and `extractParams` grabs random words from the response.

## Fix (2 files, ~10 lines)

### 1. Separate AI-response detection into its own function
**File**: `src/utils/actionIntentDetector.ts`

- Mark the AI-response patterns block (lines 386-407) with a flag like `aiResponseOnly: true` in the rule
- Add a new `PatternRule` interface field: `aiResponseOnly?: boolean`
- Create a new exported function: `detectAIResponseIntent(aiResponse: string)` that ONLY checks rules where `aiResponseOnly === true`
- Also fix line 405: change `return {};` to `return null;` (so AI-response patterns also require a keyword)

### 2. Use the separated function for fallback
**File**: `src/hooks/useEnhancedAIChatDB.ts` (lines 500-503)

Change:
```typescript
let actionIntent = detectActionIntent(content);
if (!actionIntent.detected) {
  actionIntent = detectActionIntent(fullContent);
}
```

To:
```typescript
let actionIntent = detectActionIntent(content);
if (!actionIntent.detected) {
  actionIntent = detectAIResponseIntent(fullContent);
}
```

This ensures the fallback ONLY uses patterns designed for AI response text (like "launching the content wizard for [topic]"), not the general user-message patterns that falsely match.

## Expected Results After Fix

| Scenario | Result |
|----------|--------|
| "create a blog" (no topic) | AI asks for topic, wizard does NOT open |
| User replies "AI in healthcare" | AI says "launching content wizard for AI in healthcare", fallback detects it, wizard opens with correct keyword |
| "write a blog about SEO" (topic included) | Direct match from user message, wizard opens immediately |

## Technical Details

```text
actionIntentDetector.ts
  - Add aiResponseOnly flag to PatternRule interface
  - Tag AI-response patterns with aiResponseOnly: true
  - Fix extractParams return null instead of {}
  - Export new detectAIResponseIntent() function

useEnhancedAIChatDB.ts
  - Import detectAIResponseIntent
  - Use it for fallback instead of detectActionIntent
```
