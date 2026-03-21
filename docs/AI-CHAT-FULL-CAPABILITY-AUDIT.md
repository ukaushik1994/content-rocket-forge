# AI Chat — Full Capability Audit Against Inventory

> Every item from the capability inventory verified against actual code.
> **Legend:** WORKS = code executes end-to-end | PARTIAL = tool exists but has issues | BROKEN = doesn't work | MISSING = not implemented

---

## CONTENT REPOSITORY (12 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 1 | List/filter content items | **WORKS** | `get_content_items` tool reads from `content_items` table |
| 2 | Get editorial calendar items | **WORKS** | `get_calendar_items` reads from calendar table |
| 3 | Get content performance (GA + GSC) | **PARTIAL** | `get_content_performance` tool exists but requires Google Analytics / Search Console API keys — no clear onboarding if not configured |
| 4 | Get SEO scores | **WORKS** | `get_seo_scores` reads from content_items |
| 5 | Get repurposed content | **WORKS** | `get_repurposed_content` reads repurposed versions |
| 6 | Create content item | **WORKS** | Creates in DB with auto SEO scoring |
| 7 | Update content item | **WORKS** | |
| 8 | Delete/archive content | **WORKS** | Soft-deletes (sets status to archived) |
| 9 | Generate full article | **BROKEN** | `generate_full_content` at line 426 reads `api_key` from `ai_service_providers` (plaintext) — should use `shared/apiKeyService.ts` |
| 10 | Open Content Builder | **BROKEN** | Returns `navigate: '/content-builder'` which redirects to `/ai-chat` — circular loop |
| 11 | Launch Content Wizard | **WORKS** | Returns `content_creation_choice` visualData → user picks path |
| 12 | Calendar CRUD | **WORKS** | Create, update, delete calendar items all write to DB |

---

## APPROVALS (3 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 13 | Get pending approvals | **WORKS** | |
| 14 | Approve content | **WORKS** | Also logs to `approval_history` |
| 15 | Reject content | **WORKS** | Supports both reject and request_changes |

---

## KEYWORDS & RESEARCH (7 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 16 | List keywords | **WORKS** | |
| 17 | Get SERP analysis data | **WORKS** | Reads cached SERP data |
| 18 | Add keywords | **WORKS** | |
| 19 | Remove keywords | **WORKS** | |
| 20 | Trigger live SERP analysis | **WORKS** | Fixed — now uses `getApiKey('serp')` correctly |
| 21 | Trigger content gap analysis | **WORKS** | AI-based gap detection using existing content + keywords |
| 22 | Create topic cluster | **BROKEN** | `create_topic_cluster` at line 242 reads `api_key` from `ai_service_providers` (plaintext) — same bug as #9 |

---

## OFFERINGS & COMPETITORS (11 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 23 | Get solutions/products | **WORKS** | |
| 24 | Get company info | **WORKS** | |
| 25 | Get competitor profiles | **WORKS** | Includes SWOT, intelligence |
| 26 | Get competitor solutions | **WORKS** | |
| 27 | Create solution | **WORKS** | |
| 28 | Update solution | **WORKS** | |
| 29 | Delete solution | **WORKS** | |
| 30 | Update company info | **WORKS** | |
| 31 | Add competitor | **WORKS** | |
| 32 | Update competitor | **WORKS** | |
| 33 | Trigger AI competitor analysis | **PARTIAL** | Tool exists, calls `competitor-intel` edge function — depends on AI provider being configured |

---

## EMAIL & CONTACTS (16 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 34 | Get contacts | **WORKS** | |
| 35 | Get segments | **WORKS** | |
| 36 | Get email campaigns | **WORKS** | Includes analytics |
| 37 | Get email templates | **WORKS** | |
| 38 | Get email threads | **WORKS** | |
| 39 | Create contact | **WORKS** | |
| 40 | Update contact | **WORKS** | |
| 41 | Tag contacts | **WORKS** | |
| 42 | Delete contact | **WORKS** | |
| 43 | Create segment | **WORKS** | |
| 44 | Delete segment | **WORKS** | |
| 45 | Create email campaign | **WORKS** | Creates draft campaign |
| 46 | Send email campaign | **PARTIAL** | Tool calls `engage-email-send` — requires Resend key. Now decrypts correctly but user needs Resend configured |
| 47 | Delete email campaign | **WORKS** | |
| 48 | Send quick email | **PARTIAL** | Same Resend dependency |
| 49 | Create email template | **WORKS** | |
| 50 | Update email template | **WORKS** | |

---

## SOCIAL MEDIA (5 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 51 | Get social posts | **WORKS** | |
| 52 | Create social post | **WORKS** | Creates DB record — but social API integration is stub (no real posting) |
| 53 | Update social post | **WORKS** | Updates DB record |
| 54 | Schedule social post | **PARTIAL** | Sets `scheduled_at` in DB but `engage-social-poster` is stub — post never actually publishes to platforms |
| 55 | Delete social post | **WORKS** | |

