# All Break Points — Fix Plan

> **For:** Lovable.dev
> **Scope:** 39 break points across 23 modules. Organized by severity — fix critical first, then high, then medium.
> **Rule:** Every fix has exact file + what to change for both frontend and backend.

---

## CRITICAL FIXES (9 items — app looks broken)

---

### C1 — AI Chat: "No provider" shows as "rate limited"

**What breaks:** User with no AI provider configured sends a message. Error says "Rate limited by AI provider. Automatically retrying in 30 seconds..." — wrong error. User waits forever.

**Frontend — File:** `src/hooks/useEnhancedAIChatDB.ts`

Find the error handling section (~line 844-878) where the error message is set. Currently all non-200 responses may fall into the rate limit detection. Add a specific check BEFORE the rate limit check:

```ts
// After getting the error response, BEFORE checking for rate limit:
const errorText = await response.text().catch(() => '');

// Check for no-provider error specifically
if (errorText.includes('No AI provider') || errorText.includes('No API key') || response.status === 400) {
  setMessages(prev => prev.map(m =>
    m.id === assistantMessageId
      ? { ...m, content: 'No AI provider configured. Go to Settings → API Keys and add your API key (OpenAI, Gemini, Anthropic, etc.) to start chatting.', status: 'error' as any }
      : m
  ));
  return; // Don't fall through to rate limit handler
}

// Existing rate limit detection continues below...
```

**Backend:** No changes.

---

### C2 — AI Chat: SSE stream breaks → blank message forever

**What breaks:** Network drops mid-response. The assistant message was already added to state with empty content. User sees a blank bubble that never goes away.

**Frontend — File:** `src/hooks/useEnhancedAIChatDB.ts`

Find where the SSE reader loop exits (the `while(true)` loop that reads the stream). After the loop, add a check for empty content:

```ts
// After SSE loop finishes (after the while loop or in the finally block):
// Check if we got a real response
if (!accumulatedText && !response) {
  // Stream broke with no content — update the blank message to show error
  setMessages(prev => prev.map(m =>
    m.id === assistantMessageId
      ? { ...m, content: 'Connection lost during response. Please try sending your message again.', status: 'error' as any }
      : m
  ));
  return;
}
```

Also add to the `catch` block of the fetch/SSE handling:

```ts
catch (err: any) {
  // If assistant message was added but has no content, mark as error
  setMessages(prev => prev.map(m =>
    m.id === assistantMessageId && (!m.content || m.content.trim() === '')
      ? { ...m, content: `Connection error: ${err.message || 'Request failed'}. Please try again.`, status: 'error' as any }
      : m
  ));
}
```

**Backend:** No changes.

---

### C3 — Campaigns: 0 content briefs crashes generation

**What breaks:** User generates a strategy that returns 0 content briefs. Clicking "Generate Assets" tries to map over empty/undefined array. Crash.

**Frontend — File:** `src/pages/Campaigns.tsx` (or wherever asset generation is triggered)

Find where `strategy.contentBriefs` is mapped (~line 251-300). Add guard:

```ts
// Before mapping over briefs:
const briefs = strategy?.contentBriefs || [];
if (briefs.length === 0) {
  toast({
    title: 'No content briefs available',
    description: 'Generate a strategy first to create content briefs.',
    variant: 'destructive'
  });
  return;
}
```

**Backend:** No changes.

---

### C4 — Analytics: No GA/GSC → NaN displayed

**What breaks:** User opens Analytics page without Google Analytics configured. Metrics try `.toFixed(1)` on undefined values. Shows "NaN%" on the page.

**Frontend — File:** `src/pages/Analytics.tsx`

Find where metrics like `avgBounceRate`, `avgSessionDuration`, `avgCTR`, `avgPosition` are displayed. Add null guards:

```ts
// For every metric that uses .toFixed():
// CHANGE FROM:
{metrics.avgBounceRate.toFixed(1)}%

// CHANGE TO:
{(metrics.avgBounceRate ?? 0).toFixed(1)}%
```

Apply to ALL metrics that use `.toFixed()`, `.toLocaleString()`, or similar formatting. The pattern:

