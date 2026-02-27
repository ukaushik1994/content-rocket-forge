
# Fix Plan: SERP Context Leak, Entity Mapping, Docstring & Fallback

## Issues Found

### Issue 1: Chunked Generation Loses SERP + Solution Context (Critical)

**File:** `src/services/advancedContentGeneration.ts` (lines 147-221)

**Problem:** When articles are >2500 words, `generateInChunks()` splits the outline into 2-3 section groups. The FIRST chunk gets the full prompt (with all SERP items, solution data, keywords). But chunks 2+ get a stripped-down prompt (lines 165-180) that only includes:
- Keyword and title
- A brief summary of previous headings
- Writing style and expertise level

ALL SERP selections, solution context, secondary keywords, content gaps, and FAQ requirements are **completely lost** for chunks 2+. This means ~60-70% of a long article ignores the research data.

**Fix:** Re-inject a condensed SERP + solution context block into chunks 2+ prompts. Add after line 180:
- Selected SERP keywords to weave in
- Solution name + mandatory mention reminder
- Content gaps still to address
- Secondary keywords list

This requires passing the `config` object's SERP data into the continuation prompt without bloating token count (use condensed format).

---

### Issue 2: Entity Mapping Gap in WizardStepGenerate

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` (lines 330-335)

**Problem:** The `serpSelections` array maps 4 types from `researchSelections`:
- faqs -> type 'question'
- contentGaps -> type 'contentGap'
- relatedKeywords -> type 'keyword'
- serpHeadings -> type 'heading'

But `researchSelections` also contains **entities** (discovered during research step). These are never passed to the generation prompt, so entity coverage is missed.

**Fix:** Add entity mapping to the serpSelections array:
```text
...wizardState.researchSelections.entities?.map(e => ({
  type: 'entity', content: e, source: 'serp', selected: true
})) || []
```

---

### Issue 3: Stale Docstring in AI Detection Service

**File:** `src/services/aiContentDetectionService.ts` (line 43)

**Problem:** Docstring says `adjustedHumanScore = rawHuman + max(0, (contentValueScore - 50) * 0.4)` but actual code (line 131) uses `(contentValueScore - 40) * 0.6`. Misleading for anyone reading the code.

**Fix:** Update docstring to match actual formula: `(contentValueScore - 40) * 0.6`

---

### Issue 4: Bare Skeleton Fallback on Generation Failure

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` (lines 377-381, 386-391)

**Problem:** When AI generation fails or returns empty, the fallback creates bare HTML like `<h2>Title</h2><p>Write about Title here.</p>`. This has zero SEO value and no keyword integration.

**Fix:** Replace with a keyword-rich markdown outline that includes:
- H1 with the main keyword
- H2s from the outline with brief keyword-integrated prompts
- A placeholder FAQ section with selected questions
- Secondary keywords listed for reference

---

## Implementation Sequence

| Step | Task | File |
|------|------|------|
| 1 | Re-inject SERP + solution context into chunked generation (chunks 2+) | `advancedContentGeneration.ts` |
| 2 | Add entity mapping to serpSelections array | `WizardStepGenerate.tsx` |
| 3 | Fix stale docstring to match actual formula | `aiContentDetectionService.ts` |
| 4 | Replace bare fallback with keyword-rich outline | `WizardStepGenerate.tsx` |
| 5 | End-to-end test with provided credentials | Browser test |

## Technical Details

**Chunk 2+ prompt injection (condensed format to save tokens):**
```text
SERP CONTEXT (integrate throughout):
- Keywords: ${selectedKeywords.join(', ')}
- Solution "${solutionName}": mention at least once in this section
- Content gaps to address: ${remainingGaps}
- Secondary keywords: ${secondaryKeywords}
```

**Keyword-rich fallback template:**
```text
# ${title}

${keyword} is a topic that requires detailed exploration...

## ${outlineSection.title}

[Content about ${outlineSection.title} related to ${keyword}]

## Frequently Asked Questions

### ${faq1}
### ${faq2}

---
*Keywords: ${secondaryKeywords}*
```
