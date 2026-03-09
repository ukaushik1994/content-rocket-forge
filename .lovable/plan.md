

# Phase 2: UX Enhancements — Implementation Plan

## Already Done (from audit)
- **2.2 Sidebar Tooltips** — Already has `CollapsedIconButton` with `Tooltip`
- **2.5 Keywords Manual Entry** — Already exists in `SeedKeywordManager`
- **2.7 Journey Builder Node Deletion** — Already has delete button + keyboard shortcut

## Remaining Items (5 tasks)

### 2.1 — Repository Bulk Actions
**File:** `RepositoryTabs.tsx` + new `RepositoryBulkBar.tsx`
- Add checkbox column to content list items
- Track `selectedIds: Set<string>` state in RepositoryTabs
- Show a floating bulk action bar when ≥1 item selected: **Delete All**, **Publish All**, **Export Selected**
- "Select All" checkbox in header
- Delete uses `deleteContentItem` from `useContent()` in a loop with confirmation dialog

### 2.3 — Content Wizard Progress Indicator
**File:** `ContentWizardSidebar.tsx`
- The wizard already has step indicators (BLOG_STEPS / QUICK_STEPS) but during generation there's no progress feedback
- Add a progress overlay in `WizardStepGenerate` showing phases: "Analyzing brief → Structuring content → Writing sections → Finalizing"
- Use a cycling text animation with a progress bar that fills over estimated time

### 2.4 — Content Wizard Cancel/Abort
**File:** `WizardStepGenerate.tsx`
- Add an "Abort" button visible during generation
- Use `AbortController` on the generation fetch call
- On abort, show toast "Generation cancelled" and allow retry

### 2.6 — Contacts CSV File Upload
**File:** `ContactsList.tsx` (lines 290-299)
- Add a file drop zone above the textarea in the Bulk CSV tab
- Accept `.csv` files via `<input type="file" accept=".csv">` + drag-and-drop area
- On file drop/select, read with `FileReader` and populate the existing `csvText` state
- Keep the textarea as a fallback for paste

### 2.8 — Calendar Week + Day Views
**File:** `EditorialCalendar.tsx`
- Add a view toggle (Month / Week / Day) using segmented buttons at top
- Week view: 7-column grid showing hours, items placed by date
- Day view: Single column with hourly slots
- Reuse existing `calendarItems` data, just change the rendering grid

## Recommended Batch

Start with **2.1 (Bulk Actions)**, **2.4 (Abort)**, and **2.6 (CSV Upload)** — three low-medium effort items that close real UX gaps. Calendar views (2.8) and progress indicator (2.3) can follow in the next batch.

| File | Change |
|------|--------|
| `RepositoryTabs.tsx` | Add selection state, pass to cards, render bulk bar |
| `SimplifiedRepositoryCard.tsx` | Add checkbox prop |
| New `RepositoryBulkBar.tsx` | Floating action bar component |
| `WizardStepGenerate.tsx` | Add abort button + AbortController |
| `ContactsList.tsx` | Add file drop zone to Bulk CSV tab |

5 files. No new dependencies.

