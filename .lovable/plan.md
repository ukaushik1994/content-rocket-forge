

## Plan: Add spacing after Engage and brighten Chats section

### Changes in `ChatHistorySidebar.tsx`

1. **Add spacing after Engage section** (after line 426): Insert a `<div className="mb-4" />` spacer between the Engage `CollapsibleSection` and the Chats section.

2. **Brighten chat conversation titles** (lines 453-456): Change `text-foreground/80` to `text-foreground/90` for inactive chat titles, making them more readable.

3. **Brighten chat timestamps** (line 460): Change `text-muted-foreground/60` to `text-muted-foreground/70` for the subtitle/timestamp text.

4. **Brighten the "Chats" section label**: If the `CollapsibleSection` label styling is shared, we may instead adjust the chat item text only. Will check if the label needs independent brightening.

