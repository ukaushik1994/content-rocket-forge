

# Major 80 — Phased Implementation Plan

## Phase 1: Backend Safety Nets ✅ COMPLETE

| Item | Status | What was done |
|------|--------|---------------|
| SB-18 | ✅ | Quality gate in `process-content-queue` — content with SEO < 30 flagged as `needs_review` |
| SB-19 | ✅ | Keyword difficulty warning in `keyword-action-tools.ts` — warns when difficulty > 60 and user has < 20 published articles |
| SB-20 | ✅ | Cannibalization prevention in `content-action-tools.ts` — pre-generation check for duplicate keyword targeting |

## Phase 2: Honest Messaging + Discovery (NEXT)

| Item | What | Where |
|------|------|-------|
| SB-6 | Social posting stub banner | Social dashboard + tool response |
| SB-7 | Email Resend onboarding guidance | Engage email first-visit |
| SB-11 | Proactive tool suggestion in system prompt | `enhanced-ai-chat` system prompt |

## Phase 3: Content Lifecycle Fixes

| Item | What | Where |
|------|------|-------|
| SB-4 | Rescore all existing content | New edge function + Settings UI |
| SB-2 | Draft→Publish nudge filter | `EnhancedContentFilters.tsx` |
| SB-21 | Content←→Conversation link | `content-action-tools.ts` + detail view |
| SB-22 | Internal links injected into HTML | `content-action-tools.ts` |

## Phase 4: Proposal→Action Flow + Onboarding

| Item | What | Where |
|------|------|-------|
| SB-1 | "Write This" on proposals | `AIProposalsHero.tsx` + wizard pre-fill |
| SB-10 | Getting Started milestones | Post-onboarding guidance component |