```ts
// Safe formatting helper (add at top of component):
const safeNum = (val: any, decimals = 1) => {
  const n = Number(val);
  return isNaN(n) ? '0' : n.toFixed(decimals);
};

// Then use:
{safeNum(metrics.avgBounceRate)}%
{safeNum(metrics.avgCTR)}%
{safeNum(metrics.avgPosition, 0)}
{safeNum(metrics.avgSessionDuration, 0)}s
```

**Backend:** No changes.

---

### C5 — Publishing: Status stays "draft" after successful publish

**What breaks:** WordPress/Wix publish succeeds (content is live on the website) but if the DB update to mark it "published" fails (network drop), the content shows as "draft" in Creaiter. User doesn't know it's already live.

**Backend — File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts`

Find the `publish_to_website` handler. After the publish API call succeeds, update the DB status BEFORE returning success:

```ts
// After publish succeeds:
// Update status FIRST, before returning
const { error: statusError } = await supabase
  .from('content_items')
  .update({
    status: 'published',
    metadata: {
      ...(content.metadata || {}),
      published_url: publishResult.url || publishResult.link,
      published_at: new Date().toISOString(),
      published_provider: connection.provider
    }
  })
  .eq('id', content.id)
  .eq('user_id', userId);

if (statusError) {
  // Publish succeeded but status update failed — warn user
  return JSON.stringify({
    success: true,
    message: `Published "${content.title}" to ${connection.provider}, but failed to update status in Creaiter. The content is live at ${publishResult.url}. Please manually update the status in Repository.`,
    url: publishResult.url || publishResult.link,
    warning: 'status_update_failed'
  });
}
```

**Frontend:** No changes.

---

### C6 — Notifications: Subscription fails → bell never shows anything

**What breaks:** If Supabase realtime subscription throws, the notification system silently dies. Bell always shows 0.

**Frontend — File:** `src/hooks/use-notifications.ts`

Find the subscription setup. Wrap in proper error handling with retry:

```ts
// After subscription setup:
const setupSubscription = () => {
  try {
    const channel = supabase
      .channel('dashboard-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dashboard_alerts' }, (payload) => {
        // handle new alert
        setAlerts(prev => [payload.new as any, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Notification subscription failed, retrying in 30s...');
          setTimeout(setupSubscription, 30000); // Retry after 30s
        }
      });

    return () => { supabase.removeChannel(channel); };
  } catch (err) {
    console.warn('Notification subscription error:', err);
    // Retry after 30s
    const retryTimeout = setTimeout(setupSubscription, 30000);
    return () => clearTimeout(retryTimeout);
  }
};

// Call setupSubscription in useEffect
```

**Backend:** No changes.

---

### C7 — Cron: generate-proactive-insights crashes stop ALL users

**What breaks:** If one user's recommendation insert fails, the entire loop stops. No other users get insights.

**Backend — File:** `supabase/functions/generate-proactive-insights/index.ts`

Find the user loop where recommendations are inserted. Wrap each user's processing in its own try-catch:

```ts
// Inside the user loop:
for (const user of activeUsers) {
  try {
    // ... existing recommendation generation for this user
    // ... insert recommendations

    // ... insert dashboard_alerts (if high priority)
  } catch (userErr) {
    console.error(`Failed to generate insights for user ${user.id}:`, userErr);
    // Continue to next user — don't break the loop
    continue;
  }
}
```

**Frontend:** No changes.

---

### C8 — Journeys: Failed step stays "failed" forever

**What breaks:** If an email template is deleted while a journey is running, that step fails and stays failed permanently. The enrollment stalls — contact is stuck.

**Backend — File:** `supabase/functions/engage-journey-processor/index.ts`

After marking a step as "failed", add auto-advance logic:

```ts
// After marking step as failed:
if (stepResult.status === 'failed') {
  console.warn(`Step failed for enrollment ${enrollment.id}: ${stepResult.error}`);

  // Auto-advance past failed step after 3 failures
  const { count: failCount } = await supabase
    .from('journey_step_executions')
    .select('id', { count: 'exact', head: true })
    .eq('enrollment_id', enrollment.id)
    .eq('status', 'failed');

  if ((failCount || 0) >= 3) {
    // Skip this step and advance to next node
    console.log(`Skipping failed step after 3 attempts for enrollment ${enrollment.id}`);
    // Find next edge and advance
    const nextEdges = journey.edges?.filter((e: any) => e.source === currentStep.node_id) || [];
    if (nextEdges.length > 0) {
      await supabase.from('journey_enrollments')
        .update({ current_step_index: enrollment.current_step_index + 1 })
        .eq('id', enrollment.id);
    } else {
      // No next step — mark enrollment complete
      await supabase.from('journey_enrollments')
        .update({ status: 'completed' })
        .eq('id', enrollment.id);
    }
  }
}
```

**Frontend:** No changes.

---

### C9 — Journeys: No lock → duplicate processing

**What breaks:** Two concurrent runs of `engage-journey-processor` pick up the same enrollment. Contact gets emailed/tagged twice.

**Backend — File:** `supabase/functions/engage-journey-processor/index.ts`

Add a processing lock using a status field:

```ts
// At the start, when fetching pending steps:
// CHANGE FROM:
const { data: pendingSteps } = await supabase
  .from('journey_step_executions')
  .select('*')
  .eq('status', 'pending')
  .limit(20);

