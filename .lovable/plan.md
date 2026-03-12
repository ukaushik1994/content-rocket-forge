

# AI Chat Tools: Complete Audit

## 1. Duplicate Analysis

### No True Name Duplicates Found
Every tool has a unique function name. However, there are **functional overlaps** — tools that do similar things via different paths:

| Overlap Area | Tool A | Tool B | Issue |
|---|---|---|---|
| **Campaign creation** | `create_campaign` (cross-module-tools) | `promote_content_to_campaign` (cross-module-tools) | Both create rows in `campaigns` table. `promote_content_to_campaign` also links existing content. **Not a duplicate** — different entry points, but AI could get confused on which to pick. |
| **Social post creation** | `create_social_post` (engage-action-tools) | `repurpose_for_social` (cross-module-tools) | `repurpose_for_social` fetches content then generates social posts via AI. `create_social_post` directly inserts. **Not a duplicate** — different workflows. |
| **Social scheduling** | `schedule_social_post` (engage-action-tools) | `schedule_social_from_repurpose` (cross-module-tools) | `schedule_social_post` updates one existing post. `schedule_social_from_repurpose` bulk-creates and schedules multiple posts. **Not a duplicate** — different cardinality. |
| **Content generation** | `generate_full_content` (content-action-tools) | `start_content_builder` / `launch_content_wizard` (content-action-tools) | `generate_full_content` is fully automated. The other two open interactive UI wizards. **Not a duplicate** — automated vs guided. |

### Verdict: Zero actual duplicates. The functional overlaps are intentional — they serve different user intents.

---

## 2. Complete AI Chat Capability Map

### READ Tools (25 total)

| # | Tool | Module | What it fetches |
|---|---|---|---|
| 1 | `get_content_items` | Core | Content repository items with status, SEO score, type filtering |
| 2 | `get_keywords` | Core | Keyword library with volume/difficulty filters |
| 3 | `get_proposals` | Core | AI strategy proposals with status/priority filtering |
| 4 | `get_solutions` | Core | Business offerings/products with full metadata |
| 5 | `get_seo_scores` | Core | SEO content scores from `seo_content_scores` table |
| 6 | `get_serp_analysis` | Core | SERP analysis history (always fresh, no cache) |
| 7 | `get_competitors` | Core | Competitor profiles with SWOT, intelligence, nested solutions |
| 8 | `get_competitor_solutions` | Core | Competitor products with pricing, features, tech specs |
| 9 | `get_calendar_items` | Core | Editorial calendar with date range and status filters |
| 10 | `get_pending_approvals` | Core | Content items awaiting review/approval |
| 11 | `get_social_posts` | Core | Social media posts with scheduling info |
| 12 | `get_email_templates` | Core | Email templates by category |
| 13 | `get_topic_clusters` | Core | Topic cluster structures with importance scores |
| 14 | `get_content_gaps` | Core | Identified content gaps and opportunities |
| 15 | `get_strategy_recommendations` | Core | Strategy recommendations with priority/status |
| 16 | `get_repurposed_content` | Core | Repurposed content versions by format |
| 17 | `get_email_threads` | Core | Email inbox threads |
| 18 | `get_activity_log` | Core | Workspace activity events |
| 19 | `get_company_info` | Core | Company/business details |
| 20 | `get_campaign_intelligence` | Campaign | Comprehensive campaign dashboard (queue + content + performance) |
| 21 | `get_queue_status` | Campaign | Real-time content generation queue |
| 22 | `get_campaign_content` | Campaign | Content items belonging to a campaign |
| 23 | `get_engage_contacts` | Engage | CRM contacts with tags/subscription filtering |
| 24 | `get_engage_segments` | Engage | Audience segments with member counts |
| 25 | `get_engage_journeys` | Engage | Customer journeys with enrollment data |
| 26 | `get_engage_automations` | Engage | Automation rules with execution stats |
| 27 | `get_engage_email_campaigns` | Engage | Email campaigns with delivery analytics |
| 28 | `get_brand_voice` | Brand/Analytics | Brand guidelines (tone, personality, values) |
| 29 | `get_content_performance` | Brand/Analytics | Content analytics (requires API keys) |

**Actual count: 29 read tools** (the system prompt says 25 — this is inaccurate)

### WRITE Tools (46 total)

