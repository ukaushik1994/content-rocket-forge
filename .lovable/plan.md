

# Major 80 — Phased Implementation Plan

## Phase 1: Backend Safety Nets ✅ COMPLETE

| Item | Status | What was done |
|------|--------|---------------|
| SB-18 | ✅ | Quality gate in `process-content-queue` — content with SEO < 30 flagged as `needs_review` |
| SB-19 | ✅ | Keyword difficulty warning in `keyword-action-tools.ts` — warns when difficulty > 60 and user has < 20 published articles |
| SB-20 | ✅ | Cannibalization prevention in `content-action-tools.ts` — **blocks** generation and returns confirmation actions (write different angle / update existing / force generate) |

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

## Phase 4: Proposal→Action Flow + Onboarding ✅ COMPLETE

| Item | Status | What was done |
|------|--------|---------------|
| SB-1 | ✅ | "Write This" CTA on ProposalCard with primary styling; auto-opens Content Wizard via `useLocation` state in EnhancedChatInterface |
| SB-10 | ✅ | `GettingStartedChecklist` component on AI Chat welcome screen — 4 milestones (company, offerings, proposals, content) with live DB checks, progress bar, collapsible, auto-dismiss on completion |

## Phase A-E: Remaining Major 80 Items ✅ COMPLETE

| Item | Status | What was done |
|------|--------|---------------|
| SB-20 (upgrade) | ✅ | Cannibalization check now **blocks** generation — returns `requiresConfirmation: true` with action buttons instead of appending a warning |
| M1-1 | ✅ | `improve_content` tool — fetch → snapshot → AI rewrite → rescore → save, with version history support |
| M1-10 | ✅ | Post-publish distribution CTAs — after `publish_to_website`, shows "Create Social Posts", "Email Subscribers", "Done for Now" |
| M1-19 | ✅ | AI-generated meta titles/descriptions — uses a dedicated AI call for SEO-optimized meta tags, falls back to truncation |
| M1-8 | ✅ | `get_monthly_summary` tool — parallel queries across content, keywords, proposals, calendar, emails with formatted summary |
| M1-20 | ✅ | `reformat_content` tool — supports shorter/longer/casual/formal/bullets/simplify with version snapshot |
| M1-18 | ✅ | `last_reviewed_at` column + backfill, ContentDetailView updates on mount, analyst flags 90+ day stale content |

## Intentionally Deferred (No infrastructure yet)

M1-3 (content type detection), M1-5 (consistency), M1-9 (proposal validation), M1-15 (funnel stage), M1-16 (outline learning), M1-21 (user goals)
