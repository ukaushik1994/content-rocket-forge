# Post-Cleanup — Remaining Issues

> After the major cleanup (6,720 lines deleted), here's everything still broken or needing attention.

---

## P0 — BLOCKING (2 items)

### 1. `generate_full_content` tool reads plaintext API key — WILL FAIL

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — lines 426-431

```ts
const { data: provider } = await supabase.from('ai_service_providers')
  .select('api_key, provider, preferred_model')  // reads plaintext api_key
```

The `index.ts` was fixed to use `shared/apiKeyService.ts` for decryption, but this tool handler still reads from `ai_service_providers.api_key`. Since plaintext sync was removed from the client, this column is empty → the tool gets no key → `ai-proxy` may fall back to its own decryption, but the `provider` object sent has an empty `api_key`.

**Impact:** "Generate an article about X" via AI chat fails silently.

**Fix:**
```ts
const { getApiKey } = await import('../shared/apiKeyService.ts');
const { data: providerRow } = await supabase.from('ai_service_providers')
  .select('provider, preferred_model')
  .eq('user_id', userId).eq('status', 'active')
  .order('priority', { ascending: true }).limit(1).single();

if (!providerRow) {
  return { success: false, message: 'No AI provider configured. Go to Settings to add your API key.' };
}

const apiKey = await getApiKey(providerRow.provider, userId);
if (!apiKey) {
  return { success: false, message: `No API key found for ${providerRow.provider}. Please add it in Settings.` };
}
```

Then pass `apiKey` (not `provider.api_key`) to the ai-proxy call.

---

### 2. `create_topic_cluster` tool reads plaintext API key — WILL FAIL

**File:** `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` — lines 241-246

Exact same bug, same fix pattern.

---

## P1 — STALE REFERENCES (actions navigate to redirects)

### 3. Edge function system prompt references deleted routes

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

The system prompt (injected into every AI call) still tells the AI about deleted routes:

| Line | Reference | Now redirects to | Should say |
|------|-----------|-----------------|------------|
| 733 | `/research/content-strategy` | `/ai-chat` | Remove or say "use AI Chat" |
| 734 | `/research/serp-intelligence` | `/keywords` | `/keywords` |
| 735 | `/research/topic-clusters` | `/ai-chat` | Remove or say "use AI Chat Research Intelligence" |
| 736 | `/research/content-gaps` | `/ai-chat` | Remove |
| 737 | `/research/calendar` | `/calendar` | `/calendar` |
| 799 | Full workflow referencing old routes | Multiple redirects | Update entire flow description |
| 2743 | `targetUrl: '/research/content-strategy'` | → `/ai-chat` | `/ai-proposals` |
| 2744 | `targetUrl: '/research/content-strategy?new=true'` | → `/ai-chat` | `/ai-proposals` |

**Impact:** AI generates action buttons pointing to old URLs. They do redirect so nothing 404s, but the user bounces through a redirect and lands on a generic page instead of the right place.

**Fix:** Update the system prompt module and hardcoded actions to use current routes:
- `/research/content-strategy` → `/ai-proposals` (for proposals) or remove (for strategy)
- `/research/serp-intelligence` → `/keywords`
- `/research/topic-clusters` → remove (AI chat handles this)
- `/research/content-gaps` → remove (AI chat handles this)
- `/research/calendar` → `/calendar`

---

### 4. `start_content_builder` tool navigates to `/content-builder` → redirects to `/ai-chat`

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — line 515

```ts
url: '/content-builder',
```

This is a circular loop: AI chat → action button → `/content-builder` → redirect → `/ai-chat`.

**Fix:** Either remove the `start_content_builder` tool entirely (since `launch_content_wizard` does the same thing better), or change the return to open the wizard sidebar instead of navigating:

