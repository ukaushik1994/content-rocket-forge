

# Complete AI Chat Capability Audit — Every Question a User Can Ask

## Tool Inventory: 92 Total Tools

**29 READ tools** + **63 WRITE tools** across 11 tool files.

---

## MODULE-BY-MODULE: Every Question + Expected Behavior

### 1. REPOSITORY (Panel — `visualData.type: "repository"`)

**Browse/Search (opens panel):**
- "Find my blog about AI"
- "Show me all my published content"
- "What did I write about marketing?"
- "Open my content library"
- "Read my article on email automation"
- "Search my content for [keyword]"
- "How many articles do I have?"
- "Show me my drafts"
- "What content is archived?"
- "Find content with SEO score above 80"

**Create (uses tools — no panel):**
- "Write an article about [topic]" → `generate_full_content`
- "Create a blog post on [topic]" → `launch_content_wizard` (opens wizard panel)
- "Draft a quick article about AI" → `create_content_item`
- "Help me write content about [topic]" → `start_content_builder`

**Edit (uses tools):**
- "Update my blog titled [name]" → `update_content_item`
- "Change the title of article X to Y" → `update_content_item`
- "Publish my draft about [topic]" → `update_content_item` (status: published)
- "Archive the article about [topic]" → `delete_content_item`

**Calendar (uses tools):**
- "Schedule content for next Monday" → `create_calendar_item`
- "What's on my content calendar this week?" → `get_calendar_items`
- "Move my scheduled post to Friday" → `update_calendar_item`
- "Remove the article from the calendar" → `delete_calendar_item`
- "What's planned for March?" → `get_calendar_items` with date range

**Submit for review:**
- "Submit this article for review" → `submit_for_review`
- "Send my blog for approval" → `submit_for_review`

---

### 2. APPROVALS (Panel — `visualData.type: "approvals"`)

**Browse (opens panel):**
- "What's pending approval?"
- "Show me items that need review"
- "Any content waiting for my approval?"
- "How many items need review?"
- "Show approvals"

**Take action (uses tools):**
- "Approve the blog about [topic]" → `approve_content`
- "Reject the article about [topic]" → `reject_content`
- "This needs changes — add a note: [feedback]" → `reject_content` with action: request_changes
- "Approve content ID [uuid]" → `approve_content`
- "Mark [title] as approved with note: looks great" → `approve_content`

---

### 3. OFFERINGS (Text only)

**Read:**
- "What products do I have?"
- "Tell me about my [offering name]"
- "How many offerings do I have?"
- "What are the features of [product]?"
- "Who's the target audience for [offering]?"
- "List my solutions"
- "What are the use cases for [product]?"
- "Show pain points for [offering]"
- "What pricing do I have for [product]?"

**Create/Edit/Delete:**
- "Add a new product called [name]" → `create_solution`
- "Create an offering for [description]" → `create_solution`
- "Update [product] description to [new text]" → `update_solution`
- "Add feature X to [product]" → `update_solution`
- "Delete my [product] offering" → `delete_solution`
- "Change target audience for [product]" → `update_solution`

**Company Info:**
- "What's my company info?" → `get_company_info`
- "Update my company name to [name]" → `update_company_info`
- "Set my industry to SaaS" → `update_company_info`
- "What's our mission statement?" → `get_company_info`
- "Update our website URL" → `update_company_info`

---

### 4. CONTACTS (Text only)

**Read:**
- "How many contacts do I have?"
- "Show contacts tagged [tag]"
- "List my subscribers"
- "Who are my unsubscribed contacts?"
- "Find contacts with tag VIP"
- "Show my audience segments"
- "How many segments do I have?"
- "What tags are most common?"

**Create/Edit/Delete:**
- "Add contact john@example.com" → `create_contact`
- "Create contact Jane Doe, jane@co.com, tag: VIP" → `create_contact`
- "Update John's email to [new email]" → `update_contact`
- "Tag these contacts as [tag]" → `tag_contacts`
- "Unsubscribe contact [id]" → `update_contact`
- "Delete contact [name]" → `delete_contact`
- "Create a segment called Active Users" → `create_segment`
- "Build a segment of users who opened emails in last 30 days" → `create_segment`
- "Delete segment [name]" → `delete_segment`

**Enroll in journeys:**
- "Enroll John in the Welcome journey" → `enroll_contacts_in_journey`
- "Add VIP contacts to the onboarding sequence" → `enroll_contacts_in_journey`

