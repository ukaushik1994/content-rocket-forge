

# Merge Plus Menu & Quick Actions + Extend Mode Indicator

## Problem
1. Two separate dropdown menus (+ and ⚡) with overlapping items (e.g. "Content Wizard" / "Write content", "Analyst" / "Check performance")
2. Mode indicator chip above chatbox only shows for Content Wizard and Web Search — not for Research Intelligence, Analyst, or AI Proposals

## Solution

### 1. Merge into a single + menu with two sections

Combine both menus into `PlusMenuDropdown.tsx`. Use a subtle section divider:

**Tools section** (from Plus menu):
- Attach File — `text-blue-400`
- Content Wizard — `text-purple-400` (removes duplicate "Write content")
- Research Intelligence — `text-rose-400`
- Analyst — `text-orange-400` (removes duplicate "Check performance")
- AI Proposals — `text-amber-400`
- Web Search — `text-emerald-400`
- Generate Image — `text-cyan-400`

**Quick Actions section** (remaining non-duplicate Quick Actions):
- Research keywords — `text-amber-400`
- Run a campaign — `text-emerald-400` (Megaphone icon)
- Draft an email — `text-blue-400` (Mail icon)
- What can you do? — `text-violet-400` (HelpCircle icon)

Separated by a thin `border-t border-border/30` divider.

### 2. Remove ⚡ button and `EnhancedQuickActions` popover

In `ContextAwareMessageInput.tsx`:
- Remove the Quick Actions `<Popover>` block (lines 367-402)
- Remove `quickActionsOpen` state
- Remove `EnhancedQuickActions` import
- Add Quick Actions callbacks to `PlusMenuDropdown` (new props for the 4 quick action items that send prompts)

### 3. Extend mode indicator for all activatable tools

Currently only Content Wizard and Web Search show indicator chips. Add indicators for:
- **Research Intelligence**: rose-colored chip, "Research Intelligence — opening panel"
- **Analyst**: orange-colored chip, "Analyst — opening panel"  
- **AI Proposals**: amber-colored chip, "AI Proposals — opening panel"

These tools open panels (not input modes), so their indicators would flash briefly. Alternatively, since Research/Analyst/Proposals open side panels immediately (not input modes), we skip persistent indicators for them and only extend indicators for tools that change the input behavior.

**Decision**: Keep indicators only for input-mode tools (Content Wizard, Web Search, Generate Image). For Generate Image, add a cyan indicator chip similar to Content Wizard. The panel-opening tools (Research, Analyst, Proposals) don't need indicators since they open panels rather than changing input mode.

### Files changed: 3
- `src/components/ai-chat/PlusMenuDropdown.tsx` — add quick action items with divider, new `onSendPrompt` prop
- `src/components/ai-chat/ContextAwareMessageInput.tsx` — remove ⚡ popover, add image generation mode indicator, pass `onSendPrompt` to PlusMenuDropdown
- `src/components/ai-chat/EnhancedQuickActions.tsx` — no deletion needed (used in welcome screen), but no longer used in input bar

