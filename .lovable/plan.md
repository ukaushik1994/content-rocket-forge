

# Email Dashboard — Minimal Consistency Overhaul

## The Problem

The Email page lives inside the Engage layout (compact header, no hero) but still feels **cluttered** compared to other pages:

1. **Header + Stats + Tab bar = 3 separate visual bands** before any content appears — too many layers stacked vertically
2. **Stats row is always visible** even though the data is mostly zeros for new users — wasted space
3. **7 tabs in a pill bar** with a primary/secondary split that still feels like a wall of options
4. **Campaigns sub-tab has its own header + 3 stat cards + campaign list** — triple-layered within a tab
5. **Each sub-tab (Drafts, Scheduled, Sent) has its own search bar** — redundant chrome repeated per tab

Meanwhile the Keywords page uses the old 60vh gradient hero — completely different design language. But you asked about Email specifically, so this plan focuses there.

## Design Direction

Collapse the 3 bands (header, stats, tabs) into **2 bands max**: a header row with actions, and a tab bar. Move stats into a collapsible or into the Reports tab where they belong. Let the content breathe.

## Plan

### 1. Merge Header + Stats into One Row
**File: `EmailDashboard.tsx`**

Remove the separate `GlassCard` stats row entirely. Instead, show 2-3 key numbers as subtle text badges inline in the header row (e.g., "14 threads · 92% delivery"). Actions (Compose, New Campaign) stay on the right.

Before:
```
[Icon + Title]                    [New Campaign] [Compose]
[GlassCard: Threads | Rate | Campaigns | Queued]
[Inbox | Campaigns | Templates | Sent | Scheduled | Drafts | Reports]
```

After:
```
[Icon + Title + "14 threads · 92% delivery"]    [New Campaign] [Compose]
[Inbox | Campaigns | Templates | Sent | Scheduled | Drafts | Reports]
```

### 2. Simplify Tab Bar — Single Tier
Remove the primary/secondary visual split. All 7 tabs get the same style — small text pills. The active one gets `bg-muted text-foreground`, others are ghost. No icons in tabs (saves space, reduces noise). Drop the divider line between primary and secondary.

### 3. Remove Redundant Stats in Campaigns Tab
**File: `CampaignsList.tsx`**

Remove the 3-card stats grid (Draft/Sending/Complete) at the top of the campaigns tab. The campaign cards already show status badges — the stats grid is just restating the same data. Remove the separate "Campaigns" header too (the tab already says "Campaigns"). Just show the list directly.

### 4. Unify Sub-Tab Chrome
Each sub-tab (Sent, Scheduled, Drafts) currently renders its own search bar + count label. This is fine — it's per-tab filtering. But ensure they all match exactly: same height, same placeholder pattern, same count position.

### 5. Clean Up Campaign Cards
**File: `CampaignsList.tsx`**

- Remove the blue `Mail` icon from every card (redundant — you're already in the Email section)
- Remove the `BarChart3` icon next to clickable campaigns
- Tighten the `Sent: 0 · Delivered: 0 · Failed: 0` row — use a single compact string instead of 3 separate spans

## Files to Edit

| File | Changes |
|------|---------|
| `EmailDashboard.tsx` | Remove GlassCard stats row, inline key metrics in header text, flatten tab bar to single tier |
| `CampaignsList.tsx` | Remove stats grid, remove campaign header, clean card icons |

2 files, no new dependencies. Pure subtraction — removing clutter, not adding features.

