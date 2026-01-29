
# Self-Learning Content Engine: Simplified Integration Plan

## Core Philosophy

**"Content is art, not a spreadsheet."**

All technical analysis (GA4, GSC, PageSpeed, Heatmaps) happens invisibly in the backend. Users only see plain-language suggestions when their content needs attention.

---

## What Changes

| Area | Change |
|------|--------|
| **Repository Cards** | Small badge showing "X improvements suggested" when AI has recommendations |
| **Content Detail Modal** | Collapsible banner at top showing AI suggestions with checkboxes to pick and choose |
| **Backend** | Scheduled job that automatically checks published content weekly |
| **Notifications** | Push notification when content needs optimization |
| **Analytics Page** | No changes (keep current analytics only) |

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                    SCHEDULED BACKGROUND JOB                      │
│                    (Runs weekly for each user)                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              For each PUBLISHED content piece:                   │
│                                                                  │
│   1. Fetch GA4 data (bounce rate, session duration)             │
│   2. Fetch GSC data (position, CTR)                             │
│   3. Fetch PageSpeed data (Core Web Vitals)                     │
│   4. Fetch Heatmap data (scroll depth, rage clicks)             │
│                                                                  │
│   All data flows to AI → "What needs to change?"                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI CONTENT OPTIMIZER                          │
│                                                                  │
│   Receives: All performance data (user never sees raw data)     │
│   Returns:                                                       │
│     - Plain language suggestions                                 │
│     - Improved content drafts for each suggestion                │
│     - Priority (high/medium/low)                                 │
│                                                                  │
│   Example output:                                                │
│   "Your headline isn't grabbing attention. 70% of visitors      │
│    leave within 10 seconds. Try this stronger opening..."       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│     NOTIFICATION         │     │  CONTENT_OPTIMIZATION_HISTORY   │
│   (dashboard_alerts)     │     │         (database)               │
│                          │     │                                  │
│  "3 content pieces need  │     │  Stores all pending suggestions │
│   your attention"        │     │  with status: pending_review    │
│                          │     │                                  │
│  [View Suggestions]      │     │  Ready for user to review       │
└─────────────────────────┘     └─────────────────────────────────┘
```

---

## User Experience Flow

### Step 1: Badge on Content Card

When AI has pending suggestions for a content piece, a subtle badge appears:

```text
┌─────────────────────────────────────────────┐
│  [Published] [SEO: 85]     [•••]            │
│                                             │
│  How to Optimize Your Landing Page          │
│  Landing pages are crucial for...           │
│                                             │
│  [2 improvements suggested] ← NEW BADGE     │
│  Updated 3 days ago                         │
└─────────────────────────────────────────────┘
```

- Subtle amber/yellow glow or badge
- Only appears when there are pending suggestions
- Clicking opens the content detail modal

### Step 2: Suggestions Banner in Content Detail Modal

When user opens content with pending suggestions, a collapsible banner appears at the top:

```text
┌─────────────────────────────────────────────────────────────────┐
│  [How to Optimize Your Landing Page]                            │
│  Blog • Published                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ AI Suggestions ─────────────────────────────────────────┐   │
│  │  Based on recent performance, here's what we recommend:   │   │
│  │                                                           │   │
│  │  ☐ Strengthen your headline                               │   │
│  │    70% of visitors leave within 10 seconds. A more       │   │
│  │    compelling hook could improve engagement.              │   │
│  │    [Preview Change]                                       │   │
│  │                                                           │   │
│  │  ☐ Move CTA above the fold                                │   │
│  │    Only 35% of readers scroll past the intro. Your main  │   │
│  │    call-to-action should be visible immediately.          │   │
│  │    [Preview Change]                                       │   │
│  │                                                           │   │
│  │  [Apply Selected] [Dismiss All]                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ▼ Content Preview                                              │
│  ▼ Keywords                                                     │
│  ▼ Media Assets                                                 │
│  ...                                                            │
└─────────────────────────────────────────────────────────────────┘
```

- Each suggestion has a checkbox
- "Preview Change" shows before/after comparison
- "Apply Selected" creates a new draft with chosen improvements
- "Dismiss All" marks suggestions as acknowledged

### Step 3: Notification Alert

Users get notified when new suggestions are available:

```text
┌─────────────────────────────────────────────┐
│  🔔 Content Optimization Available          │
│                                             │
│  3 content pieces could perform better      │
│  with a few tweaks.                         │
│                                             │
│  [View in Repository]                       │
└─────────────────────────────────────────────┘
```

---

## Implementation Details

### Phase 1: Background Performance Check Job

**New Edge Function:** `content-performance-check`

This runs on a schedule (weekly by default) and:
1. Fetches all published content for the user
2. For each piece, gathers performance data from all sources
3. Sends data to content-optimizer AI
4. Stores suggestions in `content_optimization_history`
5. Pushes notification if suggestions exist

**Trigger:** pg_cron scheduled job

### Phase 2: Optimization Suggestions Badge

**Modified File:** `src/components/content/repository/card/ContentCardHeader.tsx`

Add a new `OptimizationBadge` component that:
- Queries `content_optimization_history` for pending suggestions
- Displays count badge if suggestions exist
- Uses subtle amber/yellow color to draw attention

**New Component:** `src/components/content/repository/card/OptimizationBadge.tsx`

### Phase 3: Suggestions Banner in Modal

**Modified File:** `src/components/repository/ContentDetailModal.tsx`

Add a new collapsible section at the very top that:
- Fetches pending suggestions from `content_optimization_history`
- Displays each suggestion with checkbox
- Shows plain-language explanation (not technical metrics)
- Preview button shows side-by-side comparison
- Apply creates new draft version
- Dismiss marks as acknowledged

**New Component:** `src/components/content/optimization/OptimizationSuggestionsBanner.tsx`

### Phase 4: Notification Integration

Use existing `pushEnhancedAlert` from `enhancedNotificationsService`:

```text
pushEnhancedAlert({
  userId,
  title: 'Content Optimization Available',
  message: '3 content pieces could perform better with a few tweaks.',
  module: 'content_optimizer',
  priority: 'medium',
  notificationType: 'info',
  actionButtons: [
    {
      id: 'view_suggestions',
      label: 'View in Repository',
      action: 'navigate',
      url: '/repository?filter=needs_optimization',
      variant: 'primary'
    }
  ]
});
```

---

## External Tool Links

For power users who want to see the raw data, we add simple external links (not dashboards):

- "View in Google Analytics" button (opens GA4 in new tab)
- "View in Search Console" button (opens GSC in new tab)
- "View in Clarity/Hotjar" button (opens heatmap tool in new tab)

These appear in Settings under the configured integration, not in the Repository.

---

## Database Changes

**No new tables needed.** Use existing:
- `content_optimization_history` - already has all needed columns
- `dashboard_alerts` - for notifications

**Add one column to `content_items`:**
```sql
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS pending_optimizations_count INTEGER DEFAULT 0;
```

This count is updated by the background job and used for quick badge display without extra queries.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/content-performance-check/index.ts` | Create | Scheduled job that checks all published content |
| `src/components/content/repository/card/OptimizationBadge.tsx` | Create | Badge showing suggestion count |
| `src/components/content/repository/card/ContentCardHeader.tsx` | Modify | Add OptimizationBadge |
| `src/components/content/optimization/OptimizationSuggestionsBanner.tsx` | Create | Collapsible banner with checkboxes |
| `src/components/repository/ContentDetailModal.tsx` | Modify | Add OptimizationSuggestionsBanner at top |
| `src/hooks/useOptimizationSuggestions.ts` | Create | Hook to fetch/manage suggestions |
| Migration SQL | Create | Add pending_optimizations_count column |

---

## What We Are NOT Building

To keep the tool simple and focused:

- No PagePerformanceDashboard component (technical data stays hidden)
- No Core Web Vitals visualization (backend uses it, user doesn't see it)
- No heatmap visualization (backend digests it into plain suggestions)
- No UnifiedPerformanceView (no new pages)
- No new tabs in Analytics page

**The AI does the technical thinking. Users just see:**
"Here's what you should change, and here's why in plain English."

---

## Example AI Suggestion (What User Sees)

Instead of showing:
```
Bounce Rate: 72% ⚠️ HIGH
LCP: 4.2s ⚠️ POOR
Scroll Depth: 35%
```

User sees:
```
"Your readers are leaving quickly. Based on how people interact 
with your page, they're not finding what they expected from the 
headline. Here's a stronger opening that matches their intent..."
```

---

## Success Criteria

1. User opens Repository and immediately sees which content needs attention
2. User clicks content card, sees plain-language suggestions at the top
3. User can preview each change before applying
4. User selects which suggestions to apply (pick and choose)
5. Updated content is saved as new draft for review
6. No technical metrics shown in the UI
7. No new pages added
8. Seamless integration into existing workflow
