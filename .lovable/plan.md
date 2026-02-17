

# AI-Powered Engage Module -- Feature Innovation Plan
## Email, Contacts, Segments, Social, Activity

This plan introduces AI-native capabilities across every Engage module, transforming it from a manual CRM into an intelligent, autonomous marketing engine. Every feature below uses the existing `ai-proxy` pattern (user's configured AI provider) with Lovable AI Gateway as fallback.

---

## Architecture: New Edge Functions

All AI features route through dedicated edge functions that call `ai-proxy`. Each function handles one domain to keep things modular and testable.

| Edge Function | Purpose |
|---|---|
| `engage-ai-writer` | Generates email bodies, subject lines, social posts from prompts |
| `engage-ai-scoring` | Scores contacts, predicts churn, computes engagement health |
| `engage-ai-segments` | Converts natural language to segment rules (JSON) |
| `engage-ai-analytics` | Generates activity summaries, anomaly detection, next-best-action |
| `engage-ai-social` | Repurposes content, suggests hashtags, recommends post times |

---

## Phase 1: Email AI

### E-AI-1: AI Email Writer
**What**: "Write with AI" button in the template editor. User provides a brief (topic, tone, length) and AI generates a full HTML email body matching their brand voice.
- New dialog in `TemplatesList.tsx` with prompt input fields (topic, tone, CTA, length)
- Calls `engage-ai-writer` edge function with `use_case: 'email_body'`
- Returns structured HTML that populates the template editor
- Also supports "Improve This" -- select existing body text, AI rewrites it

### E-AI-2: AI Subject Line Generator
**What**: Generate 5 subject line variations with predicted engagement level (High/Medium/Low) based on best practices.
- Button in template editor and campaign wizard
- Calls `engage-ai-writer` with `use_case: 'subject_lines'` and email body context
- Returns array of `{ subject: string, confidence: 'high' | 'medium' | 'low', reason: string }`
- User picks one or regenerates

### E-AI-3: Smart Send Time Optimization
**What**: AI analyzes contact engagement history (open times, click times from `email_messages`) to recommend optimal send time per campaign.
- New "Optimize Send Time" button in the campaign scheduler step
- Calls `engage-ai-analytics` with aggregated open/click timestamp distributions
- Returns recommended day + hour with reasoning
- Users can accept or override

### E-AI-4: Deliverability Intelligence
**What**: AI reviews email content for spam triggers, readability, and compliance issues before sending.
- "Check Deliverability" button in template preview
- Calls `engage-ai-writer` with `use_case: 'deliverability_check'`
- Returns score (0-100), issues list (spam words, missing unsubscribe, image-to-text ratio), and fix suggestions
- Visual scorecard with red/yellow/green indicators

---

## Phase 2: Contacts & Segments AI

### C-AI-1: AI Contact Scoring (Lead Scoring)
**What**: Automatically score every contact 0-100 based on engagement signals (email opens, clicks, events, journey completions, recency).
- New `engagement_score` computed field displayed as a badge on contact cards
- "Recalculate Scores" button calls `engage-ai-scoring` edge function
- The function aggregates per-contact signals from `email_messages`, `engage_events`, `journey_enrollments`, and `engage_activity_log`
- AI produces score + reasoning + recommended action (nurture, upsell, re-engage, archive)
- Scores visible in contact list with sort capability

### C-AI-2: Natural Language Segment Builder
**What**: Type "Active users who opened an email in the last 7 days but haven't purchased" and AI generates the segment rules JSON.
- New "Describe in English" input at the top of the segment creation dialog
- Calls `engage-ai-segments` edge function with the natural language description
- AI returns `SegmentDefinition` JSON (match + rules array) using tool calling for structured output
- Rules auto-populate the existing `RuleBuilder` for user review and tweaking
- User can still manually build rules as before

### C-AI-3: Predictive Churn Detection
**What**: AI identifies contacts at risk of disengagement based on declining activity patterns.
- "Churn Risk" tab in Contacts list showing contacts sorted by risk score
- Calls `engage-ai-scoring` with `use_case: 'churn_prediction'`
- AI analyzes activity frequency trends (last 7d vs 30d vs 90d), email engagement decay, event frequency
- Returns risk_level (low/medium/high/critical), predicted_churn_date, recommended_actions
- One-click "Create Re-engagement Journey" from high-risk contacts

### C-AI-4: Smart Deduplication
**What**: AI detects and suggests merging duplicate contacts using fuzzy matching.
- "Find Duplicates" button in contacts toolbar
- Edge function queries contacts and groups by similarity (email domain, name Levenshtein distance, phone patterns)
- Presents merge candidates with confidence scores
- User reviews and confirms merges (primary record selection, tag/attribute combination)

---

## Phase 3: Social AI

### S-AI-1: AI Post Writer & Repurposer
**What**: Generate platform-optimized social posts from a topic, URL, or existing content piece.
- "Write with AI" button in the create post dialog
- Input: topic/URL/paste content + select target platforms
- Calls `engage-ai-social` with `use_case: 'generate_posts'`
- Returns platform-specific versions respecting character limits (280 for Twitter, 3000 for LinkedIn, etc.)
- Each version is pre-filled into the post editor with platform toggles
- Also supports "Repurpose Email" -- select an email template and AI creates social posts from it

### S-AI-2: Smart Scheduling & Best Time to Post
**What**: AI recommends optimal posting times per platform based on audience engagement patterns.
- "Suggest Best Time" button in the scheduling section
- Calls `engage-ai-social` with `use_case: 'best_time'` + historical post performance data
- Returns recommended times per platform with reasoning
- Auto-fills the scheduler with one click

### S-AI-3: Hashtag & Trend Intelligence
**What**: AI suggests relevant, trending hashtags for post content.
- "Suggest Hashtags" button next to the hashtag section in post editor
- Calls `engage-ai-social` with post content + platform
- Returns categorized hashtags: high_reach, niche, trending, branded
- One-click insert into post content

### S-AI-4: AI Engagement Assistant
**What**: AI generates reply suggestions for social inbox mentions and comments.
- In `SocialInbox.tsx`, each incoming message gets a "Suggest Reply" button
- Calls `engage-ai-social` with `use_case: 'suggest_reply'` + message context + brand voice
- Returns 3 tone variants: professional, friendly, witty
- User picks and sends (or edits first)

---

## Phase 4: Activity & Analytics Intelligence

### A-AI-1: AI Command Center / Daily Briefing
**What**: AI-generated summary of everything that happened across all Engage channels in the last 24h/7d.
- New "AI Briefing" card at the top of the Activity Log
- Calls `engage-ai-analytics` with `use_case: 'briefing'`
- Aggregates: emails sent/opened/bounced, journeys completed, automations triggered, social posts published/engaged
- AI generates a narrative summary + 3 key insights + 3 recommended next actions
- Auto-refreshes daily or on-demand

### A-AI-2: Anomaly Detection & Proactive Alerts
**What**: AI monitors key metrics and alerts when something deviates significantly.
- Background check in `engage-job-runner` (runs every hour)
- Compares current period metrics vs historical baseline (bounce rate, open rate, unsubscribe rate, automation failure rate)
- When anomaly detected, inserts alert into `engage_activity_log` with type `ai_alert`
- Activity feed shows these with a special AI badge and recommended actions
- Example: "Bounce rate spiked to 12% (normally 3%) -- 47 emails bounced from campaign 'Spring Sale'. Check your sender domain."

### A-AI-3: Next Best Action Engine
**What**: AI proactively suggests what to do next based on current state of all channels.
- Sidebar widget or card in Activity dashboard
- Calls `engage-ai-analytics` with full workspace state summary
- Returns prioritized action list with impact estimates:
  - "Send follow-up to 234 contacts who opened but didn't click Campaign X" (High Impact)
  - "Your Welcome Series journey has 40% drop-off at Step 3 -- try shortening the wait" (Medium Impact)
  - "15 contacts tagged 'VIP' haven't been contacted in 30 days" (High Impact)
- Each action has a one-click button to execute (create campaign, edit journey, create segment)

### A-AI-4: Conversational CRM (Natural Language Analytics)
**What**: Ask questions in plain English and get instant answers with charts.
- Already partially exists via `enhanced-ai-chat` with engage tools
- Enhancement: Add a mini chat input directly in the Activity tab header
- Routes through existing `enhanced-ai-chat` with engage context pre-loaded
- Example: "How many emails did we send last week?" returns a number + mini chart
- Example: "Which campaign had the best open rate?" returns comparison visualization

---

## Database Changes

```text
-- Contact scoring results (cached, not recomputed every page load)
New table: engage_contact_scores
  id UUID PK
  workspace_id UUID (FK team_workspaces)
  contact_id UUID (FK engage_contacts)
  engagement_score INTEGER (0-100)
  churn_risk TEXT (low/medium/high/critical)
  scoring_factors JSONB
  recommended_actions TEXT[]
  computed_at TIMESTAMPTZ
  UNIQUE(workspace_id, contact_id)

-- AI briefing cache (avoid regenerating on every page load)
New table: engage_ai_briefings
  id UUID PK
  workspace_id UUID
  period TEXT (daily/weekly)
  summary TEXT
  insights JSONB
  actions JSONB
  generated_at TIMESTAMPTZ
```

---

## New Edge Functions (5 total)

### 1. engage-ai-writer
- Handles: email body generation, subject lines, deliverability checks
- Uses ai-proxy with user's configured provider
- Structured output via tool calling

### 2. engage-ai-scoring
- Handles: contact scoring, churn prediction
- Aggregates signals from multiple tables
- Returns structured scores via tool calling

### 3. engage-ai-segments
- Handles: natural language to segment rules conversion
- Returns SegmentDefinition JSON via tool calling
- Validates against known field names

### 4. engage-ai-analytics
- Handles: briefings, anomaly detection, next-best-action
- Heavy data aggregation before AI call
- Cached results in engage_ai_briefings

### 5. engage-ai-social
- Handles: post generation, repurposing, hashtag suggestions, reply suggestions
- Platform-aware (respects character limits)
- Returns platform-keyed content

---

## Implementation Priority

### Wave 1 -- Highest Impact (do first)
- E-AI-1: AI Email Writer (most visible, immediate value)
- S-AI-1: AI Post Writer & Repurposer (same pattern, reuses writer function)
- C-AI-2: Natural Language Segment Builder (unique differentiator)
- A-AI-1: AI Command Center / Briefing (wow factor)

### Wave 2 -- Intelligence Layer
- C-AI-1: AI Contact Scoring
- E-AI-2: AI Subject Line Generator
- A-AI-3: Next Best Action Engine
- S-AI-3: Hashtag Intelligence

### Wave 3 -- Predictive & Advanced
- C-AI-3: Predictive Churn Detection
- E-AI-3: Smart Send Time
- A-AI-2: Anomaly Detection (background job)
- S-AI-2: Best Time to Post

### Wave 4 -- Polish
- E-AI-4: Deliverability Intelligence
- C-AI-4: Smart Deduplication
- S-AI-4: AI Engagement Assistant
- A-AI-4: Conversational CRM widget

---

## Files Created
- `supabase/functions/engage-ai-writer/index.ts`
- `supabase/functions/engage-ai-scoring/index.ts`
- `supabase/functions/engage-ai-segments/index.ts`
- `supabase/functions/engage-ai-analytics/index.ts`
- `supabase/functions/engage-ai-social/index.ts`

## Files Modified
- `src/components/engage/email/templates/TemplatesList.tsx` (AI writer + subject lines + deliverability)
- `src/components/engage/email/campaigns/CampaignsList.tsx` (smart send time)
- `src/components/engage/contacts/ContactsList.tsx` (scoring badges, churn tab, dedup)
- `src/components/engage/contacts/SegmentsList.tsx` (NL segment builder)
- `src/components/engage/social/SocialDashboard.tsx` (AI writer, hashtags, best time)
- `src/components/engage/social/SocialInbox.tsx` (AI reply suggestions)
- `src/components/engage/activity/ActivityLog.tsx` (AI briefing, anomaly alerts, NL chat)
- `supabase/functions/engage-job-runner/index.ts` (anomaly detection loop, segment auto-eval)

## Summary
- 16 AI-powered features across 5 modules
- 5 new edge functions (all using ai-proxy pattern)
- 2 new database tables (scores cache + briefings cache)
- 4 implementation waves, highest-impact features first