```ts
case 'start_content_builder': {
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

---

### 5. Frontend `ModernActionButtons` still navigates to deleted routes

**File:** `src/components/ai-chat/ModernActionButtons.tsx` — lines 147, 151

```ts
navigate('/research/content-strategy', { ... });  // line 147
navigate('/research/content-strategy');             // line 151
```

These redirect to `/ai-chat` which works but is confusing (user clicks "Research" and lands back in chat).

**Fix:** Change to `/keywords` or remove these specific navigation handlers since the default catch-all now converts unknown actions to chat messages.

---

### 6. Stale `/research/` references across services and components (~20 files)

Many service files and components still reference deleted research routes:

| File | Lines | Reference |
|------|-------|-----------|
| `src/pages/AIProposals.tsx` | 80 | `navigate('/research/content-strategy', ...)` |
| `src/services/overdueContentService.ts` | 183, 200 | `action_url: '/research/content-strategy#calendar'` |
| `src/hooks/useOverdueContentMonitor.ts` | 37, 45 | `window.location.href = '/research/content-strategy#calendar'` |
| `src/utils/notificationHelpers.ts` | 154, 183, 341 | `/research/keyword-research`, `/research/content-strategy` |
| `src/services/notificationIntegrations.ts` | 119, 145, 172, 192 | Various `/research/` paths |
| `src/services/aiService.ts` | 151, 171 | `navigate:/research/keyword-research`, `navigate:/research/content-strategy` |
| `src/components/analytics/ContentAnalyticsCard.tsx` | 163 | `/research/serp?keyword=...` |
| `src/components/onboarding/OnboardingCarousel.tsx` | 75 | `/research/content-strategy` |
| `src/components/dashboard/ModuleCarouselData.ts` | 49 | `/research/keyword-research` |

**Fix:** Global find-and-replace:
- `/research/content-strategy` → `/ai-chat` or `/ai-proposals` (depending on context)
- `/research/content-strategy#calendar` → `/calendar`
- `/research/keyword-research` → `/keywords`
- `/research/serp-intelligence` → `/keywords`
- `/research/serp?keyword=` → `/keywords` (or remove the link)
- `/research/topic-clusters` → `/ai-chat`
- `/research/content-gaps` → `/ai-chat`

---

## P1 — MISSING FUNCTIONALITY

### 7. `.gitignore` still missing `.env`

**File:** `.gitignore`

Still no `.env` entries. Add:
```
.env
.env.*
.env.local
.env.production
```

---

### 8. Quick action "Research keywords" uses hardcoded keyword

**File:** `src/components/ai-chat/EnhancedQuickActions.tsx` — line 13

```ts
{ text: 'Research keywords', prompt: 'Add keyword "content marketing" and run SERP analysis', ... }
```

This sends a hardcoded "content marketing" keyword. The user didn't choose this.

**Fix:** Change to a generic prompt:
```ts
{ text: 'Research keywords', prompt: 'Show me my tracked keywords and suggest new ones to research', ... }
```

---

## P2 — DEAD CODE (large)

### 9. `content-builder/` — 190 files still in codebase

`src/components/content-builder/` has 190 `.ts`/`.tsx` files. The `/content-builder` route is a redirect to `/ai-chat`. The Content Wizard in the AI chat sidebar is the replacement.

**However:** Some of these files ARE still imported:
- `src/contexts/content-builder/types/` — type definitions used by Campaigns, Solutions, Content Wizard
- `src/components/content-builder/ContentBuilder.tsx` — imported by `SmartActionHandler.tsx`
- Various content-builder components imported by content-wizard steps

**Recommendation:** Don't delete the whole directory. But audit which files are truly dead:
- The 30+ step components (`steps/writing/`, `steps/save/`, `steps/OutlineStep.tsx`, etc.) are likely dead since no route renders `ContentBuilder`
- The context and type files are shared — keep those
- The serp components inside content-builder may be used by other parts

This is a larger cleanup effort — recommend doing after all P0/P1 items are resolved.

---

### 10. `content-repurposing/` — 45 files still in codebase

`src/components/content-repurposing/` has 45 files. The page was deleted but the component directory remains. Some components are imported by `ContentRepurposingModal.tsx` and `ContentDetailModal.tsx` in the repository, so they may be active.

**Recommendation:** Same as above — audit imports before deleting.

---

## IMPLEMENTATION ORDER

### Immediate (do now)
| # | Item | Est. |
|---|------|------|
| 1 | Fix `generate_full_content` API key lookup | 10 min |
| 2 | Fix `create_topic_cluster` API key lookup | 10 min |
| 3 | Fix `start_content_builder` → return wizard visualData | 5 min |
| 4 | Add `.env` to `.gitignore` | 1 min |

### Next (stale references)
| # | Item | Est. |
|---|------|------|
| 5 | Update edge function system prompt — remove deleted route references | 15 min |
| 6 | Update `ModernActionButtons` — remove `/research/` navigation | 5 min |
| 7 | Global find-replace `/research/` URLs in ~20 service/component files | 30 min |
| 8 | Fix hardcoded "content marketing" in quick action | 2 min |

### Later (dead code audit)
| # | Item | Est. |
|---|------|------|
| 9 | Audit `content-builder/` — identify truly dead files vs shared ones | 1-2 hrs |
| 10 | Audit `content-repurposing/` — check if modal still needs these | 30 min |

---

## TESTING CHECKLIST

- [ ] "Generate a blog post about AI" → article created (not empty/error)
- [ ] "Create a topic cluster about marketing" → cluster created (not error)
- [ ] AI suggests "View Strategy Proposals" → navigates to `/ai-proposals` (not redirect loop)
- [ ] AI suggests "Open Content Builder" → opens Content Wizard sidebar (not redirect)
- [ ] No action buttons navigate to `/research/*` (should go to current routes)
- [ ] "Research keywords" quick action → generic prompt (not "content marketing")
- [ ] `.env` file creation → not tracked by git
