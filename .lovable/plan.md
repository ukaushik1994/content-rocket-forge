
# Phased Implementation Plan: All 35 Content Wizard Issues

## Summary

35 issues across 5 phases. Each phase is self-contained and testable. The core architectural gap: `advancedContentGeneration.ts` calls `ai-proxy` directly, bypassing `AIServiceController` where Settings templates ARE loaded. This means the Wizard ignores all user-configured prompts.

**Key Decisions:**
- Humanizer = anti-AI rules baked into the generation prompt (no UI toggle, no second pass)
- Settings prompts = additive layer on top of Wizard's built-in logic (no overlap)
- Solution defaults beat Settings when conflicting
- Word count = strict within 10%
- Settings Prompts tab will show what the Wizard already covers so users don't duplicate

---

## Phase 1: Critical Flow and UX Fixes

**Issues addressed: #1, #2, #3, #4, #6, #11**

| # | Issue | What to fix |
|---|-------|-------------|
| 1 | Choice card missing on repeat requests | Reset `requestPromotedVisualData` in the edge function every time `launch_content_wizard` tool is called, not just first time |
| 2 | Silent topic validation | Show toast error + red border when Next is clicked with empty topic in `ContentWizardSidebar.tsx` |
| 3 | Stale "trending industry topics" | Pass empty string instead of vague placeholder when no real keyword is extracted |
| 4 | Goal dropdown not auto-filled from solution | Map solution category to a default goal in `WizardStepConfig.tsx` |
| 6 | Word count slider not visible | Ensure word count control is accessible and scrollable on Config step |
| 11 | `contentIntent` hardcoded to 'inform' | Use Goal dropdown value to dynamically set contentIntent |

**Files:** `enhanced-ai-chat/index.ts`, `content-action-tools.ts`, `ContentWizardSidebar.tsx`, `WizardStepConfig.tsx`

**Test:** Launch wizard twice in same chat, verify choice card appears both times. Clear topic, click Next, verify error shown. Select a solution, verify Goal auto-fills.

---

## Phase 2: Content Quality Engine (Humanizer + Word Count + Depth)

**Issues addressed: #5, #7, #8, #9, #10, #13, #33**

All changes in `advancedContentGeneration.ts` system prompt.

### 2A. Anti-AI Humanization (Issues #5, #33)

Add mandatory WRITING STYLE RULES block to the system prompt:

- Banned openers: "In today's [adjective] world/environment/landscape"
- Banned phrases: "game-changer", "revolutionize", "landscape", "paramount", "leverage", "navigate the complexities", "realm", "tapestry", "comprehensive guide", "delve into", "it's important to note", "without further ado", "let's dive in"
- Require: Start with a specific fact/statistic/question/scenario
- Require: Write like a subject-matter expert talking to a peer
- Require: Concrete numbers, specific examples, varied sentence length, active voice
- Require: No filler paragraphs -- every paragraph must advance understanding

This IS the humanizer -- built into the prompt so content comes out human on the first pass, no toggle needed.

### 2B. Strict Word Count (Issue #8)

Change "Aim for approximately X words" to: "You MUST write between [0.9x] and [1.1x] words. This is a hard requirement."

### 2C. Case Study Enforcement (Issue #7)

Add rule: When case studies are provided, cite each with exact company name, industry, and numerical results. Never paraphrase into vague "organizations have reported improvements."

### 2D. Depth Over Surface (Issues #9, #10)

Add rules: Include specific details (version numbers, module names, config steps). Replace generic bullets with actionable practitioner steps. At least one specific metric/benchmark per major section.

### 2E. Non-Promotional Solution Integration (Issue #13)

Add rule: Mention the solution as a natural recommendation within educational context. Never shift to sales copy tone. Maintain consistent expert voice throughout.

**Files:** `advancedContentGeneration.ts` (system prompt section, lines 180-203)

**Test:** Generate content for same keyword as before, compare output. Verify no AI cliches, word count within 10%, case studies cited with exact numbers, solution mentioned without promotional tone shift.

---

## Phase 3: Settings Prompt Integration

**Issues addressed: #17, #18, #19, #20**

### How It Works

The Wizard builds its full system prompt as it does today (SERP rules, solution context, outline, word count, humanizer rules from Phase 2). Then, BEFORE sending to ai-proxy, it loads the user's custom prompt template for the current format type via `getPromptTemplatesByType(formatType)` and appends it as an "ADDITIONAL USER PREFERENCES" section.

**Priority order (top wins for conflicts):**
1. Solution data (audience, tone, pain points) -- most specific context
2. Content Wizard built-in rules (SERP, outline, word count, humanizer)
3. Settings prompt templates -- user's custom style/voice/rules
4. Brand guidelines -- supplementary context

### No-Overlap Guarantee

Update the Settings Prompts tab (`FormatPromptSettings.tsx`) to show a read-only summary of what the Wizard already handles:

```
The Content Wizard already handles:
- Content structure and outline
- Word count targets
- SEO and keyword optimization
- Solution/offering integration
- SERP research data
- Writing quality and anti-AI rules

Your custom prompts add ON TOP of these. Use them for:
- Tone and voice preferences ("always use British English")
- Banned words or phrases specific to your brand
- Formatting preferences ("always end with a CTA")
- Industry-specific terminology rules
```

### Code Change

In `advancedContentGeneration.ts`, after the system prompt is built (around line 203), before the ai-proxy call (line 230):

1. Import `getPromptTemplatesByType`
2. Load templates for `config.formatType || 'blog'`
3. If a template exists, append as: `ADDITIONAL USER PREFERENCES (follow these on top of all rules above): [template content]`
4. If template has a `structureTemplate`, append that too

