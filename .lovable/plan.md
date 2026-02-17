

# Automations Powerhouse Enhancement Plan

## Current State Summary

The Automations module already has solid CRUD, 5 triggers, 7 action types, dry run, execution logs, rate limiting, advanced settings, and a Run Now button. This plan adds the features that separate a basic automation tool from a professional-grade marketing automation engine.

---

## Enhancement 1: Automation Analytics Dashboard

Currently, the stats grid only shows Active / Paused / Total counts. There is no visibility into performance trends, success rates over time, or which automations are performing best.

**What gets added:**
- A Recharts-based mini analytics section below the stats grid
- Bar chart: executions per day (last 7 days) with success/fail stacking
- Top 3 most-triggered automations (leaderboard)
- Overall success rate percentage with a radial progress indicator
- All data sourced from the existing `automation_runs` table -- no new DB tables needed

**File:** `AutomationsList.tsx` -- new query + chart section between stats grid and automation list

---

## Enhancement 2: Automation Templates / Presets

Users currently start from a blank form every time. There are no pre-built recipes to accelerate setup.

**What gets added:**
- A "Start from Template" button next to "New Automation" in the hero
- A template picker dialog with 6-8 common recipes:
  - Welcome Series (trigger: contact_created, actions: send_email + add_tag "welcomed")
  - Re-engagement (trigger: segment_entry for inactive, actions: send_email)
  - Tag-based Nurture (trigger: tag_added "lead", actions: wait 1 day + send_email)
  - Event Follow-up (trigger: event_occurred, actions: send_email + webhook)
  - VIP Upgrade (trigger: tag_added "vip", actions: update_field "tier" = "premium" + enroll_journey)
  - Churn Prevention (trigger: segment_entry for at-risk, actions: send_email + add_tag "retention")
- Selecting a template pre-fills the Create dialog -- user can customize before saving
- No database changes needed -- templates are hardcoded recipe objects in a separate file

**Files:**
- New file: `src/components/engage/automations/automationPresets.ts` (data)
- Modified: `AutomationsList.tsx` (template picker dialog + button)

---

## Enhancement 3: Automation Version History

There is no way to see what changed in an automation over time. If someone edits a trigger or modifies actions, the previous configuration is lost.

**What gets added:**
- Before saving edits, snapshot the current automation config into a new `automation_versions` table
- "Version History" option in the dropdown menu per automation
- A dialog showing timestamped versions with a diff view (what trigger/actions changed)
- "Restore" button to revert to any previous version

**Database change:** One new table `automation_versions` (automation_id, version_number, snapshot JSONB, created_at, created_by)

**Files:**
- DB migration for `automation_versions`
- Modified: `AutomationsList.tsx` (save mutation snapshots + version dialog)

---

## Enhancement 4: Conditional Branching (If/Else Actions)

Currently, all actions run sequentially for every triggered contact. There is no way to say "if the contact has tag X, do action A, otherwise do action B."

**What gets added:**
- A new action type: `condition_branch`
- When selected, the action card shows a RuleBuilder for the "if" condition, plus two sub-action slots (then / else)
- The edge function evaluates the branch condition per-contact and executes the appropriate sub-action
- This turns the linear action list into a lightweight decision tree

**Files:**
- Modified: `AutomationsList.tsx` (new action type UI with nested sub-actions)
- Modified: `engage-job-runner/index.ts` (branch evaluation logic)

---

## Enhancement 5: Bulk Actions on Automations

With many automations, there is no way to activate, pause, or delete multiple at once.

**What gets added:**
- Checkbox selection on each automation card
- A floating action bar (bottom of screen) when items are selected
- Bulk actions: Activate All, Pause All, Delete Selected
- Select All / Deselect All toggle

**File:** `AutomationsList.tsx` (selection state + bulk mutation + floating bar UI)

---

## Enhancement 6: Success/Failure Rate Badge Per Automation

The execution count badge currently shows total runs only. There is no at-a-glance indicator of whether an automation is healthy or failing.

**What gets added:**
- Fetch success and failure counts per automation from `automation_runs`
- Show a color-coded badge: green if >90% success, yellow 70-90%, red <70%
- Tooltip on hover shows "23 success / 2 failed (92%)"
- Uses the existing `automation_runs` table -- extends the current `execCounts` query

**File:** `AutomationsList.tsx` (enhanced query + badge rendering)

---

## Enhancement 7: Scheduling Window (Time-of-Day Restrictions)

The edge function currently fires automations at any time. There is no way to restrict execution to business hours or specific days.

**What gets added:**
- New fields in the Advanced Settings collapsible:
  - Active days: checkboxes for Mon-Sun
  - Active hours: start time / end time pickers
- Stored in the existing `rate_limit` JSONB column (e.g., `{ schedule: { days: [1,2,3,4,5], start_hour: 9, end_hour: 17 } }`)
- Edge function checks current time against schedule before executing
- No new DB columns needed -- uses existing JSONB

**Files:**
- Modified: `AutomationsList.tsx` (schedule UI in Advanced Settings)
- Modified: `engage-job-runner/index.ts` (schedule check before execution)

---

## Enhancement 8: AutomationRuns Page Enhancements

The runs audit trail page is functional but basic. It needs:

**What gets added:**
- Recharts line chart at the top showing run volume over the selected date range
- Retry button for failed runs (re-invokes the edge function for that specific automation + contact)
- Pagination (currently limited to 200 rows with no paging)
- EngageHero header with gradient styling (currently plain text)
- EngageButton for export (currently standard Button)

**File:** `AutomationRuns.tsx`

---

## Implementation Priority & Sequencing

| Priority | Enhancement | Complexity | New DB |
|----------|------------|------------|--------|
| 1 | Success/Failure Rate Badge | Low | No |
| 2 | Automation Analytics Dashboard | Medium | No |
| 3 | Automation Templates/Presets | Medium | No |
| 4 | Bulk Actions | Medium | No |
| 5 | Scheduling Window | Medium | No |
| 6 | AutomationRuns Enhancements | Medium | No |
| 7 | Version History | Medium | Yes (1 table) |
| 8 | Conditional Branching | High | No |

---

## Technical Summary

### Files Created
- `src/components/engage/automations/automationPresets.ts` (template recipes data)

### Files Modified
- `src/components/engage/automations/AutomationsList.tsx` (enhancements 1-7)
- `src/components/engage/automations/AutomationRuns.tsx` (enhancement 8)
- `supabase/functions/engage-job-runner/index.ts` (scheduling window + conditional branching)

### Database Changes
- 1 new table: `automation_versions` (for version history only)
- Zero changes to existing tables (everything else uses existing JSONB columns)

### Dependencies
- Recharts (already installed) for analytics charts
- All other features use existing UI components (GlassCard, EngageButton, RuleBuilder, etc.)

