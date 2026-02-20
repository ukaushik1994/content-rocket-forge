

# Content Wizard: Full Content Builder Alignment

## Context

After thorough analysis of both the Content Builder and Content Wizard codebases, and your answers:
- Keep both interfaces for now (wizard + builder page)
- Writing config (tone, audience, style) should auto-fill from solution data but remain editable
- Derive tone/style from solution's `target_audience` field (no new DB columns needed)

## Current State Assessment

The Content Wizard (`WizardStepGenerate.tsx`) already uses `generateAdvancedContent`, has proper keyword linking, reuse history, and DOMPurify sanitization. The save payload correctly avoids non-existent columns. The step merge (Topic + Solution) is done. Title field exists.

**The implementation from previous rounds is structurally complete.** The remaining issues are:

## Remaining Issues to Fix

### Issue 1: Solution Intelligence Not Fully Derived
The `handleSolutionSelect` in `ContentWizardSidebar.tsx` already infers writing style and expertise from `targetAudience`, but it's basic. The Content Builder's `ContentWritingStep` uses `selectedSolution` data (features, pain points, use cases, target audience, case studies, pricing, market data, technical specs) extensively in the generation prompt. The Wizard already passes `selectedSolution` to `generateAdvancedContent`, which handles this -- so this is actually working.

**However**, the solution data fetched in `WizardStepSolution.tsx` is incomplete. It only maps: `id, name, features, useCases, painPoints, targetAudience, description, category, logoUrl, externalUrl`. It's missing: `benefits, market_data, competitors, technical_specs, pricing_model, case_studies, unique_value_propositions, key_differentiators, positioning_statement, tags, short_description, metadata`. These are all used by `buildAdvancedContentPrompt()` in the generation service.

**Fix**: Expand the solution mapping in `WizardStepSolution.tsx` to include all fields that `generateAdvancedContent` uses.

### Issue 2: Config Step Shows No Indication of Solution-Derived Defaults
When the user selects a solution and the writing style/expertise auto-fills, Step 3 (Config) shows the selectors but doesn't tell the user WHY those values were pre-selected. Need a small info badge like "Auto-set from GL Connect's audience" so the user knows they can change it.

**Fix**: Add an info line in `WizardStepWordCount.tsx` showing which solution influenced the defaults.

### Issue 3: Content Builder Saves `content_type` and `solution_id` Correctly
The Wizard currently hardcodes `content_type: 'blog'`. The Content Builder uses `state.contentType` which can be `article`, `blog`, etc. The Wizard should pass the actual content type.

**Fix**: Use `wizardState.contentType` (which defaults to `'blog'` from props) in the save payload -- this is already correct. No change needed.

### Issue 4: Missing `keywords` JSONB Column Population
The Content Builder's `useSaveContent` does NOT populate the `keywords` column directly -- it stores keyword data in `metadata` and links via `content_keywords` table. The Wizard currently sets `keywords: { main, secondary }` in the insert. This is actually fine since the column exists and accepts JSONB. No conflict.

### Issue 5: The `solution_id` Foreign Key Constraint
The Wizard passes `wizardState.selectedSolution?.id` as `solution_id`. This is a valid UUID from the `solutions` table, so no FK violation. This is correct.

---

## Plan: 2 Files to Modify

### File 1: `src/components/ai-chat/content-wizard/WizardStepSolution.tsx`

Expand the solution data mapping to include all fields used by the content generation service:
- `benefits` (from `s.benefits`)
- `marketData` (from `s.market_data`)
- `technicalSpecs` (from `s.technical_specs`)
- `caseStudies` (from `s.case_studies`)
- `pricing` (from `s.pricing_model`)
- `uniqueValuePropositions` (from `s.unique_value_propositions`)
- `keyDifferentiators` (from `s.key_differentiators`)
- `positioningStatement` (from `s.positioning_statement`)
- `tags` (from `s.tags`)
- `shortDescription` (from `s.short_description`)
- `competitors` (from `s.competitors`)

This ensures `generateAdvancedContent` gets the full solution context, matching what the Content Builder provides.

### File 2: `src/components/ai-chat/content-wizard/WizardStepWordCount.tsx`

Add a small info badge at the top of the Config step showing: "Defaults set from [Solution Name]'s audience profile" when a solution has influenced the writing style/expertise selection. This makes it clear the values are auto-derived but editable.

Accept `selectedSolutionName` as a new prop.

### File 3: `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`

Pass `selectedSolutionName` to `WizardStepWordCount`.

---

## Technical Details

```text
WizardStepSolution.tsx (line ~35-47):
  Current mapping only includes 8 fields.
  Add ~11 more fields from the solutions table columns:
    benefits, marketData, technicalSpecs, caseStudies,
    pricing, uniqueValuePropositions, keyDifferentiators,
    positioningStatement, tags, shortDescription, competitors
  
  These map directly to what buildAdvancedContentPrompt() checks:
    - config.selectedSolution.marketData
    - config.selectedSolution.technicalSpecs
    - config.selectedSolution.caseStudies
    - config.selectedSolution.pricing
    - config.selectedSolution.uniqueValuePropositions
    - config.selectedSolution.keyDifferentiators

WizardStepWordCount.tsx:
  Add prop: selectedSolutionName?: string
  Show info badge: "Defaults from {name}'s audience"

ContentWizardSidebar.tsx:
  Pass selectedSolutionName={wizardState.selectedSolution?.name}
  to WizardStepWordCount
```

## What's Already Working (No Changes Needed)

- Generation uses `generateAdvancedContent` with full SERP integration
- Save logic correctly inserts to `content_items` without non-existent columns
- Keyword linking via `keywords` + `content_keywords` tables
- Reuse history recording
- DOMPurify sanitization on preview
- "Continue Editing" button with sessionStorage handoff
- Title field (mandatory before save)
- Merged Topic + Solution step
- Auto-inference of writing style/expertise from solution audience
- Deduplication by title

