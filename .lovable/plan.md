
# Content Wizard: Complete End-to-End Fix

## Problems Identified

### 1. Merge Step 0 (Topic) and Step 1 (Solution) into a Single Step
Currently the user goes through two separate steps for topic and solution. These should be one step where the user picks a solution AND enters/confirms the keyword.

### 2. No Title Field -- Save Fails
The `content_items` table requires `title` (non-nullable). The wizard auto-generates a title from meta or content H1, but there is no explicit title input for the user. The Content Builder has a `contentTitle` field and a `SaveContentDialog` where the user sets the title before saving.

### 3. Insert Uses Non-Existent Columns
The current `saveAsDraft()` passes `main_keyword` and `secondary_keywords` to the insert, but these columns do NOT exist on the `content_items` table. This causes the save to fail silently or throw. The Content Builder stores these in `metadata` JSON, not as top-level columns.

### 4. Writing Config Should Come From Solution Data
The Content Builder pulls writing tone/audience context from the solution's `target_audience`, `pain_points`, `features`, etc. The Wizard currently ignores this offering intelligence. When a solution is selected, the writing style and expertise level should be inferred from the solution data (e.g., if the target audience is "enterprise CTOs", set expertise to "expert" and style to "professional").

### 5. `content_type` Enum Mismatch
The wizard passes `wizardState.contentType` which defaults to `'blog'` but the valid enum values are: `article`, `blog`, `glossary`, `social_post`, `email`, `landing_page`. The `contentArticleType` field (`how-to`, `listicle`, etc.) is NOT the same as `content_type`. The wizard needs to distinguish between them.

---

## Plan

### File 1: `ContentWizardSidebar.tsx` -- Merge Steps 0+1, Add Title Field

**Changes:**
- Reduce from 6 steps to 5: `Topic & Solution` (0), `Research` (1), `Outline` (2), `Config` (3), `Generate & Save` (4)
- Add `title` field to `WizardState`
- Move keyword input INTO the Solution step (show keyword input at top, solutions below)
- Update `canProceed` logic: step 0 requires keyword length >= 2 AND a solution selected
- Update all step references (goNext max, step indices)

### File 2: `WizardStepSolution.tsx` -- Integrate Keyword Input

**Changes:**
- Accept `keyword` and `onKeywordChange` props
- Render keyword input at the top of the solution step
- When a solution is selected, auto-suggest writing style and expertise from solution data (e.g., if target_audience contains "enterprise" or "professional", default to professional style)
- Emit a callback with offering intelligence metadata

### File 3: `WizardStepGenerate.tsx` -- Fix Save Logic + Add Title Input

**Changes:**
- Add an editable title input field (pre-filled from metaTitle or auto-extracted from content H1)
- Remove `main_keyword` and `secondary_keywords` from the insert payload (these columns don't exist)
- Store keywords in `metadata` JSON and in the `keywords` JSONB column
- Set `content_type` to a valid enum value (default `'blog'`)
- Remove `solution_id` if it's not a valid UUID from the solutions table (or keep it if valid)
- Ensure the save actually works by matching the Content Builder's exact insert shape:
  ```
  { title, content, user_id, status, seo_score, meta_title, meta_description, 
    metadata, content_type, solution_id, keywords }
  ```
- Keep keyword linking (keywords table + content_keywords table) as-is since that works
- Keep reuse history as-is

### File 4: `WizardStepWordCount.tsx` -- Minor Label Updates

**Changes:**
- Relabel step as "Writing Config" to match merged flow
- No structural changes needed

---

## Technical Details

```text
ContentWizardSidebar.tsx:
  - STEPS: [
      { id: 0, label: 'Topic & Solution' },
      { id: 1, label: 'Research' },
      { id: 2, label: 'Outline' },
      { id: 3, label: 'Config' },
      { id: 4, label: 'Generate' },
    ]
  - WizardState: add `title: string`
  - canProceed case 0: keyword.length >= 2 && selectedSolution
  - All subsequent cases shift -1

WizardStepSolution.tsx:
  - Add keyword input at top
  - Accept keyword/onKeywordChange props
  - Auto-set writing defaults from solution.target_audience

WizardStepGenerate.tsx:
  - Add title Input field before meta fields
  - Fix insert: remove main_keyword, secondary_keywords columns
  - Use keywords JSONB column for keyword storage
  - Ensure content_type is valid enum ('blog' default)
  - Title is required before save (disable button if empty)

Save payload (matching Content Builder):
  {
    title: wizardState.title,
    content: wizardState.generatedContent,
    user_id: user.id,
    status: 'draft',
    seo_score: 0,
    meta_title: wizardState.metaTitle || null,
    meta_description: wizardState.metaDescription || null,
    content_type: 'blog',
    solution_id: wizardState.selectedSolution?.id || null,
    keywords: { main: wizardState.keyword, secondary: relatedKeywords },
    metadata: { ...comprehensive metadata... }
  }
```

## Result

| Issue | Fix |
|-------|-----|
| Steps 0+1 separate | Merged into single "Topic & Solution" step |
| No title input | Editable title field in Generate step |
| Save fails (bad columns) | Removed non-existent columns from insert |
| No offering intelligence | Solution data auto-sets writing style/expertise |
| 6 steps too many | Reduced to 5 clean steps |
