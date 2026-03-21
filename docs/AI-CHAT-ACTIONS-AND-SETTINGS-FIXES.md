# AI Chat Actions & Settings Consolidation — Fix Plan for Lovable

---

## PART 1: Every Broken Action in AI Chat

### How Actions Work (the flow)

```
Edge function returns → actions[] in response
  → EnhancedMessageBubble renders ModernActionButtons
    → User clicks button
      → ModernActionButtons.handleActionClick() does its own routing
        → Falls through to onAction → handleAction() in useEnhancedAIChatDB
```

There are TWO layers of action handling: `ModernActionButtons` handles some actions directly (navigate, confirm, send_message), then passes unrecognized ones to the parent `handleAction`. This creates gaps where actions fall through both layers and hit "Unknown Action".

---

### BUG 1: Error "Settings" button navigates to 404

**Where:** `src/hooks/useEnhancedAIChatDB.ts` — line 579

When the AI chat fails, the error message includes a "Settings" button:
```ts
action: 'navigate',
data: { url: '/ai-service-hub' }
```

`/ai-service-hub` does not exist in App.tsx routes. The user hits the 404 page.

**Fix:** Change to open the settings popup instead:
```ts
{
  id: 'settings-' + assistantId,
  type: 'button' as const,
  label: '⚙️ API Settings',
  action: 'navigate:/ai-settings',
}
```

This matches the `navigate:` prefix that `ModernActionButtons` handles at line 107.

---

### BUG 2: Edge function returns dead/wrong routes in action URLs

**Where:** `supabase/functions/enhanced-ai-chat/index.ts`

The system prompt and hardcoded fallback actions reference routes that don't exist or redirect:

| Line | URL in action | Problem | Correct URL |
|------|---------------|---------|-------------|
| 280 | `/content` | No route exists | `/repository` |
| 1003 | `/content-builder` | Redirects to `/ai-chat` | `/ai-chat` or remove |
| 2434 | `/content-strategy` | No route | `/research/content-strategy` |
| 2467 | `/content` | No route | `/repository` |
| 2468 | `/content-builder` | Redirects | `/ai-chat` |

**Fix:** Find-and-replace these URLs in the system prompt and hardcoded actions:
- `/content` → `/repository`
- `/content-builder` → `/ai-chat`
- `/content-strategy` → `/research/content-strategy`

---

### BUG 3: `confirm_action` button click → "Unknown Action"

**Where:** `src/hooks/useEnhancedAIChatDB.ts` — `handleAction` (line 590)

When the AI returns a destructive action, the response includes `{ action: 'confirm_action', data: { action: 'delete_content_item' } }`. The initial detection at line 510 in `sendMessage` correctly identifies it and shows a confirmation card.

But when the user **clicks "Confirm"**, `ModernActionButtons` passes the action to `onAction` → `handleAction`. The `handleAction` function checks for `send_message`, `workflow:`, `send:`, `navigate:`, and hardcoded strings — but NOT `confirm_action`. It hits the `default:` case → "Unknown Action" toast.

**Fix:** Add `confirm_action` handling to `handleAction`:

```ts
// In handleAction, after the send_message check (line 598):
if (action.action === 'confirm_action') {
  // Re-send the original message with confirmation
  const confirmedMessage = `CONFIRMED: Execute ${action.data?.action || 'action'}`;
  await sendMessage(confirmedMessage);
  return;
}
```

Or better — connect it to the existing `handleConfirmAction` method which already handles the pending confirmation state.

---

### BUG 4: AI-generated `actionType` values → "Unknown Action"

**Where:** `supabase/functions/enhanced-ai-chat/index.ts` — line 3215

When the AI returns actions with `actionType` that isn't `'navigate'`, the edge function sets `action: item.actionType` directly. For example, if the AI returns `actionType: 'create_content'`, the action becomes `{ action: 'create_content' }`. Neither `ModernActionButtons` nor `handleAction` recognizes this string.

**Fix:** In `ModernActionButtons.handleActionClick`, add a catch-all that converts unrecognized actions into chat messages:

```ts
// At the end of handleActionClick, replace the existing else block (line 152-155):
} else {
  // Unrecognized action — send as a chat message for the AI to handle
  const followUpMessage = action.data?.message || `Help me with: ${action.label}`;
  onAction({ ...action, action: 'send_message', data: { message: followUpMessage } });
}
```

This way, any action the AI generates that doesn't match a known pattern gets turned into a follow-up message, keeping the conversation going.

---

### BUG 5: Visual data action clicks → "Unknown Action"

**Where:** `src/components/ai-chat/EnhancedMessageBubble.tsx` — lines 295-308

When a user clicks an action inside a chart or visual data panel, the handler creates:
```ts
{ action: action, data }  // where 'action' is a raw string like "View Details"
```

