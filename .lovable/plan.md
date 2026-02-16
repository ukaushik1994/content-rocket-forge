

# Engage Module -- Modal and Button Premium Upgrade

## What This Fixes

The Engage modals and buttons currently look "functional but flat" compared to the homepage's premium glassmorphic design. The homepage uses large rounded cards with `bg-white/5 backdrop-blur-xl border-white/10`, hover glow effects, gradient overlays, and spring-animated buttons. The Engage modals use basic `bg-card/95 backdrop-blur-xl` with no glow, no gradient title accents, and standard-sized buttons without motion.

This plan upgrades the **base UI components** (Dialog, AlertDialog, Button behavior) and all **Engage-specific modals** to match the homepage tier.

---

## Changes Overview

### 1. Upgrade Base Dialog Component (`src/components/ui/dialog.tsx`)

Enhance the default `DialogContent` styling to use the premium glassmorphic look:
- Background: `bg-card/95 backdrop-blur-2xl` (deeper blur)
- Border: `border-white/[0.08]` (subtle glass edge)
- Shadow: `shadow-2xl shadow-black/40` (depth)
- Close button: add hover glow effect

This is a global improvement -- every dialog in the app benefits without per-instance overrides.

### 2. Upgrade Base AlertDialog Component (`src/components/ui/alert-dialog.tsx`)

Same glassmorphic treatment:
- Background: `bg-card/95 backdrop-blur-2xl`
- Border: `border-white/[0.08]`
- Shadow: `shadow-2xl shadow-black/40`
- Higher z-index overlay (`z-[100]` to match Dialog)

### 3. Upgrade GlassCard Component (`src/components/ui/GlassCard.tsx`)

Enhance the shared GlassCard with premium hover effects matching the homepage's action cards:
- Hover: subtle border glow (`hover:border-white/[0.15]`)
- Hover: slight lift (`hover:-translate-y-0.5`)
- Background: `bg-white/[0.03]` (lighter glass)
- Border: `border-white/[0.06]`

### 4. Create Shared Engage Button Variants (`src/components/engage/shared/EngageButton.tsx`)

A wrapper component for premium buttons used across Engage:
- **Primary Action**: gradient background (purple-to-blue), hover glow, spring scale animation
- **Secondary Action**: glass outline with hover gradient border
- Both use `framer-motion` whileHover/whileTap for spring feel

### 5. Upgrade Engage Dialog Headers

Add gradient-colored titles to all Engage dialogs by creating an `EngageDialogHeader` shared component:
- Gradient title text matching each page's color scheme
- Subtle icon with glow next to title
- Thin gradient separator line below header

### 6. File-by-File Modal Upgrades

Remove per-instance `bg-card/95 backdrop-blur-xl border-border/50` overrides (now handled by the base component) and add premium touches:

| File | Modals | Upgrade |
|------|--------|---------|
| `ContactsList.tsx` | Add Contact, Bulk Delete | Remove redundant className, add gradient header |
| `ContactDetailDialog.tsx` | Contact Detail | Add gradient header with contact initial avatar |
| `SegmentsList.tsx` | Create/Edit Segment, Members Viewer | Gradient header, enhanced rule builder container |
| `JourneysList.tsx` | Create Journey | Gradient header, template cards with hover glow |
| `AutomationsList.tsx` | Create/Edit, Exec Log, Dry Run | 3 dialogs get gradient headers, action cards get glow |
| `SocialDashboard.tsx` | Create Post, Link Account | Gradient header, platform-colored accents |
| `SocialInbox.tsx` | Inbox Detail, Saved Replies | Gradient header |
| `ActivityLog.tsx` | Activity Details | Gradient header with channel-colored icon |
| `ComposeDialog.tsx` | Compose Email | Gradient header, send button gets primary gradient |
| `JourneyAnalytics.tsx` | Analytics | Gradient header |
| `JourneyPerformance.tsx` | Performance | Gradient header |
| `JourneyEnrollments.tsx` | Enrollments | Gradient header |
| `AutomationRuns.tsx` | Run Details | Gradient header |

### 7. Button Upgrades Across Engage

Replace key action buttons with premium styling:

- **Primary CTA buttons** ("Add Contact", "Create Journey", "New Automation", "New Post", "Send Email"): Apply gradient background `bg-gradient-to-r from-primary to-primary/80` with hover glow `shadow-primary/25` and spring animation
- **Empty state CTA buttons**: Larger with gradient background and arrow icon
- **Tab switcher buttons**: Enhanced glass pill styling with gradient active indicator
- **Dropdown menu triggers**: Subtle glass background with hover glow
- **Pagination buttons**: Glass outline styling

---

## Technical Approach

### New Files (2)
1. `src/components/engage/shared/EngageButton.tsx` -- Premium button wrapper with gradient + spring motion
2. `src/components/engage/shared/EngageDialogHeader.tsx` -- Gradient dialog header with icon + separator

### Modified Files (16)
- `src/components/ui/dialog.tsx` -- Base glassmorphic styling
- `src/components/ui/alert-dialog.tsx` -- Base glassmorphic styling + z-index fix
- `src/components/ui/GlassCard.tsx` -- Enhanced hover effects
- `src/components/engage/contacts/ContactsList.tsx` -- Modal + button upgrades
- `src/components/engage/contacts/ContactDetailDialog.tsx` -- Modal upgrade
- `src/components/engage/contacts/SegmentsList.tsx` -- Modal + button upgrades
- `src/components/engage/journeys/JourneysList.tsx` -- Modal + button upgrades
- `src/components/engage/journeys/JourneyAnalytics.tsx` -- Modal upgrade
- `src/components/engage/journeys/JourneyPerformance.tsx` -- Modal upgrade
- `src/components/engage/journeys/JourneyEnrollments.tsx` -- Modal upgrade
- `src/components/engage/automations/AutomationsList.tsx` -- Modal + button upgrades
- `src/components/engage/automations/AutomationRuns.tsx` -- Modal upgrade
- `src/components/engage/social/SocialDashboard.tsx` -- Modal + button upgrades
- `src/components/engage/social/SocialInbox.tsx` -- Modal upgrade
- `src/components/engage/activity/ActivityLog.tsx` -- Modal upgrade
- `src/components/engage/email/inbox/ComposeDialog.tsx` -- Modal + button upgrades

### Zero Breaking Changes
- Base component upgrades are additive (enhanced defaults, existing className overrides still work)
- No database changes
- No routing changes
- All existing functionality preserved

