

# Fix: AI Asks for Topic/Keyword Before Launching Content Wizard

## Problem
When a user says "create a blog" without specifying a topic, the wizard launches with an empty keyword, causing the Research step to return no SERP data.

## Changes (2 files)

### 1. Edge Function Tool Description (enforces AI behavior)
**File**: `supabase/functions/enhanced-ai-chat/content-action-tools.ts` (lines 148-158)

Update the `launch_content_wizard` tool description and keyword property to make the AI ask for a topic or keyword first:

- **Line 149 description** becomes:
  `"Launch the interactive content creation wizard. The 'keyword' parameter is REQUIRED. If the user has NOT specified a clear topic, keyword, or title (e.g. they just say 'create a blog'), you MUST ask them: 'What topic or keyword would you like to write about?' BEFORE calling this tool. Once they provide a title or topic, extract the core keyword/phrase and pass it as the 'keyword' parameter. Never call with an empty or generic keyword."`
- **Line 153 keyword description** becomes:
  `"The main topic, keyword, or phrase the user wants to write about. Extract from their title or topic. REQUIRED - never leave empty."`

### 2. Client-side Intent Detector (prevents auto-launch without keyword)
**File**: `src/utils/actionIntentDetector.ts` (lines 375-383)

Update `extractParams` so that when no keyword is found, it returns `null` instead of `{}`. This prevents the client from auto-triggering the tool call, letting the AI conversation flow naturally to ask the user.

- **Line 382**: Change `return {};` to `return null;`

Then wherever intents are processed, skip intents where `extractParams` returns `null` (treat as "needs more info from user").

## Result

| User says | What happens |
|-----------|-------------|
| "Create a blog" | AI asks: "What topic or keyword would you like to write about?" |
| "Write about AI in healthcare" | Keyword "AI in healthcare" extracted, wizard launches immediately |
| "Blog about SEO strategies" | Keyword "SEO strategies" extracted, wizard launches immediately |

2 files, ~5 lines changed.