---

### 5. CAMPAIGNS (Text + charts)

**Read:**
- "How are my campaigns doing?" → `get_campaign_intelligence` + chart
- "Show campaign [name] status" → `get_campaign_intelligence`
- "What's in my content queue?" → `get_queue_status`
- "How many items are generating?" → `get_queue_status`
- "Show failed content items" → `get_queue_status`
- "What content is in campaign [name]?" → `get_campaign_content`
- "Campaign performance breakdown" → `get_campaign_intelligence` + multi-chart
- "How many campaigns do I have?"
- "Which campaigns are active?"
- "Compare my campaigns" → multi-chart

**Create/Action:**
- "Create a campaign about [topic]" → `create_campaign`
- "Launch a new campaign for [offering]" → `create_campaign`
- "Start content generation for [campaign]" → `trigger_content_generation`
- "Resume generation" → `trigger_content_generation`
- "Retry failed items in [campaign]" → `retry_failed_content`
- "Promote my article to a campaign" → `promote_content_to_campaign`
- "Email campaign content to my contacts" → `campaign_content_to_engage`

---

### 6. EMAIL (Text only)

**Read:**
- "Show my email templates" → `get_email_templates`
- "How many email campaigns do I have?" → `get_engage_email_campaigns`
- "Which emails are scheduled?" → `get_engage_email_campaigns`
- "Show my sent campaigns" → `get_engage_email_campaigns`
- "How did my last email perform?" → `get_engage_email_campaigns`
- "Show my inbox" → `get_email_threads`
- "Any new emails?" → `get_email_threads`
- "Show open email threads" → `get_email_threads`

**Create/Send:**
- "Draft an email about [topic]" → `create_email_campaign`
- "Create a newsletter for my VIP segment" → `create_email_campaign`
- "Send email campaign [name]" → `send_email_campaign`
- "Schedule email for tomorrow 9am" → `send_email_campaign` with scheduled_at
- "Send a quick email to john@example.com" → `send_quick_email`
- "Email this article to my subscribers" → `content_to_email`
- "Create an email template for newsletters" → `create_email_template`
- "Update template [name] subject to [new subject]" → `update_email_template`
- "Delete email campaign [name]" → `delete_email_campaign`

---

### 7. SOCIAL (Text only)

**Read:**
- "Show my upcoming social posts" → `get_social_posts`
- "What posts are scheduled?" → `get_social_posts`
- "Show my draft social posts" → `get_social_posts`
- "How are my social posts doing?" → `get_social_posts`
- "Any failed social posts?" → `get_social_posts`

**Create/Schedule:**
- "Create a LinkedIn post about [topic]" → `create_social_post`
- "Write a tweet about [topic]" → `create_social_post`
- "Post on Facebook: [content]" → `create_social_post`
- "Schedule a LinkedIn post for tomorrow" → `create_social_post` with scheduled_at
- "Repurpose my blog for social" → `repurpose_for_social`
- "Share my article on Twitter and LinkedIn" → `repurpose_for_social`
- "Schedule these social posts" → `schedule_social_from_repurpose`
- "Update my social post about [topic]" → `update_social_post`
- "Reschedule social post to next Monday" → `schedule_social_post`
- "Delete my social post about [topic]" → `delete_social_post`

---

### 8. KEYWORDS (Text + charts)

**Read:**
- "Show my keywords" → `get_keywords` + chart
- "What are my top keywords by volume?" → `get_keywords` + chart
- "Keywords with difficulty under 30" → `get_keywords`
- "How many keywords am I tracking?" → text count
- "Show keywords with high volume" → `get_keywords` + chart

**Create/Research:**
- "Add keyword [term]" → `add_keywords`
- "Track these keywords: X, Y, Z" → `add_keywords`
- "Remove keyword [term]" → `remove_keywords`
- "Stop tracking [keyword]" → `remove_keywords`
- "Run a SERP analysis for [keyword]" → `trigger_serp_analysis`
- "Analyze [keyword] in search" → `trigger_serp_analysis`
- "What's ranking for [keyword]?" → `trigger_serp_analysis`
- "Find content gaps for [topic]" → `trigger_content_gap_analysis`
- "What am I missing on [topic]?" → `trigger_content_gap_analysis`
- "Create a topic cluster for [topic]" → `create_topic_cluster`
- "Build a content hub around [pillar topic]" → `create_topic_cluster`

---

### 9. ANALYTICS (Text + charts)

