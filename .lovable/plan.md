

# Sprint 1 Implementation — System Prompt Intelligence

Three zero-migration enhancements. Two edge function injections + one client-side service rewrite.

---

## 1a. Enhancement 4 — AI Negotiation Before Generation

**File:** `supabase/functions/enhanced-ai-chat/index.ts`  
**Location:** After line 2693 (`systemPrompt += brandVoiceContext;`), before the data context compression block.

**Add:**
- Detect content creation intent: `const isContentCreation = /write|create|generate|draft|blog|article|post/i.test(userQuery) && queryIntent.categories.includes('content');`
- If true, append `CONTENT CREATION PROTOCOL` system prompt block that instructs the AI to:
  1. Check existing coverage via `get_content_items`
  2. Suggest best-performing format
  3. Mention competitor angles
  4. Ask about solution integration
  5. Exception: skip if user says "just write it" / "skip questions"
- Add console log: `🤝 Injected Content Creation Negotiation Protocol`

---

## 1b. Enhancement 8 — Multi-Step Workflows

**File:** `supabase/functions/enhanced-ai-chat/index.ts`  
**Location:** Same injection point, right after the negotiation block.

**Add:**
- Detect multi-step intent: `const isMultiStepIntent = /pipeline|full|comprehensive|audit|sweep|review all|analyze everything/i.test(userQuery);`
- If true, append `MULTI-STEP WORKFLOW PROTOCOL` system prompt block that instructs the AI to execute one step at a time, show results, ask for confirmation before continuing
- Includes example flow for "audit my content" with 3 progressive steps
- Add console log: `🔄 Injected Multi-Step Workflow Protocol`

---

## 1c. Enhancement 6 — Enhanced Edit Pattern Learning

**File:** `src/services/contentFeedbackService.ts` — full rewrite of `trackContentEdit`

**Changes to `EditPattern` interface:**
- Add `shortened?: boolean`, `expanded?: boolean`, `patterns?: string[]`

**Changes to `trackContentEdit`:**
- Add paragraph splitting detection (long paragraphs reduced)
- Add example-adding detection (regex for "for example", "such as", etc.)
- Add generic phrase removal detection (regex for "in today's", "it's important to note", etc.)
- Add data/statistics addition detection (regex for percentages, quantities)
- Add heading consolidation detection
- Lower the significance threshold: track edits with `patterns.length > 0` even if length change is <10%
- Store `shortened`, `expanded`, and `patterns` fields in `feedback_data`

**Changes to `getEditPreferences`:**
- Aggregate `patterns` arrays across recent edits
- Include patterns appearing in 30%+ of edits as recurring recommendations
- Return combined length + pattern preferences

---

## Edge function redeploy

After editing `index.ts`, the `enhanced-ai-chat` function auto-deploys.

---

## What stays untouched

- All existing brand voice injection logic (line 2674-2690)
- Data context compression (line 2695-2703)
- Tool filtering, retry logic, auto-execute fallback
- Summarization, pinning, conversation memory
- Analyst Engine hook and sidebar