| # | Tool | Module | Action |
|---|---|---|---|
| **Content Management** | | | |
| 1 | `create_content_item` | Content | Create content draft with auto SEO scoring |
| 2 | `update_content_item` | Content | Update content title/body/status/meta |
| 3 | `delete_content_item` | Content | Archive (soft delete) content |
| 4 | `generate_full_content` | Content | AI-generate full article from keyword with auto SEO |
| 5 | `start_content_builder` | Content | Open Content Builder UI with pre-filled data |
| 6 | `launch_content_wizard` | Content | Launch interactive content wizard |
| **Approvals** | | | |
| 7 | `submit_for_review` | Content | Submit content for review |
| 8 | `approve_content` | Content | Approve pending content |
| 9 | `reject_content` | Content | Reject/request changes on content |
| **Calendar** | | | |
| 10 | `create_calendar_item` | Content | Schedule content on editorial calendar |
| 11 | `update_calendar_item` | Content | Reschedule/update calendar item |
| 12 | `delete_calendar_item` | Content | Remove calendar item |
| **Keywords & Research** | | | |
| 13 | `add_keywords` | Keyword | Add keywords to library (with upsert) |
| 14 | `remove_keywords` | Keyword | Remove keywords by ID or name |
| 15 | `trigger_serp_analysis` | Keyword | Run live SERP analysis via API |
| 16 | `trigger_content_gap_analysis` | Keyword | Analyze content gaps for a topic |
| 17 | `create_topic_cluster` | Keyword | Generate topic cluster with subtopics |
| **Business Intelligence** | | | |
| 18 | `create_solution` | Offerings | Create new product/offering |
| 19 | `update_solution` | Offerings | Update offering details |
| 20 | `delete_solution` | Offerings | Delete offering |
| 21 | `update_company_info` | Offerings | Update company details |
| 22 | `add_competitor` | Offerings | Add competitor profile |
| 23 | `update_competitor` | Offerings | Update competitor info |
| 24 | `trigger_competitor_analysis` | Offerings | AI-powered competitor analysis |
| **CRM & Engage** | | | |
| 25 | `create_contact` | Engage | Create CRM contact |
| 26 | `update_contact` | Engage | Update contact info |
| 27 | `tag_contacts` | Engage | Bulk tag contacts |
| 28 | `create_segment` | Engage | Create audience segment |
| 29 | `create_email_campaign` | Engage | Create email campaign draft |
| 30 | `send_email_campaign` | Engage | Send/schedule email campaign |
| 31 | `create_journey` | Engage | Create customer journey |
| 32 | `activate_journey` | Engage | Activate draft journey |
| 33 | `create_automation` | Engage | Create automation rule |
| 34 | `toggle_automation` | Engage | Enable/disable automation |
| 35 | `enroll_contacts_in_journey` | Engage | Manual journey enrollment |
| 36 | `send_quick_email` | Engage | Send one-off email |
| 37 | `create_social_post` | Engage | Create/schedule social post |
| 38 | `update_social_post` | Engage | Edit social post content/status |
| 39 | `schedule_social_post` | Engage | Schedule existing social post |
| 40 | `create_email_template` | Engage | Create reusable email template |
| 41 | `update_email_template` | Engage | Edit email template |
| **Deletions** | | | |
| 42 | `delete_contact` | Engage | Delete CRM contact |
| 43 | `delete_segment` | Engage | Delete segment |
| 44 | `delete_email_campaign` | Engage | Delete email campaign |
| 45 | `delete_journey` | Engage | Delete journey |
| 46 | `delete_automation` | Engage | Delete automation |
| 47 | `delete_social_post` | Engage | Delete social post |
| **Cross-Module Orchestration** | | | |
| 48 | `promote_content_to_campaign` | Cross-Module | Content → Campaign |
| 49 | `content_to_email` | Cross-Module | Content → Email campaign |
| 50 | `campaign_content_to_engage` | Cross-Module | Campaign → Email campaign |
| 51 | `repurpose_for_social` | Cross-Module | Content → Social posts (AI-generated) |
| 52 | `publish_to_website` | Cross-Module | Content → WordPress/Wix |
| 53 | `create_campaign` | Cross-Module | Create campaign from scratch |
| 54 | `schedule_social_from_repurpose` | Cross-Module | Bulk save/schedule repurposed social posts |
| **Campaigns** | | | |
| 55 | `trigger_content_generation` | Campaign | Start campaign content generation |
| 56 | `retry_failed_content` | Campaign | Retry failed generation items |
| **Proposals & Strategy** | | | |
| 57 | `accept_proposal` | Proposals | Accept proposal → schedule to calendar |
| 58 | `reject_proposal` | Proposals | Dismiss proposal |
| 59 | `create_proposal` | Proposals | Create new proposal manually |
| 60 | `accept_recommendation` | Strategy | Accept strategy recommendation |
| 61 | `dismiss_recommendation` | Strategy | Dismiss recommendation |
| **Brand** | | | |
| 62 | `update_brand_voice` | Brand | Update brand guidelines |

### Special Tools (not in TOOL_DEFINITIONS, used separately)
| Tool | Purpose |
|---|---|
| `generate_campaign_strategies` | Structured output tool for campaign strategy generation (used via CAMPAIGN_STRATEGY_TOOL) |

---

### Grand Total: 29 Read + 62 Write + 1 Special = **92 tool definitions**

---

## 3. Issues Found

### A. System Prompt Count is Wrong
The system prompt in `index.ts` claims "25 read tools" — the actual count is **29**. This should be corrected.

### B. `generate_campaign_strategies` is a Phantom Tool
It's defined in `campaign-strategy-tool.ts` and imported in `index.ts`, but its switch case in `tools.ts` (line 858-860) just returns `toolArgs` as-is — it's a formatting passthrough, not a real data tool. It's also NOT in `TOOL_DEFINITIONS` (it's added separately in `index.ts` as `CAMPAIGN_STRATEGY_TOOL`). This is intentional but worth noting.

### C. No Functional Duplicates Requiring Action
All overlapping tools serve distinct purposes as documented above.

---

## Recommendation

No code changes needed for duplicates. The only fix worth making is updating the system prompt tool count from "25" to "29" read tools to match reality. This is a one-line change and doesn't warrant a batch.