// CHANGE TO:
// Claim steps by immediately marking them as 'processing'
const { data: pendingSteps } = await supabase
  .from('journey_step_executions')
  .select('*')
  .eq('status', 'pending')
  .limit(20);

if (pendingSteps && pendingSteps.length > 0) {
  const stepIds = pendingSteps.map(s => s.id);
  // Atomically claim these steps
  const { data: claimed } = await supabase
    .from('journey_step_executions')
    .update({ status: 'processing' })
    .in('id', stepIds)
    .eq('status', 'pending') // Only claim if still pending (race protection)
    .select();

  // Only process the ones we successfully claimed
  const stepsToProcess = claimed || [];
  // ... process stepsToProcess instead of pendingSteps
}
```

**Frontend:** No changes.

---

## HIGH FIXES (15 items — frustrating but not crash)

---

### H1 — AI Chat: Expired token → silent message loss

**Frontend — File:** `src/hooks/useEnhancedAIChatDB.ts`

Already has session refresh (from earlier fix). Verify it actually refreshes when token is < 2 min from expiry. If still failing, make the check more aggressive:

```ts
// Change refresh threshold from 120 seconds to 300 seconds (5 min):
if (expiresAt - nowSecs < 300) {
  await supabase.auth.refreshSession();
}
```

**Backend:** No changes.

---

### H2 — AI Chat: Conversation creation fails → messages split

**Frontend — File:** `src/hooks/useEnhancedAIChatDB.ts`

Find where `createConversation` returns null and the function returns early. Add cleanup:

```ts
if (!newConversationId) {
  toast({ title: 'Failed to create conversation', description: 'Please try again.', variant: 'destructive' });
  // Remove the user message that was optimistically added
  setMessages(prev => prev.filter(m => m.id !== userMessageId));
  return;
}
```

**Backend:** No changes.

---

### H3 — Content Wizard: SERP API missing → generic "failed"

**Frontend:** Where SERP research is triggered in the wizard, check for the API key first:

```ts
// Before calling SERP analysis:
const { data: serpKey } = await supabase
  .from('api_keys_metadata')
  .select('id')
  .eq('service', 'serp')
  .eq('is_active', true)
  .maybeSingle();

if (!serpKey) {
  toast({
    title: 'SERP API key required',
    description: 'Add your SerpAPI key in Settings → API Keys to enable keyword research.',
    variant: 'destructive'
  });
  return;
}
```

**Backend:** No changes.

---

### H4 — Content Wizard: Empty briefs → placeholder content

**Backend — File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` or wherever campaign content is generated.

When generating content from briefs, validate briefs have real data:

```ts
// Before generating content from a brief:
if (!brief.title || brief.title.startsWith('Content ') || !brief.keyword) {
  return JSON.stringify({
    success: false,
    message: 'Content brief is incomplete — missing title or keyword. Please regenerate the strategy.'
  });
}
```

**Frontend:** No changes.

---

### H5 — Repository: Detail view on null content

**Frontend — File:** `src/components/content/repository/ContentDetailView.tsx`

Add null guard at the top of the component:

```tsx
if (!item) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      Content not found or has been deleted.
    </div>
  );
}
```

**Backend:** No changes.

---

### H6 — Keywords: Page shows empty with hidden error

**Frontend — File:** `src/pages/keywords/KeywordsPage.tsx`

Add error state to the keyword fetch:

