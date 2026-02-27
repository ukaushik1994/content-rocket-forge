

# Fix Plan: Human Score, Solution Integration & Meta Title

## Three Issues to Fix

### Issue 1: Human Score shows 15% -- needs value-adjusted scoring

**Current problem:** The AI detection prompt simply asks "is this AI-written?" and returns a confidence score. The human score = 100 - confidence. A well-structured, comprehensive article scores LOW because structured = AI-like. But structured + valuable content is exactly what search engines want.

**Solution: Value-Adjusted Scoring**

Rewrite the detection prompt in `aiContentDetectionService.ts` to evaluate content on 4 dimensions (as requested):

1. **Personal experiences & opinions** -- first-person voice, anecdotes, unique takes (0-25 pts)
2. **Specificity over generality** -- named companies, exact numbers, real benchmarks vs "many experts say..." (0-25 pts)
3. **Writing pattern variation** -- sentence length variety, conversational asides, non-formulaic transitions (0-25 pts)
4. **Factual depth** -- expert nuance, contrarian insights, beyond-surface analysis (0-25 pts)

The prompt will ask the AI to score each dimension separately AND return a `contentValueScore` (0-100). The final displayed "Human Score" will be:

```text
adjustedScore = rawHumanScore + (contentValueBoost)
where contentValueBoost = max(0, (contentValueScore - 50) * 0.4)
```

So if raw human = 15% but content value = 90, boost = (90-50)*0.4 = +16, final = 31%. If content value = 100, boost = +20, final = 35%. This rewards genuinely valuable content without blindly inflating scores.

The badge will also show contextual labels:
- >= 70%: green "Human: X%"  
- 40-69% with high value: amber "Value Pass: X%"
- < 40% with low value: red "Human: X%" (actual concern)

**Files:** `src/services/aiContentDetectionService.ts`, `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

---

### Issue 2: Solution Integration shows 0 mentions -- need creative connection angles

**Current problem:** When topic = "AI in healthcare" and solution = "GL Connect" (financial/data tool), the generator doesn't mention it because the solution-aware prompt allows skipping irrelevant solutions. But the user wants the AI to ALWAYS find creative connection angles.

**Solution:** Update `AISolutionIntegrationService.createSolutionAwarePrompt` in `advancedContentGeneration.ts` to add an explicit instruction: "You MUST find at least 1-2 creative angles to naturally connect this solution to the topic. Even if the solution isn't directly in the same industry, find overlap in data handling, workflow optimization, integration capabilities, or complementary use cases."

Also update the generation system prompt with a new rule: "When a solution is selected, ALWAYS mention it at least twice -- once as a contextual example and once as a recommendation. Find cross-industry angles if the solution is from a different domain."

**Files:** `src/services/advancedContentGeneration.ts` (system prompt + solution-aware prompt builder)

---

### Issue 3: Meta title allows below 50 characters -- should enforce 50-60 range

**Current problem:** 
- The SEO checklist in `WizardStepGenerate.tsx` correctly checks `>= 50 && <= 60` but the display label says "too short" without enforcing it
- The `MetaInformationCard.tsx` only flags `> 60` as destructive (red border) but doesn't flag `< 50`
- The `generateMetaSuggestions.ts` utility truncates at 60 but has no minimum of 50
- The AI prompt for meta generation says "under 60 chars" but doesn't say "at least 50"

**Fixes across 4 files:**

1. **`WizardStepGenerate.tsx`** line 782: Update character counter to show warning when < 50 (currently only shows `/60`)
2. **`WizardStepGenerate.tsx`** line 252: Update AI prompt to say "between 50-60 characters" instead of "under 60 chars"
3. **`MetaInformationCard.tsx`** lines 53, 62: Add `< 50` check alongside `> 60` for destructive styling
4. **`generateMetaSuggestions.ts`**: Add minimum 50 char enforcement -- if generated title < 50, pad with "| Keyword" or extend

**Files:** `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`, `src/components/content-builder/final-review/MetaInformationCard.tsx`, `src/utils/seo/meta/generateMetaSuggestions.ts`

---

## Implementation Sequence

| Step | Task | Files |
|------|------|-------|
| 1 | Rewrite AI detection prompt with 4-dimension scoring + value-adjusted formula | `aiContentDetectionService.ts` |
| 2 | Update human score badge to show contextual labels (value pass) | `WizardStepGenerate.tsx` |
| 3 | Add "find connection angles" instruction to solution-aware prompts | `advancedContentGeneration.ts` |
| 4 | Fix meta title 50-60 char validation across all files | `WizardStepGenerate.tsx`, `MetaInformationCard.tsx`, `generateMetaSuggestions.ts` |
| 5 | End-to-end test with provided credentials | Browser test |

## Technical Details

**Updated `AIDetectionResult` interface:**
```text
interface AIDetectionResult {
  isAIWritten: boolean;
  confidence: number;
  contentValueScore: number;         // NEW: 0-100
  adjustedHumanScore: number;        // NEW: value-adjusted
  dimensionScores: {                 // NEW
    personalVoice: number;
    specificity: number;
    writingVariation: number;
    factualDepth: number;
  };
  aiIndicators: string[];
  humanizationSuggestions: string[];
}
```

**Value-adjusted formula in WizardStepGenerate:**
```text
const rawHuman = 100 - detection.confidence;
const valueBoost = Math.max(0, (detection.contentValueScore - 50) * 0.4);
const adjusted = Math.min(100, Math.round(rawHuman + valueBoost));
setAiHumanScore(adjusted);
```

**Solution angle instruction (appended to solution-aware prompt):**
```text
"MANDATORY: You MUST mention [solution name] at least 2 times in the content.
Find creative cross-industry angles: data integration, workflow optimization, 
analytics capabilities, or complementary use cases. Frame the solution as a 
relevant tool that enhances the topic's outcomes."
```

