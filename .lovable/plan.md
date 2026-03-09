

# Fix: Wrap AI Chat Route in AppLayout

## Problem
The `/ai-chat` route (line 144 in `App.tsx`) renders `<AIChat />` directly without `<AppLayout>`, so the sidebar never appears on the main chat page. All other routes are wrapped in `<AppLayout>`.

This happened because AI Chat previously had its own duplicate sidebar inside `EnhancedChatInterface.tsx`, which we removed in the last fix — but we never added the `<AppLayout>` wrapper to compensate.

## Fix

**File: `src/App.tsx` (line 144)**

Change:
```tsx
<Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
```

To:
```tsx
<Route path="/ai-chat" element={<ProtectedRoute><AppLayout><AIChat /></AppLayout></ProtectedRoute>} />
```

One line change. The sidebar (both collapsed and expanded states) will immediately appear on the AI Chat page.

