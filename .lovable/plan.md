

# Fix Plan: 5 Remaining Content Wizard Issues

## Issue 1: AI Detection Score Not Showing ("No JSON found")

**Root Cause:** The `detectAIContent` service in `aiContentDetectionService.ts` already calls `ai-proxy` directly (rewritten in the last round). However, the `ai-proxy` response is nested under `data.data.choices[...]`. The current code at line 76 correctly checks `aiData?.data?.choices?.[0]?.message?.content` first. The likely issue is that the `ai-proxy` edge function returns the response wrapped differently for some providers, OR the model isn't returning pure JSON despite the system prompt.

**Fix (in `src/services/aiContentDetectionService.ts`):**
- Add `response_format: { type: "json_object" }` to the params for OpenAI models (forces JSON mode)
- Improve the JSON extraction fallback: after the `\{[\s\S]*\}` regex, also try `stripMarkdownCodeFence` (already exists in the codebase) before parsing
- Add more detailed error logging to show exactly what response came back

## Issue 2: Word Count Undershoot (Chunked Generation Validation)

**Status:** The chunked generation code is already in place (`generateInChunks` at line 103). It's triggered when `targetLength > 2500`. The logic looks correct — it splits outline into groups of 2-3 sections, calls ai-proxy per chunk with proportional word counts, and concatenates.

**Fix (in `src/services/advancedContentGeneration.ts`):**
- The `wordsPerChunk` calculation uses `config.targetLength / chunks.length`, but for the system prompt the AI still needs a stronger instruction. Add a reinforced word count instruction in each chunk prompt: `"ABSOLUTE MINIMUM: ${wordsPerChunk} words for these sections. Write detailed, thorough content with examples, explanations, and analysis for each section. Do NOT summarize or be brief."`
- Increase `tokensPerChunk` multiplier from 1.8 to 2.2 to allow more room for output
- Add a post-generation word count check: if total is still under 80% of target, log a warning (no retry — just awareness)

## Issue 3: Stale Keyword from Quick Action ("post" extracted)

**Root Cause:** The `EnhancedQuickActions.tsx` prompt was updated to "I want to create a new blog post", but the AI in `enhanced-ai-chat` still extracts "post" as the keyword from this message. The `launch_content_wizard` tool description (line 149 of `content-action-tools.ts`) says "If the user has NOT specified a clear topic... you MUST ask them" — but the AI interprets "blog post" as a topic.

**Fix (in `supabase/functions/enhanced-ai-chat/content-action-tools.ts`):**
- Update the tool description to explicitly list "post", "blog", "blog post", "article" as NOT valid keywords: `"Common words like 'post', 'blog', 'article', 'content' are NOT valid keywords. The keyword must be a specific subject matter topic (e.g. 'AI in healthcare', 'email marketing')."`

**Also fix (in `src/components/ai-chat/EnhancedQuickActions.tsx`):**
- Change the prompt to be even more explicit: `"I want to write a new blog post. What topic should I write about?"` — this phrasing makes the AI ask for the topic instead of extracting one.

## Issue 4: Red Border Validation (Too Subtle / Clears Fast)

**Status:** The red border IS applied (line 95 of `WizardStepSolution.tsx` has `keywordError && "border-destructive ring-1 ring-destructive/30"`). The `validationError` state in `ContentWizardSidebar.tsx` clears after 2 seconds (line 151: `setTimeout(() => setValidationError(false), 2000)`).

**Fix (in `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`):**
- Increase timeout from 2000ms to 4000ms for better visibility
- Add a shake animation on the keyword input when validation fails

**Fix (in `src/components/ai-chat/content-wizard/WizardStepSolution.tsx`):**
- Add an error message below the input when `keywordError` is true: a small red text "Please enter a topic (at least 2 characters)"

## Issue 5: Content Gap Quality (Templated Patterns Expansion)

**Status:** `TEMPLATED_PATTERNS` in `WizardStepResearch.tsx` already filters generic headings. But some patterns slip through (e.g., "Definition and Overview", "Key Benefits").

**Fix (in `src/components/ai-chat/content-wizard/WizardStepResearch.tsx`):**
- Add more patterns to `TEMPLATED_PATTERNS`:
  - `/definition\s+and\s+overview$/i`
  - `/^key\s+(benefits|features|advantages)/i`  
  - `/^(the\s+)?(importance|role)\s+of/i`
  - `/step.by.step/i`
  - `/pros?\s+and\s+cons?/i`

---

## Files Modified

| File | Changes |
|------|---------|
| `src/services/aiContentDetectionService.ts` | Add JSON mode param, improve fallback parsing |
| `src/services/advancedContentGeneration.ts` | Stronger word count instruction per chunk, higher token multiplier |
| `supabase/functions/enhanced-ai-chat/content-action-tools.ts` | Blacklist generic keywords in tool description |
| `src/components/ai-chat/EnhancedQuickActions.tsx` | More explicit prompt phrasing |
| `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx` | Longer validation timeout |
| `src/components/ai-chat/content-wizard/WizardStepSolution.tsx` | Error message below input |
| `src/components/ai-chat/content-wizard/WizardStepResearch.tsx` | Expand TEMPLATED_PATTERNS |

## Implementation Order
1. Quick fixes: EnhancedQuickActions prompt, validation timeout, error message (3 files)
2. TEMPLATED_PATTERNS expansion (1 file)
3. AI detection JSON fix (1 file)
4. Word count reinforcement (1 file)  
5. Backend tool description update + deploy (1 edge function)