---

## CAMPAIGNS (5 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 56 | Get campaign intelligence | **WORKS** | |
| 57 | Get queue status | **WORKS** | |
| 58 | Get campaign content | **WORKS** | |
| 59 | Trigger content generation | **PARTIAL** | Calls `campaign-content-generator` — depends on AI provider |
| 60 | Retry failed content | **WORKS** | |

---

## JOURNEYS & AUTOMATIONS (8 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 61 | Get journeys | **WORKS** | |
| 62 | Create journey | **WORKS** | Creates DB record |
| 63 | Activate journey | **PARTIAL** | Sets status to active in DB but `engage-journey-processor` needs to be running as a cron to actually execute steps |
| 64 | Delete journey | **WORKS** | |
| 65 | Get automations | **WORKS** | |
| 66 | Create automation | **WORKS** | |
| 67 | Toggle automation | **WORKS** | |
| 68 | Delete automation | **WORKS** | |

---

## PROPOSALS & STRATEGY (7 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 69 | Get proposals | **WORKS** | |
| 70 | Get strategy recommendations | **WORKS** | |
| 71 | Accept proposal | **WORKS** | |
| 72 | Reject proposal | **WORKS** | |
| 73 | Create proposal | **WORKS** | |
| 74 | Accept recommendation | **WORKS** | |
| 75 | Dismiss recommendation | **WORKS** | |

---

## BRAND VOICE (2 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 76 | Get brand voice | **WORKS** | |
| 77 | Update brand voice | **WORKS** | |

---

## CROSS-MODULE (7 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 78 | Promote content to campaign | **WORKS** | |
| 79 | Content to email | **WORKS** | Creates email campaign from content |
| 80 | Campaign content to Engage email | **WORKS** | |
| 81 | Repurpose for social | **PARTIAL** | AI generates platform posts, saves as `social_posts` records — but no real publishing |
| 82 | Schedule social from repurpose | **PARTIAL** | Same — saves to DB, posting is stub |
| 83 | Create campaign | **WORKS** | |
| 84 | Publish to website | **WORKS** | Calls `publish-wordpress` or `publish-wix` — requires active website connection |

---

## ACTIVITY & INTELLIGENCE (3 tools)

| # | Capability | Status | Issue |
|---|-----------|--------|-------|
| 85 | Get activity log | **WORKS** | |
| 86 | Generate campaign strategies | **WORKS** | Dedicated fast path with structured output |
| 87 | Live web search | **NEW/WORKS** | Auto-detects queries needing real-time info, calls SERP for web results |

---

## UI-LEVEL FEATURES

| # | Feature | Status | Issue |
|---|---------|--------|-------|
| 88 | File attachments | **WORKS** | Upload zone appears, files analyzed |
| 89 | Content Wizard sidebar | **WORKS** | Multi-step: solution → research → outline → word count → generate |
| 90 | Research Intelligence sidebar | **WORKS** | Clusters, gaps, recommendations tabs with real data |
| 91 | Analyst mode | **WORKS** | Opens sidebar, prompts work via chat |
| 92 | AI Proposals browser | **WORKS** | Sidebar + dedicated `/ai-proposals` page |
| 93 | Image generation | **WORKS** | Inside Content Wizard step, uses `imageGenService` |
| 94 | Video generation | **STUB** | `VisualDataRenderer` has UI shell (lines 811-866) but says "will be available when video generation launches" |
| 95 | Charts & dashboards | **WORKS** | Bar, line, pie, area, radar, funnel, scatter, radial bar, composed |
| 96 | Quick actions | **WORKS** | All 6 buttons functional |
| 97 | Action confirmation cards | **WORKS** | Confirmation flow for destructive actions |
| 98 | Markdown rendering | **WORKS** | Via `SafeMarkdown` with DOMPurify |
| 99 | Conversation memory | **PARTIAL** | Per-session only (first message + last 9). No cross-session memory, no brand voice learning |

---

## BUGS FOUND (things that need fixing)

### BUG 1: `generate_full_content` reads plaintext API key (P0)

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — line 426-431

```ts
const { data: provider } = await supabase.from('ai_service_providers')
  .select('api_key, provider, preferred_model')  // <-- reads plaintext api_key
```

The main `index.ts` was fixed to use `shared/apiKeyService.ts`, but this tool handler still reads from the old plaintext column. If the column is empty (which it now is since plaintext sync was removed), this tool silently fails.

**Fix:** Same pattern as `index.ts` — use `shared/apiKeyService.ts`:
```ts
const { getApiKey } = await import('../shared/apiKeyService.ts');
const { data: providerRow } = await supabase.from('ai_service_providers')
  .select('provider, preferred_model')
  .eq('user_id', userId).eq('status', 'active')
  .order('priority', { ascending: true }).limit(1).single();

if (!providerRow) return { success: false, message: 'No AI provider configured.' };

const apiKey = await getApiKey(providerRow.provider, userId);
if (!apiKey) return { success: false, message: `No API key for ${providerRow.provider}.` };
```