**Read:**
- "Show my content performance" → `get_content_performance` + multi-chart
- "How is my content doing?" → `get_content_performance` + chart
- "Compare blog performance" → chart
- "Show me traffic data" → `get_content_performance`
- "What's my bounce rate?" → `get_content_performance`
- "Show CTR for my articles" → `get_content_performance`
- "Page views this month" → `get_content_performance`
- "Which content gets most impressions?" → `get_content_performance` + chart
- "Show SEO scores for my content" → `get_seo_scores` + chart
- "What's my average SEO score?" → `get_seo_scores`
- "Content with lowest SEO scores" → `get_seo_scores`

---

### 10. JOURNEYS (Text only)

**Read:**
- "Show my customer journeys" → `get_engage_journeys`
- "What journeys are active?" → `get_engage_journeys`
- "How many journeys do I have?" → text count
- "Show paused journeys" → `get_engage_journeys`
- "Journey enrollment counts" → `get_engage_journeys`

**Create/Manage:**
- "Create a journey for onboarding" → `create_journey`
- "New drip campaign called Welcome Series" → `create_journey`
- "Activate the [name] journey" → `activate_journey`
- "Start the onboarding journey" → `activate_journey`
- "Delete journey [name]" → `delete_journey`
- "Enroll contacts in [journey]" → `enroll_contacts_in_journey`

---

### 11. AUTOMATIONS (Text only)

**Read:**
- "List my automations" → `get_engage_automations`
- "Which automations are active?" → `get_engage_automations`
- "Show inactive automations" → `get_engage_automations`
- "How many automations do I have?" → text count
- "Automation success rates" → `get_engage_automations`

**Create/Manage:**
- "Create an automation for [trigger]" → `create_automation`
- "Set up auto-tagging when contacts sign up" → `create_automation`
- "Turn on the [name] automation" → `toggle_automation`
- "Pause the [name] automation" → `toggle_automation`
- "Delete automation [name]" → `delete_automation`

---

### 12. COMPETITORS (within Offerings — text only)

**Read:**
- "Who are my competitors?" → `get_competitors`
- "Show competitor [name] SWOT" → `get_competitors`
- "Compare competitor products" → `get_competitor_solutions`
- "What's [competitor]'s pricing?" → `get_competitor_solutions`
- "Market leaders in my space" → `get_competitors`
- "Show competitor solutions for [name]" → `get_competitor_solutions`

**Create/Manage:**
- "Add competitor [name]" → `add_competitor`
- "Track competitor [name] at [website]" → `add_competitor`
- "Update [competitor] to Market Leader" → `update_competitor`
- "Analyze competitor [name]" → `trigger_competitor_analysis`
- "Scan [competitor]'s website" → `trigger_competitor_analysis`

---

### 13. PROPOSALS & STRATEGY (Text + charts)

**Read:**
- "Show my proposals" → `get_proposals` + chart
- "What strategy proposals do I have?" → `get_proposals`
- "High priority proposals" → `get_proposals`
- "Quick-win content ideas" → `get_proposals`
- "Show strategy recommendations" → `get_strategy_recommendations`
- "What should I do next?" → `get_strategy_recommendations`

**Actions:**
- "Accept proposal [title]" → `accept_proposal`
- "Schedule proposal for next week" → `accept_proposal` with date
- "Reject proposal [title]" → `reject_proposal`
- "Create a proposal for [topic]" → `create_proposal`
- "Accept the recommendation" → `accept_recommendation`
- "Dismiss recommendation [title]" → `dismiss_recommendation`

---

### 14. BRAND VOICE (Text only)

**Read:**
- "What's my brand voice?" → `get_brand_voice`
- "Show my brand guidelines" → `get_brand_voice`
- "What tone should I use?" → `get_brand_voice`
- "What phrases should I avoid?" → `get_brand_voice`
- "Show my brand personality" → `get_brand_voice`
- "What are our brand values?" → `get_brand_voice`

**Update:**
- "Change my tone to professional and friendly" → `update_brand_voice`
- "Add 'jargon-free' to my brand guidelines" → `update_brand_voice`
- "Don't use the word 'synergy'" → `update_brand_voice` (dont_use)
- "Always use 'empower' in content" → `update_brand_voice` (do_use)
- "Update target audience to B2B SaaS founders" → `update_brand_voice`
- "Set mission statement to [text]" → `update_brand_voice`

---

### 15. CROSS-MODULE WORKFLOWS (The Power Moves)