This raw string doesn't match any handler pattern.

**Fix:** Route visual data actions through `sendMessage` as follow-ups:
```ts
onAction={(action, data) => {
  if (action.startsWith('navigate:')) {
    navigate(action.replace('navigate:', ''));
  } else if (action.startsWith('send:')) {
    onSendMessage?.(action.replace('send:', ''));
  } else {
    // Convert to chat follow-up
    onSendMessage?.(`Tell me more about: ${action}`);
  }
}}
```

---

### BUG 6: Deep dive prompts only visible in sidebar

**Where:** `src/components/ai-chat/VisualizationSidebar.tsx` — line 1372 and `visualization/MultiChartAnalysis.tsx` — line 224

The AI returns `deepDivePrompts` (suggested follow-up questions) in `visualData`. These only render in the sidebar and multi-chart modal. If the sidebar is closed, users never see suggested follow-ups.

**Fix:** Add deep dive prompts to `EnhancedMessageBubble` after the action buttons. In the message bubble, after the `ModernActionButtons` block (line 320):

```tsx
{/* Deep dive follow-up prompts */}
{!isUser && message.visualData?.deepDivePrompts?.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-1.5">
    {message.visualData.deepDivePrompts.slice(0, 3).map((prompt: string, idx: number) => (
      <button
        key={idx}
        onClick={() => onSendMessage?.(prompt)}
        className="text-xs px-2.5 py-1 rounded-full border border-border/20 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
      >
        {prompt}
      </button>
    ))}
  </div>
)}
```

---

### BUG 7: Workflow action buttons do nothing visible

**Where:** `src/hooks/useEnhancedAIChatDB.ts` — `handleWorkflowAction` (line 687)

When an action starts with `workflow:`, `handleWorkflowAction` is called. It reads/writes workflow state via `enhancedAIService` but doesn't trigger any AI processing, tool execution, or UI update. The user clicks a workflow button and sees a brief "Action Executed" toast but nothing else happens.

**Fix:** Convert workflow actions into AI messages so the AI can process them:

```ts
const handleWorkflowAction = useCallback(async (workflowAction: string, data?: any) => {
  if (!user) return;
  // Send as a message so the AI can take action
  await sendMessage(`Execute workflow step: ${workflowAction}`, `Running: ${workflowAction.replace(/_/g, ' ')}`);
}, [sendMessage, user]);
```

---

## PART 2: Settings Duplication — The Full Map

### What exists now (5 places where API keys are managed)

| # | What | Where | Used By | Status |
|---|------|-------|---------|--------|
| 1 | **Settings Popup → "API Keys" tab** | `src/components/settings/api/ApiSettings.tsx` | `SettingsPopup.tsx` → sidebar Settings button | **THE MAIN ONE** — full provider management |
| 2 | **`/ai-settings` page** | `src/pages/AISettings.tsx` | Route, Campaign page link | **DUPLICATE** — only shows OpenRouterSettings + password change |
| 3 | **APISettings** (capital) | `src/components/settings/APISettings.tsx` | Re-exported from `settings/index.ts` | **DEAD** — never imported by any component |
| 4 | **MinimalAPISettings** | `src/components/settings/MinimalAPISettings.tsx` | Not imported anywhere | **DEAD** |
| 5 | **EnhancedAISettings** | `src/components/settings/EnhancedAISettings.tsx` | Re-exported from `settings/index.ts` | **DEAD** — never imported |
| 6 | **EnhancedProviderManagement** | `src/components/settings/EnhancedProviderManagement.tsx` | Only by EnhancedAISettings (dead) | **DEAD** |
| 7 | **ProviderManagement** | `src/components/settings/ProviderManagement.tsx` | Only by MinimalAPISettings (dead) | **DEAD** |
| 8 | **OpenRouterSettings** (ai-chat) | `src/components/ai-chat/OpenRouterSettings.tsx` | `/ai-settings` page | **DUPLICATE** — separate OpenRouter-only UI |
| 9 | **OpenRouterSettings** (settings) | `src/components/settings/api/OpenRouterSettings.tsx` | `ApiKeyInput.tsx`, `ModelIndicator.tsx` | Part of the main settings popup |

### What SHOULD exist (one path)

**One entry point:** The Settings popup, accessed from the sidebar "Settings" gear icon. This already exists and works (`SettingsPopup.tsx` → `ApiSettings.tsx`).

All other paths should either:
- Open the settings popup (via `openSettings('api')`)
- OR redirect to it

### Fixes needed

**Fix A: Make `/ai-settings` route open the settings popup instead of its own page**

Change `src/pages/AISettings.tsx` to be a thin redirect that opens the popup:

