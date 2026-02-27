

# Fix Plan: Solution Detection UI + SEO Score Alignment with Content Builder

## Problem Summary

Two bugs remain from the previous fix attempt, plus the SEO scoring engine is fundamentally different from the Content Builder's proven approach.

---

## Bug 1: Solution Feature Detection UI Still Uses Exact Matching (Critical)

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` (line 1006)

**Root Cause:** The previous fix updated the **save logic** (lines 611-627) to use `analyzeSolutionIntegration()` with fuzzy matching, but the **UI display** at line 1006 still uses naive exact matching:

```text
const covered = features.filter((f: string) => editableContent.toLowerCase().includes(f.toLowerCase())).length;
```

This is why the user sees "0/10 features covered" in the sidebar even though the saved metadata would be correct.

**Fix:** Replace the inline exact-match in the UI render block (lines 1000-1024) with a call to `analyzeSolutionIntegration()` -- the same function already imported at line 16. Use `solMetrics.mentionedFeatures.length` for the display count and `solMetrics.nameMentions` for mentions.

---

## Bug 2: SEO Score Uses Wrong Algorithm

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx` (lines 76-100)

**Root Cause:** The wizard's `calculateSeoScore` is a simple 7-item checklist where each item adds fixed points. This produces unreliable scores (65 when 5/7 pass). Meanwhile, the Content Builder uses a battle-tested 3-dimension weighted algorithm from `src/utils/seo/`:

| Dimension | Weight | Source File |
|-----------|--------|-------------|
| Keyword density score | 40% | `keywordAnalysis.ts` (optimal range 1-3%) |
| Content length score | 30% | `contentAnalysis.ts` (tiered: 300/600/1000/1500 words) |
| Readability score | 30% | `contentAnalysis.ts` (sentence + word length penalties) |

**Fix:** Replace `calculateSeoScore()` with the Content Builder's approach:
1. Import `calculateKeywordUsage`, `calculateKeywordUsageScore` from `@/utils/seo/keywordAnalysis`
2. Import `calculateContentLengthScore`, `calculateReadabilityScore` from `@/utils/seo/contentAnalysis`
3. Compute: `score = keywordScore * 0.4 + contentLengthScore * 0.3 + readabilityScore * 0.3`

Keep the existing `getSeoChecklist()` for the expandable checklist display, but add two new items:
- **Keyword density** (shows actual % and optimal range)
- **Readability** (shows avg sentence length)

---

## Enhancement: Richer SEO Checklist

Add 2 new items to `getSeoChecklist()` (currently 7 items, becomes 9) to match Content Builder depth:

1. **Keyword density**: Check if main keyword density is between 1-3%. Show actual density percentage.
2. **Readability**: Check if avg sentence length is under 25 words.

These items are display-only and don't affect the main score (which now comes from the weighted algorithm).

---

## Implementation Sequence

| Step | Task | Lines |
|------|------|-------|
| 1 | Add imports for Content Builder scoring utils | Top of file |
| 2 | Replace `calculateSeoScore` with weighted 3-dimension algorithm | Lines 76-100 |
| 3 | Add keyword density + readability items to `getSeoChecklist` | Lines 108-156 |
| 4 | Fix solution integration UI display to use fuzzy matching | Lines 1000-1024 |

All changes are in a single file: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

---

## Technical Details

**New calculateSeoScore (replaces lines 76-100):**
```text
function calculateSeoScore(content, keyword, metaTitle, metaDescription) {
  // Use Content Builder's proven 3-dimension weighted algorithm
  const keywordUsage = calculateKeywordUsage(content, keyword, []);
  const keywordScore = calculateKeywordUsageScore(keywordUsage, keyword);
  const contentLengthScore = calculateContentLengthScore(content);
  const readabilityScore = calculateReadabilityScore(content);
  
  // Weighted average (same weights as Content Builder)
  let score = Math.round(
    (keywordScore * 0.4) + (contentLengthScore * 0.3) + (readabilityScore * 0.3)
  );
  
  // Bonus for meta tag optimization (up to +10)
  if (metaTitle.length >= 50 && metaTitle.length <= 60) score += 5;
  if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 5;
  
  return Math.min(100, score);
}
```

**Fixed solution UI display (replaces lines 1000-1024):**
```text
{wizardState.selectedSolution && editableContent && (() => {
  const solMetrics = analyzeSolutionIntegration(editableContent, {
    name: wizardState.selectedSolution.name,
    features: Array.isArray(wizardState.selectedSolution.features) ? wizardState.selectedSolution.features : [],
    painPoints: Array.isArray(wizardState.selectedSolution.painPoints) ? wizardState.selectedSolution.painPoints : [],
    targetAudience: Array.isArray(wizardState.selectedSolution.targetAudience) ? wizardState.selectedSolution.targetAudience : [],
  });
  return (
    <div className="...">
      <span>{solMetrics.nameMentions} mentions of "{wizardState.selectedSolution.name}"</span>
      <span>{solMetrics.mentionedFeatures.length}/{features.length} features covered</span>
    </div>
  );
})()}
```

**New checklist items (appended to getSeoChecklist):**
```text
{
  label: 'Keyword density',
  passed: density >= 1 && density <= 3,
  detail: `${density.toFixed(1)}% (optimal: 1-3%)`
},
{
  label: 'Readability',
  passed: avgSentenceLength <= 25,
  detail: `Avg sentence: ${Math.round(avgSentenceLength)} words${avgSentenceLength > 25 ? ' (shorten sentences)' : ''}`
}
```