These are unique to AI Chat — users can't do these from any single page:

- "Turn my blog into a campaign" → `promote_content_to_campaign`
- "Email my article to subscribers" → `content_to_email`
- "Send campaign content to my VIP segment" → `campaign_content_to_engage`
- "Repurpose my blog for Twitter and LinkedIn" → `repurpose_for_social`
- "Publish to my WordPress site" → `publish_to_website`
- "Repurpose this content" → opens Repurpose panel (`content_repurpose`)
- "Create a campaign, generate content, then email it to VIPs" → chain of tools
- "Find my best article and share it on social" → search + repurpose

---

### 16. RESEARCH (Mixed — panels + text)

**Topic Clusters:**
- "Show my topic clusters" → `get_topic_clusters`
- "Create a cluster around [topic]" → `create_topic_cluster`
- "How is my topical authority?" → `get_topic_clusters` + chart

**Content Gaps:**
- "What content gaps do I have?" → `get_content_gaps`
- "What topics am I missing?" → `get_content_gaps`
- "Gap analysis for [topic]" → `trigger_content_gap_analysis`

**SERP:**
- "Analyze SERP for [keyword]" → `trigger_serp_analysis`
- "What's ranking for [keyword]?" → `get_serp_analysis`
- "Show me search results for [keyword]" → SERP flow

**Repurposed Content:**
- "Show repurposed versions of my content" → `get_repurposed_content`
- "What formats does my article come in?" → `get_repurposed_content`

---

### 17. ACTIVITY LOG (Text only)

- "What happened recently?" → `get_activity_log`
- "Show workspace activity" → `get_activity_log`
- "Recent events in email channel" → `get_activity_log`
- "Audit trail for today" → `get_activity_log`

---

### 18. GENERAL / META QUESTIONS

- "Hi / Hello" → conversational fast-path
- "What can you do?" → capabilities overview
- "Where is the calendar?" → route answer (/research/calendar)
- "How do I create content?" → explain wizard vs generate vs manual
- "Where are my contacts?" → route answer (/engage/contacts)
- "Help me plan a content strategy" → opens Research Intelligence panel

---

## GAPS & RISKS FOUND

| # | Issue | Impact |
|---|---|---|
| 1 | **No "update_social_post" in query-analyzer patterns** | User says "edit my social post" — `needsSocialAction` is detected but only for `schedule.*post` or `update.*social` which may not match casual phrasing |
| 2 | **No panel trigger for "content_repurpose"** | User says "repurpose my article" — AI needs to return `visualData.type: "content_repurpose"` but there's no panelHint for it in query-analyzer |
| 3 | **Calendar queries lack date computation** | The prompt says "auto-detect this week/next week" but there's no utility that computes dates — AI must do it in-context which is unreliable |
| 4 | **Competitor tools under "Offerings" umbrella** | User asking about competitors gets `needsSolutions` detected — but competitor tools are separate, may cause confusion |
| 5 | **Cross-module chains have no confirmation flow** | "Turn my blog into a campaign and email it" = 3 tools chained. No intermediate confirmation — could execute all silently |
| 6 | **"What should I do next?" falls into recommendations** | But also triggers proposals — AI gets both datasets, may confuse them |
| 7 | **Email templates vs email campaigns** | User says "show my emails" — ambiguous between `get_email_templates`, `get_engage_email_campaigns`, and `get_email_threads` |
| 8 | **Brand voice not in query-analyzer categories** | `needsBrandVoice` is detected but never added to categories array — it's detected only in the expanded read tools section (line 145) and pushed at line 155 |
| 9 | **`get_content_performance` requires API keys** | If user asks "how's my content performing?" and no GA/GSC keys are set up — tool returns error. Prompt mentions this but AI may still try |
| 10 | **No "generate image" or "generate video" in tools** | `VisualData` types include `generated_image` and `generated_video` but no tools exist to generate them — dead types |

---

## SUMMARY

The AI Chat has **deep coverage** across all modules. The main risk areas are:

1. **Ambiguous queries** — "show my emails" could mean 3 different things
2. **Missing panel hints** — content_repurpose has no query-analyzer trigger
3. **Cross-module chains** — no confirmation between chained operations
4. **Dead visual types** — image/video generation types exist but no tools to use them

No code changes needed right now — this is a reference map. When ready to implement fixes, the changes would go into `query-analyzer.ts` (better pattern matching) and `index.ts` (disambiguation rules in the prompt).

