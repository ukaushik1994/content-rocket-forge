

# Major 80 — Phased Implementation Plan

## Reality Check

Of the 60 remaining items, here's what matters:
- **11 Ship Blockers** (7 TODO + 4 PARTIAL) — must finish before any real user touches this
- **21 Month 1 items** — polish and depth
- **32 User-Driven** — parked until users ask

I'm breaking the Ship Blockers into **4 phases**, each designed to be **fully completable in one session**. I will not start a phase until the previous one is done. If something blocks mid-phase, I'll tell you.

---

## Phase 1: Backend Safety Nets (SB-18, SB-19, SB-20)

These are invisible backend guards that prevent bad output. No UI needed — purely edge function and tool-response changes.

| Item | What | Where |
|------|------|-------|
| SB-18 | Campaign quality gate — flag content with SEO < 30 as "needs_review" instead of "completed" | `process-content-queue` edge function |
| SB-19 | Keyword difficulty context — warn when targeting difficulty > 60 with < 20 articles | `keyword-action-tools.ts` response enrichment |
| SB-20 | Cannibalization prevention — pre-generation check for duplicate keyword targeting | `content-action-tools.ts` pre-check |

**Deliverable**: All three guards active. No UI changes needed.

---

## Phase 2: Honest Messaging + Discovery (SB-6, SB-7, SB-11)

Quick wins — add honesty banners and improve tool discoverability.

| Item | What | Where |
|------|------|-------|
| SB-6 | Social posting stub — banner saying "Posts saved as drafts, direct publishing coming soon" | Social dashboard + tool response text |
| SB-7 | Email Resend onboarding — setup guidance card when no Resend key configured | Engage email first-visit experience |
| SB-11 | Tool discovery — add proactive tool suggestion instruction to system prompt | `enhanced-ai-chat` system prompt |

**Deliverable**: Users see honest capability boundaries. AI suggests tools contextually.

---

## Phase 3: Content Lifecycle Fixes (SB-4, SB-2, SB-21, SB-22)

These fix the content pipeline from scoring through publishing.

| Item | What | Where |
|------|------|-------|
| SB-4 | Rescore all existing content — edge function + Settings button | New edge function + Settings UI |
| SB-2 | Draft→Publish nudge — "Ready to Publish" filter sorted by SEO score | `EnhancedContentFilters.tsx` + Repository |
| SB-21 | Content←→Conversation link — wire `conversation_id` during save, show link in detail | `content-action-tools.ts` + Repository detail |
| SB-22 | Internal links injected into HTML — post-generation link insertion | `content-action-tools.ts` |

**Deliverable**: Old content rescored, drafts surfaced for publishing, content linked to conversations, internal links actually embedded.

**Heads up**: SB-4 requires a new edge function (`rescore-all-content`). I'll build it, deploy it, and add the trigger button. If the edge function deploy fails, I'll tell you before moving on.

---

## Phase 4: Proposal→Action Flow + Onboarding (SB-1, SB-10)

The highest-impact UX improvements — reducing friction from proposal to published content.

| Item | What | Where |
|------|------|-------|
| SB-1 | "Write This" button on each proposal card → opens Content Wizard pre-filled with keyword, content type, solution_id | `AIProposalsHero.tsx` / proposal cards + wizard pre-fill |
| SB-10 | Getting Started milestones card — 3-step checklist (add offering → generate proposals → write first article) | Post-onboarding guidance component |

**Deliverable**: One-click proposal-to-wizard flow. New users see clear next steps after API setup.

---

## After Ship Blockers: Month 1 Sprints

Once all 4 phases above are done and verified, I'll move to Month 1 in this order:

| Sprint | Items | Focus |
|--------|-------|-------|
| Sprint 5 | M1-19, M1-8, M1-17 | Meta hooks, monthly summary, calendar overdue tracking |
| Sprint 6 | M1-1, M1-10, M1-14 | Improve existing content, auto-distribute, approval gate |
| Sprint 7 | M1-13, M1-12, M1-15, M1-22 | Published URL, brief persistence, funnel stage, target audience |
| Sprint 8 | M1-21, M1-24, M1-18 | User goals, readability scoring, last-reviewed tracking |
| Sprint 9 | M1-2, M1-3, M1-4, M1-5 | Content types, value metric, competitor solutions, consistency |
| Sprint 10 | M1-9, M1-16, M1-20, M1-23 | Proposal validation, outline learning, reformat, multi-language |

**Tier 3 (32 items)**: Not planned. Implemented only when real users request them.

---

## Ground Rules

1. **Each phase is atomic** — I finish it completely or tell you what's blocking before moving on
2. **Edge functions are the risk** — if a deploy fails or needs secrets, I stop and tell you immediately
3. **I'll verify each phase** — read back the changed files to confirm correctness before declaring done
4. **You approve each phase** — after I finish one, you confirm it works before I start the next

Ready to start with **Phase 1** on your approval.

