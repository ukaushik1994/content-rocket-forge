

# Batch 3-5 Implementation Plan

## Status Assessment

After thorough code review, **most Batch 3-5 items are already implemented**:
- Content Wizard cancel button + progress bar -- done
- Campaigns empty state -- done
- Contacts CSV upload with drag-drop -- done
- Social "Not linked" badges + Link Account -- done
- Password change via `supabase.auth.updateUser` -- done
- Repository bulk select with `RepositoryBulkBar` -- done
- Offerings delete with `DeleteSolutionDialog` -- done
- Calendar week/day views with `CalendarView` toggle -- done
- Journey node deletion via Delete key -- done
- Analytics empty state with "Configure API Keys" CTA -- done

## Remaining Items (4 fixes)

### 1. Keywords: Add Manual Keyword Entry
**File**: `src/components/ai-chat/panels/KeywordsPanel.tsx`
- Add "Add Keyword" button in header
- Dialog with fields: keyword, volume (optional), difficulty (optional)
- Insert into `keyword_library` table via `keywordLibraryService`
- Show "Connect SERP API for live data" info banner when keywords have no volume data

### 2. Journey Builder: Visual Delete Button on Nodes
**File**: `src/components/engage/journeys/nodes/CustomNodes.tsx`
- Add a small trash icon overlay on each node (visible on hover)
- Wire to the existing `handleDeleteNode` callback via node data prop
- Delete key already works; this adds discoverability

### 3. Analytics: Export Report (CSV/PDF)
**File**: `src/pages/Analytics.tsx`
- Add "Export" button to the analytics toolbar
- CSV export: collect content_items + content_analytics data, generate CSV blob via `URL.createObjectURL`
- PDF export: use existing `html2canvas` dependency to capture the dashboard section and trigger download

### 4. Update plan.md
Mark Batches 3-5 as complete.

## Implementation Order
All 4 fixes are independent and can be done in sequence. Total scope: ~4 files, ~200 lines of new code.