```ts
const [loadError, setLoadError] = useState(false);

// In the fetch:
try {
  const data = await keywordLibraryService.getKeywords(userId);
  setKeywords(data);
} catch (err) {
  setLoadError(true);
  console.error('Failed to load keywords:', err);
}

// In render:
{loadError && (
  <div className="text-center py-8 text-destructive">
    Failed to load keywords. Please refresh the page.
  </div>
)}
```

**Backend:** No changes.

---

### H7 — Proposals: Accept fails → inconsistent state

**Backend — File:** `supabase/functions/enhanced-ai-chat/proposal-action-tools.ts`

Wrap the accept flow in proper order — update status LAST:

```ts
// 1. Create calendar item first
const { error: calErr } = await supabase.from('content_calendar').insert({...});
if (calErr) {
  return JSON.stringify({ success: false, message: 'Failed to add to calendar. Proposal not accepted.' });
}

// 2. Only update proposal status if calendar succeeded
await supabase.from('ai_strategy_proposals')
  .update({ status: 'scheduled' })
  .eq('id', proposalId);
```

**Frontend:** No changes.

---

### H8 — Publishing: Stale token → no re-auth guidance

**Backend — File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts`

In the publish handler, when connection lookup returns null or auth fails:

```ts
if (!connection || !connection.credentials) {
  return JSON.stringify({
    success: false,
    message: 'No active website connection found. Your WordPress/Wix credentials may have expired. Go to Settings → Websites to reconnect.'
  });
}
```

**Frontend:** No changes.

---

### H9 — Settings: Legacy key → dead end

**Frontend — File:** `src/services/apiKeyService.ts`

Find where `LEGACY_KEY_REQUIRES_REENTRY` error is thrown. Catch it at the call site and show a clear message:

```ts
try {
  const key = await getApiKey(service);
} catch (err: any) {
  if (err.message?.includes('LEGACY_KEY_REQUIRES_REENTRY')) {
    toast({
      title: 'API key needs to be re-entered',
      description: `Your ${service} key was stored in an old format. Please go to Settings → API Keys and re-enter it.`,
      variant: 'destructive'
    });
  }
}
```

**Backend:** No changes.

---

### H10 — Settings: Provider switch during conversation

**Frontend — File:** `src/components/settings/api/DefaultAiProviderSelector.tsx`

When user switches provider, show a warning if a conversation is active:

```ts
const handleSwitch = async (newProvider: string) => {
  // Show warning but don't block
  toast({
    title: `Switched to ${newProvider}`,
    description: 'New messages will use this provider. If you have an in-progress message, it will complete with the previous provider.'
  });
  // ... existing switch logic
};
```

**Backend:** No changes.

---

### H11 — Onboarding: Skip → no company info → downstream fails

**Frontend — File:** `src/contexts/OnboardingContext.tsx`

In `skipOnboarding`, set minimum default company info:

```ts
const skipOnboarding = async () => {
  // Set a default company entry so downstream features don't crash
  try {
    const { data: existing } = await supabase
      .from('company_info')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from('company_info').insert({
        user_id: user.id,
        company_name: 'My Company',
        industry: 'General'
      });
    }
  } catch { /* non-blocking */ }

  endOnboarding();
};
```

**Backend:** No changes.

---

### H12 — Email: Campaign stuck in "sending"

**Backend — File:** `supabase/functions/engage-email-send/index.ts`

After the email send attempt (success or failure), always update campaign status:

```ts
// In finally block or after all sends:
try {
  const finalStatus = allSent ? 'sent' : 'failed';
  await supabase.from('email_campaigns')
    .update({ status: finalStatus, updated_at: new Date().toISOString() })
    .eq('id', campaignId);
} catch {
  console.error('Failed to update campaign status');
}
```

**Frontend:** No changes.

---

### H13 — Email: Null body → blank email sent

**Backend — File:** `supabase/functions/engage-email-send/index.ts`

Before sending, validate the email has content:

```ts
if (!bodyHtml || bodyHtml.trim().length < 10) {
  // Don't send blank emails
  await supabase.from('email_campaigns')
    .update({ status: 'failed', error_message: 'Email body is empty — cannot send blank email.' })
    .eq('id', campaignId);
  return { success: false, error: 'Email body is empty' };
}
```

**Frontend:** No changes.

---

### H14 — Social: Post created but targets fail → orphan

**Backend — File:** `supabase/functions/enhanced-ai-chat/engage-action-tools.ts`

After creating the social post, if targets insert fails, delete the orphaned post:

```ts
// After post insert succeeds:
const { error: targetErr } = await supabase.from('social_post_targets').insert(targets);

