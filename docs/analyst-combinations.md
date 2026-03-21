# Analyst Sidebar — All Possible Section Combinations

> Based on the Stitch design (narrative timeline with numbered sections). Each section only appears when its data condition is met. This file lists every section, when it shows, all its visual variants, and the data that drives it.

---

## SECTION FORMAT

Every section follows this design pattern from the Stitch output:

```
• [NUMBER]. [SECTION LABEL]           ← dot + numbered uppercase label (gold/yellow text)

[Bold headline statement]              ← large text, keywords highlighted in color
[Highlighted keyword in green/pink]

[Data card(s)]                         ← dark glass cards with metrics
[Trend chart if applicable]            ← area/line chart inside card

[Explanatory paragraph]                ← smaller body text with bold inline data

[Narrative Prompt card]                ← question + action buttons (if decision needed)
```

---

## SECTION 01: HEALTH ASSESSMENT

**Shows when:** Always (first section when Analyst activates — healthScore is computed from platform data)

**Headline variants based on score:**

| Score range | Headline | Highlighted word | Color |
|:-----------:|----------|-----------------|-------|
| 80-100 | "Our operational health is **thriving** and momentum is building." | thriving | green |
| 60-79 | "Our operational health is **stabilizing** but requires friction reduction." | stabilizing | yellow |
| 40-59 | "Our operational health is **underperforming** — critical gaps need attention." | underperforming | amber |
| 0-39 | "Our operational health is **critical** — immediate intervention needed." | critical | red |

**Data cards (2-column grid):**

| Card | Shows when | Content |
|------|-----------|---------|
| Publish Rate | Always (if content exists) | `[published] / [total]` with progress bar. Context: "Output is X% below/above targeted velocity." |
| Aggregate Score | Always | Large number (0-100). Label: "AGGREGATE SCORE" |
| SEO Average | When published content has SEO scores | `[avg]/100` with color indicator |
| Content Volume | When < 10 articles | `[count] articles` with "Building library — 15+ for momentum" |
| Active Campaigns | When campaigns exist | `[count] active` |
| Keyword Coverage | When keywords tracked | `[count] tracked` |

**Show 2 cards max** — pick the two most critical based on health factors.

**Narrative Prompt (decision card):**

Shows when `healthScore.topCritical` exists. Poses a strategic question based on the biggest issue:

| Top critical factor | Narrative prompt | Button A | Button B |
|-------------------|-----------------|----------|----------|
| Low publish rate | "The current publication delay is our primary strategic bottleneck. Should we prioritize speed over SEO quality for the next 48 hours?" | ACCELERATE NOW | MAINTAIN QUALITY |
| Low SEO scores | "Content quality is flagged — average SEO is [X]/100. Should we pause new creation and optimize existing content?" | OPTIMIZE EXISTING | KEEP CREATING |
| No campaigns active | "Zero active campaigns means zero automated content production. Should we launch a quick campaign?" | LAUNCH CAMPAIGN | SKIP FOR NOW |
| No keywords tracked | "Without tracked keywords, we're flying blind on SEO. Should we import keyword suggestions from your content?" | AUTO-DETECT KEYWORDS | I'LL ADD MANUALLY |
| Stale drafts (>14d) | "You have [X] drafts collecting dust. Should we review and publish the best ones or archive the rest?" | REVIEW TOP DRAFTS | ARCHIVE STALE |
| Empty calendar | "Nothing scheduled for the next 2 weeks. Should I generate a content plan from your top proposals?" | GENERATE PLAN | I'LL PLAN LATER |

---

## SECTION 02: PERFORMANCE TRAJECTORY

**Shows when:** `platformData` has trend data (trendData arrays) OR `cumulativeMetrics` have change values

**Headline variants:**

| Condition | Headline | Highlighted word | Color |
|-----------|----------|-----------------|-------|
| Publish trend up | "Reach is expanding **organically** via the content network." | organically | green |
| Publish trend down | "Output velocity is **declining** — pipeline needs fuel." | declining | pink/red |
| Publish trend flat | "Performance is **holding steady** — time to push for growth." | holding steady | blue |
| SEO trend up | "Search authority is **strengthening** across your content." | strengthening | green |
| SEO trend down | "SEO quality is **eroding** — recent content needs optimization." | eroding | pink/red |
| No trend data | SKIP this section entirely | | |

