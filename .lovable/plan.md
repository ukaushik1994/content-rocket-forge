

# AI Chat — Remaining Failures & Issues

After reviewing the current implementation, here are the bugs that will cause runtime failures or degraded behavior.

---

## 1. Export Button Crashes — Signature Mismatch (Critical)
**File:** `EnhancedChatInterface.tsx` line 447

`MessageSearchBar` expects `onExportConversation: (format: 'json' | 'markdown' | 'txt') => void` but it receives `exportConversation` which has the signature `(conversationId: string, format?: 'json' | 'txt') => void`. When a user clicks "Export as JSON", it calls `exportConversation('json')` — treating `'json'` as the `conversationId`, which will fail to find the conversation and silently do nothing.

**Fix:** Wrap the call: `onExportConversation={(format) => activeConversation && exportConversation(activeConversation, format as any)}`

---

## 2. "Export as Markdown" Does Nothing (Medium)
**File:** `MessageSearchBar.tsx` line 139

The dropdown offers `'markdown'` format but `exportConversation` only handles `'json'` and `'txt'`. Clicking "Export as Markdown" would pass an unhandled format and fall into the JSON branch silently.

**Fix:** Add a `'markdown'` branch to `exportConversation` in the hook, or change the dropdown option to `'txt'`.

---

## 3. `createConversation` Lists `loadConversations` in Deps But Doesn't Use It (Minor)
**File:** `useEnhancedAIChatDB.ts` line 211

```ts
}, [user, toast, loadConversations]);
```

`loadConversations` was removed from the function body but remains in the dependency array. This causes unnecessary callback recreation whenever `loadConversations` reference changes. No crash, but wasted re-renders.

**Fix:** Remove `loadConversations` from the dependency array.

---

## 4. `solutions` Table Queried With `as any` Cast (Medium)
**File:** `EnhancedChatInterface.tsx` line 297

```ts
.from('solutions' as any)
```

If the `solutions` table doesn't exist in the generated types, this query may silently fail. The wizard context extraction degrades gracefully (solutions array stays empty), but the `as any` suppresses type safety.

**Fix:** Verify the table exists in types. If not, either regenerate types or add error handling around the query.

---

## 5. `error.message` Accessed Without Type Narrowing (Minor)
**Files:** `useEnhancedAIChatDB.ts` lines 799, 875

```ts
} catch (error) {
  // error is 'unknown' but .message is accessed directly
  description: `Failed to execute action: ${error.message}`,
```

TypeScript strict mode would flag this. In practice it works because JavaScript errors have `.message`, but it's technically unsafe.

**Fix:** Cast to `(error as Error).message` or use `String(error)`.

---

## Summary

| # | Issue | Severity | User Impact |
|---|-------|----------|-------------|
| 1 | Export button passes format as conversationId | Critical | Export silently fails |
| 2 | Markdown export not implemented | Medium | Button does nothing |
| 3 | Stale dependency in createConversation | Minor | Extra re-renders |
| 4 | `solutions as any` query | Medium | Wizard may lack solution data |
| 5 | Untyped error access | Minor | No crash but unsafe |

## Implementation

1. Fix export wiring in `EnhancedChatInterface.tsx` — wrap `exportConversation` with `activeConversation`
2. Add markdown format support to `exportConversation` in the hook (output markdown-formatted text)
3. Remove `loadConversations` from `createConversation` deps
4. Add try/catch around `solutions` query and remove `as any`
5. Add proper error type narrowing in catch blocks

**Files to modify:**
- `src/hooks/useEnhancedAIChatDB.ts`
- `src/components/ai-chat/EnhancedChatInterface.tsx`

