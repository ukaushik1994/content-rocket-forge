

# Fix Proposal Cards: Remove Fake Metrics, Show Real Data

## The Problem

The `EnhancedAIProposalCard` component generates misleading fake data:
- **Word count** (line 135): Multiplies description word count by 15, producing random numbers like "~270 words" or "~195 words" -- proposals aren't written content, so word count is meaningless
- **SEO score** (line 137): `Math.random() * 40 + 60` generates a different random score every render
- **Status** (line 127): `Math.random() > 0.5 ? 'draft' : 'ready'` randomly assigns status on each render
- **SEO Metadata section**: Just repeats the title and description already shown above -- pure noise

Meanwhile, the **actually useful** data from proposals (priority tags like "High Return", estimated monthly impressions like "8,618", primary keyword, related keywords) gets buried or displayed poorly.

## The Fix

Redesign the `EnhancedAIProposalCard` to show only real, meaningful proposal data:

### What Gets Removed
- Fake word count estimation (line 135)
- Fake random SEO score and grade (lines 137-138)
- Fake random status assignment (lines 120-128)
- The "Content stats" grid showing fake word count and reading time (lines 227-236)
- The "SEO METADATA" box that just repeats title/description (lines 238-251)
- The "AI Analysis" progress bar with random percentage (lines 253-269)

### What Replaces It
- **Priority tag badge** using the existing `priorityConfig` (Quick Win, High Return, Growth Opportunity, Evergreen) -- already in the component but not prominently shown
- **Content type badge** (Blog Post, Article, etc.) -- already configured but unused
- **Estimated Monthly Impressions** -- the real SEO metric from the proposal data, displayed in a compact highlight card
- **Primary keyword** shown as a labeled pill
- **Related keywords** (already shown, keep as-is)
- Clean timestamp footer (keep as-is)

### Visual Layout (Sidebar Card)

```text
+------------------------------------------+
| [High Return]  [Blog Post]          [eye] |
|                                           |
| Best Practices for Automating Financial   |
| Reporting                                 |
| A comprehensive guide outlining best...   |
|                                           |
| [primary keyword pill] [+2 related]       |
|                                           |
| [trending icon] Est. 8,618 impressions/mo |
|                                           |
| Just created                  [Use This ->]|
+------------------------------------------+
```

### Files Modified

**`src/components/research/content-strategy/components/EnhancedAIProposalCard.tsx`**
- Remove `estimatedWords`, `readingTime`, `seoScore`, `seoGrade` variables
- Replace `getStatus()` random logic: use `proposal.status` if available, otherwise default to `'draft'` deterministically (no `Math.random()`)
- Remove the "Content stats" grid (word count + reading time)
- Remove the "SEO METADATA" section
- Remove the "AI Analysis" progress bar section
- Replace status badge row with: priority tag badge + content type badge
- Add an "Estimated Impressions" compact row using `proposal.estimated_impressions` (only shown when data exists)
- Move primary keyword display above related keywords for better visual hierarchy

**No changes needed to**:
- `ProposalBrowseStep.tsx` (already uses the card correctly)
- `ProposalBrowserSidebar.tsx` (state management is fine)
- `StrategySuggestions.tsx` (strategy page also benefits from removing fake data)

## Impact

- Both the sidebar proposal cards AND the strategy page cards will show real data instead of fake metrics
- Cards become more compact and scannable
- Users see actionable info (impressions, priority, keywords) instead of misleading numbers
- No new files, no backend changes -- single component fix

