# Final Fixes — Lovable Prompt

Do these 8 tasks in order. Each one has the exact file, the exact lines to change, and what to replace them with. Do NOT skip any. Do NOT change anything else.

---

## TASK 1: Fix `generate_full_content` API key lookup

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

**Find this block (lines 425-435):**
```ts
        // Get user's AI provider
        const { data: provider } = await supabase.from('ai_service_providers')
          .select('api_key, provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!provider) {
          return { success: false, message: 'No AI provider configured. Go to Settings to add your API key.' };
        }
```

**Replace with:**
```ts
        // Get user's AI provider metadata (no api_key — decrypted separately)
        const { data: providerRow } = await supabase.from('ai_service_providers')
          .select('provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!providerRow) {
          return { success: false, message: 'No AI provider configured. Go to Settings to add your API key.' };
        }

        // Decrypt API key from secure api_keys table
        const { getApiKey: getDecryptedKey } = await import('../shared/apiKeyService.ts');
        const decryptedApiKey = await getDecryptedKey(providerRow.provider, userId);
        if (!decryptedApiKey) {
          return { success: false, message: `No API key found for ${providerRow.provider}. Please add it in Settings → API Keys.` };
        }

        // Build provider object with decrypted key
        const provider = { ...providerRow, api_key: decryptedApiKey };
```

**Why:** The current code reads `api_key` from `ai_service_providers` which is now empty (plaintext sync was removed). This makes the entire `generate_full_content` tool fail silently. The fix decrypts the key from the secure `api_keys` table, matching what `index.ts` already does at line 2017.

---

## TASK 2: Fix `create_topic_cluster` API key lookup

**File:** `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts`

**Find this block (lines 240-250):**
```ts
        // Get user's AI provider
        const { data: provider } = await supabase.from('ai_service_providers')
          .select('api_key, provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!provider) {
          return { success: false, message: 'No AI provider configured. Go to Settings to add your API key.' };
        }
```

**Replace with the exact same fix as Task 1:**
```ts
        // Get user's AI provider metadata (no api_key — decrypted separately)
        const { data: providerRow } = await supabase.from('ai_service_providers')
          .select('provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!providerRow) {
          return { success: false, message: 'No AI provider configured. Go to Settings to add your API key.' };
        }

        // Decrypt API key from secure api_keys table
        const { getApiKey: getDecryptedKey } = await import('../shared/apiKeyService.ts');
        const decryptedApiKey = await getDecryptedKey(providerRow.provider, userId);
        if (!decryptedApiKey) {
          return { success: false, message: `No API key found for ${providerRow.provider}. Please add it in Settings → API Keys.` };
        }

        // Build provider object with decrypted key
        const provider = { ...providerRow, api_key: decryptedApiKey };
```

**Why:** Same bug as Task 1 — reads empty plaintext column. Same fix.

---

## TASK 3: Fix `start_content_builder` dead route

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

**Find this block (lines 509-523):**
```ts
      case 'start_content_builder': {
        return {
          success: true,
          message: `Opening Content Builder with keyword "${toolArgs.keyword}"`,
          action: {
            type: 'navigate',
            url: '/content-builder',
            payload: {
              keyword: toolArgs.keyword,
              solution_id: toolArgs.solution_id,
              suggested_title: toolArgs.suggested_title
            }
          }
        };
      }
```

**Replace with:**
```ts
      case 'start_content_builder': {
        // Open Content Wizard sidebar (same as launch_content_wizard)
        return {
          success: true,
          message: `Ready to create content about "${toolArgs.keyword}". Choose how you'd like to proceed.`,
          visualData: {
            type: 'content_creation_choice',
            keyword: toolArgs.keyword,
            solution_id: toolArgs.solution_id || null,
            content_type: 'blog'
          }
        };
      }
