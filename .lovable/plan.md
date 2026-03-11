

# Plan: Complete AI Chat Platform Awareness

## Problem
The `PLATFORM_KNOWLEDGE_MODULE` (inlined in `enhanced-ai-chat/index.ts` at lines 468-511) is outdated and incomplete. It references wrong routes (e.g., `/content` instead of `/repository`, `/strategy` instead of `/research/content-strategy`), lists non-existent standalone pages (`/competitors`, `/brand`), and entirely omits major modules like Content Approval, Editorial Calendar, Research Intelligence sub-pages, Glossary Builder, and the full Engage sub-module breakdown.

The `shared/prompt-modules.ts` version (lines 583-695) is more detailed but equally outdated on routes and missing modules.

## What Changes

### Single file edit: `supabase/functions/enhanced-ai-chat/index.ts`
Replace the inlined `PLATFORM_KNOWLEDGE_MODULE` (lines 468-511) with a comprehensive, route-accurate module covering every page and feature.

### Updated Module Structure

```text
PLATFORM_KNOWLEDGE_MODULE (rewritten)
├── Platform Identity (Creaiter = AI content marketing platform)
├── Navigation Structure (sidebar sections)
│   ├── CHATS: AI Chat (/ai-chat) — Control Centre
│   ├── LIBRARY: Repository (/repository), Offerings (/offerings), Approvals (/content-approval)
│   ├── TOOLS: Campaigns (/campaigns), Keywords (/keywords), Analytics (/analytics)
│   ├── RESEARCH: Content Strategy, SERP Intelligence, Topic Clusters, Content Gaps, Calendar
│   └── ENGAGE: Email, Contacts, Segments, Journeys, Automations, Social, Activity
├── Module Details (each with purpose, route, key features, data tables)
│   1.  AI Chat (/ai-chat) — Control Centre, greeting, quick actions, + menu tools
│   2.  Content Wizard (chat sidebar panel) — blog 5-step vs quick 2-step
│   3.  Research Intelligence (chat sidebar panel) — topic clusters, gaps, strategies
│   4.  Analyst (chat sidebar panel) — data visualization companion
│   5.  Repository (/repository) — format-organized tabs, repurposed content
│   6.  Offerings (/offerings) — product/service profiles, auto-fill briefs
│   7.  Content Approval (/content-approval) — review workflows
│   8.  Glossary Builder (/glossary-builder) — terminology management
│   9.  Campaigns (/campaigns) — strategy-to-execution pipeline
│   10. Keywords (/keywords) — keyword library, SERP data
│   11. Analytics (/analytics) — performance dashboards
│   12. Content Strategy (/research/content-strategy) — proposals, pipeline
│   13. SERP Intelligence (/research/serp-intelligence) — live SERP analysis
│   14. Topic Clusters (/research/topic-clusters) — pillar/cluster mapping
│   15. Content Gaps (/research/content-gaps) — gap identification
│   16. Editorial Calendar (/research/calendar) — scheduling, status tracking
│   17. Engage Email (/engage/email) — inbox, campaigns, drafts, templates
│   18. Engage Contacts (/engage/contacts) — CRM, tags, bulk actions
│   19. Engage Segments (/engage/segments) — audience segmentation
│   20. Engage Journeys (/engage/journeys) — multi-step workflows
│   21. Engage Automations (/engage/automations) — trigger-based rules
│   22. Engage Social (/engage/social) — multi-platform publishing, inbox
│   23. Engage Activity (/engage/activity) — unified event log
│   24. Settings (modal) — AI provider config, brand guidelines, integrations
├── Key Data Pipelines (same 4 pipelines, with corrected routes)
├── AI Chat Tools Summary (what you can DO, not just read)
│   ├── Read tools: 18 data-fetching tools
│   ├── Write tools: content CRUD, keyword CRUD, offering CRUD
│   ├── Engage tools: contact/segment/journey/automation/email CRUD
│   └── Cross-module: promote content→campaign, content→email, repurpose→social
└── Smart Behaviors (contextual guidance)
```

### Also update: `shared/prompt-modules.ts`
Sync the same rewritten module there so both copies match.

### Token Budget Consideration
The current inlined module is ~500 tokens. The new version will be ~1,200 tokens — still well within the normal budget ceiling (25k). The graduated fallback system already strips it in high-token scenarios, so no risk.

### Query Analyzer Enhancement
**File**: `supabase/functions/enhanced-ai-chat/query-analyzer.ts`

Add missing intent categories so the AI properly routes queries about:
- Approvals (`/content-approval`) — add `needsApprovals` pattern
- Calendar (`/research/calendar`) — add `needsCalendar` pattern  
- Research sub-pages — add `needsResearch` pattern
- Glossary — add `needsGlossary` pattern
- Social — already covered under `needsEngage` but add specific social patterns

These new categories ensure the AI fetches relevant context when users ask about these modules.

---

**Files modified**: 2
- `supabase/functions/enhanced-ai-chat/index.ts` (replace PLATFORM_KNOWLEDGE_MODULE, ~lines 468-511)
- `supabase/functions/enhanced-ai-chat/query-analyzer.ts` (add missing intent patterns)

**Files NOT modified**: `shared/prompt-modules.ts` (not imported by the edge function — it uses the inlined copy)

