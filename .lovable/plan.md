

# Re-add Platform Summary + Insights to Welcome Layout & Fix Emoji Icons

## What
1. Bring back the colored metric circles (Content, Published, In Review, SEO Score) **above** the centered input
2. Bring back the Insights list (Stale drafts, Empty calendar, Pending approvals) **below** the quick action chips
3. Replace emoji icons in quick action chips with proper Lucide icons

## Layout

```text
   ✦ AI Command Centre
   
   Morning momentum, Utkarsh.

   ● Content  ● Published  ● In Review  ● SEO Score
   
   ┌─────────────────────────────┐
   │ Ask Creaiter anything...    │
   └─────────────────────────────┘
   
   [✏ Write]  [📢 Campaign]  [✉ Email]  [? Help]
   
   INSIGHTS
   ○ Stale drafts (>14d) (11)
   ○ Empty calendar this week
   ○ Pending approvals (4)
```

## Changes — 1 file

### `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 727-826)

**1. Add PlatformSummaryCard between GettingStartedChecklist and the centered input** (~line 747):
```tsx
<PlatformSummaryCard onAction={() => {}} />
```

**2. Replace emoji icons in quick action chips** (lines 801-805):
- `'Write content'` → `Pencil` icon, remove `'✍️'`
- `'Run a campaign'` → `Megaphone` icon, remove `'📣'`
- `'Draft an email'` → `Mail` icon, remove `'✉️'`
- `'What can you do?'` → `Sparkles` icon, remove `'✦'`

Each chip renders `<IconComponent className="w-3.5 h-3.5" />` instead of a `<span>` with emoji.

**3. Add Insights section after the quick action chips** (~after line 825):
```tsx
{proactiveInsights.length > 0 && (
  <motion.div className="flex flex-col items-center gap-3 mt-4">
    <span className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-medium">
      Insights
    </span>
    {proactiveInsights.map((insight, i) => (
      <motion.button key={insight.type} 
        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
        transition={{ delay: 0.6 + i * 0.08 }}
        onClick={() => handleSendMessage(insight.label)}
      >
        <span className={color based on type}>{insight.icon}</span>
        <span>{insight.label}{insight.count > 0 ? ` (${insight.count})` : ''}</span>
      </motion.button>
    ))}
  </motion.div>
)}
```

Insight icon colors: `stale → text-amber-400`, `failed → text-rose-400`, `empty_cal → text-blue-400`, `approvals → text-emerald-400`

**4. Add imports** for `Pencil`, `Megaphone`, `Mail`, `Sparkles` from lucide-react (some may already be imported).

### Files changed: 1
- `src/components/ai-chat/EnhancedChatInterface.tsx`

