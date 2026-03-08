

# Phase 2: Convert Pages to Right Panels

## What We're Doing
Converting 4 sidebar items (Repository, Offerings, Approvals, Contacts) from page navigations to right-panel components that open inside the chat interface — same pattern as Content Wizard.

## How It Works Today
The `VisualizationSidebar` already routes by `visualData.type`:
- `content_wizard` → renders `ContentWizardSidebar`
- `proposal_browser` → renders `ProposalBrowserSidebar`
- default → renders chart/data visualization

We extend this same pattern with 4 new panel types.

## Implementation

### 1. Create 4 Panel Components

Each panel is a slim wrapper that imports the existing page's core component (no rewriting logic):

**`src/components/ai-chat/panels/RepositoryPanel.tsx`**
- Imports `RepositoryTabs` + `ContentDetailModal` from existing repository components
- Uses `useContent()` for data
- Wrapped in the same slide-in shell as ContentWizardSidebar (fixed right, top-16 bottom-24)
- Close button (X) top-right

**`src/components/ai-chat/panels/OfferingsPanel.tsx`**
- Imports `SolutionManager` from `@/components/solutions/manager`
- Wraps company info, brand guidelines, competitors in scrollable panel
- Uses existing auth + supabase data fetching from Solutions.tsx

**`src/components/ai-chat/panels/ApprovalsPanel.tsx`**
- Imports `ContentApprovalView` from `@/components/approval/ContentApprovalView`
- Wraps in `ContentProvider`
- Minimal shell

**`src/components/ai-chat/panels/ContactsPanel.tsx`**
- Imports `ContactsList` from `@/components/engage/contacts/ContactsList`
- Wraps in `WorkspaceProvider`

### 2. Update VisualizationSidebar.tsx

Add 4 new type checks before the default chart render (lines ~906-928):

```
if (visualData?.type === 'repository') → <RepositoryPanel isOpen onClose />
if (visualData?.type === 'offerings') → <OfferingsPanel isOpen onClose />
if (visualData?.type === 'approvals') → <ApprovalsPanel isOpen onClose />
if (visualData?.type === 'contacts') → <ContactsPanel isOpen onClose />
```

### 3. Update ChatHistorySidebar.tsx

Change 4 items from `handleNavigation('/path')` to `handlePanel('type')`:

```
Repository  → handlePanel('repository')
Offerings   → handlePanel('offerings')
Approvals   → handlePanel('approvals')
Contacts    → handlePanel('contacts')
```

### 4. Update EnhancedChatInterface.tsx

Expand the `onOpenPanel` handler (line ~367) to handle all new panel types:

```typescript
onOpenPanel={(panelType) => {
  handleSetVisualization({ type: panelType });
}}
```

This single handler works for all panel types since the type string is what routes rendering.

### 5. Panel Shell Pattern

All 4 panels share the same shell:
```
- Fixed position: top-16 bottom-24 right-0
- Width: w-full sm:w-[500px] lg:w-[600px]
- Slide in from right (framer-motion x: 100% → 0)
- Mobile backdrop overlay
- Header with title + X close button
- ScrollArea for content
- Same glassmorphic styling as ContentWizardSidebar
```

Create a shared `PanelShell.tsx` component to avoid duplication.

## Files Changed
| File | Change |
|------|--------|
| `src/components/ai-chat/panels/PanelShell.tsx` | NEW — shared slide-in panel wrapper |
| `src/components/ai-chat/panels/RepositoryPanel.tsx` | NEW — wraps RepositoryTabs |
| `src/components/ai-chat/panels/OfferingsPanel.tsx` | NEW — wraps SolutionManager |
| `src/components/ai-chat/panels/ApprovalsPanel.tsx` | NEW — wraps ContentApprovalView |
| `src/components/ai-chat/panels/ContactsPanel.tsx` | NEW — wraps ContactsList |
| `src/components/ai-chat/VisualizationSidebar.tsx` | Add 4 type checks (~5 lines each) |
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Change 4 nav items to panel triggers |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Generalize onOpenPanel handler |

## What Stays
- All standalone page routes remain functional (bookmarkable, direct access)
- No existing logic is rewritten — panels import the same components pages use
- Automations + Journeys stay as page navigations (visual builders need full screen)