**Data card:**
- Title: metric name (e.g., "GLOBAL REACH GROWTH", "CONTENT VELOCITY", "SEO TRAJECTORY")
- Value: delta from trend (`+12.4k Delta`, `-3.2 avg SEO`, `+5 articles`)
- Badge: "TRENDING UP" (green) / "TRENDING DOWN" (red) / "STABLE" (blue)
- Chart: area/line chart from `trendData` array (4 data points = 4 weeks)

**Explanatory text:** One paragraph connecting the trend to a business insight:
- Up trend: "While volume is low, the **engagement quality index** has risen to [X]% for [module], suggesting a highly receptive audience."
- Down trend: "Output has dropped [X]% compared to the previous period. The **content gap** with competitors may widen if this continues."
- Stable: "Consistent output at [X] pieces per week. Consider **increasing cadence** to capture more search territory."

---

## SECTION 03: STRATEGIC DIVERGENCE (Anomalies & Cross-Signals)

**Shows when:** `crossSignalInsights.length > 0` OR `anomalyInsights` with type `warning` or `opportunity`

**Headline variants:**

| Condition | Headline | Highlighted word | Color |
|-----------|----------|-----------------|-------|
| Has warnings | "Anomalies in frequency demand **immediate triage**." | immediate triage | pink (underlined) |
| Has opportunities only | "New expansion vectors **detected** in your data." | detected | green |
| Mixed | "Signals detected — **divergence requires attention**." | divergence requires attention | yellow |

**Insight cards (vertical stack):** Each cross-signal or anomaly as a card:

| Insight type | Icon | Card style |
|-------------|------|-----------|
| SEO declining | ⚠️ Warning triangle | Dark card, amber left border |
| Topic concentration | ⚖️ Balance | Dark card, yellow left border |
| Publishing gap | ⏰ Clock | Dark card, red left border |
| Unused proposals | 💡 Lightbulb | Dark card, green left border |
| Keyword gap | 🔑 Key | Dark card, cyan left border |
| Stale drafts | 📝 Document | Dark card, amber left border |
| Empty calendar | 📅 Calendar | Dark card, red left border |
| Low SEO published | 📉 Chart down | Dark card, red left border |
| Untapped keyword cluster | ✨ Sparkles | Dark card, green left border |
| Competitor activity | 🎯 Target | Dark card, purple left border |

Each card has:
- Icon (colored, in rounded square)
- Title (bold, 14px)
- Description (muted, 12px)
- Arrow (→) indicating it's tappable/expandable

**Narrative Prompt card:** Only if there's an actionable opportunity:

| Opportunity | Narrative | Button A | Button B |
|------------|-----------|----------|----------|
| Untapped keyword cluster | "Our AI detected a '[keyword]' trend. Would you like to pivot the current SEO strategy to capture this cluster before the competition?" | AUTHORIZE PIVOT | KEEP CURRENT ROADMAP |
| Competitor weakness found | "Competitor [name] has a gap in [topic]. Should we create content to exploit this opening?" | CREATE CONTENT | NOTE FOR LATER |
| SEO declining | "Your last 3 articles scored [X → Y → Z]. Should we pause and optimize, or investigate why quality dropped?" | PAUSE & OPTIMIZE | INVESTIGATE ROOT CAUSE |
| Publishing gap | "It's been [X] days since your last publish. Your usual cadence is [Y] days. Should we fast-track a draft?" | FAST-TRACK BEST DRAFT | STICK TO SCHEDULE |

---

## SECTION 04: CONTENT INTELLIGENCE

**Shows when:** User has discussed content topics OR `cumulativeMetrics` include content-related metrics

**Headline variants:**

| Condition | Headline | Highlighted word |
|-----------|----------|-----------------|
| High-performing content exists | "Your content engine has **clear winners** worth replicating." | clear winners (green) |
| All content low SEO | "Content quality needs **systematic improvement**." | systematic improvement (amber) |
| Mix of performance | "Content performance shows **divergent patterns**." | divergent patterns (blue) |

**Data cards:**
- Top performing article: title + SEO score + type
- Worst performing: title + SEO score + improvement suggestions
- Content type distribution: mini pie/donut chart showing blog vs social vs email split

**Explanatory text:** Which content type performs best, which topics score highest.

---

## SECTION 05: KEYWORD LANDSCAPE

**Shows when:** `topics` include 'keywords' category OR user asked about keywords/SEO

**Headline variants:**

| Condition | Headline |
|-----------|----------|
| Keywords tracked, some high volume | "Your keyword portfolio has **high-value targets** ready for content." |
| Keywords tracked, none used in content | "**Keyword-to-content gap** detected — [X] keywords have no targeting article." |
| No keywords | "Operating without **keyword intelligence** limits your SEO potential." |

