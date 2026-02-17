

# AI Chat Universal Action Engine
## Full Cross-Module Write Access for Every Module

This plan transforms the AI Chat from a read-and-visualize tool into a full-stack command center that can take real actions across every module in the system -- all at once, with cross-module chaining.

---

## Current State vs Target State

### What the AI can do TODAY:
- **READ** data from: Content, Keywords, Proposals, Solutions, Competitors, SEO, SERP, Campaigns, Engage (contacts, segments, journeys, automations, email campaigns)
- **WRITE/ACT** in: Campaigns only (trigger generation, retry failed)

### What the AI will do AFTER this plan:
- **Full CRUD** in: Content Builder, Repository, Approvals, Keywords, Research, Offerings/Solutions, Company/Competitors, Engage (contacts, emails, segments, journeys, automations)
- **Cross-module chaining**: e.g. "Find my best campaign content and email it to VIP contacts"

---

## Architecture

All new action tools are added to a single new file: `engage-intelligence-tool.ts` pattern is replicated per domain. The `tools.ts` file aggregates everything. The `query-analyzer.ts` gets new intent patterns for write operations.

### New Tool Module Files (inside `supabase/functions/enhanced-ai-chat/`)

| File | Domain | Actions |
|---|---|---|
| `content-action-tools.ts` | Content Builder + Repository | Create content, update status, edit, delete, submit for review |
| `keyword-action-tools.ts` | Keywords + Research | Add/remove keywords, trigger SERP analysis |
| `offerings-action-tools.ts` | Solutions + Company + Competitors | Create/edit solutions, update company info, add competitors |
| `engage-action-tools.ts` | Engage (all) | Create contacts, send emails, build segments, manage journeys, toggle automations |
| `cross-module-tools.ts` | Cross-module orchestration | Chain reads and writes across modules |

---

## Tool Definitions (37 new action tools)

### 1. Content Builder & Repository Actions (8 tools)

```text
create_content_item
  - Creates a new content draft in the repository
  - Params: title, content, content_type, keywords[], seo_score, status
  - Returns: created item with ID

update_content_item
  - Updates an existing content item (title, content, status, metadata)
  - Params: content_id, fields to update
  - Returns: updated item

delete_content_item
  - Moves content to archived status (soft delete)
  - Params: content_id
  - Returns: confirmation

submit_for_review
  - Changes approval_status to 'pending_review'
  - Params: content_id, notes (optional)
  - Returns: approval record

approve_content
  - Sets approval_status to 'approved'
  - Params: content_id, notes
  - Returns: updated status

reject_content
  - Sets approval_status to 'rejected' or 'needs_changes'
  - Params: content_id, notes, action ('reject' | 'request_changes')
  - Returns: updated status

generate_full_content
  - End-to-end: keyword -> SERP -> outline -> full article -> save to repository
  - Calls ai-proxy for content generation
  - Params: keyword, content_type, tone, length, solution_id (optional)
  - Returns: saved content item with ID

start_content_builder
  - Prepares a content builder session and returns navigation URL
  - Params: keyword, solution_id, suggested_title
  - Returns: { action: 'navigate', url: '/content-builder', payload: {...} }
```

### 2. Keywords & Research Actions (5 tools)

```text
add_keywords
  - Adds one or more keywords to the user's keyword library
  - Params: keywords[] (with optional volume, difficulty)
  - Returns: created keyword records

remove_keywords
  - Removes keywords from the library
  - Params: keyword_ids[] or keyword_names[]
  - Returns: confirmation

trigger_serp_analysis
  - Triggers SERP analysis for a keyword via serp-api edge function
  - Params: keyword, location (optional)
  - Returns: SERP analysis results

trigger_content_gap_analysis
  - Analyzes content gaps using AI based on existing content and keywords
  - Params: topic or keyword
  - Returns: gap analysis with recommendations

create_topic_cluster
  - Generates a topic cluster structure from a pillar topic
  - Params: pillar_topic, subtopic_count
  - Returns: cluster definition
```

### 3. Offerings/Solutions & Company Actions (7 tools)

```text
create_solution
  - Creates a new offering/solution
  - Params: name, description, features[], use_cases[], target_audience
  - Returns: created solution

update_solution
  - Updates an existing solution
  - Params: solution_id, fields to update
  - Returns: updated solution

delete_solution
  - Removes a solution
  - Params: solution_id
  - Returns: confirmation

update_company_info
  - Updates company information
  - Params: name, description, industry, website, mission, values[]
  - Returns: updated company record

add_competitor
  - Adds a new competitor profile
  - Params: name, website, description, market_position
  - Returns: created competitor

update_competitor
  - Updates competitor data
  - Params: competitor_id, fields to update
  - Returns: updated competitor

trigger_competitor_analysis
  - Triggers AI intelligence extraction for a competitor
  - Params: competitor_id or competitor_name
  - Returns: analysis results
```

### 4. Engage Module Actions (12 tools)

