

# Sidebar Cleanup — Adversarial Audit

## What to remove / change

### Collapsed sidebar (icon strip)
**Remove:**
- **Search icon** (line 276-280) — no-op, does nothing when clicked, wastes space
- **Calendar icon** (line 294-298) — not a primary action; accessible from expanded sidebar

**Keep:** Toggle, New Chat, Library/Tools/Engage section icons, User avatar dropdown

### Expanded sidebar
**Restructure order — move New Chat + Search above Library:**

Current order: Logo+Toggle+Notifications+NewChat → Library → Tools → Engage → Chats → Calendar+Profile

New order: Logo+Toggle+Notifications → **New Chat button (full-width)** → **Search input** → Library → Tools → Engage → Chats → Calendar+Profile

- Remove the `+` icon button from the header row (line 368-376); replace with a full-width "New Chat" button placed between the header and the search input
- Move the search input (currently inside the Chats collapsible, line 406-415) up to sit just below the New Chat button, above Library — this becomes a global search for both nav items and chats
- Remove the duplicate search inside the Chats section

**Sections collapsed by default:**
- Change `CollapsibleSection` `defaultOpen` from `true` to `false` for Library, Tools, and Engage (lines 383, 390, 397)

## Files changed

| File | Change |
|------|--------|
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Remove Search + Calendar from collapsed strip; restructure expanded sidebar order (New Chat → Search → Library/Tools/Engage collapsed by default → Chats); remove duplicate search from Chats section |

## Summary of collapsed strip (after cleanup)
Toggle → New Chat → divider → Library / Tools / Engage → spacer → User avatar

## Summary of expanded sidebar (after cleanup)  
Logo + Toggle + Notifications (header) → New Chat button → Search input → Library (collapsed) → Tools (collapsed) → Engage (collapsed) → Chats → Calendar + Profile (footer)

