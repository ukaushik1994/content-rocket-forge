

# Email Page — Visual Parity with Keywords Page

## Core Difference

The Keywords page is a **standalone full-page experience** with:
- `AnimatedBackground` with floating particles and gradient orbs
- 60vh hero with gradient text, glassmorphic badge, pulsing dot, action CTA
- Glassmorphic filter bar (`bg-background/60 backdrop-blur-xl border-border/50`)
- Cards with `backdrop-blur-xl`, hover scale animations, gradient overlays

The Email page is nested inside `EngageLayout` which already provides `AnimatedBackground` + `EngageBackground`. But the Email content itself is plain — no glassmorphism, no gradient text, no card-based header, no visual depth. It looks like a settings panel, not a feature page.

## Plan

### 1. Elevate the Header into a Glassmorphic Hero Card
**File: `EmailDashboard.tsx`**

Replace the plain flex row with a glassmorphic card hero (not 60vh — keep it compact since it's inside EngageLayout):
- Wrap header in `bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl p-6`
- Add gradient text for "Email" title: `bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent`
- Add a subtle pulsing status dot (like Keywords hero badge)
- Inline stats rendered as glassmorphic mini-pills with icons
- Action buttons get the glassmorphic treatment: `bg-background/40 border-border/50 backdrop-blur-sm`
- Add a subtle animated gradient glow behind the card (`absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 blur-2xl`)

### 2. Glassmorphic Tab Bar
**File: `EmailDashboard.tsx`**

Replace plain pill buttons with a Keywords-style filter bar:
- Wrap tabs in `bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 p-2`
- Active tab: `bg-primary text-primary-foreground shadow-lg` (matching Keywords quick filters)
- Inactive: `hover:bg-background/80` with spring hover animation
- Add `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}` from framer-motion

### 3. Animate Entry
**File: `EmailDashboard.tsx`**

Add staggered entry animations matching Keywords page:
- Header card: fade + slide up (delay 0)
- Tab bar: fade + slide up (delay 0.2)
- Content area: fade + slide up (delay 0.4)

### 4. Polish Sub-Tab Content Wrappers
**File: `EmailDashboard.tsx`**

Wrap the tab content area in a subtle container with the same glassmorphic card treatment for consistency. Each sub-tab's content inherits the premium feel.

## What This Does NOT Change

- No 60vh hero — the Email page stays compact since it's inside EngageLayout which already has backgrounds
- No changes to sub-tab internals (Inbox 3-panel, Drafts list, etc.) — those are functional and fine
- No new dependencies

## Files to Edit

| File | Changes |
|------|---------|
| `EmailDashboard.tsx` | Glassmorphic hero card, gradient title, animated tab bar, staggered entry, content wrapper |

1 file. Pure visual elevation.

