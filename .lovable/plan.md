

# Fix Plan: Content Wizard Bugs (3 Issues)

## Bug 1: Content Gaps and Headings show `[object Object]` (Step 2)

**File**: `src/components/ai-chat/content-wizard/WizardStepResearch.tsx`

**Lines 53 and 55** use `String(g)` and `String(h)` on SERP objects that have properties like `.topic`, `.description`, `.text`, `.title`. This produces `[object Object]`.

**Fix**: Extract the correct property from the object:
- Line 53 (contentGaps): Change `String(g)` to `(g as any).topic || (g as any).description || (g as any).content || JSON.stringify(g)`
- Line 55 (serpHeadings): Change `String(h)` to `(h as any).text || (h as any).title || (h as any).heading || JSON.stringify(h)`

---

## Bug 2: No fallback content when AI generation fails (Step 5)

**File**: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`

When AI returns an error or empty content (lines 93-96, 132-134, 135-137), the user is stuck -- no content is generated so the Save button never appears.

**Fix**:
- In `generateContent()`, when provider is missing (line 93-96) OR AI returns empty (line 132-134) OR catch fires (line 135-137), generate fallback HTML from the outline:
```
const fallback = wizardState.outline.map(s =>
  `<h${s.level + 1}>${s.title}</h${s.level + 1}>\n<p>Write about ${s.title} here.</p>`
).join('\n\n');
onContentGenerated(fallback);
toast.warning('AI unavailable. A draft outline has been created for you to edit.');
```
- This ensures the Save button always appears.

---

## Bug 3: "Unsupported Visualization Type" card in chat

**File**: `src/components/ai-chat/VisualDataRenderer.tsx`

Line 136 lists valid types but does not include `content_wizard`. When the AI returns `type: "content_wizard"`, the renderer shows an error card even though the sidebar handles this type separately.

**Fix**: Add `'content_wizard'` to the `validTypes` array on line 136, and add an early return for it before the validation block (since it's handled by the sidebar, no inline card is needed):
```
if (data.type === 'content_wizard') return null;
```

---

## Summary

| # | Bug | File | Lines | Change |
|---|-----|------|-------|--------|
| 1 | `[object Object]` in Research | `WizardStepResearch.tsx` | 53, 55 | Extract `.topic`/`.text` from SERP objects |
| 2 | No fallback content on AI fail | `WizardStepGenerate.tsx` | 93-96, 132-137 | Generate HTML draft from outline |
| 3 | "Unsupported Visualization" card | `VisualDataRenderer.tsx` | 136 | Return `null` for `content_wizard` type |

3 files, ~15 lines changed total.