**Data card:** Keyword coverage ratio (tracked vs content-targeted), top 3 keywords by volume

---

## SECTION 06: CAMPAIGN PULSE

**Shows when:** `topics` include 'campaigns' OR campaigns exist in data

**Headline variants:**

| Condition | Headline |
|-----------|----------|
| Active campaigns running | "Campaign engine is **operational** — [X] items in queue." |
| Queue has failures | "Content pipeline has **[X] failures** requiring intervention." |
| No active campaigns | "Campaign infrastructure is **idle** — no active content production." |

**Data card:** Queue status (pending/processing/completed/failed as mini bar chart)

---

## SECTION 07: ENGAGEMENT METRICS

**Shows when:** `topics` include 'email', 'social', or 'engage'

**Headline variants:**

| Condition | Headline |
|-----------|----------|
| Email campaigns sent | "Email channel is **active** — [X] campaigns delivered." |
| Contacts growing | "Audience is **expanding** — [X] contacts across [Y] segments." |
| Social posts created | "Social presence has **[X] drafted posts** awaiting distribution." |
| Nothing in engage | "Marketing channels are **dormant** — no email, social, or audience activity." |

**Data cards:** Contact count, segment count, email campaigns (sent/draft), social posts (draft/scheduled)

---

## SECTION 08: COMPETITIVE POSITION

**Shows when:** `topics` include 'competitors' OR competitors exist in data

**Headline variants:**

| Condition | Headline |
|-----------|----------|
| Competitor data fresh (<30d) | "Competitive landscape has **[X] tracked rivals** — intelligence is current." |
| Competitor data stale (>30d) | "Competitor intelligence is **outdated** — last analyzed [X] days ago." |
| No competitors | "Operating in a **competitive blind spot** — no rivals tracked." |

**Data card:** Competitor count + staleness indicator + top competitor name

---

## SECTION 09: GOAL PROGRESS

**Shows when:** `goalProgress` exists (conversation has a detected goal)

**Headline variants:**

| Status | Headline |
|--------|----------|
| completed | "Session objective **achieved** — [goalName] complete." |
| nearly_done | "Almost there — **[goalName]** is [X]% complete." |
| in_progress | "Working toward **[goalName]** — [X]% through the workflow." |
| not_started | "Session goal: **[goalName]** — let's get started." |

**Progress visualization:**
- Milestone checkpoints (vertical timeline within the card)
- Each milestone: checkbox (filled/empty) + label
- Progress bar at top with percentage

**Narrative prompt:**
- "Next step: [nextStep]" with a one-click action button

---

## SECTION 10: PREVIOUS SESSION MEMORY

**Shows when:** `previousSessionInsights.length > 0` (loaded from localStorage on activation)

**Headline:** "Continuing from your **last session** — here's what we found."

**Content:** List of previous session insights, each prefixed with 📋, styled in muted/gray tones to distinguish from current session data.

**Narrative prompt:** "Should we follow up on these findings or start fresh?"
- CONTINUE WHERE WE LEFT OFF
- START FRESH

---

## SECTION 11: WEB INTELLIGENCE

**Shows when:** `webSearchResults.length > 0`

**Headline:** "Real-time market signals from **[X] web searches**."

**Content:** Each search query as a sub-section:
- Query text as header
- Answer box (if available) as highlighted quote card
- Top 3 results: title + snippet + source URL
- Related searches as pill tags

---

## SECTION 12: EXPLORE (Suggested Prompts)

**Shows when:** Always (last section)

**Headline:** "Continue exploring your data."

**Content:** 2-4 dynamic prompt pills based on:
1. Topics discussed → "Deep dive: [topic]"
2. Warnings found → "Address: [warning summary]"
3. Uncovered modules → "Explore [module name]"
4. Fallback → "Show content performance", "Campaign health", "Keyword analysis"

---

## WHICH SECTIONS APPEAR — BY USER STATE

### New user (no data)
```
01. HEALTH ASSESSMENT → score ~20, "critical", prompt to create first content
12. EXPLORE → default suggested prompts
```

### User with content only (no campaigns, no keywords, no engage)
```
01. HEALTH ASSESSMENT → score 30-50, flags missing keywords/campaigns
04. CONTENT INTELLIGENCE → shows article performance
05. KEYWORD LANDSCAPE → "Operating without keyword intelligence"
03. STRATEGIC DIVERGENCE → if any anomalies (stale drafts, low SEO)
12. EXPLORE
```

