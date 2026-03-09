

# Email Dashboard — Premium UI Overhaul

## Problems

1. **40vh hero wastes space** — Same `EngagePageHero` pattern already fixed on Automations. Title, badge, glow, centered stats push content below the fold.
2. **No primary actions in header** — No "Compose" or "New Campaign" button visible until you navigate to the right tab. The most common user action is buried.
3. **7 equal-weight tabs** — Inbox, Sent, Scheduled, Drafts, Templates, Campaigns, Reports all get identical pills. Inbox/Campaigns are daily drivers; Reports/Scheduled are occasional. No hierarchy.
4. **"Loading..." text everywhere** — Drafts, Scheduled, Sent, Templates all use plain text `"Loading..."` instead of skeleton placeholders.
5. **Drafts tab is read-only** — Cards show name + template + date but zero actions (no Edit, Delete, Resume, or Launch button). Complete dead end.
6. **Scheduled "Send Now" is fake** — Calls `toast.info('Email will be sent on next processing cycle')` without actually changing status. Misleading.
7. **Reports lack date filtering** — No 7d/30d/90d selector. Shows all-time data with no way to scope it. Charts don't include opens/clicks breakdown.
8. **Stats are raw counts** — Hero shows "Threads: 0, Templates: 0" — not actionable. Should show unread count, delivery rate, or open rate.

## Plan

### 1. Replace Hero with Compact Header (EmailDashboard.tsx)

Same pattern as the Automations fix:
- Compact `h-16` flex row: left = Mail icon + "Email" title + subtitle, right = "Compose" primary button + "New Campaign" secondary button
- Below: single row of 4 mini-stat pills in a GlassCard (Threads, Unread, Delivery Rate, Campaigns Active) — actionable metrics, not raw counts
- Tab bar stays but reorganized: group into **Primary** (Inbox, Campaigns, Templates) and **Secondary** (Sent, Scheduled, Drafts, Reports) with a visual separator or smaller sizing for secondary tabs

### 2. Fix Drafts Tab (drafts/DraftsList.tsx)

- Add action buttons per card: **Edit** (opens campaign wizard), **Delete** (with confirmation), **Launch** (triggers the campaign launch flow)
- Add empty state CTA: "Create your first campaign" button
- Replace `"Loading..."` with skeleton cards

### 3. Fix Scheduled "Send Now" (scheduled/ScheduledList.tsx)

- Change `sendNow` mutation to actually update `status` from `'queued'` to `'sending'` (or set `queued_at` to `now()`) so the processing cycle picks it up immediately
- Replace `"Loading..."` with skeleton cards

### 4. Add Loading Skeletons (all sub-tabs)

Replace all `"Loading..."` text strings in DraftsList, ScheduledList, SentList, TemplatesList with 3-4 skeleton card placeholders using the existing `Skeleton` component.

### 5. Reports Date Filter (reports/EmailReports.tsx)

- Add a 7d / 30d / 90d / All toggle row at the top
- Filter `email_messages` query by `sent_at >= date_range`
- Add opens/clicks bars to the campaign performance chart (data already exists in `stats` column)

## Files to Edit

| File | Changes |
|------|---------|
| `src/components/engage/email/EmailDashboard.tsx` | Replace hero, compact header, actionable stats, tab reorganization |
| `src/components/engage/email/drafts/DraftsList.tsx` | Add Edit/Delete/Launch actions, skeleton loading, empty state CTA |
| `src/components/engage/email/scheduled/ScheduledList.tsx` | Fix sendNow mutation, skeleton loading |
| `src/components/engage/email/sent/SentList.tsx` | Skeleton loading |
| `src/components/engage/email/reports/EmailReports.tsx` | Date range filter, opens/clicks in chart |
| `src/components/engage/email/templates/TemplatesList.tsx` | Skeleton loading |

