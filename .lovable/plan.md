

# Input Bar — Apple-Inspired Theme Alignment

## Current Issues
The input bar area still uses the old styling: heavy borders, `bg-background/95`, `ring-1` focus effects, bold primary-colored send button, and a `GlobalApiStatus` badge sitting next to the input. The helper text ("Enter to send") also adds visual noise. None of this matches the minimal, typography-driven welcome screen above it.

## Changes

### 1. ContextAwareMessageInput.tsx — Flatten the input container
- **Container border**: Change from `border-border/40` to `border-border/20`, remove the `ring-1 ring-primary/20` focus effect, replace with just `border-primary/30` on focus
- **Background**: Change from `bg-background/95` to `bg-background/60` for a lighter, more transparent feel
- **Box shadow**: Remove the animated boxShadow entirely — flat is the goal
- **Send button**: Change from `bg-primary` filled button to a ghost-style button: `bg-transparent text-muted-foreground hover:text-foreground`, no background color, just an icon that becomes visible on hover. Keep it `rounded-xl`
- **Attachment button**: Already ghost, just reduce opacity further (`text-muted-foreground/40`)
- **Helper text**: Remove the "Enter to send" line entirely — it adds clutter. Remove the character count too
- **Container padding**: Reduce from `p-3` to `p-2.5` for tighter feel
- **Border radius**: Keep `rounded-2xl`

### 2. EnhancedChatInterface.tsx — Clean the input area wrapper
- **Outer container**: Keep `border-t border-border/20 bg-background/80 backdrop-blur-md` (already updated)
- **Remove GlobalApiStatus** from next to the input — it breaks the minimal layout. Move it to the navbar or remove it entirely from this view
- **Remove the `flex items-center gap-3` wrapper** that holds the input + status. Let the input take full width
- **Padding**: Tighten from `px-6 py-4` to `px-4 py-3` for a more compact bar

## Files Changed
| File | What |
|------|------|
| `src/components/ai-chat/ContextAwareMessageInput.tsx` | Flatten container, ghost send button, remove helper text, reduce padding |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Remove GlobalApiStatus from input row, simplify wrapper, tighten padding |

