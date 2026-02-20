
# Content Wizard vs Content Builder: Complete Gap Audit & Alignment Plan

## Audit Summary

After reviewing every file in both systems, here is a feature-by-feature comparison showing what the Content Builder has that the Wizard is missing.

---

## GAP ANALYSIS TABLE

| Feature | Content Builder | Content Wizard | Gap Severity |
|---------|----------------|----------------|--------------|
| Solution + Content Type selection | Modal with solution avatars AND content type picker per solution | Solution list only, no content type picker | HIGH |
| Company/Brand context injection | Loads `company_info` + `brand_guidelines` from DB, auto-injects into instructions | None | HIGH |
| Content Brief questionnaire | Target Audience, Content Goal, Tone & Style, Specific Points (4 fields) | None | HIGH |
| Rich content editor (Write/Preview/Export) | Full markdown editor with tabs, copy, download, word count, auto-save | Tiny `dangerouslySetInnerHTML` preview (first 3000 chars only) | HIGH |
| Optimization & Review step | Solution integration metrics, SEO checklist, document structure analysis, meta generation, publish option | None | HIGH |
| Additional Instructions field | Editable textarea on writing step sidebar, persisted in metadata | Not exposed to user | MEDIUM |
| Image generation | Auto-generates images after content, gallery with insert-into-content | None | MEDIUM |
| Save includes `content_type` from solution | Sets `content_type` from SolutionSelectionModal (blog, article, glossary, etc.) | Hardcodes `'blog'` always | MEDIUM |
| SERP Analysis deep-dive | Full SERP Analysis Step with diagnostics, debug panel, data validation | Lightweight research step (good enough for wizard) | LOW |
| Strategy source tracking | Saves `proposal_id`, `priority_tag`, `estimated_impressions` in metadata | None | LOW |
| Content Brief in metadata | Saves `contentBrief` object in metadata | None | MEDIUM |
| Floating writing sidebar | Shows SERP items, outline, solution, word count, instructions as floating metrics | None (wizard is already sidebar) | LOW |
| Content type selector (article format) | Explicit format selection from `contentFormats` list | Only `contentArticleType` (how-to, listicle, etc.) | MEDIUM |

---

## PLAN: Phase-by-Phase Implementation

### Phase 1: Critical Saves & Data Gaps (Must Fix)

**File: `WizardStepGenerate.tsx`**
- Load company_info and brand_guidelines from DB on mount (same as `SolutionSelectionModal.tsx` does)
- Auto-inject company/brand context into the generation config's `additionalInstructions`
- Pass `content_type` from `wizardState.contentType` instead of hardcoding `'blog'`
- Save `contentBrief` data in metadata if available

**File: `ContentWizardSidebar.tsx`**
- Add `contentBrief` to `WizardState`: `{ targetAudience, contentGoal, tone, specificPoints }`
- Auto-populate `contentBrief.targetAudience` and `contentBrief.tone` from the selected solution's data

### Phase 2: Content Brief Step (New Mini-Section)

**File: `WizardStepWordCount.tsx` (rename conceptually to "Config")**
- Add a compact Content Brief section ABOVE the writing style selectors
- 3 compact dropdowns: Target Audience, Content Goal, Tone (same options as `ContentBriefQuestions.tsx`)
- 1 small textarea: "Specific points to include"
- Auto-fill audience and tone from the selected solution's `targetAudience` array
- These values feed into `additionalInstructions` during generation

### Phase 3: Content Type Selection

**File: `WizardStepSolution.tsx`**
- After selecting a solution, show a compact content type picker (same `contentFormats` list used in `SolutionSelectionModal.tsx`)
- Options: Blog Post, Article, Glossary, Social Post, Email, Landing Page
- Store in `wizardState.contentType` (already exists, just needs UI)
- This value gets saved to `content_items.content_type`

### Phase 4: Rich Content Editor

**File: `WizardStepGenerate.tsx`**
- Replace the tiny `dangerouslySetInnerHTML` preview with a proper Write/Preview tabs component
- Write tab: full-height textarea for manual editing
- Preview tab: rendered markdown with `ReactMarkdown`
- Show word count, reading time, copy button
- Allow the user to edit generated content before saving

### Phase 5: Metadata Enrichment on Save

**File: `WizardStepGenerate.tsx` (save logic)**
- Add to metadata: `contentBrief`, `contentFormat`, `contentIntent`, `comprehensiveSerpData` (if available)
- Add company/brand context to metadata
- Add `wordCount` and `readingTime` calculations
- Match the Content Builder's full metadata shape from `useSaveContent.ts`

---

## Technical Details

```text
WizardState additions:
  contentBrief: {
    targetAudience: string;
    contentGoal: string;
    tone: string;
    specificPoints: string;
  } | null;

WizardStepSolution.tsx:
  - After solution select, show content type grid
  - Uses contentFormats from '@/components/content-repurposing/formats'
  - Updates wizardState.contentType

WizardStepWordCount.tsx (Config step):
  - Add Content Brief section (3 selects + 1 textarea)
  - Auto-fill from solution.targetAudience:
    "enterprise" -> audience="enterprise", tone="professional"
    "developer" -> audience="developers", tone="technical"
    "consumer" -> audience="general", tone="friendly"

WizardStepGenerate.tsx:
  - On mount: load company_info + brand_guidelines
  - Inject into config.additionalInstructions
  - Replace preview with Write/Preview tabs
  - Save metadata matches useSaveContent.ts shape
  - content_type uses wizardState.contentType (not hardcoded)

Save metadata shape (matching Content Builder):
  {
    contentType, metaTitle, metaDescription, outline,
    selectedSolution: { id, name, category, features, useCases, painPoints, targetAudience },
    mainKeyword, secondaryKeywords,
    contentFormat, contentIntent, additionalInstructions,
    wordCount, readingTime,
    contentBrief: { targetAudience, contentGoal, tone, specificPoints },
    companyContext: { name, industry, mission },
    brandContext: { tone, keywords, doUse, dontUse },
    researchSelections,
    generated_via: 'chat_wizard',
    analysisTimestamp
  }
```

## Implementation Order

1. Phase 1 (Critical) -- Fix save data gaps, company/brand injection
2. Phase 3 (Content Type) -- Add type picker to solution step
3. Phase 2 (Content Brief) -- Add brief fields to config step
4. Phase 4 (Editor) -- Rich editor with Write/Preview tabs
5. Phase 5 (Metadata) -- Full metadata parity

## What NOT to Bring Over

- Floating writing sidebar (wizard IS the sidebar)
- Full SERP Analysis Step with diagnostics (research step is sufficient)
- Image auto-generation (future phase, not core)
- Strategy source tracking (wizard is triggered from chat, not from strategy)
- UnsavedChangesDialog (wizard is ephemeral)
