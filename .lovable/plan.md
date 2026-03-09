

# Email Section — Premium UI Overhaul

## Issues Found Across All Tabs

### 1. EmailDashboard (Shell)
- **Compose button goes to Inbox tab** — misleading; should open ComposeDialog directly
- **"New Campaign" goes to campaigns tab** — should open the campaign wizard directly
- **Gradient button clashes with design system** — memory says "all legacy gradients removed", but Compose button uses `bg-gradient-to-r from-blue-500 to-cyan-500`
- **Stats row icons too small** at 16px with 10px labels — hard to scan

### 2. Inbox Tab
- Solid implementation with 3-panel layout, search, status filters. Minor issues:
  - **No skeleton loading** for thread list area
  - **Status filter buttons overflow** on smaller viewports — no responsive handling

### 3. Sent Tab
- **Flat list with no visual hierarchy** — every row looks identical, no grouping by date or status
- **Detail dialog uses grid layout** that crams To/Status/Subject/Sent into a cramped 2x2 grid
- **No pagination or "load more"** — hard limit of 200

### 4. Scheduled Tab
- **No search** — unlike Sent tab which has search
- **Action buttons ("Send Now", "Cancel") are ghost variants** — destructive action (Cancel) doesn't stand out enough
- **Bare header** — just a count, no visual anchor

### 5. Drafts Tab
- **Edit button is fake** — `toast.info('Opening campaign editor...')` — does nothing
- **Launch has no confirmation** — directly mutates to 'sending' without an AlertDialog (Delete has confirmation but Launch doesn't)
- **No search** — inconsistent with other tabs

### 6. Templates Tab
- **Best-designed tab** — has thumbnail previews, visual builder, AI tools
- **Delete has no confirmation** — one-click destructive action
- **Template cards are dense** — variables list + usage badge + date all cramped at the bottom

### 7. Campaigns Tab
- **"Loading..." plain text** — line 491, still not using skeletons
- **Stats section header "Campaigns"** uses gradient text — clashes with design system
- **Status stats row (Draft/Sending/Complete)** uses gradient backgrounds — should be flat per design system
- **Campaign cards are information-heavy** — status badge + template + date + audience + sent/delivered/failed stats all in one row

### 8. Reports Tab
- **Well-structured** with date range, summary cards, charts
- **Pie chart labels overlap** on small datasets
- **No export functionality** — users can't download report data

## Plan

### Phase 1: Dashboard Shell Polish
**File: `EmailDashboard.tsx`**
- Fix Compose button to open ComposeDialog directly (add `showCompose` state)
- Fix "New Campaign" to open campaign wizard (pass callback or use context)
- Replace gradient button with solid monochrome (`bg-foreground text-background`) per design system
- Increase stat pill icon/text sizes for better scannability

### Phase 2: Consistency Pass — Search & Skeletons
**Files: `ScheduledList.tsx`, `DraftsList.tsx`**
- Add search bar to Scheduled and Drafts tabs (matching Sent tab pattern)
- Fix Drafts "Edit" button to actually open the campaign wizard
- Add confirmation dialog to Draft "Launch" action
- Add search count display

### Phase 3: Campaigns Loading & Design System
**File: `CampaignsList.tsx`**
- Replace "Loading..." text with skeleton cards
- Remove gradient text from "Campaigns" header
- Remove gradient backgrounds from status stat cards — use flat borders/accents instead
- Clean up campaign card density: move sent/delivered/failed into a compact inline badge row

### Phase 4: Templates Safety
**File: `TemplatesList.tsx`**
- Add AlertDialog confirmation before template delete (matching Drafts pattern)
- Clean up card bottom section spacing

### Phase 5: Sent Tab Detail Dialog
**File: `SentList.tsx`**
- Improve detail dialog layout: stack fields vertically instead of 2x2 grid
- Add date grouping headers (Today, Yesterday, This Week) to the list

### Phase 6: Dashboard Compose Integration
**Files: `EmailDashboard.tsx`**
- Import and mount `ComposeDialog` at dashboard level
- Wire Compose button to open it from any tab

## Files to Edit

| File | Key Changes |
|------|-------------|
| `EmailDashboard.tsx` | ComposeDialog integration, remove gradients, fix button actions, larger stats |
| `ScheduledList.tsx` | Add search bar |
| `DraftsList.tsx` | Add search, fix Edit action, add Launch confirmation |
| `CampaignsList.tsx` | Skeleton loading, remove gradients, cleaner cards |
| `TemplatesList.tsx` | Add delete confirmation dialog |
| `SentList.tsx` | Better detail dialog, date group headers |

6 files, no new dependencies.

