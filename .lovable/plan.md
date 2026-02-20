

# Fix: Related Keywords Showing [object Object]

## Problem

In `WizardStepResearch.tsx` line 54, related searches from SERP data are objects with shape `{ query: string, volume?: number }`, but the mapping code looks for `.keyword` which doesn't exist. It falls through to `String(k)` producing `[object Object]`.

## Fix

**File**: `src/components/ai-chat/content-wizard/WizardStepResearch.tsx` (line 54)

Change the property accessor from `.keyword` to `.query || .keyword` so it correctly extracts the text from SERP related search objects.

Before:
```typescript
relatedKeywords: (serpResult.relatedSearches || serpResult.keywords || []).map(k => ({ text: typeof k === 'string' ? k : (k as any).keyword || String(k), source: 'serp' as const })),
```

After:
```typescript
relatedKeywords: (serpResult.relatedSearches || serpResult.keywords || []).map(k => ({ text: typeof k === 'string' ? k : (k as any).query || (k as any).keyword || String(k), source: 'serp' as const })),
```

One line, one property added. The label "Related Keywords" is fine to keep as-is since these are effectively related keywords surfaced from SERP related searches.

