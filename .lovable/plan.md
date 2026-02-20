
# Content Wizard: End-to-End Fix Plan

## Issues Found (7 Total)

### Issue 1: Content Generation Uses Basic AI-Proxy Instead of Advanced Content Generation Service
**Severity**: Critical -- this is why content quality is poor or generation fails

The Content Builder uses `generateAdvancedContent()` from `src/services/advancedContentGeneration.ts`, which builds a sophisticated multi-section prompt with writing style, expertise level, SERP selections by type, solution-aware prompting, and content intent. The Wizard's `WizardStepGenerate.tsx` uses a basic single `ai-proxy` call with a minimal prompt -- no writing style, no expertise level, no content type intelligence, no structured SERP integration.

**Fix**: Replace the inline `generateContent()` in `WizardStepGenerate.tsx` with a call to `generateAdvancedContent()` from the existing service, mapping the wizard state to a `ContentGenerationConfig` object.

### Issue 2: Save Only Goes to `content_items` -- Missing Keywords, Content-Keywords Links, Reuse History
**Severity**: Critical -- saved content is missing keyword associations and metadata

The Content Builder's `useSaveContent` hook saves to `content_items` AND also:
- Saves keywords to the `keywords` table
- Links them via `content_keywords` table
- Records `content_reuse_history`
- Includes comprehensive SERP metadata, solution integration metrics, strategy source tracking
- De-duplicates content by title

The Wizard's `saveAsDraft()` only does a basic `content_items.insert()` with minimal metadata. Keywords are put in `secondary_keywords` column but never linked properly.

**Fix**: Rewrite `saveAsDraft()` in `WizardStepGenerate.tsx` to match the Content Builder's save logic -- save keywords, link them, include comprehensive metadata, and record reuse history.

### Issue 3: Missing `main_keyword` and `secondary_keywords` Column Population
**Severity**: Medium

The wizard correctly sets `main_keyword` but puts `relatedKeywords` into `secondary_keywords`. The Content Builder also saves `content_type`, proper `meta_title`, `meta_description`, and `seo_score`. The wizard is missing `seo_score` entirely.

**Fix**: Align the insert payload with the Content Builder's format.

### Issue 4: No Content Brief / Writing Configuration Step
**Severity**: Medium -- content quality gap

The Content Builder has writing style selection (Conversational, Professional, Academic, etc.), expertise level, content type (how-to, listicle, comprehensive), and toggles for stats/case studies/FAQs. The Wizard jumps straight from word count to generate with no configuration.

**Fix**: Add writing configuration options (style, expertise, content type) to the existing "Words" step (Step 4) since it has visual space. This keeps the step count at 6 while adding the missing controls.

### Issue 5: Word Count Not Passed Correctly to Generation
**Severity**: Medium

When `wordCountMode === 'ai'`, the `wordCount` is set in state but the generation prompt uses `wizardState.wordCount || 1500`. If the AI estimate is e.g. 2400, it should use that, but the `max_tokens` calculation (`wordCount * 3`) may be insufficient for longer content.

**Fix**: Ensure the AI-estimated word count is properly propagated and use appropriate `max_tokens` (at least `targetLength * 2` or 4000, whichever is higher).

### Issue 6: Content Preview Uses `dangerouslySetInnerHTML` Without Sanitization
**Severity**: Low (security)

The Wizard preview renders HTML directly. The Content Builder uses DOMPurify for sanitization.

**Fix**: Add DOMPurify sanitization to the preview in `WizardStepGenerate.tsx`.

### Issue 7: No "Continue Editing in Content Builder" Option After Save
**Severity**: Low (UX gap)

The Content Builder workflow allows continuing editing. After the Wizard saves, the user can only go to Repository or close -- no option to open the newly created content in the full Content Builder for further refinement.

**Fix**: Add a "Continue Editing" button that loads the saved content into the Content Builder via sessionStorage (matching the existing pattern).

---

## Files to Modify

### 1. `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` (Major rewrite)
- Replace `generateContent()` with call to `generateAdvancedContent()` service
- Rewrite `saveAsDraft()` to match Content Builder save logic (keywords table, content_keywords links, comprehensive metadata, reuse history)
- Add DOMPurify for content preview
- Add "Continue Editing" button post-save

### 2. `src/components/ai-chat/content-wizard/WizardStepWordCount.tsx` (Add writing config)
- Add writing style selector (Conversational, Professional, Academic, Casual)
- Add expertise level selector (Beginner, Intermediate, Expert)
- Add content type selector (General, How-to, Listicle, Comprehensive)
- Pass these values through wizard state

### 3. `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx` (State additions)
- Add `writingStyle`, `expertiseLevel`, `contentArticleType` to `WizardState` interface
- Add `includeStats`, `includeCaseStudies`, `includeFAQs` boolean flags
- Pass new state to WizardStepWordCount and WizardStepGenerate

---

## Technical Implementation Summary

```text
ContentWizardSidebar.tsx
  - WizardState: add writingStyle, expertiseLevel, contentArticleType,
    includeStats, includeCaseStudies, includeFAQs
  - Pass new fields to WizardStepWordCount and WizardStepGenerate

WizardStepWordCount.tsx
  - Add writing style radio group (4 options)
  - Add expertise level radio group (3 options)
  - Add content type selector (4 options)
  - Report changes back to parent via new callback props

WizardStepGenerate.tsx
  - Import generateAdvancedContent, ContentGenerationConfig
  - Import DOMPurify
  - Map WizardState to ContentGenerationConfig and call generateAdvancedContent()
  - Rewrite saveAsDraft():
    * Save/upsert keywords to keywords table
    * Link via content_keywords table
    * Include comprehensive metadata (strategy source, solution, SERP data)
    * Record content_reuse_history
    * De-duplicate by title
  - Add DOMPurify.sanitize() on preview
  - Add "Continue Editing" button that loads into Content Builder via sessionStorage
```
