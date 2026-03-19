

# Premium Minimal Welcome Screen Redesign

## Design Philosophy
Apple-inspired clarity: generous whitespace, no borders/containers, typography-driven hierarchy. The current 3-column grid with bordered cards, uppercase labels, and dense chips is replaced with a single centered column that breathes.

## Layout

```text
              AI Command Centre •

         Rise and create, John.
        What would you like to do?

        📄 12    ✓ 8    ⏳ 3    📈 72%

   ✏ Write content        🔍 Research keywords
   📢 Run a campaign      ✉ Draft an email
   📊 Check performance   ❓ What can you do?

   ─────────────────────────────────

   ⚠ 11 stale drafts need attention
   📅 Your calendar is empty this week
   📋 4 items pending approval
```

## Key Changes

1. **Remove all container cards** — no bordered boxes, no `bg-card/20` panels, no uppercase section labels. Content floats in open space with only spacing as separation.

2. **Quick Actions → 2×3 ghost grid** — icon + text only, no borders. On hover: subtle `bg-white/5` rounded background. Centered in a `max-w-md` container.

3. **Insights & Recommendations → inline text rows** — simple `icon + text` rows below a thin `border-border/10` divider. No chips, no pills. Hover underlines the text. Only shown when data exists (no "No recommendations yet" empty states).

4. **Workflow templates removed** from welcome screen (they add clutter; accessible via chat).

5. **Spacing**: 32px between badge→greeting, 24px greeting→stats, 32px stats→actions, 24px actions→divider→insights. Generous `min-h-[60vh]` centering.

6. **Motion**: Keep existing stagger timing but remove `whileHover: y: -1` bounce (too playful). Use only opacity fade-in.

## Files

| File | Change |
|------|--------|
| `EnhancedChatInterface.tsx` (lines 636-720) | Replace 3-col grid with single-column: quick actions grid + optional divider + inline insight rows. Remove workflow templates section, remove empty states. |
| `EnhancedQuickActions.tsx` | Restyle to `grid-cols-2 max-w-md` ghost buttons — remove borders, bg, and hover-bounce. Just icon + text with subtle hover bg. |

