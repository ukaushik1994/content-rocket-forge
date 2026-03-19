

# 3-Column Premium Minimal Welcome Layout

Keep the clean premium styling but arrange the three content categories side by side.

## Layout

```text
         AI Command Centre •
      Rise and create, John.
     What would you like to do?

    📄 12    ✓ 8    ⏳ 3    📈 72%

┌─────────────────┬─────────────────┬─────────────────┐
│  Quick Actions   │    Insights     │  Recommended    │
│                  │                 │                 │
│  ✏ Write content │ ⚠ 11 stale...  │ ✦ Optimize...   │
│  🔍 Research     │ 📅 Empty cal   │ ✦ Try email...  │
│  📢 Campaign     │ 📋 4 pending   │                 │
│  ✉ Email         │                │                 │
│  📊 Performance  │                │                 │
│  ❓ Help          │                │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

No borders/cards — just 3 columns with subtle section labels and ghost-style items. On mobile, stacks vertically.

## Changes

**`EnhancedChatInterface.tsx` (lines 636-685)**
- Wrap quick actions, insights, and recommendations in `grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl w-full`
- Each column: small muted label at top ("Quick Actions", "Insights", "Recommended"), items below
- Insights & recommendations render as inline text rows (current style)
- Quick actions rendered inline (not via `EnhancedQuickActions` component) in single column list

**`EnhancedQuickActions.tsx`**
- Change to `grid-cols-1` single column, remove max-w-md (will be sized by parent grid)

