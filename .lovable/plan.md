

# AI Chat Actions, Settings Consolidation & Dead Code Cleanup

## Phase 1: Fix Broken Chat Actions (7 bugs)

### 1A. Error "Settings" button → already uses `navigate:/ai-settings` (line 592 of useEnhancedAIChatDB.ts)
**Status**: Already partially fixed. The action uses `navigate:/ai-settings` which ModernActionButtons handles, but `/ai-settings` is a full page. Change to use `openSettings('api')` instead of navigation.
- **File**: `src/hooks/useEnhancedAIChatDB.ts` line 592 — change action from `navigate:/ai-settings` to `openSettings` (add a new action type `open_settings`)
- **File**: `src/components/ai-chat/ModernActionButtons.tsx` — add handler for `open_settings` action that dispatches `window.dispatchEvent(new CustomEvent('openSettings', { detail: 'api' }))`

### 1B. Edge function returns dead routes in actions
- **File**: `supabase/functions/enhanced-ai-chat/index.ts`
  - Lines 731-735: Update system prompt references `/research/content-strategy` → `/ai-proposals`, `/research/serp-intelligence` → `/keywords`, `/research/topic-clusters` → `/ai-chat`
  - Line 799: `/research/content-strategy` → `/ai-proposals`, `/research/calendar` → `/calendar`
  - Lines 2741-2744: actionableItems targetUrls → `/ai-proposals`
- **File**: `supabase/functions/enhanced-ai-chat/content-action-tools.ts` line 515: `/content-builder` → `/ai-chat`

### 1C. `confirm_action` handling
Already handled — `ModernActionButtons` line 91 catches it, and `handleAction` line 669 has a `confirm_action` case. No change needed.

### 1D. Unknown action catch-all
Already handled — `ModernActionButtons` line 152-155 converts unknown actions to chat messages, and `handleAction` line 674-677 does the same. No change needed.

### 1E. Visual data action clicks
Already handled — `EnhancedMessageBubble` lines 296-304 routes visual data actions correctly. No change needed.

### 1F. Deep dive prompts in message bubble
Already implemented — `EnhancedMessageBubble` lines 319-340. No change needed.

### 1G. Workflow action buttons → send as AI message
- **File**: `src/hooks/useEnhancedAIChatDB.ts` — `handleWorkflowAction` (around line 687). Currently does silent operations. Change to send as chat message so the AI processes the workflow step.

---

## Phase 2: Settings Consolidation

### 2A. `/ai-settings` page → open popup + redirect
- **File**: `src/pages/AISettings.tsx` — Replace with thin component that calls `openSettings('api')` on mount and returns `<Navigate to="/ai-chat" />`

### 2B. Fix all `navigate('/ai-settings')` and `window.location.href = '/ai-settings'` references
| File | Change |
|---|---|
| `src/components/ai-chat/SmartActionHandler.tsx` line 51 | `navigate('/ai-settings')` → `openSettings('api')` |
| `src/components/ai-chat/ErrorBoundary.tsx` line 116 | `window.location.href = '/ai-settings'` → dispatch openSettings event |
| `src/components/dashboard/SetupChecklist.tsx` line 73 | `route: '/ai-settings'` → add onClick that calls `openSettings('api')` |

### 2C. Dead settings files already cleaned
The previous cleanup already removed APISettings, MinimalAPISettings, EnhancedAISettings, ProviderManagement, EnhancedProviderManagement. No action needed.

---

## Phase 3: Fix Stale Route References Across Codebase

All `/research/content-strategy` references that survived the route cleanup:

| File | Line | Current | Fix |
|---|---|---|---|
| `ModernActionButtons.tsx` | 147 | `navigate('/research/content-strategy')` | → `/ai-proposals` |
| `ModernActionButtons.tsx` | 151 | `navigate('/research/content-strategy')` | → `/ai-proposals` |
| `QuickActionsPanel.tsx` | 51 | `navigate:/research/content-strategy` | → `send_message` with "Help me plan content strategy" |
| `SetupChecklist.tsx` | 81 | `route: '/research/content-strategy'` | → `/ai-chat` |
| `useOverdueContentMonitor.ts` | 37, 45 | `href = '/research/content-strategy#calendar'` | → `/calendar` |
| `notificationHelpers.ts` | 183, 341 | `url: '/research/content-strategy'` | → `/ai-proposals` |
| `StrategyWorkflowActions.tsx` | 68 | `navigate('/research/content-strategy?tab=calendar')` | → `/calendar` |

---

## Phase 4: Content Builder Component Audit

The content-builder **types** (`types/`, `contexts/content-builder/`) are shared by 9+ active modules — keep all.

**Content-builder components still actively imported** (keep):
- `serp/EmptyDataState` — used by 3 SERP components
- `steps/SerpAnalysisStep` — used by StrategyBuilderDialog
- `steps/SolutionSelector` — used by StrategyEnhancedSolutionSelector
- `steps/save/SaveStep` — used by StrategyContentSaver
- `steps/save/PublishedUrlDialog` — used by SmartActionBar, ContentAnalyticsCard
- `outline/AIOutlineGenerator` — used by StrategyEnhancedOutlineGenerator
- `outline/ai-generator/AiProviderSelector` — used by ContentRepurposingModal
- `UnsavedChangesDialog` — used by EmailBuilderDialog
- `provider/ProviderManager.tsx` — uses openSettings (functional)

**Content-builder components safe to delete** (not imported outside content-builder):
- `ContentBuilder.tsx` (the main page component — already redirects)
- `ContentIntelligencePanel.tsx`
- `ServiceCheckModal.tsx`
- `SolutionSelectionModal.tsx`
- `analysis/` directory
- `editor/` directory
- `final-review/` directory (tabs, technical — large tree)
- `hooks/` directory
- `keyword/` directory
- `optimization/` directory
- `sidebar/` directory
- `steps/` — all EXCEPT `SerpAnalysisStep`, `SolutionSelector`, `save/SaveStep`, `save/PublishedUrlDialog`, `ContentTypeStep` (check if used)

This requires a careful per-file import check before deletion. Estimated ~60-80 files removable.

---

## Phase 5: Content Repurposing Audit

Content repurposing components are **heavily used** (24 files import from them). The `RepurposePanel` in the AI chat sidebar, `ContentRepurposingModal` in Repository, and `contentFormats` utility are all active.

**Keep everything** in `src/components/content-repurposing/`. No deletions needed — these are functional and integrated.

---

## Execution Order

1. **Phase 1** (Actions) + **Phase 2** (Settings) — can run in parallel, ~10 files
2. **Phase 3** (Stale routes) — ~7 files, quick find-replace
3. **Phase 4** (Content builder cleanup) — largest phase, ~60-80 file deletions after import verification
4. **Phase 5** — No action needed, audit confirms components are active

Total: ~15 files modified, ~60-80 files deleted