if (targetErr) {
  // Rollback: delete the orphaned post
  await supabase.from('social_posts').delete().eq('id', postId);
  return JSON.stringify({
    success: false,
    message: 'Failed to set up post targets. Please try again.'
  });
}
```

**Frontend:** No changes.

---

### H15 — Cross-Module: Invalid content_id → orphaned campaign

**Backend — File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts`

In `promote_content_to_campaign`, validate content exists first:

```ts
const { data: content, error } = await supabase
  .from('content_items')
  .select('id, title')
  .eq('id', toolArgs.content_id)
  .eq('user_id', userId)
  .single();

if (error || !content) {
  return JSON.stringify({
    success: false,
    message: 'Content item not found. It may have been deleted.'
  });
}
```

**Frontend:** No changes.

---

## MEDIUM FIXES (15 items — edge cases)

---

### M1 — Repository: Bulk delete partial failure

**Frontend — File:** `src/components/repository/RepositoryBulkBar.tsx`

Collect results and report:

```ts
const handleBulkDelete = async (ids: string[]) => {
  let succeeded = 0;
  let failed = 0;
  for (const id of ids) {
    try {
      await deleteContentItem(id);
      succeeded++;
    } catch {
      failed++;
    }
  }
  if (failed > 0) {
    toast({ title: `Deleted ${succeeded} items, ${failed} failed`, variant: 'destructive' });
  } else {
    toast({ title: `${succeeded} items deleted` });
  }
  refreshContent();
  clearSelection();
};
```

**Backend:** No changes.

---

### M2 — Repository: Malformed metadata crash

**Frontend — File:** `src/components/content/repository/ContentDetailView.tsx`

Wrap any JSON.parse calls:

```ts
const safeParse = (val: any) => {
  try { return typeof val === 'string' ? JSON.parse(val) : val || {}; }
  catch { return {}; }
};
```

**Backend:** No changes.

---

### M3 — Analyst: Health score NaN

**Frontend — File:** `src/hooks/useAnalystEngine.ts`

In health score computation, guard every division:

```ts
const total = factors.reduce((sum, f) => sum + (isNaN(f.score) ? 0 : f.score), 0);
const maxTotal = factors.reduce((sum, f) => sum + f.maxScore, 0);
const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
```

**Backend:** No changes.

---

### M4 — Analyst: Refresh loop crashes

**Frontend — File:** `src/hooks/useAnalystEngine.ts`

Wrap the refresh interval callback:

```ts
const interval = setInterval(() => {
  try {
    if (!document.hidden && isActive) {
      fetchPlatformData();
    }
  } catch (err) {
    console.warn('Analyst refresh failed:', err);
  }
}, 120000);
```

**Backend:** No changes.

---

### M5 — Notifications: Unread count out of sync

**Frontend — File:** `src/hooks/use-notifications.ts`

Periodically re-fetch count as fallback:

```ts
// Add a 5-minute polling fallback in case realtime fails:
useEffect(() => {
  const poll = setInterval(async () => {
    const { count } = await supabase
      .from('dashboard_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    setUnreadCount(count || 0);
  }, 300000); // 5 min
  return () => clearInterval(poll);
}, [userId]);
```

**Backend:** No changes.

---

### M6 — Contacts: Duplicate email silent error

**Backend — File:** `supabase/functions/enhanced-ai-chat/engage-action-tools.ts`

Before inserting contact, check for duplicate:

```ts
const { data: existing } = await supabase
  .from('engage_contacts')
  .select('id')
  .eq('email', toolArgs.email)
  .eq('user_id', userId)
  .maybeSingle();

if (existing) {
  return JSON.stringify({
    success: false,
    message: `Contact with email ${toolArgs.email} already exists.`
  });
}
```

**Frontend:** No changes.

---

### M7 — Contacts: Batch tagging partial failure

**Backend — File:** `supabase/functions/enhanced-ai-chat/engage-action-tools.ts`

