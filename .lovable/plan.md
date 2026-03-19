

# Auto-Delete Empty Conversations on Load

## What
When the chat interface loads (or refreshes), automatically delete any conversations that have zero messages. This keeps the sidebar clean without requiring manual cleanup.

## How

**File:** `src/hooks/useEnhancedAIChatDB.ts`

Modify `loadConversations` (~line 76-107):
1. After fetching conversations, identify empty ones by querying `ai_messages` for a count per conversation
2. Delete any conversations with 0 messages in a single batch delete
3. Filter them out of the returned list before setting state

Alternatively (simpler, fewer round-trips):
1. After the conversations query returns, run a single SQL delete via supabase that removes conversations with no messages:
   - Delete from `ai_conversations` where `user_id = user.id` and `id NOT IN (SELECT DISTINCT conversation_id FROM ai_messages)`
2. Then filter the deleted IDs out of the local state

**Implementation detail:**
- Add a cleanup step at the **start** of `loadConversations` (before the main query), or right after it
- Skip cleanup if a search filter is active (only clean on full loads)
- Exclude the currently active conversation to avoid deleting a conversation the user just created but hasn't typed in yet
- This runs once per load/refresh — no performance concern

**Estimated changes:** ~15 lines added to one function in one file.