### Brand Context Restructure

In `WizardStepGenerate.tsx` `buildAdditionalInstructions()`, restructure brand info from loose text to a labeled section: "BRAND VOICE (follow strictly): Company, Tone, DO use, DON'T use"

**Files:** `advancedContentGeneration.ts`, `FormatPromptSettings.tsx`, `WizardStepGenerate.tsx`

**Test:** Add a custom blog template in Settings ("always use British English, end with a question"). Generate content. Verify British spelling appears and article ends with a question -- while Wizard's structure/word count/solution rules are still followed.

---

## Phase 4: SERP and Research Quality

**Issues addressed: #25, #26, #27, #28, #29**

| # | Issue | Fix |
|---|-------|-----|
| 25 | Templated SERP headings | Add a flag to distinguish real SERP data from AI-generated fallback. Tag fallback items with "(AI-suggested)" label |
| 26 | Irrelevant strategy signals in outlines | Filter out items containing "video content opportunity", "local services", "visual content" from auto-generated outlines -- these are strategy signals, not article sections |
| 27 | No PAA integration | If "People Also Ask" data exists in SERP response, surface it in Research step alongside Content Gaps and Headings |
| 28 | Content gaps look generic | Improve SERP analysis prompt to generate gaps referencing specific competitor weaknesses rather than keyword+template patterns |
| 29 | SERP data not clearly labeled | Add visual badges in Research step: green "From SERP" vs blue "AI Suggested" |

**Files:** `WizardStepResearch.tsx`, `WizardStepOutline.tsx`, SERP edge function

**Test:** Enter a well-known keyword, verify research items show real SERP data with green badges. Verify outline doesn't include video/local service items.

---

## Phase 5: Platform Parity and Polish

**Issues addressed: #12, #14, #15, #16, #30, #31, #32, #34, #35**

| # | Issue | Fix |
|---|-------|-----|
| 12 | No refinement loop | Add "Refine" button post-generation that sends content back with specific improvement instructions |
| 14 | No content score in Wizard | After generation, run lightweight scoring (readability, keyword density, structure) and show a score badge |
| 15 | No AI detection score | Import `aiContentDetectionService`, run automatically post-generation, show as small indicator |
| 16 | User instructions not integrated | Fetch `getRecentUserInstructions()` and append top 3 most-used instructions to prompt |
| 30 | Landing page promises vs reality | Ensure metrics shown match what landing page advertises |
| 31 | No progress indicator | Show staged progress: "Building prompt... Generating... Finalizing..." |
| 32 | Meta fields not editable | Make meta title/description editable directly in Generate step |
| 34 | Content Builder metadata parity | Save same metadata fields (serpMetrics, solutionIntegrationMetrics) as Content Builder |
| 35 | No "Continue Editing" | Pass all wizard state to Content Builder via sessionStorage |

**Files:** `WizardStepGenerate.tsx`, `ContentWizardSidebar.tsx`, `aiContentDetectionService.ts`

**Test:** Generate content, verify score badge and AI detection indicator appear. Click Refine, verify content improves. Click Continue Editing, verify Content Builder opens with all context preserved.

---

## Implementation Sequence

```text
Phase 1 (Flow Fixes)         --> 1 session
Phase 2 (Quality Engine)     --> 1 session
Phase 3 (Prompt Integration) --> 1 session
Phase 4 (SERP Quality)       --> 1 session
Phase 5 (Parity & Polish)    --> 2 sessions
```

Each phase ends with end-to-end testing before proceeding.

## Issue Tracking Checklist

| Issue | Phase | Description |
|-------|-------|-------------|
| 1 | 1 | Choice card missing on repeat requests |
| 2 | 1 | Silent topic validation |
| 3 | 1 | Stale "trending industry topics" keyword |
| 4 | 1 | Goal dropdown not auto-filled |
| 5 | 2 | Generic AI-sounding openers |
| 6 | 1 | Word count slider not visible |
| 7 | 2 | Case studies cited vaguely |
| 8 | 2 | Word count undershooting by 30-40% |
| 9 | 2 | Shallow bullet points |
| 10 | 2 | No specific details (versions, modules) |
| 11 | 1 | contentIntent hardcoded to 'inform' |
| 12 | 5 | No refinement loop |
| 13 | 2 | Solution integration sounds promotional |
| 14 | 5 | No content score in Wizard |
| 15 | 5 | No AI detection score |
| 16 | 5 | User instructions not integrated |
| 17 | 3 | Settings templates NOT used by Wizard |
| 18 | 3 | Settings templates could overlap Wizard rules |
| 19 | 3 | Priority unclear when Settings vs Solution conflict |
| 20 | 3 | Brand context loosely appended |
| 21 | 3 | No visibility into what Wizard handles |
| 22 | 3 | Settings prompts description unclear |
| 23 | 3 | Structure templates ignored |
| 24 | 3 | No fallback when no template exists |
| 25 | 4 | SERP headings look templated |
| 26 | 4 | Irrelevant strategy signals in outlines |
| 27 | 4 | No PAA integration |
| 28 | 4 | Content gaps look generic |
| 29 | 4 | SERP data not labeled real vs AI |
| 30 | 5 | Landing page vs reality gap |
| 31 | 5 | No progress indicator during generation |
| 32 | 5 | Meta fields not editable inline |
| 33 | 2 | No humanization layer |
| 34 | 5 | Content Builder metadata parity |
| 35 | 5 | No "Continue Editing" flow |