```text
create_contact
  - Creates a new contact in Engage
  - Params: email, first_name, last_name, tags[], attributes{}
  - Returns: created contact

update_contact
  - Updates contact fields
  - Params: contact_id, fields to update
  - Returns: updated contact

tag_contacts
  - Adds tags to one or more contacts
  - Params: contact_ids[] or filter criteria, tags[]
  - Returns: updated count

create_segment
  - Creates a new audience segment (supports natural language via engage-ai-segments)
  - Params: name, description, rules (JSON or natural language string)
  - Returns: created segment with evaluated count

create_email_campaign
  - Creates a new email campaign
  - Params: name, subject, template_id or body_html, segment_id or contact_ids[]
  - Returns: created campaign (draft status)

send_email_campaign
  - Schedules or immediately sends an email campaign
  - Params: campaign_id, scheduled_at (optional, null = send now)
  - Returns: send status

create_journey
  - Creates a new customer journey
  - Params: name, description, trigger_type, steps[] (simplified)
  - Returns: created journey (draft status)

activate_journey
  - Activates a draft journey
  - Params: journey_id
  - Returns: updated journey

create_automation
  - Creates a new automation rule
  - Params: name, trigger (type + config), actions[], is_active
  - Returns: created automation

toggle_automation
  - Activates or deactivates an automation
  - Params: automation_id, is_active (boolean)
  - Returns: updated automation

enroll_contacts_in_journey
  - Manually enrolls contacts into a journey
  - Params: journey_id, contact_ids[]
  - Returns: enrollment count

send_quick_email
  - Sends a one-off email to specific contacts (not campaign)
  - Params: to_emails[], subject, body_html
  - Returns: send status
```

### 5. Cross-Module Orchestration (5 tools)

```text
find_and_act
  - Meta-tool: reads from one module, acts in another
  - Used internally by the AI when it detects cross-module intent
  - Not a direct tool but a pattern the AI follows

promote_content_to_campaign
  - Takes a content item and creates a campaign around it
  - Params: content_id, campaign_name, platforms[]
  - Returns: created campaign

content_to_email
  - Takes content and creates an email campaign from it
  - Params: content_id, segment_id, subject (optional)
  - Returns: draft email campaign

campaign_content_to_engage
  - Finds campaign content and creates an Engage email campaign
  - Params: campaign_id, segment_id
  - Returns: email campaign linked to segment

repurpose_for_social
  - Takes content and creates social posts via engage-ai-social
  - Params: content_id, platforms[]
  - Returns: generated social posts ready for scheduling
```

---

## Query Analyzer Updates

The `query-analyzer.ts` needs new intent patterns to detect write operations:

```text
New patterns to detect:
- /create|add|make|build|write|draft|generate|new/i -> write intent
- /update|edit|change|modify|rename/i -> update intent
- /delete|remove|archive|trash/i -> delete intent
- /send|publish|schedule|activate|trigger|start/i -> action intent
- /approve|reject|review|submit/i -> approval intent
- /tag|label|categorize/i -> tagging intent
- /enroll|add to|move to/i -> cross-module intent

Combined with existing module detection to route to correct tools.
```

---

## Files Created

| File | Purpose |
|---|---|
| `supabase/functions/enhanced-ai-chat/content-action-tools.ts` | Content + Repository + Approval write tools |
| `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` | Keyword + Research write tools |
| `supabase/functions/enhanced-ai-chat/offerings-action-tools.ts` | Solutions + Company + Competitor write tools |
| `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` | Full Engage CRUD tools |
| `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` | Cross-module orchestration tools |

## Files Modified

| File | Changes |
|---|---|
| `supabase/functions/enhanced-ai-chat/tools.ts` | Import and aggregate all new tool modules into TOOL_DEFINITIONS + executeToolCall routing |
| `supabase/functions/enhanced-ai-chat/query-analyzer.ts` | Add write/action intent patterns, new categories: 'content_action', 'engage_action', 'offerings_action' |
| `supabase/functions/enhanced-ai-chat/index.ts` | Update TOOL_USAGE_MODULE prompt to describe all new action capabilities to the AI model |

## No Database Changes Required

All tools operate on existing tables using existing RLS policies. The AI Chat authenticates via the user's JWT, so all operations respect existing security.

---

## Technical Details

### Security Model
- Every action tool receives `supabase` (client with user JWT) and `userId`
- All DB operations use `.eq('user_id', userId)` or workspace-scoped queries
- No service role key needed -- user's permissions apply
- Engage tools use workspace_id lookup (existing pattern from engage-intelligence-tool.ts)

### Tool Execution Pattern
Each tool module follows the exact same pattern as `campaign-intelligence-tool.ts`:
1. Export `TOOL_DEFINITIONS` array (OpenAI function-calling format)
2. Export `TOOL_NAMES` array for routing
3. Export `executeToolCall(toolName, toolArgs, supabase, userId)` function
4. Internal switch statement routes to specific functions
5. Each function validates ownership, performs the action, returns structured result

### Cross-Module Chaining
The AI model naturally handles multi-step operations through conversation context. When a user says "Find my best content and email it to VIP contacts", the AI will:
1. Call `get_content_items` with `min_seo_score=80, limit=5`
2. Call `get_engage_contacts` with `tag='VIP'`
3. Call `create_email_campaign` with the content body and contact segment
4. Return a summary with actionable next steps

The `cross-module-tools.ts` provides convenience tools that combine these steps atomically.

### Content Generation (Both Options)
- **Full automation**: `generate_full_content` calls `ai-proxy` directly with the keyword, generates a full article, and saves it to `content_items` with status 'draft'
- **Builder handoff**: `start_content_builder` returns a navigation action with sessionStorage payload, which the frontend handles via `handleAction` in `useEnhancedAIChat.tsx`

---

## Summary
- 37 new action tools across 5 modules
- 5 new tool module files (all inside enhanced-ai-chat/)
- 3 existing files modified (tools.ts, query-analyzer.ts, index.ts)
- 0 database migrations needed
- Full cross-module chaining enabled from day one
- All operations respect existing RLS and user authentication

