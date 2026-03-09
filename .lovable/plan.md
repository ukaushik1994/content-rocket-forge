

# Phase 2 Final Batch: Progress Indicator + Calendar Views

## 2.3 — Wizard Generation Progress Indicator

**Current state:** Lines 1081-1094 show a basic "Generating..." button + tiny `generationStage` text with `animate-pulse`. No visual progress bar or phase breakdown.

**Change in `WizardStepGenerate.tsx`:**
- Replace the minimal text indicator (lines 1087-1094) with a visual progress overlay showing:
  - A progress bar that advances through 4 stages: "Building prompt" → "Generating content" → "Analyzing quality" → "Finalizing"
  - Each stage maps to a percentage range (0-25%, 25-75%, 75-90%, 90-100%)
  - Stage icons + animated text
  - The existing abort button stays in place
- Update `generateContent()` (line 525+) to set numeric progress state alongside `generationStage`
- Add `generationProgress` state (number 0-100) that advances with each stage change

**No new files needed** — the progress UI renders inline where the generate button lives.

---

## 2.8 — Calendar Week + Day Views

**Current state:** `EditorialCalendar.tsx` renders only a month grid (line 285). No view toggle exists.

**Changes in `EditorialCalendar.tsx`:**
- Add `calendarView` state: `'month' | 'week' | 'day'` (default: `'month'`)
- Add segmented toggle buttons next to the month navigation (line 250 area)
- **Month view:** Keep existing grid as-is
- **Week view:** Show 7 columns for the week containing `selectedDate` (or current week), with items listed vertically per day. Use `startOfWeek`/`endOfWeek` from date-fns.
- **Day view:** Show a single column for `selectedDate` (or today) with all items listed with full detail
- Navigation arrows adapt: in week view they move ±1 week, in day view ±1 day
- Reuse existing `getContentForDate()`, `getStatusColor()`, `getTypeIcon()` helpers

**Layout for each view:**

```text
Month: [existing 7-col grid with day cells]
Week:  [7-col grid, taller cells, all items visible]
Day:   [single column, full-width item cards with times]
```

---

## Summary

| File | Change |
|------|--------|
| `WizardStepGenerate.tsx` | Add progress bar + stage phases during generation |
| `EditorialCalendar.tsx` | Add week/day views with segmented toggle |

2 files edited. No new dependencies (date-fns `startOfWeek`/`endOfWeek` already available).

