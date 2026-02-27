
# Phase 4 & 5 Implementation Plan

## Phase 4: SERP & Research Quality (Issues #25-29)

### 4A. Visual badges for real vs AI data (Issues #25, #29)

**File:** `src/components/ai-chat/content-wizard/WizardStepResearch.tsx`

The component already tracks `source: 'serp' | 'ai'` and shows badges (line 194-196). Changes needed:

- Update the Badge styling: SERP items get a green badge (`bg-green-500/15 text-green-400 border-green-500/30` with label "From SERP"), AI items get a blue badge (`bg-blue-500/15 text-blue-400 border-blue-500/30` with label "AI Suggested")
- Current badges just say "SERP" or "AI" -- make them more descriptive and color-coded

### 4B. Filter irrelevant strategy signals from outlines (Issue #26)

**File:** `src/components/ai-chat/content-wizard/WizardStepOutline.tsx`

After the AI generates the outline (around line 131 where `parsed.map` happens), add a filter step:

```typescript
const IRRELEVANT_PATTERNS = [
  /video\s+content\s+opportunit/i,
  /local\s+services?/i,
  /visual\s+content\s+strateg/i,
  /podcast\s+opportunit/i,
  /infographic\s+creation/i,
  /social\s+media\s+strateg/i,
];

// Filter out strategy signals that aren't article sections
const filtered = parsed.filter(s => 
  !IRRELEVANT_PATTERNS.some(p => p.test(s.title || s.heading || ''))
);
```

Apply this filter at all three parse paths (JSON array, markdown headings, both around lines 131, 139).

### 4C. Surface People Also Ask data (Issue #27)

The Research step already has an "FAQs / People Also Ask" category (line 140) that maps `serpResult.peopleAlsoAsk`. This is already implemented. The label just needs to be more prominent -- it already says "FAQs / People Also Ask". No code change needed here, it's working.

### 4D. Improve content gap quality (Issue #28)

**File:** `src/components/ai-chat/content-wizard/WizardStepResearch.tsx`

In the `fetchAIResearch` function (line 72), improve the AI prompt (line 98) to generate competitor-specific gaps instead of generic template patterns:

Change the prompt to:
```
For the topic "${keyword}", generate research data in JSON format:
- faqs: 5 specific questions searchers ask (not generic "What is X?" patterns)
- contentGaps: 4 specific topics that existing top-ranking articles MISS or cover poorly (reference what competitors lack, not just keyword variations)
- relatedKeywords: 6 related long-tail search terms
- serpHeadings: 5 specific headings that would outperform current top results

Make every item specific and actionable, not templated. Return ONLY valid JSON.
```

Also update the static fallback (lines 82-86) to be less templated -- use slightly more specific fallback patterns.

---

## Phase 5: Platform Parity & Polish (Issues #12, #14, #15, #16, #31, #32, #34, #35)

### 5A. Refinement loop (Issue #12)

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

After content is generated (post line 816, near the Regenerate button), add a "Refine" input + button:

- A small text input: "How should this be improved?"
- A "Refine" button that sends the current content + refinement instruction back to `generateAdvancedContent` with the instruction prepended to `additionalInstructions`
- This is different from Regenerate (which starts fresh) -- Refine passes the existing content as context

Add state: `refinementInstruction`, `isRefining`

The refine function sends to ai-proxy with a prompt like:
```
Here is existing content to improve:
[content]

Improvement requested: [user instruction]

Rewrite the content incorporating this feedback while keeping the same structure.
```

### 5B. Content quality score badge (Issue #14)

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

The `calculateSeoScore` function already exists (line 72-108). After generation, display it as a badge next to the word count badge (around line 745-753):

```tsx
{!quick && seoScore !== null && (
  <Badge variant={seoScore >= 70 ? 'default' : seoScore >= 40 ? 'secondary' : 'destructive'} className="text-[10px] gap-1">
    SEO: {seoScore}/100
  </Badge>
)}
```

Compute `seoScore` reactively from `editableContent`.

### 5C. AI detection score indicator (Issue #15)

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

Import `detectAIContent` from `@/services/aiContentDetectionService`. After content generation completes, run it automatically:

```typescript
const [aiScore, setAiScore] = useState<number | null>(null);

// In generateContent, after setting editableContent:
const detection = await detectAIContent(result);
setAiScore(detection?.overallScore ?? null);
```

Show as a small badge: "Human: 85%" (where 85 = 100 - aiScore).

### 5D. User instructions integration (Issue #16)

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

In `buildAdditionalInstructions()`, after the existing logic (around line 254), add:

```typescript
import { getRecentUserInstructions } from '@/services/userInstructionsService';

// Inside buildAdditionalInstructions:
try {
  const recentInstructions = await getRecentUserInstructions(3);
  if (recentInstructions.length > 0) {
    parts.push(`USER'S PREFERRED INSTRUCTIONS (from history):\n${recentInstructions.join('\n')}`);
  }
} catch {}
```

Note: This makes `buildAdditionalInstructions` async, so `generateContent` will need to `await` it.

### 5E. Progress indicator during generation (Issue #31)

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

Replace the simple `isGeneratingContent` spinner with a staged progress indicator:

```typescript
const [generationStage, setGenerationStage] = useState<string>('');

// In generateContent:
setGenerationStage('Building prompt...');
// ... build config
setGenerationStage('Generating content...');
const result = await generateAdvancedContent(config);
setGenerationStage('Analyzing quality...');
// ... run seo score + ai detection
setGenerationStage('');
```

Show the stage text below the spinner in the Generate button area.

### 5F. Continue Editing with full state (Issue #35)

**File:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

The `handleContinueEditing` already saves `continueEditingContentId` to sessionStorage (line 643-646). Enhance it to also save wizard context:

```typescript
sessionStorage.setItem('wizardContext', JSON.stringify({
  keyword: wizardState.keyword,
  researchSelections: wizardState.researchSelections,
  outline: wizardState.outline,
  serpData: wizardState.serpData,
  selectedSolution: wizardState.selectedSolution ? {
    id: wizardState.selectedSolution.id,
    name: wizardState.selectedSolution.name,
  } : null,
}));
```

The Content Builder already loads by contentId, but having wizard context in sessionStorage enables richer editing context.

### 5G. Meta fields already editable (Issue #32)

Looking at lines 702-718, meta title and description are already editable `Input` and `Textarea` fields. This issue is already resolved.

### 5H. Metadata parity (Issue #34)

Looking at lines 404-503, the save logic already includes `serpMetrics`, `comprehensiveSerpData`, `solutionIntegrationMetrics`, `selectionStats`, `documentStructure`, and `seoScore`. This is already implemented with full parity.

---

## Files Modified

| Phase | File | Changes |
|-------|------|---------|
| 4 | `WizardStepResearch.tsx` | Green/blue badge colors, improved AI prompt for gaps |
| 4 | `WizardStepOutline.tsx` | Filter irrelevant strategy signals from generated outlines |
| 5 | `WizardStepGenerate.tsx` | Refine button, SEO score badge, AI detection indicator, user instructions integration, progress stages, enhanced Continue Editing |

## Already Done (No Changes Needed)
- Issue #27 (PAA integration) -- already in Research step
- Issue #32 (Meta fields editable) -- already editable
- Issue #34 (Metadata parity) -- already comprehensive
- Issue #30 (Landing page vs reality) -- addressed by adding visible scores

## Implementation Order
1. Phase 4 changes (Research badges + Outline filtering) -- quick wins
2. Phase 5A-5C (Refine, scores, AI detection) -- core value
3. Phase 5D-5F (Instructions, progress, Continue Editing) -- polish
