

# Add Colored Icons to Plus Menu Dropdown

## What
The Plus menu (+ button) has monochrome icons. Match the Quick Actions style by giving each item a unique color.

## Changes — 1 file

**`src/components/ai-chat/PlusMenuDropdown.tsx`**

Add an `iconColor` property to each menu item and apply it to the icon className (replacing `text-muted-foreground`):

| Item | Color |
|------|-------|
| Attach File | `text-blue-400` |
| Content Wizard | `text-purple-400` |
| Research Intelligence | `text-rose-400` |
| Analyst | `text-orange-400` |
| AI Proposals | `text-amber-400` |
| Web Search | `text-emerald-400` |
| Generate Image | `text-cyan-400` |

Change icon className from:
```
text-muted-foreground group-hover:text-primary
```
to:
```
{item.iconColor}
```

No items overlap between the two menus (Plus = tools, Quick Actions = shortcuts), so no removals needed.

