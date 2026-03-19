


# Major 80 — Phased Implementation Plan

## Phase 1: Backend Safety Nets ✅ COMPLETE

| Item | Status | What was done |
|------|--------|---------------|
| SB-18 | ✅ | Quality gate in `process-content-queue` — content with SEO < 30 flagged as `needs_review` |
| SB-19 | ✅ | Keyword difficulty warning in `keyword-action-tools.ts` — warns when difficulty > 60 and user has < 20 published articles |
| SB-20 | ✅ | Cannibalization prevention in `content-action-tools.ts` — pre-generation check for duplicate keyword targeting |

## Phase 2: Honest Messaging + Discovery ✅ COMPLETE

| Item | Status | What was done |
|------|--------|---------------|
| SB-6 | ✅ | Social dashboard honesty banner — "Posts are saved as drafts, direct publishing coming soon" always visible |
| SB-7 | ✅ | Email Resend onboarding — guidance card shown when no Resend API key configured, with link to resend.com |
| SB-11 | ✅ | Tool discovery in system prompt — AI now proactively suggests relevant tools based on conversation context |

## Phase 3: Content Lifecycle Fixes ✅ COMPLETE

| Item | Status | What was done |
|------|--------|---------------|
| SB-4 | ✅ | `rescore-all-content` edge function + Settings → Content tab with "Rescore All Content" button |
| SB-2 | ✅ | "Ready to Publish" filter (drafts with SEO ≥ 60), auto-sorted by SEO score descending |
| SB-21 | ✅ | `conversation_id` column on `content_items`, wired during AI generation, "View Source Conversation" button in detail view |
| SB-22 | ✅ | Internal links injected as actual `<a>` tags into generated HTML (matching published articles by keyword overlap) |

## Phase 4: Proposal→Action Flow + Onboarding (NEXT)

| Item | What | Where |
|------|------|-------|
| SB-1 | "Write This" on proposals | `AIProposalsHero.tsx` + wizard pre-fill |
| SB-10 | Getting Started milestones | Post-onboarding guidance component |
