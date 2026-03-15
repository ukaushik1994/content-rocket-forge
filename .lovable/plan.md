

# Fix: Replace Engage Icon in Collapsed Sidebar

The collapsed AI Chat sidebar currently uses `MessageCircle` (speech bubble) for the "Engage" section. On a chat page, this is confusing — it blends in with the chat context and isn't recognizable as "Engage."

## Change

**File: `src/components/ai-chat/ChatHistorySidebar.tsx`**

Replace the Engage collapsed icon from `MessageCircle` to `Megaphone` (already imported at line 24):

- **Line 311**: Change `<MessageCircle className="h-4 w-4" />` → `<Megaphone className="h-4 w-4" />`

That's it — one line change. The `Megaphone` icon is already imported and better conveys "Engage" (outreach, campaigns, email marketing).

