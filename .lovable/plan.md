

# AI Chat — Fix Plan (Verified Against Both Audits)

The existing plan from the previous message is confirmed complete. All 7 Claude Code issues and all 3 Antigravity failures + 4 partials are covered. No new issues found.

---

## Phase 1: Critical — Concurrency Guards
**Files:** `useEnhancedAIChatDB.ts`

| Fix | Issue | What |
|-----|-------|------|
| #1 | T5 — Rapid-fire messages dropped | Add `isSendingRef` mutex in `sendMessage`; block or queue while AI responding |
| #10 | D8 — Rapid double-edit race | Add `isEditingRef` mutex in `editMessage` |
| #11 | E2 — Stale loadMessages | Add `loadRequestRef` counter, ignore stale async results |

---

## Phase 2: Medium — UI Gaps
| Fix | Issue | File | What |
|-----|-------|------|------|
| #2 | D5 — No delete for AI messages | Message action component | Show Delete option on assistant messages (hook already handles it) |
| #3 | S1 — Sidebar open on mobile | `SidebarContext.tsx` | Auto-collapse when viewport < 768px on mount |
| #4 | M5 — Escape doesn't close search | `MessageSearchBar.tsx` | Add `onKeyDown` Escape handler |
| #5 | C9/I5 — Web search no visual feedback | `ContextAwareMessageInput.tsx` | Show chip/badge + change placeholder when web search active |

---

## Phase 3: Polish — Data Integrity
**File:** `useEnhancedAIChatDB.ts`

| Fix | Issue | What |
|-----|-------|------|
| #6 | C11 — Error messages vanish on reload | Save error messages to DB via `saveMessage`, or detect orphaned user messages on load |
| #7 | F4 — Export empty convo downloads empty file | Guard: `if (!messages.length)` → toast "Nothing to export" |
| #8 | B7 — Rename accepts empty string | Guard: `if (!newTitle.trim())` → toast + return |
| #9 | A5 — Logout stale state | `useEffect` clearing state when `user` becomes null |
| #12 | B5 — Rename sidebar sync | Optimistic local state update before DB call in `renameConversation` |

---

## Phase 4: Missing Features (Optional)
| Feature | What |
|---------|------|
| V1-V3 Tags UI | Add tag management to conversation context menu (hooks exist) |
| G1 Share button | Add Share button to chat header (hook exists) |

---

## Execution Order
Phases 1 → 2 → 3 → 4. Each phase is independently testable. Total: 12 fixes across ~5 files.

