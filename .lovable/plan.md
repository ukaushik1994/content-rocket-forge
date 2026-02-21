

# Fix Content Type-Aware Generation

## Problem Summary

The Content Wizard and Content Builder always generate blog-style long-form articles regardless of the selected content type. Three root causes:

1. The AI system prompt is hardcoded for "SEO-optimized articles"
2. The `ContentGenerationConfig.contentType` field only accepts article subtypes (`how-to`, `listicle`, `comprehensive`, `general`) -- not format types (`social-twitter`, `email`, etc.)
3. The actual format selection (e.g., `social-twitter`) is never passed into the AI prompt

## Solution: Format-Specific Prompt-Only Generation

When a user selects a non-blog format, skip SERP/outline/SEO steps entirely and generate directly with a format-aware AI prompt. Save to `content_items` with title + content only (meta fields optional/empty). It appears in the Repository the same way repurposed content does -- under the format tabs with format badges.

---

## Phase 1: Format-Aware AI Generation

### File: `src/services/advancedContentGeneration.ts`

1. **Expand `ContentGenerationConfig`** -- Add a new field `formatType` (`string`) that carries the actual format ID (`blog`, `social-twitter`, `email`, `script`, `carousel`, `meme`, `landing-page`, `google-ads`, etc.)

2. **Create format-specific system prompts** -- New function `getSystemPromptForFormat(formatType)` that returns tailored system prompts:
   - `social-twitter`: "You are a social media expert. Write a concise, engaging tweet (max 280 chars)..."
   - `social-linkedin`: "You are a LinkedIn content strategist. Write a professional, engaging post (300-600 words)..."
   - `social-facebook`: "Write engaging Facebook content (200-400 words)..."
   - `social-instagram`: "Write a captivating Instagram caption with relevant hashtags..."
   - `email`: "You are an email marketing specialist. Write a compelling email with subject line, preview text, and body..."
   - `script`: "You are a video scriptwriter. Write a script with scene directions, dialogue, and timing..."
   - `carousel`: "Write content for a multi-slide carousel post (5-8 slides, each with a headline and short body)..."
   - `meme`: "Write meme text: top text and bottom text, punchy and humorous..."
   - `landing-page`: "You are a conversion copywriter. Write landing page copy with headline, subheadline, benefits, CTA..."
   - `google-ads`: "Write Google Ads copy: headlines (30 chars each), descriptions (90 chars each)..."
   - `blog` (default): Keep the existing system prompt

3. **Adapt `buildAdvancedContentPrompt`** -- When `formatType` is non-blog:
   - Replace "comprehensive article" language with format-specific instructions
   - Adjust target length to format defaults (280 for Twitter, 500 for email, etc.)
   - Remove SERP integration requirements for social/meme formats
   - Keep solution context (still relevant for all formats)

4. **Adjust `max_tokens`** -- Scale based on format: Twitter = 200, social = 1000, email = 2000, blog = 4000+

### File: `src/services/contentBriefGenerator.ts`

Already has `getDefaultWordCount()` per format -- no changes needed, already correct.

---

## Phase 2: Content Wizard -- Skip Steps for Non-Blog Formats

### File: `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`

1. **Define blog-like vs quick formats**:
   ```text
   BLOG_FORMATS = ['blog', 'landing-page']
   QUICK_FORMATS = everything else (social-*, email, script, meme, carousel, google-ads)
   ```

2. **Dynamic step flow** -- When `contentType` is a quick format:
   - Show only 2 steps: "Topic and Solution" (step 0) then "Generate and Save" (step 4)
   - Skip steps 1 (Research), 2 (Outline), 3 (Config) entirely
   - Update `STEPS` array dynamically based on selected format
   - Update `canProceed()` and step navigation accordingly

3. **Pass `formatType` to generation** -- In `WizardStepGenerate`, pass `formatType: wizardState.contentType` into the `ContentGenerationConfig` so the AI knows to generate a tweet vs a blog

4. **Hide meta fields for quick formats** -- In the Generate step, do not show meta title/description fields for non-blog formats. They will be saved as `null`.

### File: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

1. **Pass `formatType`** in the `ContentGenerationConfig` when calling `generateAdvancedContent()`
2. **Conditionally render meta fields** -- Only show meta title/description inputs when `wizardState.contentType` is a blog-like format
3. **Skip SEO score calculation** for non-blog formats (set to `null`)
4. **Adjust the save payload** -- For non-blog: `meta_title: null`, `meta_description: null`, `seo_score: null`

---

## Phase 3: Content Builder -- Same Fix

### File: `src/components/content-builder/steps/ContentWritingStep.tsx`

1. Pass the parent `state.contentType` (from the Content Builder context) as `formatType` into `ContentGenerationConfig`
2. This ensures the Content Builder also generates format-appropriate content when a non-blog type is selected

---

## Phase 4: Database Enum Expansion

### Migration SQL

Add missing values to `content_type_enum` so non-blog content can be stored properly:

```text
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'social_twitter';
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'social_linkedin';
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'social_facebook';
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'social_instagram';
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'script';
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'meme';
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'carousel';
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'google_ads';
```

### Update `FORMAT_TO_DB_ENUM` mapping

In `WizardStepGenerate.tsx`, expand the mapping to cover all new enum values:

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

---

## Phase 5: Repository Display

No changes needed -- the Repository already has format tabs (Socials, Email, Blog, Scripts) and displays content with format badges. Once non-blog content is saved with the correct `content_type` enum value, it will automatically appear under the right tab.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/services/advancedContentGeneration.ts` | Add `formatType` to config, format-specific system prompts, adapted prompt builder |
| `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx` | Dynamic 2-step vs 5-step flow based on format |
| `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` | Pass `formatType`, hide meta fields for non-blog, skip SEO score |
| `src/components/content-builder/steps/ContentWritingStep.tsx` | Pass `formatType` from builder context |
| Database migration | Expand `content_type_enum` with new values |

No new tables. No new edge functions. The Repository automatically picks up new content types.