### BUG 2: `create_topic_cluster` reads plaintext API key (P0)

**File:** `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` — line 241-246

Exact same bug. Same fix.

### BUG 3: `start_content_builder` returns dead route (P1)

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — line 515

```ts
url: '/content-builder',  // This redirects to /ai-chat — circular
```

**Fix:** Change to return a `content_creation_choice` visualData (same as `launch_content_wizard`) or remove this tool entirely since `launch_content_wizard` does the same thing better.

### BUG 4: Social posting is a stub — no real platform APIs (P1)

**File:** `supabase/functions/engage-social-poster/index.ts`

Posts are saved to DB and marked as `pending_integration`. No Twitter/LinkedIn/Facebook/Instagram OAuth or API calls exist. Users see "scheduled" but nothing ever publishes.

**Fix:** Add clear messaging in the UI: "Social publishing coming soon. Posts saved as drafts." Or implement real social OAuth.

### BUG 5: Video generation is UI shell only (P2)

**File:** `src/components/ai-chat/VisualDataRenderer.tsx` — lines 811-866

The renderer handles `generated_video` and `generated_videos` types but shows "will be available when video generation launches." No tool can trigger this — it's placeholder UI.

**Fix:** Either remove the video UI or mark it clearly as "coming soon" so it's not confusing.

### BUG 6: Content performance needs API keys with no setup guidance (P2)

**File:** `supabase/functions/enhanced-ai-chat/brand-analytics-tools.ts` — lines 149-177

`get_content_performance` checks for Google Analytics / Search Console API keys. If not configured, it returns available data from DB but the user never learns they need to set up GA/GSC for real analytics.

**Fix:** When GA/GSC keys are missing, include a message: "Connect Google Analytics and Search Console in Settings → Websites for real-time performance data."

### BUG 7: Conversation memory is session-only — not "learning" (P2)

**Capability claim:** "Conversation memory — Full conversation history maintained per session"

**Reality:** The inventory claim is accurate (per-session), but the **landing page** promises "learns from YOUR results" and "gets exponentially better over time." There is no cross-session learning, brand voice accumulation, or feedback loop.

**Fix:** This is a product decision, not a code bug. Either:
- Update landing page to remove learning claims
- Or implement conversation summarization + brand voice persistence

### BUG 8: `.gitignore` still missing `.env` (P1)

Still not added. Any `.env` file will be committed.

**Fix:** Add to `.gitignore`:
```
.env
.env.*
.env.local
.env.production
```

---

## PRIORITY IMPLEMENTATION PLAN

### Sprint 1: Fix broken tools (P0)

| # | Fix | File | Est. |
|---|-----|------|------|
| 1 | **BUG 1:** `generate_full_content` API key lookup | `content-action-tools.ts:426` | 10 min |
| 2 | **BUG 2:** `create_topic_cluster` API key lookup | `keyword-action-tools.ts:241` | 10 min |

### Sprint 2: Fix misleading features (P1)

| # | Fix | File | Est. |
|---|-----|------|------|
| 3 | **BUG 3:** Remove or fix `start_content_builder` dead route | `content-action-tools.ts:515` | 5 min |
| 4 | **BUG 4:** Social posting — add "coming soon" messaging | `engage-social-poster` + social UI | 20 min |
| 5 | **BUG 8:** `.gitignore` add `.env` | `.gitignore` | 1 min |

### Sprint 3: Polish (P2)

| # | Fix | File | Est. |
|---|-----|------|------|
| 6 | **BUG 5:** Video generation — mark as coming soon | `VisualDataRenderer.tsx` | 5 min |
| 7 | **BUG 6:** Content performance — GA/GSC setup guidance | `brand-analytics-tools.ts` | 10 min |
| 8 | **BUG 7:** Update landing page OR add conversation summarization | Landing + hook | 30 min - 2 hrs |

---

## TESTING CHECKLIST

### Tools that MUST work
- [ ] "Write a blog post about AI trends" → full article generated and saved to repository
- [ ] "Create a topic cluster about content marketing" → cluster with subtopics created
- [ ] "Show my content" → list with real data, chart visualization
- [ ] "Add keyword 'machine learning'" → keyword added
- [ ] "Analyze keyword 'SaaS tools'" → SERP analysis runs (with SERP key)
- [ ] "Create a contact john@example.com" → contact created
- [ ] "Send email to test@example.com" → email sent (with Resend key)
- [ ] "Create a campaign about spring sale" → campaign created
- [ ] "Publish this to my website" → publishes (with WordPress/Wix connected)
- [ ] "Approve my latest content" → confirmation card → approval

### Things that should show honest messaging
- [ ] Schedule social post → "Saved as draft. Platform publishing coming soon."
- [ ] Ask about video → No misleading "generating video" state
- [ ] Ask about content performance without GA → "Connect Google Analytics for real data"
- [ ] Ask about SERP without key → "Add your SERP API key in Settings"
