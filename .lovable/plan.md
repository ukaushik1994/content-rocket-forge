

# Implementation Status Check — Results

## Already Implemented (Verified Working)

1. **Web search `[web-search]` prefix handling** — Lines 1851-1857: prefix detected, stripped, `forceWebSearch` set. Working.
2. **Web search user API key decryption** — Lines 2175-2199: `getApiKey('serp', user.id)` with `serpstack` fallback, key passed to `executeWebSearch`. Working.
3. **`executeSerpAnalysis` accepts `apiKey` param** — Line 388: `apiKey?: string` parameter added, passed to `api-proxy` body. Working.
4. **Dead recovery block removed** — Lines 3241-3243: reduced to a harmless log warning. Working.
5. **Edit window enforcement** — Lines 995-1010: 5-minute check with toast feedback. Working.
6. **Duplicate title update removed** — Line 553: only a comment remains. Working.
7. **Shared conversation route exists** — `App.tsx` line 130: `/shared-conversation/:conversationId` routes to `<SharedConversation />`. Working.

## NOT Implemented — 1 Remaining Bug

**BUG-2 (P1): `serpApiKey` is undefined in the keyword/SEO SERP path**

On line 2210:
```
const serpResults = await executeSerpAnalysis(serpIntelligence.keywords, serpIntelligence.queryType, 'us', serpApiKey);
```

The variable `serpApiKey` is declared with `let` inside the web search `try` block (line 2177), which is inside the `if (serpIntelligence.queryType === 'web_search')` branch. The keyword/SEO path is in the `else` branch (line 2206), so **`serpApiKey` is `undefined` here** — it's not in scope.

This means keyword-triggered SERP queries (e.g., "who's ranking for AI tools", "SEO analysis for my keywords") silently fail because `executeSerpAnalysis` receives `undefined` as the API key, and the `api-proxy` has no env-level fallback.

### Fix

Move the API key decryption **above** the `if/else` branch so both paths can use it:

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Replace lines 2169-2210 with:
1. After `let webSearchContext = '';` (line 2167), add the key decryption block:
   ```ts
   let serpApiKey: string | null = null;
   if (serpIntelligence.shouldTriggerSerp && serpIntelligence.keywords.length > 0) {
     try {
       const { getApiKey } = await import('../shared/apiKeyService.ts');
       serpApiKey = await getApiKey('serp', user.id);
       if (!serpApiKey) serpApiKey = await getApiKey('serpstack', user.id);
     } catch (e) { console.warn('⚠️ Failed to decrypt SERP key:', e); }
   ```
2. Remove the duplicate key decryption from inside the web search `try` block (lines 2175-2180)
3. Both the web search path and keyword path now reference the same `serpApiKey` variable

Then redeploy `enhanced-ai-chat`.

### Summary

| Item | Status |
|------|--------|
| `[web-search]` prefix detection | Done |
| Web search uses user's API key | Done |
| Keyword SERP uses user's API key | **NOT DONE** — `serpApiKey` out of scope |
| Dead recovery block removed | Done |
| Edit window enforced | Done |
| Duplicate title update removed | Done |
| Share route exists | Done |

One fix needed: hoist `serpApiKey` decryption above the if/else so the keyword path can access it. Single file change + deploy.

