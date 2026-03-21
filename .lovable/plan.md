

# Match Quick Actions Popover Style to Plus Menu

## Problem
The Quick Actions (⚡) popover items use larger sizing (`text-sm`, `py-2`, `gap-2.5`, `px-3`) and colorful per-item icon colors (`text-purple-400`, `text-amber-400`, etc.), while the Plus menu uses compact sizing (`text-xs`, `py-1.5`, `gap-2`, `px-2.5`) with uniform `text-muted-foreground` icons that highlight to `text-primary` on hover — which looks cleaner and more minimal.

## Changes

### 1. `src/components/ai-chat/EnhancedQuickActions.tsx`
- Remove all per-item `iconColor` properties (purple, amber, emerald, blue, orange, violet)
- Match the Plus menu's button class exactly: `px-2.5 py-1.5 rounded-md text-xs font-medium`
- Icon class: `h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors`
- Add `group` to button, matching the Plus menu hover pattern
- Container: `space-y-px` instead of `gap-0.5`

### 2. `src/components/ai-chat/ContextAwareMessageInput.tsx` (line 388)
- Change popover width from `w-52` to `w-48` to match Plus menu exactly

## Result
Both popovers will have identical typography, spacing, icon treatment, and hover behavior — unified minimal aesthetic.

