

# Simplify Collapsed Sidebar — Show Only Section Icons

## Problem
The collapsed sidebar currently shows every sub-item icon (Repository, Offerings, Approvals, Content Wizard, Campaigns, Keywords, Analytics, Email, Social, Contacts, Automations, Journeys) — making it cluttered. It should only show 3 section-level icons: **Library**, **Tools**, **Engage**.

## Change

**File: `src/components/ai-chat/ChatHistorySidebar.tsx`**

Replace the scrollable icon area (lines 282-303) that maps over `libraryItems`, `toolsItems`, and `engageItems` individually with just 3 icons:

- **Library** icon (`BookOpen`) — clicking it expands the sidebar
- **Tools** icon (`Wrench`) — clicking it expands the sidebar  
- **Engage** icon (`MessageCircle`) — clicking it expands the sidebar

When clicked, each icon will call `onToggleSidebar()` to expand the sidebar so the user can see the sub-items. This matches the Claude/ChatGPT pattern where collapsed icons represent groups, not individual features.

Remove the dividers between sections since there are only 3 icons now. The `ScrollArea` wrapper can also be removed since 3 icons don't need scrolling.