Track and report partial failures:

```ts
let tagged = 0;
let failed = 0;
for (const contactId of toolArgs.contact_ids) {
  const { error } = await supabase.from('engage_contacts')
    .update({ tags: [...existingTags, ...newTags] })
    .eq('id', contactId);
  if (error) failed++;
  else tagged++;
}

return JSON.stringify({
  success: failed === 0,
  message: failed > 0
    ? `Tagged ${tagged} contacts, ${failed} failed.`
    : `Tagged ${tagged} contacts.`
});
```

**Frontend:** No changes.

---

### M8 — Calendar: Overdue check crash on bad JSON

**Frontend — File:** `src/services/overdueContentService.ts` or wherever overdue check runs.

Wrap JSON.parse:

```ts
let notes = {};
try {
  notes = item.notes ? JSON.parse(item.notes) : {};
} catch {
  notes = {};
}
```

**Backend:** No changes.

---

### M9 — Proposals: Overdue detection stops on first error

**Frontend:** Same pattern as M8 — wrap parse in try-catch, use `continue` in loop.

**Backend:** No changes.

---

### M10 — Sharing: Deleted conversation → 404

**Frontend — File:** `src/pages/SharedConversation.tsx` (or shared view component)

Show a friendly message:

```tsx
if (error || !conversation) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">Conversation not available</h2>
        <p className="text-muted-foreground">This shared conversation may have been deleted or the link is invalid.</p>
      </div>
    </div>
  );
}
```

**Backend:** No changes.

---

### M11 — Video: Not implemented

**Frontend:** If video generation is shown in the UI, add a "Coming Soon" label. If it's not visible, no change needed.

**Backend:** No changes.

---

### M12 — Cron: Quality gate doesn't enforce

**Backend — File:** `supabase/functions/process-content-queue/index.ts`

The quality gate already flags content as `needs_review` (SB-18 was done). Verify it's still working. If content is still marked `completed` with low SEO, check:

```ts
if (savedContent && (savedContent.seo_score ?? 0) < 30) {
  await supabase.from('content_items')
    .update({ approval_status: 'needs_review' })
    .eq('id', contentId);
}
```

**Frontend:** No changes.

---

### M13 — Cron: Job runner reports "success" when sub-job fails

**Backend — File:** `supabase/functions/engage-job-runner/index.ts`

Check if any result has errors and return appropriate status:

```ts
const hasErrors = Object.values(results).some((r: any) => r?.error);
return new Response(JSON.stringify({
  results,
  status: hasErrors ? 'partial_failure' : 'success'
}), { status: hasErrors ? 207 : 200 });
```

**Frontend:** No changes.

---

### M14 — Competitor: Empty page crash

**Frontend:** Add null guard on competitor array before mapping. If `competitors` is undefined, show empty state.

**Backend:** No changes.

---

### M15 — Analyst: Query failures hidden

**Frontend — File:** `src/hooks/useAnalystEngine.ts`

Already has `lastRefreshError` from earlier fix. Verify it's being set when queries fail.

**Backend:** No changes.

---

## SUMMARY

| Priority | Count | Backend | Frontend |
|----------|:-----:|:-------:|:--------:|
| Critical | 9 | 5 | 4 |
| High | 15 | 6 | 9 |
| Medium | 15 | 4 | 11 |
| **Total** | **39** | **15** | **24** |

**Do Critical first (9 items). Then High. Medium can wait for post-launch.**

**Files touched:**
- `useEnhancedAIChatDB.ts` — 3 fixes (C1, C2, H1, H2)
- `enhanced-ai-chat/cross-module-tools.ts` — 2 fixes (C5, H8, H15)
- `engage-journey-processor/index.ts` — 2 fixes (C8, C9)
- `generate-proactive-insights/index.ts` — 1 fix (C7)
- `use-notifications.ts` — 2 fixes (C6, M5)
- `Analytics.tsx` — 1 fix (C4)
- `Campaigns.tsx` — 1 fix (C3)
- `engage-email-send/index.ts` — 2 fixes (H12, H13)
- `engage-action-tools.ts` — 3 fixes (H14, M6, M7)
- `proposal-action-tools.ts` — 1 fix (H7)
- `useAnalystEngine.ts` — 2 fixes (M3, M4)
- Various frontend components — null guards and error states
