

# AI Chat Control Centre: Capability Gap Audit & Plan

## Current State: What the AI Chat CAN Do

### Read Tools (12 total)
| Tool | Table | Module |
|------|-------|--------|
| `get_content_items` | `content_items` | Repository |
| `get_keywords` | `keywords` | Keywords |
| `get_proposals` | `ai_strategy_proposals` | Content Strategy |
| `get_solutions` | `solutions` | Offerings |
| `get_seo_scores` | `seo_content_scores` | Analytics |
| `get_serp_analysis` | `raw_serp_data` | SERP Intelligence |
| `get_competitors` | `competitors` | Offerings |
| `get_competitor_solutions` | `competitor_solutions` | Offerings |
| `get_campaign_intelligence` | `campaigns` + `content_generation_queue` | Campaigns |
| `get_engage_contacts` | `engage_contacts` | Contacts |
| `get_engage_segments` | `engage_segments` | Segments |
| `get_engage_journeys` | `engage_journeys` | Journeys |
| `get_engage_automations` | `engage_automations` | Automations |
| `get_engage_email_campaigns` | `engage_email_campaigns` | Email |

### Write Tools (35+ total)
Content CRUD, keyword CRUD, offerings CRUD, competitor CRUD, approval workflow, full content generation, campaign triggers, engage CRUD (contacts, segments, journeys, automations, emails, social posts), cross-module (promote, repurpose, publish).

---

## Critical Gaps: What the AI Chat CANNOT Do

### Gap 1: Editorial Calendar — NO read or write tools
- **Table exists**: `content_calendar` (has title, scheduled_date, status, content_type, assigned_to, proposal_id, content_id)
- **AI cannot**: List scheduled items, create calendar entries, reschedule, check upcoming deadlines
- **User impact**: "What's on my calendar this week?" returns nothing. "Schedule this content for Friday" is impossible.

### Gap 2: Glossary — NO read or write tools
- **Tables exist**: `glossaries`, `glossary_terms` (term, definition, context, category, related_terms, glossary_id)
- **AI cannot**: List glossary terms, search definitions, create/update terms, import terms
- **User impact**: "Show me my glossary terms" fails. "Add a definition for X" is impossible.

### Gap 3: Content Approvals — NO read tool
- **Table exists**: `content_approvals` (content_id, reviewer_id, status, approval_notes, reviewed_at)
- **AI can**: Submit/approve/reject via content-action-tools (write actions work)
- **AI cannot**: List pending approvals, show approval history, show what's waiting for review
- **User impact**: "What content is pending my review?" returns nothing. The AI knows the knowledge module mentions approvals but has no tool to fetch the queue.

### Gap 4: Social Posts — NO read tool
- **Table exists**: `social_posts` (content, platform, status, scheduled_at, published_at, engagement metrics)
- **AI can**: Create and delete social posts (write tools exist)
- **AI cannot**: List existing posts, check scheduled posts, view engagement metrics, show post calendar
- **User impact**: "Show me my scheduled social posts" fails. "How did my LinkedIn posts perform?" is impossible.

### Gap 5: Email Templates — NO read or write tools
- **Table exists**: `email_templates` (name, subject, body_html, category, workspace_id)
- **AI cannot**: List templates, create/update templates, use template in campaign creation
- **User impact**: "Show me my email templates" fails. "Create a newsletter template" is impossible.

### Gap 6: Topic Clusters — NO read tool
- **Table exists**: `topic_clusters` (name, description, pillar_keyword, status, performance metrics)
- **AI can**: Create topic clusters via `create_topic_cluster` (keyword-action-tools)
- **AI cannot**: List existing clusters, view cluster performance, check subtopics
- **User impact**: "Show my topic clusters" fails. "How is my AI marketing cluster performing?" is impossible.

### Gap 7: Content Gaps — NO read tool
- **Table exists**: `content_gaps` (topic, gap_type, competition_level, opportunity_score, status, target_cluster_id)
- **AI can**: Trigger gap analysis via `trigger_content_gap_analysis`
- **AI cannot**: List existing saved gaps, check gap statuses, view resolved vs identified
- **User impact**: "What content gaps have I identified?" fails.

