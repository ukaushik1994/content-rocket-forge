

# Continue: Content Type-Aware Generation Implementation

The plan was previously approved. Here's the execution sequence:

---

## Step 1: Database Migration

Expand `content_type_enum` with 8 new values:

```text
social_twitter, social_linkedin, social_facebook, social_instagram, script, meme, carousel, google_ads
```

---

## Step 2: `src/services/advancedContentGeneration.ts`

- Add `formatType?: string` to `ContentGenerationConfig`
- Add `getSystemPromptForFormat(formatType)` with tailored prompts per format
- Add `getMaxTokensForFormat(formatType)` with scaled token limits
- Add `buildQuickFormatPrompt(config)` for non-blog simplified prompts
- Modify `generateAdvancedContent()` to branch on `formatType`

---

## Step 3: `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`

- Define `BLOG_FORMATS = ['blog', 'landing-page']` and helper `isQuickFormat()`
- Dynamic steps: 5 steps for blog, 2 steps (Topic -> Generate) for quick formats
- Update `canProceed()`, `goNext`, `goBack` for dynamic step count
- Render dynamic step indicators

---

## Step 4: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

- Pass `formatType: wizardState.contentType` to generation config
- Expand `FORMAT_TO_DB_ENUM` with all new mappings
- Hide meta title/description fields for non-blog formats
- Skip SEO score calculation for non-blog
- Adjust save payload: `meta_title: null`, `meta_description: null`, `seo_score: null` for non-blog

---

## Step 5: `src/components/content-builder/steps/ContentWritingStep.tsx`

- Pass `formatType: state.contentType` in the generation config

---

No new tables, no new edge functions. Repository already handles format tabs and badges.

