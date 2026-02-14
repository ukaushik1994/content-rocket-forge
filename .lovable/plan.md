

# Replace Inline Status Cards with a Smart Floating Alert Modal

## What Changes

Remove `EnhancedSerpStatus` and `EnhancedAiStatus` from their current inline position in the Content Builder hero area. Replace them with a single floating modal that only appears when something is actually missing.

## The Logic

The modal shows **only if**:
- No working SERP API (neither SerpAPI nor Serpstack), **OR**
- No active AI provider (none of OpenRouter, OpenAI, Anthropic, Gemini, Mistral, LM Studio)

If both conditions are met (at least 1 SERP + at least 1 AI), the modal never appears. The user sees nothing -- clean page.

## The Modal

- Centered floating dialog using Radix Dialog (same as existing modals in the app)
- Same glassmorphism: `bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl`
- Shows which services are missing with red/green status dots
- Two action buttons: "Go to Settings" (opens API settings) and "Dismiss" (closes it, stores dismissal in sessionStorage so it doesn't reappear during the session)
- Same icons: `AlertTriangle`, `CheckCircle`, `XCircle`, `Settings` from lucide-react
- Same framer-motion fade-in animation

## Files to Modify

1. **`src/components/content-builder/steps/KeywordSelectionStep.tsx`**
   - Remove `EnhancedSerpStatus` and `EnhancedAiStatus` imports and their rendering (lines 216-217)
   - Add the new floating modal component that checks both SERP + AI status on mount
   - Keep the `apiKeysStatus` state since other parts of the step use it

2. **New component: `src/components/content-builder/ServiceCheckModal.tsx`**
   - Uses `useAIServiceStatus` hook (already exists) for AI provider check
   - Uses the same `getApiKey`/`testApiKey` logic from `EnhancedSerpStatus` for SERP check
   - Renders a Radix Dialog centered on screen
   - Dismissible with sessionStorage flag `contentBuilderServiceCheckDismissed`
   - Auto-closes when both conditions are satisfied (user configures keys in another tab)

## What Stays Untouched
- All state management, save logic, Repository, Approvals -- zero impact
- `EnhancedSerpStatus.tsx` and `EnhancedAiStatus.tsx` files remain (used elsewhere) but are no longer rendered in the Content Builder

