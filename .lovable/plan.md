

# Audit: Offering Data Not Being Used (Redundant Asks)

## The Core Problem

When a user selects an Offering (solution), the system already has rich data about that offering -- target audience, pain points, use cases, features, benefits, case studies, pricing, competitors, positioning, etc. But both the Content Wizard and Content Builder still ask the user to manually fill in information that could be auto-populated from the offering.

---

## Gap-by-Gap Breakdown

### Gap 1: Content Brief "Target Audience" -- Already in Offering

**Where it's redundant:**
- Content Wizard Step 4 (`WizardStepWordCount.tsx` line 119): Asks user to pick "Audience" from a generic dropdown (General, Professionals, Beginners, etc.)
- Content Builder (`ContentBriefQuestions.tsx` line 37): Same dropdown

**What the offering already has:**
- `solutions.target_audience` (jsonb array) -- e.g. `["Enterprise CTOs", "IT Managers", "DevOps Engineers"]`

**What should happen:**
- Auto-populate `contentBrief.targetAudience` from the offering's `targetAudience` array when a solution is selected
- Show the auto-populated value with a note: "From [Offering Name]'s profile"
- Allow user to override

### Gap 2: Content Brief "Tone" -- Partially Inferred but Not from Offering Data

**Current behavior:**
- The wizard's `handleSolutionSelect` (line 147-171 in `ContentWizardSidebar.tsx`) does basic keyword-matching on audience text to infer tone
- But it uses hardcoded heuristics ("enterprise" -> "professional", "developer" -> "technical") instead of looking at actual brand guidelines or offering context

**What's missing:**
- Brand guidelines already have a `tone` field in the DB -- this should take priority
- The Content Builder loads brand tone in `ContentTypeStep.tsx` (line 166) and puts it in `additionalInstructions`, but never pre-fills the Content Brief "Tone" dropdown

**Fix:** Auto-fill `contentBrief.tone` from brand guidelines `tone[0]` or from offering audience inference

### Gap 3: Content Brief "Content Goal" -- Could Be Inferred from Content Intent

**Current:** User manually picks "Educate", "Convert", "Engage", etc.

**What could be auto-populated:**
- If content intent is "inform" -> auto-set goal to "educate"
- If content intent is "convert" -> auto-set goal to "convert"
- When coming from Strategy Engine, the `priority_tag` (e.g. "quick-win", "authority") maps to a goal

### Gap 4: Content Brief "Specific Points" -- Offering Already Has Pain Points, Use Cases

**Current:** Empty textarea asking "Any specific topics, pain points, or angles..."

**What the offering already has:**
- `painPoints[]` -- exactly the pain points to address
- `useCases[]` -- angles to cover
- `uniqueValuePropositions[]` -- key selling points

**Fix:** Auto-populate with a formatted string like:
```
Pain points: [from offering]
Key use cases: [from offering]
Value propositions: [from offering]
```

### Gap 5: Writing Style and Expertise Level -- Content Wizard Infers, Content Builder Doesn't

**Content Wizard:** `handleSolutionSelect` infers `writingStyle` and `expertiseLevel` from audience keywords (lines 147-171)

**Content Builder:** `ContentWritingStep.tsx` initializes these as hardcoded defaults (`Conversational`, `Beginner` -- lines 57-58) and never updates them when a solution is selected

**Fix:** Content Builder should also auto-infer writing style and expertise level from the selected offering's target audience, using the same logic as the wizard

### Gap 6: Content Builder Doesn't Pre-fill Content Brief from Offering at All

**Current flow in Content Builder:**
1. User selects offering in `ContentTypeStep`
2. `ContentBriefQuestions` renders with all empty fields
3. User manually fills everything

**The offering data (target audience, pain points, use cases) is right there but never flows into the Content Brief component.**

---

## Implementation Plan

### Change 1: Create a shared utility for offering-to-brief mapping

**New file: `src/utils/content/offeringToBrief.ts`**

A pure function that takes an `EnhancedSolution` (offering) and optional brand guidelines, and returns a pre-filled `ContentBrief` + writing defaults:

```text
Input: offering (target_audience, pain_points, use_cases, UVPs), brandGuidelines (tone)
Output: {
  contentBrief: { targetAudience, contentGoal, tone, specificPoints },
  writingStyle, expertiseLevel
}
```

Logic:
- Map offering `targetAudience` keywords to the dropdown values (enterprise -> "enterprise", developer -> "developers", etc.)
- Map brand tone to brief tone (professional, casual, technical, friendly, authoritative)
- Auto-compose `specificPoints` from pain points + use cases + UVPs
- Infer `writingStyle` and `expertiseLevel` using the same heuristics currently in the wizard's `handleSolutionSelect`

### Change 2: Content Wizard -- Use shared utility

**File: `ContentWizardSidebar.tsx`**

Replace the inline `handleSolutionSelect` heuristics (lines 147-171) with a call to the shared utility. Also pass brand tone if available.

### Change 3: Content Builder -- Auto-fill brief on solution select

**File: `ContentBriefQuestions.tsx`**

Add a `useEffect` that watches `state.selectedSolution`. When it changes:
1. Call the shared utility to get suggested brief values
2. Only auto-fill fields that are currently empty (don't overwrite user edits)
3. Show a small indicator: "Auto-filled from [Offering Name]"

### Change 4: Content Builder -- Auto-set writing defaults

**File: `ContentWritingStep.tsx`**

When `selectedSolution` is available, auto-set `writingStyle` and `expertiseLevel` from the shared utility instead of hardcoded defaults (lines 57-58).

### Change 5: Content Brief shows offering context indicator

**Both `WizardStepWordCount.tsx` and `ContentBriefQuestions.tsx`**

When fields are auto-populated from offering data, show a subtle badge/indicator so the user knows where the defaults came from and can override them.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/utils/content/offeringToBrief.ts` | NEW -- shared utility for mapping offering data to content brief + writing defaults |
| `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx` | Refactor `handleSolutionSelect` to use shared utility |
| `src/components/content-builder/steps/ContentBriefQuestions.tsx` | Auto-fill brief from offering on selection, show indicator |
| `src/components/content-builder/steps/ContentWritingStep.tsx` | Auto-set writing style + expertise from offering |
| `src/components/ai-chat/content-wizard/WizardStepWordCount.tsx` | Show which fields were auto-filled |

No database changes. No new edge functions.

