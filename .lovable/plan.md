

# Plan: Update Project Memories

Three memory operations to bring project knowledge up to date.

---

## 1. Sidebar Strategy Memory — Already Done
The memory `architecture/sidebar-panel-strategy` already exists and is accurate. It documents the 6 panel modules (Wizard, Proposals, Repository, Approvals, Research Intelligence, Content Repurposing) and lists all text-only modules. No changes needed.

## 2. Create New Memory: 92 Tools Inventory

**Memory key:** `features/ai-chat/tool-inventory`

Organized by module with read/write classification:

- **Repository**: 5 READ (`get_content_items`, `get_calendar_items`, `get_content_performance`, `get_seo_scores`, `get_repurposed_content`) + 8 WRITE (`create_content_item`, `update_content_item`, `delete_content_item`, `generate_full_content`, `launch_content_wizard`, `start_content_builder`, `create_calendar_item`, `update_calendar_item`, `delete_calendar_item`, `submit_for_review`)
- **Approvals**: 1 READ (`get_pending_approvals`) + 2 WRITE (`approve_content`, `reject_content`)
- **Offerings**: 3 READ (`get_solutions`, `get_company_info`, `get_competitors`, `get_competitor_solutions`) + 6 WRITE (`create_solution`, `update_solution`, `delete_solution`, `update_company_info`, `add_competitor`, `update_competitor`, `trigger_competitor_analysis`)
- **Contacts**: 2 READ (`get_contacts`, `get_segments`) + 6 WRITE (`create_contact`, `update_contact`, `delete_contact`, `tag_contacts`, `create_segment`, `delete_segment`, `enroll_contacts_in_journey`)
- **Campaigns**: 3 READ (`get_campaign_intelligence`, `get_queue_status`, `get_campaign_content`) + 4 WRITE (`create_campaign`, `trigger_content_generation`, `retry_failed_content`, `promote_content_to_campaign`, `campaign_content_to_engage`)
- **Email**: 3 READ (`get_email_templates`, `get_engage_email_campaigns`, `get_email_threads`) + 5 WRITE (`create_email_campaign`, `send_email_campaign`, `send_quick_email`, `content_to_email`, `create_email_template`, `update_email_template`, `delete_email_campaign`)
- **Social**: 1 READ (`get_social_posts`) + 5 WRITE (`create_social_post`, `update_social_post`, `schedule_social_post`, `delete_social_post`, `repurpose_for_social`, `schedule_social_from_repurpose`)
- **Keywords**: 2 READ (`get_keywords`, `get_serp_analysis`) + 4 WRITE (`add_keywords`, `remove_keywords`, `trigger_serp_analysis`, `trigger_content_gap_analysis`, `create_topic_cluster`)
- **Analytics**: 2 READ (`get_content_performance`, `get_seo_scores`)
- **Journeys**: 1 READ (`get_engage_journeys`) + 3 WRITE (`create_journey`, `activate_journey`, `delete_journey`)
- **Automations**: 1 READ (`get_engage_automations`) + 3 WRITE (`create_automation`, `toggle_automation`, `delete_automation`)
- **Research**: 2 READ (`get_topic_clusters`, `get_content_gaps`)
- **Proposals/Strategy**: 2 READ (`get_proposals`, `get_strategy_recommendations`) + 4 WRITE (`accept_proposal`, `reject_proposal`, `create_proposal`, `accept_recommendation`, `dismiss_recommendation`)
- **Brand Voice**: 1 READ (`get_brand_voice`) + 1 WRITE (`update_brand_voice`)
- **Activity**: 1 READ (`get_activity_log`)
- **Publishing**: 1 WRITE (`publish_to_website`)

## 3. Update Existing Memories

**`architecture/unified-chat-architecture-v4`** — Add:
- `panelHint` and `disambiguationHint` fields in QueryIntent
- Cross-module chain confirmation rule (user approval between sequential write tools)
- Navigate-away fix (action clicks open new tab instead of leaving chat)

**`features/ai-chat/intelligence`** — Add:
- Expanded regex patterns for social post editing, competitor detection, content repurposing
- `content_repurpose` panelHint trigger
- Email disambiguation rules (templates vs campaigns vs threads)
- Brand voice category detection fix

**`features/ai-chat/expanded-action-suite`** — Add:
- Calendar CRUD tools (`create_calendar_item`, `update_calendar_item`, `delete_calendar_item`)
- Contact enrollment tool (`enroll_contacts_in_journey`)
- Publishing tool (`publish_to_website`)

---

## Implementation
All three are memory-only operations — no code files change. I will create/update project knowledge entries.

