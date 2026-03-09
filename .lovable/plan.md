

# Plan: Move Content Wizard & Research to Chat + Menu

## Changes

### 1. Remove from Sidebar (`ChatHistorySidebar.tsx`)
- Remove `Content Wizard` from `toolsItems` array (line 248)
- Remove `Research` from `toolsItems` array (line 252)

### 2. Add Research to Plus Menu (`PlusMenuDropdown.tsx`)
- Add `onResearchIntelligence` callback prop
- Add a third menu item: icon `BookOpen`, label "Research Intelligence", description "Plan content strategy & gaps"
- Wire it to close the popover and call the callback

### 3. Wire callback in `ContextAwareMessageInput.tsx`
- Add a handler for Research Intelligence that triggers the `research_intelligence` panel (same mechanism Content Wizard uses)
- Pass it as `onResearchIntelligence` to `PlusMenuDropdown`

Result: The + menu in the chat bar will have 3 items (Attach File, Content Wizard, Research Intelligence), and the sidebar Tools section will only show Campaigns, Keywords, Analytics.