### Gap 8: Strategy Recommendations — NO read tool
- **Table exists**: `strategy_recommendations` (title, description, priority, status, content_type, target_keywords, estimated_impact)
- **AI cannot**: List recommendations, filter by priority/status
- **User impact**: "What strategy recommendations do I have?" fails.

### Gap 9: Repurposed Content — NO read tool
- **Table exists**: `repurposed_contents` (content_id, format_code, content, title, status)
- **AI cannot**: List repurposed versions, check which formats exist for a content piece
- **User impact**: "What repurposed versions of my article exist?" fails.

### Gap 10: Email Inbox/Threads — NO read tool
- **Tables exist**: `email_messages`, `email_threads`
- **AI can**: Create/send campaigns, send quick emails
- **AI cannot**: Read inbox threads, search emails, check delivery status of individual messages
- **User impact**: "Show me my recent emails" or "Did John reply to my email?" fails.

### Gap 11: Activity Log — NO read tool
- **Table exists**: `engage_activity_logs`
- **AI cannot**: Show recent activity, audit trail, workspace event history
- **User impact**: "What happened in my workspace today?" fails.

---

## The Plan: Close All Gaps

### Implementation: Add 11 new read tools to `enhanced-ai-chat`

**File**: `supabase/functions/enhanced-ai-chat/tools.ts` — Add new tool definitions to `CORE_TOOL_DEFINITIONS` array

**New Read Tools**:

| # | Tool Name | Table(s) | Purpose |
|---|-----------|----------|---------|
| 1 | `get_calendar_items` | `content_calendar` | List scheduled/upcoming items, filter by date range, status |
| 2 | `get_glossary_terms` | `glossary_terms` + `glossaries` | List terms, search by keyword, filter by category |
| 3 | `get_pending_approvals` | `content_approvals` + `content_items` | List items awaiting review with content titles |
| 4 | `get_social_posts` | `social_posts` | List posts by platform/status, show scheduled, engagement |
| 5 | `get_email_templates` | `email_templates` | List templates by category |
| 6 | `get_topic_clusters` | `topic_clusters` + subtopics | List clusters with performance data |
| 7 | `get_content_gaps` | `content_gaps` | List gaps by status/priority |
| 8 | `get_strategy_recommendations` | `strategy_recommendations` | List recommendations by priority/status |
| 9 | `get_repurposed_content` | `repurposed_contents` | List repurposed versions for a content piece or all |
| 10 | `get_email_threads` | `email_threads` + `email_messages` | Read inbox, search threads |
| 11 | `get_activity_log` | `engage_activity_logs` | Recent workspace events |

**New Write Tools** (add to respective action-tools files):

| # | Tool Name | Purpose |
|---|-----------|---------|
| 12 | `create_calendar_item` | Schedule content on editorial calendar |
| 13 | `update_calendar_item` | Reschedule or change status |
| 14 | `delete_calendar_item` | Remove from calendar |
| 15 | `create_glossary_term` | Add term + definition |
| 16 | `create_email_template` | Save reusable email template |

### File Changes Summary

| File | Change |
|------|--------|
| `supabase/functions/enhanced-ai-chat/tools.ts` | Add 11 read tool definitions + execution logic |
| `supabase/functions/enhanced-ai-chat/content-action-tools.ts` | Add calendar CRUD tools (3) + glossary write (1) |
| `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` | Add email template write (1) |
| `supabase/functions/enhanced-ai-chat/query-analyzer.ts` | Update intent patterns to route calendar/glossary/social/template queries |
| `supabase/functions/enhanced-ai-chat/index.ts` | Update PLATFORM_KNOWLEDGE_MODULE capabilities section to reflect new tools |

### Query Analyzer Updates
Add detection patterns so the AI auto-fetches relevant data:
- Calendar queries → `get_calendar_items`
- Glossary queries → `get_glossary_terms`
- "Pending review" → `get_pending_approvals`
- Social post queries → `get_social_posts`
- Template queries → `get_email_templates`
- Cluster queries → `get_topic_clusters`
- Gap queries → `get_content_gaps`
- Recommendation queries → `get_strategy_recommendations`
- Repurposed queries → `get_repurposed_content`

### Token Budget Impact
Adding 16 tool definitions adds ~800 tokens to the tools payload. Current tool count is ~47, new total ~63. This is within OpenAI's tool-calling limits and the function's token budget system will handle graduated fallback if needed.

