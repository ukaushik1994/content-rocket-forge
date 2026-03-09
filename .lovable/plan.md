

# Bug Fix & Polish Plan — Based on Subpage Output Report

**Overall Score: 149/216 (69%).** This plan addresses all failures and partial issues, prioritized by impact and grouped by what can be fixed now vs. what needs API readiness.

---

## Batch 1: Critical UI Bugs (No API needed)

These are broken interactions that should work today.

| # | Section | Issue | Fix |
|---|---------|-------|-----|
| 1 | AI Chat | Custom message clears input but no bubble appears | Debug message submission handler — likely state not appending user message |
| 2 | AI Chat | "New chat" doesn't show greeting | Reset conversation state AND re-trigger greeting render |
| 3 | AI Chat | Microphone button — no response, no "coming soon" | Add toast: "Voice input coming soon" |
| 4 | AI Chat | Collapsed sidebar — no tooltips | Add `<Tooltip>` wrappers on icon-only nav items |
| 5 | Repository | Campaigns tab — infinite spinner | Fix query or add empty state fallback for campaign-type content |
| 6 | Repository | No delete action on cards | Wire existing delete service to a confirmation dialog on card menu |
| 7 | Content Wizard | 406 polling errors for `ai_context_state` | Fix realtime subscription or remove polling for non-existent table/channel |
| 8 | Keywords | 400 Bad Request — malformed `metadata->mainKeyword.eq.xxx` filter | Fix Supabase query filter syntax (use `->>'mainKeyword'` or jsonb containment) |
| 9 | Keywords | Published/Draft tabs always show 0 | Fix tab filter logic to match actual content status values |
| 10 | Analytics | Campaign count shows 2 vs. 1 on Campaigns page | Align campaign counting query |

**Estimated scope: 10 targeted fixes across ~8 files**

---

## Batch 2: Approvals Workflow Hardening

Approvals scored 63% — most failures are missing workflow actions.

| Fix | Detail |
|-----|--------|
| Add Reject action | Button + status transition `pending_review` → `rejected` |
| Add Revert to Draft | Button + transition `approved`/`rejected` → `draft` |
| Status filter tabs | Add tabs: All / Pending / Approved / Rejected / Draft |
| Approval comments | Add a notes textarea on approve/reject actions, save to `approval_history` |
| Batch approve | Multi-select checkboxes + "Approve Selected" bulk action |
| AI Analysis placeholder | Change "Not analyzed" to a CTA: "Run AI Analysis" (disabled until API configured) |

**Estimated scope: ~3 files (approval page, service, types)**

---

## Batch 3: Content Wizard & Campaigns Polish

| Fix | Detail |
|-----|--------|
| Cancel button during generation | Add AbortController support + "Cancel" button visible during step 4 |
| Granular progress bar | Replace skeleton with a stepped progress indicator (Researching → Outlining → Writing → Finalizing) |
| Campaigns: validation on empty solution | Show toast error if user clicks "Start" without selecting a solution |
| Campaigns: empty state logic | Only show "Start conversation to create" when `campaigns.length === 0` |

---

## Batch 4: API-Ready Scaffolding (No keys required, graceful degradation)

These features need external APIs but should show clear setup guidance instead of broken states.

| Section | What to build |
|---------|--------------|
| **Keywords** | Manual keyword entry form (title, volume, difficulty fields — saved to DB). Show "Connect SERP API in Settings for live data" banner when no API key. |
| **Keywords** | Fix card data — pull `published_count` from `content_items` linked by keyword |
| **Email** | Rich text editor — swap textarea for a basic toolbar (bold/italic/link) using contentEditable or existing markdown support. No ESP needed for drafting. |
| **Contacts** | CSV file upload — add drag-drop zone using `<input type="file" accept=".csv">` + parse with native FileReader |
| **Social** | OAuth placeholder — change "Connected" badges to "Not Connected — Configure in Settings" with link to Settings modal |
| **Social** | Post preview — show platform-specific card preview (character limits, image ratios) even without publishing |
| **Calendar** | Week view + Day view toggles (reuse existing calendar grid logic with different granularity) |
| **Journeys** | Node deletion — add trash icon on node hover/select, wire to React Flow `removeNodes` |
| **Repository** | Bulk select — add checkbox per card + floating action bar (Delete, Change Status) |
| **Offerings** | Delete confirmation dialog before removing an offering |
| **Settings** | Password change — wire to `supabase.auth.updateUser({ password })` |

---

## Batch 5: Analytics & Reporting Readiness

| What | Detail |
|------|--------|
| Analytics empty states | Replace zero-value cards with illustrated empty states + "Connect Google Analytics" / "Connect Search Console" setup cards with links to Settings |
| Export Report | Generate a PDF/CSV from whatever data exists (even if zeros) so the button works |

---

## Implementation Order

```text
Batch 1 (Critical bugs)        → Highest impact, pure fixes
Batch 2 (Approvals)            → Completes a core workflow
Batch 3 (Wizard + Campaigns)   → Polishes content creation flow
Batch 4 (API-ready scaffold)   → Makes features usable pre-API
Batch 5 (Analytics readiness)  → Low priority, mostly empty states
```

## Summary

- **31 issues** addressed across 15 sections
- **No external API keys required** for any batch — everything is built to be "ready" with graceful fallbacks
- Batches 1-3 are pure bug fixes and missing UI logic
- Batches 4-5 add scaffolding so features work offline and are ready when APIs connect
- Each batch is independently deployable

