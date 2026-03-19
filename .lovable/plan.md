

# UI/UX Polish Plan — Gemini-Level Refinements

After auditing the codebase, **3 items are already implemented** (icon-only collapsed sidebar, custom scrollbar class, message entrance animations). The remaining work focuses on 5 areas of polish.

---

## What's Already Done (No Work Needed)
- **Icon-only collapsed sidebar** — `ChatHistorySidebar.tsx` already renders a 56px icon strip when `isCollapsed`
- **Custom scrollbar** — `.custom-scrollbar` class exists in `index.css` with themed thumb
- **Message entrance animations** — `EnhancedMessageBubble.tsx` already uses framer-motion fade+slide variants
- **Input focus glow** — `ContextAwareMessageInput.tsx` already has `border-primary/40` + purple shadow on focus
- **Web search chip** — already shows a Globe badge with "Web Search" text when active

---

## Phase 1: Glassmorphism Layer
**Files:** `ContextAwareMessageInput.tsx`, `ChatHistorySidebar.tsx`, `PlusMenuDropdown.tsx`, `index.css`

- **Input bar**: Replace `bg-background/60` with `bg-[rgba(18,18,24,0.75)]` + increase `backdrop-blur-xl` + add `border-top: 1px solid rgba(255,255,255,0.1)` glow
- **Sidebar**: Add `backdrop-blur-md` and semi-transparent background to the sidebar container (both expanded and collapsed states)
- **Plus menu popover**: Add `.glass-panel` styling to the dropdown content
- **Global**: Add a `.glass-input` utility to `index.css` for reuse

---

## Phase 2: Message Actions Visibility
**File:** `MessageActions.tsx`

Currently actions are `opacity-0 group-hover:opacity-100` — invisible on mobile. Change to:
- Default: `opacity-40` (subtly visible)
- Hover: `opacity-100`
- This makes Copy/Edit/Delete discoverable on touch devices without cluttering the UI

---

## Phase 3: Date-Grouped Chat History
**File:** `ChatHistorySidebar.tsx`

Add date section headers above conversation items:
- Group conversations into **Today**, **Yesterday**, **Previous 7 Days**, **Older**
- Add a small utility function `getDateGroup(date)` that returns the bucket
- Render a sticky `text-[10px] uppercase text-muted-foreground/50` header before each group
- Preserve existing sort (pinned first, then by `updated_at`)

---

## Phase 4: Inline Attach Icon
**File:** `ContextAwareMessageInput.tsx`

Surface a paperclip (📎) icon **next to** the `+` button for 1-click file upload:
- Add a `Paperclip` icon button beside `PlusMenuDropdown`
- Clicking it triggers `handleAttachmentClick` directly (same as the menu option)
- Only visible on `sm:` and above to avoid crowding on mobile

---

## Phase 5: Animation Polish
**Files:** `ChatHistorySidebar.tsx`, `PlusMenuDropdown.tsx`, `ThinkingIndicator.tsx`, `DynamicGreeting.tsx`, `MessageSearchBar.tsx`

| Animation | What | Where |
|-----------|------|-------|
| Sidebar slide | Add `transition-[width,transform] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]` | Sidebar container |
| AI shimmer | Add CSS shimmer gradient animation to the thinking indicator area | `ThinkingIndicator.tsx` or `index.css` |
| Plus menu pop-in | Add `scale(0.9) → scale(1)` spring animation to dropdown content | `PlusMenuDropdown.tsx` |
| Greeting stagger | Add staggered fade-up entrance to title, subtitle, quick-actions grid | `DynamicGreeting.tsx` / `QuickActionsPanel.tsx` |
| Search expand | Add `max-height` + `opacity` transition when search bar opens/closes | `ChatHistorySidebar.tsx` search section |
| Quick action hover | Add `translateY(-2px)` + shadow lift on hover to quick action cards | `EnhancedQuickActions.tsx` |

---

## Execution Order
Phase 1 → 2 → 3 → 4 → 5. Each phase is independently shippable. Total touches ~8 files, mostly CSS/className changes with one grouping utility in Phase 3.

