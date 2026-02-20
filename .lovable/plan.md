
# Fix: Content Wizard Not Saving SERP Metrics, Competitor Analysis, and Ranking Data to Repository

## What's Missing

When content is created via the **Content Wizard** (chat sidebar), it saves the article text and basic metadata but **skips all the rich SERP research data** that the Content Builder saves. This means Repository items created through the Wizard show blank sections for:

1. **SERP Metrics** (search volume, keyword difficulty, competition score, search intent)
2. **Competitor Analysis** (who ranks, their word counts, content gaps)
3. **Ranking Opportunities** (featured snippet chances, PAA targeting)
4. **Solution Integration Metrics** (how well the product is woven into content)
5. **SEO Improvement Suggestions** (actionable optimization recommendations)

### Evidence from Database

Content Builder items have all these fields populated:
- `has_serp_metrics: true`
- `has_comprehensive_serp: true`
- `has_selection_stats: true`

Content Wizard items are missing them:
- `has_serp_metrics: false`
- `has_comprehensive_serp: false`

## The Fix

### File: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

**In the `saveContent` function (around line 386-423)**, add the missing SERP and analysis fields to the metadata object. The Wizard already has `wizardState.researchSelections` with FAQs, content gaps, related keywords, and SERP headings -- we need to restructure this data into the same `comprehensiveSerpData` shape that the Repository's detail views expect.

**Add after line 421 (after `analysisTimestamp`):**

```typescript
// Build comprehensiveSerpData from wizard research state
comprehensiveSerpData: wizardState.serpData ? {
  serpMetrics: {
    searchVolume: wizardState.serpData.searchVolume || null,
    keywordDifficulty: wizardState.serpData.keywordDifficulty || null,
    competitionScore: wizardState.serpData.competition || null,
    intent: wizardState.serpData.intent || 'informational',
    totalResults: wizardState.serpData.totalResults || 0,
    competitorAnalyzed: wizardState.serpData.topResults?.length || 0,
  },
  competitorAnalysis: {
    topCompetitors: (wizardState.serpData.topResults || []).map(r => ({
      title: r.title,
      url: r.link,
      position: r.position,
      snippet: r.snippet,
    })),
  },
  rankingOpportunities: {
    featuredSnippet: wizardState.serpData.contentGaps?.some(g => 
      g.opportunity?.toLowerCase().includes('featured')) || false,
    paaTargets: wizardState.serpData.questions?.length || 0,
    contentGaps: wizardState.serpData.contentGaps?.length || 0,
  },
  selectionStats: selectionStats, // already built above
  analysisTimestamp: new Date().toISOString(),
} : null,

// Flatten for backward compatibility (Repository detail views check both paths)
serpMetrics: wizardState.serpData ? {
  searchVolume: wizardState.serpData.searchVolume || null,
  keywordDifficulty: wizardState.serpData.keywordDifficulty || null,
  competitionScore: wizardState.serpData.competition || null,
  intent: wizardState.serpData.intent || 'informational',
  totalResults: wizardState.serpData.totalResults || 0,
} : null,
rankingOpportunities: wizardState.serpData ? {
  featuredSnippet: false,
  paaTargets: wizardState.researchSelections.faqs.length,
  contentGaps: wizardState.researchSelections.contentGaps.length,
} : null,
competitorAnalysis: wizardState.serpData?.topResults ? {
  topCompetitors: wizardState.serpData.topResults.slice(0, 5).map(r => ({
    title: r.title, url: r.link, position: r.position,
  })),
} : null,

// Solution integration metrics (compute at save time)
solutionIntegrationMetrics: wizardState.selectedSolution ? {
  solutionMentions: (contentToSave.match(
    new RegExp(wizardState.selectedSolution.name, 'gi')
  ) || []).length,
  featuresCovered: wizardState.selectedSolution.features?.filter(f =>
    contentToSave.toLowerCase().includes(f.toLowerCase())
  ).length || 0,
  totalFeatures: wizardState.selectedSolution.features?.length || 0,
  integrationScore: null, // Calculated on-demand in Repository
} : null,
```

### Prerequisite: Verify `wizardState` has SERP data

We also need to check whether the Wizard's state type includes `serpData`. If the Wizard doesn't carry raw SERP data from the research step, we need to pass it through.

**File: `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`** (or wherever `WizardState` is defined)

Add `serpData` to the WizardState interface if missing, and ensure the research step populates it when SERP analysis runs.

## What This Achieves

After this fix, every content item saved from the Wizard will have the same rich metadata as Content Builder items:
- Repository detail modal will show SERP metrics (search volume, difficulty, competition)
- Competitor analysis section will populate
- Ranking opportunities will display
- Solution integration metrics will track how well the product is mentioned
- SEO improvement suggestions will be available

All existing Repository display components (`MetadataTabContent`, `SerpMetricsDisplay`, `SelectedItemsDisplay`, `MetadataAnalytics`) will work without changes because they already read from `metadata.serpMetrics`, `metadata.comprehensiveSerpData`, etc.

## Technical Details

- **1 primary file changed**: `WizardStepGenerate.tsx` (save function metadata block)
- **1 possible type update**: `WizardState` interface to include `serpData`
- **0 Repository/display changes needed** -- existing components already handle both data paths
- Uses the same `JSON.parse(JSON.stringify(...))` serialization pattern as the Content Builder to avoid Supabase JSONB issues
