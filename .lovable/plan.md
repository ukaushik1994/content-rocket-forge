

# Content Wizard vs Content Builder: Complete E2E Audit

## How I Tested

I logged in, navigated the Content Builder through Steps 1-2 (Keyword Selection, Content Type & Outline), and examined the Content Wizard's code end-to-end. I also read every line of the save logic in both systems (`useSaveContent.ts` for Builder, `WizardStepGenerate.tsx` for Wizard).

---

## FINDINGS: What the Wizard is Missing vs the Builder

### CRITICAL GAP 1: content_type Enum Mismatch

The Wizard saves `wizardState.contentType` directly (e.g., `'social-linkedin'`, `'script'`, `'landing-page'`), but the `content_items.content_type` column expects database enum values like `'social'`, `'video_script'`, `'landing_page'`.

- **Builder**: Saves proper DB enum values
- **Wizard (line 293)**: Does `const resolvedContentType = (wizardState.contentType || 'blog') as any;` -- this sends invalid enum values

**Fix**: Add a format-to-enum mapping before save.

### CRITICAL GAP 2: No SEO Score Calculation

- **Builder**: Saves `state.seoScore` (calculated via checklist in Optimize & Review step)
- **Wizard (line 301)**: Hardcodes `seo_score: 0` always

**Fix**: Add a lightweight keyword density + heading structure calculation.

### CRITICAL GAP 3: Missing Metadata Fields

The Builder's metadata (lines 251-321 of `useSaveContent.ts`) includes these that the Wizard omits:

| Metadata Field | Builder | Wizard |
|---|---|---|
| `seoScore` | Calculated | Missing |
| `seoImprovements` | Array of items | Missing |
| `documentStructure` | Heading/paragraph analysis | Missing |
| `comprehensiveSerpData` | Full SERP metrics object | Missing |
| `serpMetrics` | keyword difficulty, search volume | Missing |
| `competitorAnalysis` | top domains, gap opportunities | Missing |
| `rankingOpportunities` | featured snippet chance, PAA | Missing |
| `selectionStats` | Counts by type | Missing |
| `lastOptimized` | Timestamp | Missing |
| `location` | Geo-targeting | Missing |
| `strategySource` | Proposal tracking | N/A (by design) |
| `solutionIntegrationMetrics` | Content quality score | Missing |
| `optimizationMetadata` | Applied improvements | Missing |

### MEDIUM GAP 4: No Publish Option

- **Builder**: Has both "Save to Draft" and "Publish" buttons
- **Wizard**: Only has "Save as Draft"

**Fix**: Add a "Publish" button that sets `status: 'published'`.

### MEDIUM GAP 5: No Format Toolbar in Editor

- **Builder**: EnhancedContentEditor has H1/H2/H3/Bold/Italic/Link format buttons
- **Wizard**: Plain textarea with no formatting aids

**Fix**: Add compact format buttons above the edit textarea.

### MEDIUM GAP 6: Title Sanitization Missing

- **Builder**: Uses `sanitizeTitle()` function (lines 24-55 of `useSaveContent.ts`) to strip AI preamble patterns and fallback gracefully
- **Wizard**: Uses raw `wizardState.title.trim()` without sanitization

**Fix**: Import and use the same `sanitizeTitle` function.

### MEDIUM GAP 7: Auto-Generate Missing Meta

- **Builder**: If meta title/description is missing at save time, it auto-generates from content using `extractTitleFromContent` and `generateMetaSuggestions`
- **Wizard**: Generates meta via AI on step load, but doesn't validate at save time

**Fix**: Add meta validation before save.

### LOW GAP 8: No Solution Integration Metrics

- **Builder**: Calculates how well the solution is woven into the content
- **Wizard**: No post-generation analysis

### LOW GAP 9: Builder Saves More Insert Fields

- **Builder** `insert()` does NOT include `content_type`, `keywords`, or `solution_id` in the insert payload
- **Wizard** DOES include these fields, which is actually more complete
- However, the Builder's `content_type` is set via the context state correctly, while the Wizard may send invalid enum values (Gap 1)

---

## Implementation Plan

### Phase 1: Critical Data Fixes (3 changes in 1 file)

**File: `WizardStepGenerate.tsx`**

1. **Fix content_type enum mapping** (line ~293):
   Add a `FORMAT_TO_DB_ENUM` mapping:
   ```
   blog -> blog
   social-linkedin -> social
   social-twitter -> social
   email -> email
   landing-page -> landing_page
   script -> video_script
   ```

2. **Add lightweight SEO score calculation** (before save):
   - Keyword in title: +20
   - Keyword in first 200 chars: +15
   - Meta title 50-60 chars: +15
   - Meta description 120-160 chars: +15
   - Has H2 headings: +15
   - Word count > 800: +10
   - Has lists/bold: +10
   
3. **Add title sanitization** (import existing `sanitizeTitle` pattern or inline the same logic)

### Phase 2: Metadata Enrichment (same file)

**File: `WizardStepGenerate.tsx`**

4. **Add `selectionStats`** to metadata:
   ```
   selectionStats: {
     totalSelected: faqs + gaps + keywords + headings count,
     byType: { questions, contentGaps, relatedSearches, headings }
   }
   ```

5. **Add `documentStructure`** extraction (parse content for heading count, paragraph count, list count)

6. **Add `lastOptimized` timestamp** to metadata

7. **Add meta validation at save time** -- if meta title/description is empty, generate from content

### Phase 3: Feature Parity (same file)

**File: `WizardStepGenerate.tsx`**

8. **Add Publish button** next to "Save as Draft":
   - Same logic as `saveAsDraft` but with `status: 'published'`
   - Show confirmation toast

9. **Add compact format toolbar** above edit textarea:
   - Buttons: H1, H2, H3, Bold, Italic, Link, List
   - Each inserts markdown syntax at cursor position

### Files to Modify

Only **1 file** needs changes: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

All 9 fixes are localized to this single file's save logic and editor UI.

### What NOT to Change

- Research step (already sufficient for wizard context)
- Outline step (working correctly)
- Config step (already has content brief, writing style, expertise)
- Solution step (already has full data mapping)
- Strategy source tracking (wizard is not triggered from proposals)
- Full Optimize & Review step (too heavy for sidebar)
- Image generation (future phase)

