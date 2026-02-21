

# Implement Content Type-Aware Generation

## Overview

Four phases to make the Content Wizard and Content Builder generate format-appropriate content instead of always producing blog articles.

---

## Phase 1: Database -- Expand content_type_enum

Add missing enum values so non-blog content can be stored:

```text
social_twitter, social_linkedin, social_facebook, social_instagram, script, meme, carousel, google_ads
```

Current values (kept): `article`, `blog`, `glossary`, `social_post`, `email`, `landing_page`

---

## Phase 2: Format-Aware AI Generation

**File: `src/services/advancedContentGeneration.ts`**

1. Add `formatType?: string` to `ContentGenerationConfig` interface (line 5-21)

2. Add new function `getSystemPromptForFormat(formatType: string)` returning tailored prompts:
   - `social-twitter`: Social media expert, max 280 chars, engaging tweet with hashtags
   - `social-linkedin`: LinkedIn strategist, 300-600 words, professional tone
   - `social-facebook`: Facebook content, 200-400 words, engaging with CTA
   - `social-instagram`: Instagram caption with hashtags, emojis, engaging hook
   - `email`: Email specialist with subject line, preview text, body, CTA
   - `script`: Video scriptwriter with scene directions, dialogue, timing
   - `carousel`: Multi-slide content (5-8 slides), each with headline + short body
   - `meme`: Top text + bottom text, punchy and humorous
   - `google-ads`: Headlines (30 chars each), descriptions (90 chars each)
   - `landing-page` / `blog` (default): Keep existing SEO article prompt

3. Add `getMaxTokensForFormat(formatType: string)` returning appropriate limits:
   - twitter: 200, social: 1000, email: 2000, meme: 200, google-ads: 500, blog/landing-page: 4000+

4. Modify `generateAdvancedContent()` (line 26-204):
   - Check `config.formatType` -- if non-blog, use `getSystemPromptForFormat()` instead of the hardcoded blog system prompt (line 103-126)
   - Use `getMaxTokensForFormat()` instead of `Math.max(4000, ...)` (line 160)
   - For non-blog formats, build a simplified prompt via new `buildQuickFormatPrompt(config)` that includes keyword, solution context, and format instructions but skips SERP integration requirements

5. New function `buildQuickFormatPrompt(config)`:
   - Includes: keyword, title, solution context (name, features, pain points, use cases)
   - Includes: brand/company context from additionalInstructions
   - Excludes: SERP mandatory sections, outline structure, content gap integration
   - Keeps target length appropriate to format

---

## Phase 3: Content Wizard -- Dynamic Steps for Non-Blog Formats

**File: `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`**

1. Define format categories (after imports):
   ```text
   BLOG_FORMATS = ['blog', 'landing-page']
   QUICK_FORMATS = everything else
   ```
   Helper: `isQuickFormat(contentType) => !BLOG_FORMATS.includes(contentType)`

2. Dynamic steps array:
   - Blog formats: all 5 steps (Topic, Research, Outline, Config, Generate) -- no change
   - Quick formats: 2 steps only -- "Topic and Solution" (step 0) and "Generate and Save" (step 1)
   - Use `useMemo` to compute active steps based on `wizardState.contentType`

3. Update `canProceed()`:
   - For quick formats, step 0 requires keyword + solution (same as now)
   - Step 1 (generate) always returns true

4. Update `goNext` / `goBack` to use dynamic steps length instead of hardcoded 4

5. Step indicator: render dynamic steps array instead of fixed `STEPS`

6. Content area: for quick formats, step index 1 renders `WizardStepGenerate`

**File: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`**

1. Pass `formatType` in the `ContentGenerationConfig` (around line 255):
   ```text
   formatType: wizardState.contentType
   ```

2. For quick formats, build minimal serpSelections (empty array) and outline (empty string) since those steps were skipped

3. Conditionally render meta fields (lines 677-700):
   - Only show Meta Title and Meta Description inputs when format is blog/landing-page
   - For quick formats, skip `generateMeta()` call on mount

4. Adjust SEO score: for non-blog, set `seoScore = null` instead of calculating

5. Update `FORMAT_TO_DB_ENUM` mapping (line 20-27) to include all new types:
   ```text
   'social-twitter'  -> 'social_twitter'
   'social-linkedin' -> 'social_linkedin'
   'social-facebook' -> 'social_facebook'
   'social-instagram'-> 'social_instagram'
   'script'          -> 'script'
   'meme'            -> 'meme'
   'carousel'        -> 'carousel'
   'google-ads'      -> 'google_ads'
   'landing-page'    -> 'landing_page'
   ```

6. Adjust save payload for non-blog: `meta_title: null`, `meta_description: null`, `seo_score: null`

---

## Phase 4: Content Builder -- Same Fix

**File: `src/components/content-builder/steps/ContentWritingStep.tsx`**

1. Pass `formatType: state.contentType` in the `ContentGenerationConfig` (around line 136):
   ```text
   formatType: state.contentType
   ```
   This ensures when a user picks a non-blog type in the Content Builder, the AI prompt adapts accordingly.

---

## Files Changed Summary

| File | Change |
|------|--------|
| Database migration | Add 8 new enum values to `content_type_enum` |
| `src/services/advancedContentGeneration.ts` | Add `formatType` to config, format-specific system prompts, `buildQuickFormatPrompt()`, token scaling |
| `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx` | Dynamic 2-step vs 5-step flow based on format category |
| `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` | Pass `formatType`, expanded `FORMAT_TO_DB_ENUM`, hide meta fields + skip SEO for non-blog |
| `src/components/content-builder/steps/ContentWritingStep.tsx` | Pass `formatType` from builder context |

No new tables, no new edge functions. Repository already displays by format tabs and badges.

