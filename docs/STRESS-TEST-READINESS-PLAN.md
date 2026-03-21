# Stress Test Readiness Plan — Complete 92+ Capability Audit

> This plan ensures every tool, action, and UI feature passes the comprehensive stress test.
> Each item lists the exact issue and exact fix. Lovable should execute these in order.

---

## BLOCKING BUGS — Fix these first or tests will fail

### BUG-1: `repurpose_for_social` has no API key — will fail

**File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` — lines 287-325

**Problem:** This tool calls `ai-proxy` to generate social posts but does NOT decrypt or send an API key. It fetches `provider, preferred_model` from `ai_service_providers` but never gets the actual key. The `ai-proxy` receives the request with `Authorization: Bearer <service-role-key>`, tries `getUser()` on it (fails — service role is not a user JWT), so `userId` is undefined, `apiKey` is null → "No API key found" error.

**The other two tools** (`generate_full_content` and `create_topic_cluster`) were already fixed with `getApiKey()` but this one was missed.

**Find (lines 287-296):**
```ts
        const { data: provider } = await supabase.from('ai_service_providers')
          .select('provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!provider) {
          return { success: false, message: 'No AI provider configured.' };
        }
```

**Replace with:**
```ts
        const { data: provider } = await supabase.from('ai_service_providers')
          .select('provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!provider) {
          return { success: false, message: 'No AI provider configured.' };
        }

        // Decrypt API key from secure vault
        const { getApiKey: getDecryptedKey } = await import('../shared/apiKeyService.ts');
        const decryptedApiKey = await getDecryptedKey(provider.provider, userId);
        if (!decryptedApiKey) {
          return { success: false, message: `No API key for ${provider.provider}. Add it in Settings → API Keys.` };
        }