```

**Why:** `/content-builder` redirects to `/ai-chat`, creating a circular loop. This fix opens the Content Wizard sidebar instead, matching what `launch_content_wizard` does.

---

## TASK 4: Update edge function system prompt — replace deleted routes

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find these lines in the system prompt (around lines 732-737) and replace the URLs:**

Find:
```
- **Content Strategy** (/research/content-strategy) — SERP-driven keyword strategies and proposals. Proposals link to offerings/competitors. Pipeline management.
- **SERP Intelligence** (/research/serp-intelligence) — Live SERP analysis, competitor ranking data, search trend monitoring.
- **Topic Clusters** (/research/topic-clusters) — Pillar/cluster content mapping for topical authority building.
- **Content Gaps** (/research/content-gaps) — Identifies content opportunities competitors cover that the user doesn't.
- **Editorial Calendar** (/research/calendar) — Schedule content, drag-and-drop calendar, status tracking. Calendar scheduling auto-updates proposal status (available→scheduled→completed).
```

Replace with:
```
- **AI Proposals** (/ai-proposals) — AI-generated content strategy proposals. Users can accept, reject, or use proposals to start content creation.
- **Keywords & SERP** (/keywords) — Keyword library with SERP data, position tracking, search volume, difficulty. Live SERP analysis available via AI chat tools.
- **Topic Clusters & Content Gaps** — Available through the Research Intelligence sidebar panel in AI Chat (+ menu → Research Intelligence).
- **Editorial Calendar** (/calendar) — Schedule content, drag-and-drop calendar, status tracking. Calendar scheduling auto-updates proposal status.
```

**Also find this line (around line 799):**
```
- **Strategy → Calendar → Content**: SERP → Proposals (/research/content-strategy) → Calendar (/research/calendar) → Builder/Wizard → Repository (auto-completes proposal)
```

Replace with:
```
- **Strategy → Calendar → Content**: SERP → Proposals (/ai-proposals) → Calendar (/calendar) → Content Wizard → Repository (auto-completes proposal)
```

**Also find these hardcoded actions (around lines 2743-2744):**
```ts
{ id: '1', title: 'View Strategy Proposals', actionType: 'navigate', targetUrl: '/research/content-strategy', icon: 'FileText' },
{ id: '2', title: 'Create New Strategy', actionType: 'navigate', targetUrl: '/research/content-strategy?new=true', icon: 'Plus' }
```

Replace with:
```ts
{ id: '1', title: 'View AI Proposals', actionType: 'navigate', targetUrl: '/ai-proposals', icon: 'FileText' },
{ id: '2', title: 'Create New Proposal', actionType: 'navigate', targetUrl: '/ai-proposals', icon: 'Plus' }
```

**Why:** The `/research/*` pages were deleted and now redirect. The AI needs to know the correct current routes so action buttons go to the right place directly.

---

## TASK 5: Fix `ModernActionButtons` stale route navigation

**File:** `src/components/ai-chat/ModernActionButtons.tsx`

**Find this block (lines 146-151):**
```ts
    } else if (actionStr.includes('keyword-research') || actionStr.includes('research')) {
      navigate('/research/content-strategy', {
        state: { prefilledKeyword: action.data?.keyword || action.data?.mainKeyword || action.label }
      });
    } else if (actionStr.includes('strategy')) {
      navigate('/research/content-strategy');
```

**Replace with:**
```ts
    } else if (actionStr.includes('keyword-research') || actionStr.includes('research')) {
      navigate('/keywords');
    } else if (actionStr.includes('strategy')) {
      navigate('/ai-proposals');
```

**Why:** `/research/content-strategy` was deleted. Keyword research → Keywords page. Strategy → AI Proposals page.

---

## TASK 6: Fix quick action hardcoded keyword

**File:** `src/components/ai-chat/EnhancedQuickActions.tsx`

**Find line 13:**
```ts
    { text: 'Research keywords', prompt: 'Add keyword "content marketing" and run SERP analysis', icon: Search, iconColor: 'text-amber-400' },
```

**Replace with:**
```ts
    { text: 'Research keywords', prompt: 'Show me my tracked keywords and suggest new keyword opportunities to research', icon: Search, iconColor: 'text-amber-400' },
```

**Why:** The current prompt hardcodes "content marketing" which the user didn't choose. The fix asks the AI to show existing keywords and suggest new ones.

---

## TASK 7: Fix stale `/research/` references across the codebase

Do a global find-and-replace across ALL files in `src/` for these patterns:

| Find | Replace with |
|------|-------------|
| `/research/content-strategy#calendar` | `/calendar` |
| `/research/content-strategy` | `/ai-proposals` |
| `/research/keyword-research` | `/keywords` |
| `/research/serp-intelligence` | `/keywords` |
| `/research/serp?keyword=` | `/keywords` |
| `/research/topic-clusters` | `/ai-chat` |
| `/research/content-gaps` | `/ai-chat` |
| `/research/calendar` | `/calendar` |

**Files that contain these references (verify each one is updated):**
- `src/pages/AIProposals.tsx` (line 80)
- `src/services/overdueContentService.ts` (lines 183, 200)
- `src/hooks/useOverdueContentMonitor.ts` (lines 37, 45)
- `src/utils/notificationHelpers.ts` (lines 154, 183, 341)
- `src/services/notificationIntegrations.ts` (lines 119, 145, 172, 192)
- `src/services/aiService.ts` (lines 151, 171)
- `src/components/analytics/ContentAnalyticsCard.tsx` (line 163)
- `src/components/onboarding/OnboardingCarousel.tsx` (line 75)
- `src/components/dashboard/ModuleCarouselData.ts` (line 49)

**Why:** These files still reference deleted `/research/*` routes. The redirects work but the user bounces through unnecessary redirects. Direct URLs are better.

---

## TASK 8: Add `.env` to `.gitignore`

**File:** `.gitignore`

**Add these lines at the end:**
```
# Environment files
.env
.env.*
.env.local
.env.production
```

**Why:** Currently `.gitignore` has no `.env` entry. If anyone creates a `.env` file with secrets, it would be committed to git.

---

## VERIFICATION

After all 8 tasks, test these:

1. Open AI Chat → type "Generate a blog post about AI trends" → should create a full article (not fail silently)
2. Open AI Chat → type "Create a topic cluster about digital marketing" → should generate subtopics (not fail)
3. AI suggests "Open Content Builder" → should open Content Wizard sidebar (not redirect loop)
4. AI suggests "View Strategy Proposals" → should navigate to `/ai-proposals` directly (not bounce through redirect)
5. Click "Research keywords" quick action → should ask about YOUR keywords (not "content marketing")
6. Check no action buttons navigate to `/research/*` URLs
7. Create a `.env` file → run `git status` → file should be ignored
