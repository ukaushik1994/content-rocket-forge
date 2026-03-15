

# Add Web Search to + Menu

## What
Add a "Web Search" button to the PlusMenuDropdown that lets users manually trigger a web search mode, similar to how Content Wizard sets a mode indicator.

## Changes

### 1. `src/components/ai-chat/PlusMenuDropdown.tsx`
- Add `onWebSearch?: () => void` to props interface
- Add `Globe` to lucide imports
- Add menu item: icon `Globe`, label "Web Search", description "Search the web for info"
- Conditionally include when `onWebSearch` is provided

### 2. `src/components/ai-chat/ContextAwareMessageInput.tsx`
- Add `onWebSearch?: () => void` to `ContextAwareMessageInputProps`
- Pass it through to `PlusMenuDropdown` as `onWebSearch`
- When triggered, prepend a web search prefix to the message (e.g., set a visual indicator like wizard mode does, or simply send a prefixed message like "search the web for: ")

### 3. `src/components/ai-chat/EnhancedChatInterface.tsx`
- Add a `handleWebSearch` callback that either:
  - Sets a web search mode indicator on the input (like wizard mode), OR
  - Sends a message with a prefix that triggers the existing `analyzeSerpIntent` web search detection

**Simplest approach**: When the user clicks "Web Search", show a mode banner (like Content Wizard does) that says "Web Search — type your query and press Enter". When submitted, prefix the message with `[web-search]` so the backend's intent detection routes it to `executeWebSearch`.

### Files
- `src/components/ai-chat/PlusMenuDropdown.tsx` — add menu item
- `src/components/ai-chat/ContextAwareMessageInput.tsx` — add prop + mode banner
- `src/components/ai-chat/EnhancedChatInterface.tsx` — wire callback

