

# Sidebar Reverting — Diagnosis & Fix

## What's Happening

The code in `ChatHistorySidebar.tsx` already contains all the premium styling changes (active indicators, refined typography, `defaultOpen={true}`, etc.). The sidebar briefly showed correctly then reverted — this is a hot-reload state caching issue where React preserves the old component state (sections defaulting to closed) even after code changes.

## Fix

The issue is that `defaultOpen` only sets the **initial** state via `useState(defaultOpen)`. If React's hot module replacement preserves the old component instance, the `useState` initializer is ignored and the old `false` value persists.

### Change in `ChatHistorySidebar.tsx`

**CollapsibleSection component** — Force sections to respect `defaultOpen` on re-render by using a key-based reset or by syncing with a `useEffect`:

```tsx
// Current (line 139):
const [isOpen, setIsOpen] = useState(defaultOpen);

// Fix: Add useEffect to sync
const [isOpen, setIsOpen] = useState(defaultOpen);
React.useEffect(() => { setIsOpen(defaultOpen); }, [defaultOpen]);
```

This ensures that when the component re-renders with `defaultOpen={true}`, the sections actually open instead of staying stuck on the stale `false` state.

### File Changed
| File | Change |
|------|--------|
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Add `useEffect` sync for `defaultOpen` in `CollapsibleSection` to prevent stale state |

