

# Show Search Button Only on AI Chat Route

## What
The search icon button in the top-right corner is an AI chat feature (searches chat messages). It should only appear on `/ai-chat`. When on other pages, the remaining two icons (AI provider indicator + notification bell) should animate and shift to the right to fill the space.

## Changes — 1 file

### `src/components/layout/AppLayout.tsx` (lines 24-26, 178-182)

**SearchIconButton**: Add route check — only render when on `/ai-chat`:
```tsx
const SearchIconButton: React.FC = () => {
  const location = useLocation();
  const chatSearch = useChatSearch();
  if (!chatSearch || location.pathname !== '/ai-chat') return null;
  // ... rest unchanged
};
```

**Icon container** (line 178): Add `transition-all duration-300` so the two remaining icons animate smoothly when search disappears:
```tsx
<div className="fixed top-4 right-4 z-50 flex items-center gap-2 transition-all duration-300">
```

No other files need changes. `useLocation` is already imported.