### Active user (content + keywords + campaigns + competitors)
```
01. HEALTH ASSESSMENT → score 50-80
02. PERFORMANCE TRAJECTORY → trend charts
03. STRATEGIC DIVERGENCE → cross-signal insights
04. CONTENT INTELLIGENCE → winners + patterns
05. KEYWORD LANDSCAPE → coverage ratio
06. CAMPAIGN PULSE → queue status
08. COMPETITIVE POSITION → rival tracking
09. GOAL PROGRESS → if conversation has a goal
12. EXPLORE
```

### Power user (everything + engage + web search + previous session)
```
10. PREVIOUS SESSION MEMORY → continuing from last time
01. HEALTH ASSESSMENT → score 70+
02. PERFORMANCE TRAJECTORY → positive trends
03. STRATEGIC DIVERGENCE → opportunities (not warnings)
04. CONTENT INTELLIGENCE
05. KEYWORD LANDSCAPE
06. CAMPAIGN PULSE
07. ENGAGEMENT METRICS → email + social + contacts
08. COMPETITIVE POSITION
11. WEB INTELLIGENCE → if web searches were run
09. GOAL PROGRESS
12. EXPLORE
```

### User who just asked one data question (e.g., "show my content")
```
01. HEALTH ASSESSMENT → always
02. PERFORMANCE TRAJECTORY → if trend data available
04. CONTENT INTELLIGENCE → since they asked about content
12. EXPLORE → suggest deeper dives
```

---

## NARRATIVE PROMPT DECISION BUTTONS — FULL LIST

Every decision button maps to an AI chat action:

| Button text | Chat action sent |
|------------|-----------------|
| ACCELERATE NOW | "Fast-track my top 3 drafts for immediate publication, prioritize speed over SEO refinement" |
| MAINTAIN QUALITY | "Show me my top drafts sorted by SEO score so I can choose which to publish" |
| OPTIMIZE EXISTING | "Analyze my 5 lowest-SEO published articles and suggest improvements for each" |
| KEEP CREATING | "Continue creating new content — show me my next best proposal to write about" |
| LAUNCH CAMPAIGN | "Create a new campaign based on my top-performing content topics" |
| SKIP FOR NOW | (dismiss the prompt, no action) |
| AUTO-DETECT KEYWORDS | "Extract keywords from my published content and add them to tracking" |
| I'LL ADD MANUALLY | (dismiss, open Keywords page) |
| REVIEW TOP DRAFTS | "Show my drafts sorted by SEO score, recommend which to publish" |
| ARCHIVE STALE | "Archive all drafts that haven't been updated in 30+ days" |
| GENERATE PLAN | "Generate a 2-week content plan from my top proposals and calendar gaps" |
| I'LL PLAN LATER | (dismiss) |
| AUTHORIZE PIVOT | "Create a content strategy focused on [detected keyword cluster]" |
| KEEP CURRENT ROADMAP | (dismiss) |
| CREATE CONTENT | "Write a blog post targeting [competitor gap topic]" |
| NOTE FOR LATER | (bookmark the insight, dismiss) |
| PAUSE & OPTIMIZE | "Show my 3 lowest-SEO published articles and rewrite the worst one" |
| INVESTIGATE ROOT CAUSE | "Compare my last 5 articles — what changed in quality?" |
| FAST-TRACK BEST DRAFT | "What's my highest-SEO draft? Publish it now." |
| STICK TO SCHEDULE | (dismiss) |
| CONTINUE WHERE WE LEFT OFF | "Follow up on the issues from my last analyst session" |
| START FRESH | (clear previous session insights) |

---

## SECTION ORDERING RULES

1. **Previous Session Memory** always first (if exists) — user needs to see what was remembered
2. **Health Assessment** always second (or first if no memory) — sets the overall context
3. **Performance Trajectory** third — trends before details
4. **Strategic Divergence** fourth — alerts/anomalies are time-sensitive
5. **Content/Keyword/Campaign/Engage/Competitive** in order of relevance to the current conversation topics — sections matching discussed topics come first
6. **Goal Progress** near the end — it's a session tracker
7. **Web Intelligence** near the end — supplementary external data
8. **Explore** always last — it's the "what next" prompt

---

## EMPTY STATE (No data at all)

When Analyst activates and there's zero platform data, zero messages, zero insights:

```
[Centered in sidebar]

[BarChart3 icon, large, muted]

"Ask about your data"

Your Analyst builds intelligence as you explore.
Try one of these to get started:

[Show content performance]  [Campaign health]
[Keyword rankings]         [Compare this week vs last]
```