```

**Also find the request body (line 307-324) and add `apiKey`:**

Find:
```ts
          body: JSON.stringify({
            params: {
              provider: provider.provider,
              model: provider.preferred_model || 'gpt-4',
              messages: [
```

Replace with:
```ts
          body: JSON.stringify({
            params: {
              provider: provider.provider,
              model: provider.preferred_model || 'gpt-4',
              apiKey: decryptedApiKey,
              messages: [
```

---

### BUG-2: `schedule_social_from_repurpose` target status mismatch

**File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` — line 476

**Problem:** `social_post_targets` are inserted with `status: 'pending'` when scheduled, but `engage-social-poster` looks for `status: 'scheduled'`. Posts never get picked up.

**Find (line 476):**
```ts
            status: toolArgs.scheduled_at ? 'pending' : 'draft'
```

**Replace with:**
```ts
            status: toolArgs.scheduled_at ? 'scheduled' : 'draft'
```

---

### BUG-3: `content_to_email` and `campaign_content_to_engage` need workspace auto-creation

**File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` — lines 207-209 and 247-249

**Problem:** Both tools call `getUserWorkspaceId()` and if it returns null, they return "No Engage workspace found. Visit the Engage module first." This is confusing — the user is in AI Chat and doesn't know they need to visit Engage first.

**Find (both instances):**
```ts
        const workspaceId = await getUserWorkspaceId(supabase, userId);
        if (!workspaceId) {
          return { success: false, message: 'No Engage workspace found. Visit the Engage module first.' };
        }
```

**Replace with (both instances):**
```ts
        let workspaceId = await getUserWorkspaceId(supabase, userId);
        if (!workspaceId) {
          // Auto-create workspace so user doesn't need to visit Engage first
          try {
            const { data } = await supabase.rpc('ensure_engage_workspace', { p_user_id: userId });
            workspaceId = data;
          } catch (e) {
            console.error('[CROSS-MODULE] Failed to auto-create workspace:', e);
          }
          if (!workspaceId) {
            return { success: false, message: 'Could not create Engage workspace. Please visit the Engage module once to initialize it.' };
          }
        }
```

The `ensure_engage_workspace` RPC already exists — it's used in `engage-action-tools.ts` line 16-22.

---

### BUG-4: `generate_full_content` sends apiKey inside nested `params`

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — lines 451-461

**Problem:** The request body sends `{ params: { provider, model, apiKey, messages, ... } }` but `ai-proxy` expects `{ service, endpoint, apiKey, params: { ... } }`. The key is nested under `params` where `ai-proxy` won't find it.

**Find (lines 444-461):**
```ts
          body: JSON.stringify({
            params: {
              provider: provider.provider,
              model: provider.preferred_model || 'gpt-4',
              apiKey: decryptedApiKey,
              messages: [
                ...
              ],
              maxTokens: targetWords * 3,
              userId
            }
          })
```

**Replace with:**
```ts
          body: JSON.stringify({
            service: provider.provider,
            endpoint: 'chat',
            apiKey: decryptedApiKey,
            params: {
              model: provider.preferred_model || 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert content writer. Write a ${toolArgs.content_type || 'blog'} article. Tone: ${toolArgs.tone || 'professional'}. Target length: ~${targetWords} words. Output clean HTML content with proper headings (h2, h3), paragraphs, and lists. Do NOT include meta information or JSON - just the article content.`
                },
                {
                  role: 'user',
                  content: `Write a comprehensive ${toolArgs.content_type || 'blog post'} about "${toolArgs.keyword}".${toolArgs.additional_instructions ? ` Additional instructions: ${toolArgs.additional_instructions}` : ''}`
                }
              ],
              maxTokens: targetWords * 3
            }
          })
```

---

### BUG-5: `create_topic_cluster` same request body structure issue

**File:** `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` — lines 267-280

**Same fix as BUG-4.** The request body sends everything inside `params` but `ai-proxy` expects `service` and `endpoint` at the top level.

**Find the body (lines 267-280):**
```ts
          body: JSON.stringify({
            params: {
              provider: provider.provider,
              model: provider.preferred_model || 'gpt-4',
              apiKey: decryptedApiKey,
              messages: [...],
              maxTokens: 2000,
              userId
            }
          })
```

**Replace with:**
```ts
          body: JSON.stringify({
            service: provider.provider,
            endpoint: 'chat',
            apiKey: decryptedApiKey,
            params: {
              model: provider.preferred_model || 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: `Generate a topic cluster for content marketing. Return valid JSON only.`
                },
                {
                  role: 'user',
                  content: `Create a topic cluster with "${toolArgs.pillar_topic}" as the pillar topic. Generate ${count} subtopics. Return JSON: { "pillar": "topic", "subtopics": [{ "title": "...", "keyword": "...", "content_type": "blog", "search_intent": "informational|transactional|navigational" }] }`
                }
              ],
              maxTokens: 2000
            }
          })
```

---

### BUG-6: `repurpose_for_social` same request body structure issue

**File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` — lines 307-324

**Same fix.** After adding BUG-1's `decryptedApiKey`, also restructure the body:

**Replace the body with:**
```ts
          body: JSON.stringify({
            service: provider.provider,
            endpoint: 'chat',
            apiKey: decryptedApiKey,
            params: {
              model: provider.preferred_model || 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: `Generate social media posts for the specified platforms. Return valid JSON only: { "posts": [{ "platform": "twitter", "text": "...", "hashtags": ["..."] }] }`
                },
                {
                  role: 'user',
                  content: `Repurpose this article for ${toolArgs.platforms.join(', ')}. Title: "${content.title}". Content: ${contentPreview}`
                }
              ],
              maxTokens: 1500
            }
          })
```

---

## EDGE CASE GUARDS — Prevent crashes during stress test

### GUARD-1: Input sanitization for chat messages

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

The edge function validates input with Zod, but the stress test includes SQLi attempts (`'; DROP TABLE --`) and special characters. These are passed to tool arguments and SQL queries.

**Check:** All tool handlers use `.eq('user_id', userId)` parameterized queries via Supabase client — this is safe from SQLi. The Zod schema validates message format. **No fix needed** — the architecture is already safe.

### GUARD-2: Rate limiting for rapid fire

**Problem:** Sending 3 messages quickly could create race conditions — multiple placeholder messages, concurrent SSE streams.

**File:** `src/hooks/useEnhancedAIChatDB.ts`

**Check:** The hook has `isLoading` state that prevents concurrent sends (line 383 sets it before the call, buttons are disabled when `isLoading` is true). **No fix needed** — already guarded.

### GUARD-3: Empty/emoji-only input

**File:** `src/components/ai-chat/ContextAwareMessageInput.tsx`

**Check:** The send button has `disabled={!message.trim() || isLoading}`. Empty and whitespace-only inputs are blocked. Emoji-only inputs like "🤔" will pass through (trim() doesn't strip them), which is fine — the AI can respond to emoji.

**No fix needed.**

---

## TOOL-BY-TOOL VERIFICATION STATUS

### Phase 3: Content Repository (12 tools)
| Tool | Has handler? | Has error handling? | API key fixed? | Status |
|------|-------------|--------------------|----|--------|
| `get_content_items` | Yes (tools.ts) | Yes | N/A (read) | READY |
| `get_calendar_items` | Yes (tools.ts) | Yes | N/A (read) | READY |
| `get_content_performance` | Yes (brand-analytics-tools.ts) | Yes | N/A (read) | READY (warns if no GA key) |
| `get_seo_scores` | Yes (tools.ts) | Yes | N/A (read) | READY |
| `get_repurposed_content` | Yes (tools.ts) | Yes | N/A (read) | READY |
| `create_content_item` | Yes | Yes | N/A (no AI call) | READY |
| `update_content_item` | Yes | Yes | N/A | READY |
| `delete_content_item` | Yes | Yes | N/A | READY |
| `generate_full_content` | Yes | Yes | Fixed + **needs BUG-4 body fix** | FIX NEEDED |
| `start_content_builder` | Yes | Yes | N/A | READY (opens wizard) |
| `launch_content_wizard` | Yes | Yes | N/A | READY |
| Calendar CRUD (3) | Yes | Yes | N/A | READY |

### Phase 4: Approvals (3 tools)
| Tool | Status |
|------|--------|
| `get_pending_approvals` | READY |
| `approve_content` | READY |
| `reject_content` | READY |

### Phase 5: Keywords & Research (7 tools)
| Tool | Status | Issue |
|------|--------|-------|
| `get_keywords` | READY | |
| `get_serp_analysis` | READY | |
| `add_keywords` | READY | |
| `remove_keywords` | READY | |
| `trigger_serp_analysis` | READY | Needs SERP API key |
| `trigger_content_gap_analysis` | READY | |
| `create_topic_cluster` | **FIX NEEDED** | BUG-5: request body structure wrong |

### Phase 6: Offerings & Competitors (11 tools)
| Tool | Status |
|------|--------|
| `get_solutions` | READY |
| `get_company_info` | READY |
| `get_competitors` | READY |
| `get_competitor_solutions` | READY |
| `create_solution` | READY |
| `update_solution` | READY |
| `delete_solution` | READY |
| `update_company_info` | READY |
| `add_competitor` | READY |
| `update_competitor` | READY |
| `trigger_competitor_analysis` | READY (calls competitor-intel edge function) |

### Phase 7: Email & Contacts (16 tools)
| Tool | Status | Issue |
|------|--------|-------|
| `get_engage_contacts` | READY | |
| `get_engage_segments` | READY | |
| `get_engage_email_campaigns` | READY | |
| `get_email_templates` | READY | |
| `get_email_threads` | READY | |
| `create_contact` | READY | |
| `update_contact` | READY | |
| `tag_contacts` | READY | |
| `delete_contact` | READY | |
| `create_segment` | READY | |
| `delete_segment` | READY | |
| `create_email_campaign` | READY | |
| `send_email_campaign` | READY | Needs Resend key — shows clear message if missing |
| `delete_email_campaign` | READY | |
| `send_quick_email` | READY | Needs Resend key — shows clear message if missing |
| `create_email_template` | READY | |
| `update_email_template` | READY | |

### Phase 8: Social & Campaigns (10 tools)
| Tool | Status | Issue |
|------|--------|-------|
| `get_social_posts` | READY | |
| `get_campaign_intelligence` | READY | |
| `get_queue_status` | READY | |
| `get_campaign_content` | READY | |
| `create_social_post` | READY | Creates record — no real publishing |
| `update_social_post` | READY | |
| `schedule_social_post` | READY | Saves to DB — posting is stub |
| `delete_social_post` | READY | |
| `trigger_content_generation` | READY | |
| `retry_failed_content` | READY | |

### Phase 9: Journeys & Automations (8 tools)
| Tool | Status |
|------|--------|
| `get_engage_journeys` | READY |
| `create_journey` | READY |
| `activate_journey` | READY |
| `delete_journey` | READY |
| `get_engage_automations` | READY |
| `create_automation` | READY |
| `toggle_automation` | READY |
| `delete_automation` | READY |

### Phase 10: Proposals, Strategy & Brand (7 tools)
| Tool | Status |
|------|--------|
| `get_proposals` | READY |
| `get_strategy_recommendations` | READY |
| `get_brand_voice` | READY |
| `accept_proposal` | READY |
| `reject_proposal` | READY |
| `create_proposal` | READY |
| `accept_recommendation` / `dismiss_recommendation` | READY |
| `update_brand_voice` | READY |

### Phase 11: Cross-Module & Activity (10 tools)
| Tool | Status | Issue |
|------|--------|-------|
| `promote_content_to_campaign` | READY | |
| `content_to_email` | **FIX NEEDED** | BUG-3: workspace not auto-created |
| `campaign_content_to_engage` | **FIX NEEDED** | BUG-3: workspace not auto-created |
| `repurpose_for_social` | **FIX NEEDED** | BUG-1 + BUG-6: no API key + wrong body |
| `schedule_social_from_repurpose` | **FIX NEEDED** | BUG-2: target status mismatch |
| `create_campaign` | READY | |
| `publish_to_website` | READY | Needs WordPress/Wix connection |
| `get_activity_log` | READY | |
| `generate_campaign_strategies` | READY | |
| Web search | READY | |

---

## IMPLEMENTATION ORDER

### Step 1: Fix the 6 bugs (all in edge function tool handlers)
| # | Bug | File | Lines |
|---|-----|------|-------|
| 1 | BUG-1: `repurpose_for_social` no API key | `cross-module-tools.ts` | 287-296 |
| 2 | BUG-2: `schedule_social_from_repurpose` status mismatch | `cross-module-tools.ts` | 476 |
| 3 | BUG-3: `content_to_email` + `campaign_content_to_engage` workspace | `cross-module-tools.ts` | 207-209, 247-249 |
| 4 | BUG-4: `generate_full_content` request body structure | `content-action-tools.ts` | 444-461 |
| 5 | BUG-5: `create_topic_cluster` request body structure | `keyword-action-tools.ts` | 267-280 |
| 6 | BUG-6: `repurpose_for_social` request body structure | `cross-module-tools.ts` | 307-324 |

### Step 2: Deploy and verify
After deploying the edge function changes, test these specific scenarios:
1. "Generate a blog post about AI trends" → article saved to repository
2. "Create a topic cluster about digital marketing" → cluster with subtopics
3. "Repurpose my latest article for Twitter and LinkedIn" → social posts generated
4. "Convert my latest content into an email campaign" → email campaign created (even for first-time Engage users)
5. "Schedule these social posts for tomorrow" → status shows 'scheduled'

### Step 3: Run the full 92-tool stress test
All tools should now work. The test phases can run in order.

---

## EXPECTED LIMITATIONS (not bugs — document clearly)

| Feature | Limitation | What user sees |
|---------|-----------|---------------|
| Social posting | No real platform APIs | Posts saved as drafts, "Publishing coming soon" |
| Email sending | Needs Resend API key | Clear message: "Add Resend key in Settings" |
| SERP analysis | Needs SerpAPI key | Clear message: "Add SerpAPI key in Settings" |
| Website publishing | Needs WordPress/Wix connection | Clear message: "Connect in Settings → Websites" |
| Content performance | Needs Google Analytics/GSC | Shows available DB data, suggests connecting GA |
| Video generation | Not implemented | UI shell only, won't appear unless triggered |
| Journey processing | Needs cron job | `engage-journey-processor` must be scheduled |
