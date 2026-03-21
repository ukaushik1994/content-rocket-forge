

# Launch Ready — Final 4 Fixes: Audit & Plan

## Status: 3 of 4 Already Implemented, 1 Partially Done

### Fix 1: Dynamic Temperature — ALREADY DONE
**Line 3357-3359** of `enhanced-ai-chat/index.ts` already has:
```
temperature: queryIntent.categories.includes('action') || /create|generate|write/i.test(userQuery) ? 0.8 :
             queryRequiresToolExecution(queryIntent) ? 0.2 : 0.4,
```
This covers: data lookups (0.2), conversational (0.4), content generation (0.8). The campaign strategy call (line 2397) uses 0.7 which is fine for strategy generation. The retry call (line 3523) uses 0.5 for deterministic tool forcing — also correct. **No changes needed.**

### Fix 2: Hide start_content_builder — ALREADY DONE
**Lines 3298-3302** already filter it:
```
toolsToUse = toolsToUse.filter((t: any) => {
  const name = t.function?.name;
  return name !== 'start_content_builder' && name !== 'create_content_item' && name !== 'send_quick_email';
});
```
**No changes needed.**

### Fix 3: Email Campaigns Workspace Filter — PARTIALLY DONE (needs user_id fallback)
**Lines 1313-1324** of `useAnalystEngine.ts` currently:
- Queries `team_members` for `workspace_id`
- If no `workspace_id` found → **silently returns** (line 1317: `if (!tm?.workspace_id) return;`)
- This means users without a workspace see 0 email campaigns even if they have some

**Change needed:** Replace the early return with a user_id fallback query, wrapped in try/catch.

### Fix 4: Content-Based Anomaly IDs — ALREADY DONE
All anomaly IDs are already stable:
- `anomaly-low-seo`, `anomaly-stale-drafts`, `anomaly-empty-calendar`, `anomaly-stale-content`
- `cross-seo-declining`, `cross-seo-improving`, `cross-publish-gap`, `cross-topic-concentration-${kw}`, `cross-cannibalization-${kw}`, `cross-keyword-ratio`

No `${now.getTime()}` found anywhere in IDs. **No changes needed.**

---

## Implementation: Fix 3 Only

### File: `src/hooks/useAnalystEngine.ts` (lines 1313-1324)

Replace the email_campaigns fetch block with:

```typescript
fetches.push((async () => {
  try {
    let emailCount = 0;
    const { data: tm } = await supabase
      .from('team_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    
    if (tm?.workspace_id) {
      const { count } = await supabase
        .from('email_campaigns' as any)
        .select('id', { count: 'exact', head: true })
        .eq('workspace_id', tm.workspace_id);
      emailCount = count || 0;
    } else {
      // Fallback: filter by user_id directly
      const { count } = await supabase
        .from('email_campaigns' as any)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      emailCount = count || 0;
    }
    
    if (emailCount > 0) {
      newData.push({
        label: 'Email Campaigns',
        value: emailCount,
        category: 'email',
        fetchedAt: now
      });
    }
  } catch { /* table may not exist */ }
})());
```

**Key difference:** Instead of returning early when `workspace_id` is missing, fall back to `user_id` filtering. Also only push to `newData` if count > 0.

---

## Summary

| Fix | Status | Action |
|-----|--------|--------|
| 1. Dynamic Temperature | Done | None |
| 2. Hide deprecated tool | Done | None |
| 3. Email campaigns filter | Partial | Add user_id fallback |
| 4. Stable anomaly IDs | Done | None |

**1 file changed. 1 block modified. ~30 seconds of work.**

