

# Fix: Content Wizard Outline Generation -- AI Failures + Quality

## Root Cause: Why "AI generation failed"

The `WizardStepOutline.tsx` line 84 extracts the AI response using:
```
aiResult?.content || aiResult?.choices?.[0]?.message?.content
```

But `ai-proxy` returns a NESTED structure:
```json
{ "success": true, "data": { "choices": [{ "message": { "content": "..." } }] } }
```

The correct path is `aiResult?.data?.choices?.[0]?.message?.content`. Since the current path evaluates to `undefined`, the `jsonMatch` regex finds nothing, and the code falls through to the static fallback outline (lines 90-97). The toast says "AI generation failed" because this lands in the catch block.

This is the exact same bug we fixed in `advancedContentGeneration.ts` -- it just wasn't fixed in the Wizard's outline step.

## Root Cause: Why the outline quality is poor

Even if the response path were correct, the prompt is weak:
- **No system prompt** -- just a bare user message asking for JSON
- **Only 800 max_tokens** -- too small for a detailed 8-10 section outline with subsections
- **Shallow solution context** -- only `solution.features.slice(0, 5)`, no pain points, use cases, benefits, or positioning
- **No audience/intent awareness** -- doesn't consider who the content is for
- **Flat structure** -- asks for H2/H3 but doesn't guide the AI toward a strategic content architecture

## The Fix (1 file: `WizardStepOutline.tsx`)

### A. Fix response extraction (line 84)
Add the `data` nesting path:
```typescript
const content = aiResult?.data?.choices?.[0]?.message?.content
  || aiResult?.choices?.[0]?.message?.content
  || aiResult?.content
  || '';
```

### B. Add a proper system prompt
Add a system message that instructs the AI to act as a content strategist, creating outlines that are:
- Strategically structured for SEO and reader engagement
- Organized with clear H2/H3 hierarchy (not flat)
- Addressing search intent and competitive gaps
- Including solution-aware sections when an offering is selected

### C. Enrich the user prompt with full context
- Include ALL solution fields (features, pain points, use cases, benefits, positioning, competitors)
- Include ALL research selections (not just basic strings)
- Add audience and content intent context
- Specify the content type (blog, guide, how-to) for structural guidance

### D. Increase token budget
Change `max_tokens: 800` to `max_tokens: 2000` to allow for detailed outlines with 8-12 sections including subsections.

### E. Better JSON parsing with fallback
If the AI returns markdown-formatted headings instead of JSON, parse those too (regex for `##` and `###` patterns).

## Technical Details

```text
File: src/components/ai-chat/content-wizard/WizardStepOutline.tsx

Line 60-65: Expand contextParts to include ALL solution fields
Line 67-80: Add system prompt, increase max_tokens to 2000
Line 84: Fix response path to include aiResult?.data?.choices path
Line 85-97: Improve JSON parsing with markdown fallback
```

## Expected Result

- Outline generates successfully via AI (no more "AI generation failed")
- 8-12 strategically structured sections with H2/H3 hierarchy
- Solution context (GLC features, pain points, use cases) shapes the outline
- Research selections (FAQs, content gaps) become dedicated sections
- The outline flows naturally into Step 4 generation, producing better content
