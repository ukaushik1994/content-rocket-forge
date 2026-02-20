

# Fix: Content Wizard Not Opening When User Provides Topic

## Root Cause

The two-phase architecture has a gap:

- **Phase 1** (streaming via `ai-streaming`): Streams text only. Does NOT return `visualData`.
- **Phase 2** (tool execution via `enhanced-ai-chat`): Returns `visualData` including `content_wizard`. But it ONLY runs when `detectActionIntent()` matches the **user's message**.

When the user says "write a blog about AI in healthcare" in one message, the intent detector matches and Phase 2 fires correctly.

But when the AI asks "What topic?" and the user replies with just "AI in healthcare", the intent detector finds no match (no "create/write/blog" keywords), so Phase 2 never fires. The wizard never opens.

## Solution

Two changes needed:

### 1. Detect follow-up topic replies for the content wizard
**File**: `src/utils/actionIntentDetector.ts`

Add a new mechanism: check the **AI's streamed response** (not just the user message) for signs the AI is launching the wizard. The AI response will contain phrases like "launching the content wizard" or "starting the content creation wizard" when it decides to invoke the tool.

Add a new exported function `detectToolCallInResponse(aiResponse: string)` that checks if the AI's streamed text indicates it's calling `launch_content_wizard`, and extracts the keyword from context.

Alternatively (simpler and more reliable): modify the existing `detectActionIntent` to also accept the AI response as optional context, and add patterns that match the AI's response text for wizard launch signals.

### 2. Pass AI response to intent detection in Phase 2
**File**: `src/hooks/useEnhancedAIChatDB.ts`

After streaming completes (around line 500), if `detectActionIntent(userMessage)` returns no match, also try `detectActionIntent` against the AI's streamed `fullContent` to catch cases where the AI indicates it's executing a tool.

Update line 500 from:
```
const actionIntent = detectActionIntent(content);
```
To:
```
let actionIntent = detectActionIntent(content);
if (!actionIntent.detected) {
  actionIntent = detectActionIntent(fullContent);
}
```

### 3. Add AI-response patterns for wizard launch
**File**: `src/utils/actionIntentDetector.ts`

Add new patterns that match typical AI response text when launching the wizard:
- `/launching\s+(the\s+)?content\s+(creation\s+)?wizard/i`
- `/starting\s+(the\s+)?content\s+wizard/i`
- `/let me\s+(start|launch|open)\s+(the\s+)?content\s+wizard/i`
- `/I'll\s+(launch|start|open)\s+(the\s+)?content\s+(creation\s+)?wizard/i`

With `extractParams` pulling the keyword from the AI response text (e.g., after "about" or "for" or from quotes).

## Expected Results

| User Flow | What Happens |
|-----------|-------------|
| "Write a blog about SEO" (single message) | Intent matches user message directly, wizard opens with keyword "SEO" |
| "Create a blog" then "AI in healthcare" (two messages) | AI response says "launching content wizard for AI in healthcare", intent matches AI response, wizard opens |

## Technical Summary

| File | Change |
|------|--------|
| `src/utils/actionIntentDetector.ts` | Add AI-response patterns for wizard launch detection (~10 lines) |
| `src/hooks/useEnhancedAIChatDB.ts` | Fallback to checking AI response if user message has no intent (~3 lines) |

2 files, ~13 lines changed.