```tsx
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

const AISettings = () => {
  const { openSettings } = useSettings();

  useEffect(() => {
    openSettings('api');
  }, [openSettings]);

  return <Navigate to="/ai-chat" replace />;
};

export default AISettings;
```

This way any link to `/ai-settings` opens the popup and redirects to `/ai-chat`.

**Fix B: Delete dead settings components**

These files are never imported by any active component:
```
src/components/settings/APISettings.tsx           (capital — dead)
src/components/settings/MinimalAPISettings.tsx     (dead)
src/components/settings/EnhancedAISettings.tsx     (dead)
src/components/settings/EnhancedProviderManagement.tsx (dead)
src/components/settings/ProviderManagement.tsx     (dead)
```

Also update `src/components/settings/index.ts` to remove exports of dead components.

**Fix C: Delete duplicate OpenRouterSettings**

`src/components/ai-chat/OpenRouterSettings.tsx` is only used by the old `/ai-settings` page. After Fix A makes that page a redirect, this file becomes dead. Delete it.

**Fix D: Update all `navigate('/ai-settings')` to `openSettings('api')`**

These files navigate to `/ai-settings` as a full page — they should open the popup instead:

| File | Line | Current | Change To |
|------|------|---------|-----------|
| `src/pages/Campaigns.tsx` | 520 | `navigate('/ai-settings')` | `openSettings('api')` |
| `src/hooks/useEnhancedAIChat.ts` | 122, 126 | `window.location.href = '/ai-settings'` | `openSettings('api')` |
| `src/components/ai-chat/ErrorBoundary.tsx` | 116 | `window.location.href = '/ai-settings'` | `openSettings('api')` |
| `src/components/onboarding/OnboardingCarousel.tsx` | 145 | `route: '/ai-settings'` | Use `openSettings('api')` handler |
| `src/components/dashboard/SetupChecklist.tsx` | 73 | `route: '/ai-settings'` | Use `openSettings('api')` handler |
| `src/components/content-builder/ai/*` | various | `navigate('/ai-settings')` | `openSettings('api')` |
| `src/components/serp/*.tsx` | various | `window.location.href = '/ai-settings'` | `openSettings('api')` |
| `src/components/ai-chat/SmartActionHandler.tsx` | 51 | `navigate('/ai-settings')` | `openSettings('api')` |
| `src/components/ai-chat/ApiKeyStatusIndicator.tsx` | 41 | `navigate('/settings')` | `openSettings('api')` |

---

## PART 3: Combined Implementation Plan

### Sprint 1: Fix broken actions (chat is live but actions don't work)

| # | Fix | Est. |
|---|-----|------|
| 1 | BUG 1: Error settings button → `/ai-service-hub` → change to `navigate:/ai-settings` | 2 min |
| 2 | BUG 2: Dead routes in edge function actions | 10 min |
| 3 | BUG 3: Add `confirm_action` to `handleAction` | 15 min |
| 4 | BUG 4: Catch-all for unrecognized actions → send as message | 10 min |
| 5 | BUG 5: Visual data actions → send as follow-up | 5 min |
| 6 | BUG 7: Workflow buttons → send as AI message | 5 min |

### Sprint 2: Consolidate settings

| # | Fix | Est. |
|---|-----|------|
| 7 | Fix A: `/ai-settings` → open popup + redirect | 10 min |
| 8 | Fix B: Delete 5 dead settings components | 5 min |
| 9 | Fix C: Delete duplicate OpenRouterSettings | 2 min |
| 10 | Fix D: Update `navigate('/ai-settings')` → `openSettings('api')` everywhere | 20 min |

### Sprint 3: UX improvement

| # | Fix | Est. |
|---|-----|------|
| 11 | BUG 6: Deep dive prompts in message bubble | 30 min |

---

## Testing Checklist

### Actions
- [ ] Send "hi" → get response → action buttons work (no "Unknown Action" toast)
- [ ] AI suggests "View your content" → button navigates to `/repository` (not 404)
- [ ] AI suggests creating content → button works (not redirect loop)
- [ ] Error state → "Retry" button resends the message
- [ ] Error state → "Settings" button opens settings popup (not 404)
- [ ] AI asks to delete content → confirmation card appears → "Confirm" button works
- [ ] Chart shows action buttons → clicking them sends a follow-up message
- [ ] Workflow action buttons → trigger AI processing (not silent no-op)

### Settings
- [ ] Sidebar → Settings gear → opens popup with API Keys tab
- [ ] `/ai-settings` URL → opens popup, redirects to `/ai-chat`
- [ ] Campaign page "Configure AI" → opens popup (not full page)
- [ ] Only ONE place to manage API keys (the popup)
- [ ] No duplicate OpenRouterSettings components loaded

### Deep dive
- [ ] AI response with charts → follow-up questions visible below action buttons
- [ ] Clicking a follow-up question sends it as a message
