

# AI Chat Actions & Settings Consolidation — Fix Plan

## Summary

The uploaded audit document identifies 7 broken action bugs and a settings duplication problem across 9 components. After verifying the codebase, all issues are confirmed. Here's the implementation plan split into 3 sprints.

---

## Sprint 1: Fix Broken Chat Actions

### 1. Error "Settings" button → 404 (`useEnhancedAIChatDB.ts` line 578-579)
Change `action: 'navigate', data: { url: '/ai-service-hub' }` to `action: 'navigate:/ai-settings'` so `ModernActionButtons` handles it via its `navigate:` prefix logic.

### 2. Dead routes in edge function (`enhanced-ai-chat/index.ts`)
Find-and-replace across the system prompt and hardcoded actions:
- `/content` → `/repository`
- `/content-builder` → `/ai-chat`
- `/content-strategy` → `/research/content-strategy`

### 3. `confirm_action` unhandled (`useEnhancedAIChatDB.ts` line 590+ `handleAction`)
Add before the `default:` case:
```ts
case 'confirm_action':
  const confirmedMsg = `CONFIRMED: Execute ${action.data?.action || 'action'}`;
  await sendMessage(confirmedMsg);
  return;
```

### 4. Unrecognized AI-generated actions → "Unknown Action" (`ModernActionButtons.tsx` line 152+)
Replace the final `else { onAction(action); }` with a catch-all that converts unknown actions into chat follow-up messages:
```ts
const followUpMessage = action.data?.message || `Help me with: ${action.label}`;
onAction({ ...action, action: 'send_message', data: { message: followUpMessage } });
```

### 5. Visual data action clicks → "Unknown Action" (`EnhancedMessageBubble.tsx` lines 301-307)
Change the `else` fallback in the `onAction` handler to send as a chat message instead:
```ts
onSendMessage?.(`Tell me more about: ${action}`);
```

### 6. Workflow buttons do nothing visible (`useEnhancedAIChatDB.ts` line 687+)
After updating workflow state, send the workflow action as a message to the AI so it triggers actual processing:
```ts
await sendMessage(`Execute workflow step: ${workflowAction}`);
```

### 7. Fix `handleAction` dead routes (lines 626-653)
- `create-blog-post` / `create-landing-page` → navigate to `/repository` (not `/ai-chat`)
- `navigate-content-builder` → navigate to `/ai-chat` (already correct but redundant)

---

## Sprint 2: Consolidate Settings (5 dead files + 1 duplicate page)

### A. `/ai-settings` page → popup redirect
Replace `src/pages/AISettings.tsx` body with:
- Call `openSettings('api')` on mount
- Return `<Navigate to="/ai-chat" replace />`

### B. Delete dead settings components
Remove these unused files:
- `src/components/settings/APISettings.tsx`
- `src/components/settings/MinimalAPISettings.tsx`
- `src/components/settings/EnhancedAISettings.tsx`
- `src/components/settings/EnhancedProviderManagement.tsx`
- `src/components/settings/ProviderManagement.tsx`
- `src/components/ai-chat/OpenRouterSettings.tsx`

Update `src/components/settings/index.ts` to remove dead exports.

### C. Replace all `navigate('/ai-settings')` with `openSettings('api')`
Files to update: `Campaigns.tsx`, `useEnhancedAIChat.ts`, `ErrorBoundary.tsx`, `OnboardingCarousel.tsx`, `SetupChecklist.tsx`, `SmartActionHandler.tsx`, `ApiKeyStatusIndicator.tsx`, and any content-builder/serp files referencing `/ai-settings`.

---

## Sprint 3: UX — Deep Dive Prompts in Message Bubble

### Add deep dive prompts after action buttons (`EnhancedMessageBubble.tsx` after line 321)
Render `message.visualData?.deepDivePrompts` as clickable pill buttons that call `onSendMessage?.(prompt)`. Show up to 3 prompts, styled as subtle bordered pills below the action buttons.

---

## Files Changed Summary

| File | Changes |
|------|---------|
| `useEnhancedAIChatDB.ts` | Fix settings URL, add confirm_action, fix workflow handler, fix dead routes |
| `ModernActionButtons.tsx` | Catch-all for unrecognized actions |
| `EnhancedMessageBubble.tsx` | Fix visual action fallback, add deep dive prompts |
| `enhanced-ai-chat/index.ts` | Fix dead route URLs in system prompt |
| `AISettings.tsx` | Convert to popup redirect |
| `settings/index.ts` | Remove dead exports |
| 5 dead settings files + 1 duplicate | Delete |
| ~8 files with `/ai-settings` navigations | Replace with `openSettings('api')` |

