
# Remaining Implementation: Dialog Cleanup and EngageButton/EngageDialogHeader Integration

## Current State

All 7 Engage pages render correctly with:
- Animated gradient background (orbs + grid)
- Premium EngageHero headers with glow icons
- EngageStatCard grids with hover lift
- Premium empty states with spring animations
- Pulsing status dots on active items
- Frosted glass search bars

Two shared components were created but **never integrated**:
- `EngageDialogHeader` -- exists but zero imports across the codebase
- `EngageButton` -- exists but zero imports across the codebase

Four dialog files still have **redundant old styling** (`bg-card/95 backdrop-blur-xl border-border/50`) that conflicts with the upgraded base `dialog.tsx` defaults, and **plain titles** without gradient styling.

## Files to Fix

### 1. JourneyAnalytics.tsx (line 78)
- Remove redundant `bg-card/95 backdrop-blur-xl border-border/50` from DialogContent
- Add gradient title: `className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"`

### 2. JourneyPerformance.tsx (line 90)
- Remove redundant `bg-card/95 backdrop-blur-xl border-border/50` from DialogContent
- Add gradient title styling

### 3. JourneyEnrollments.tsx (line 94)
- Remove redundant `bg-card/95 backdrop-blur-xl border-border/50` from DialogContent
- Add gradient title styling

### 4. AutomationRuns.tsx (line 189)
- Remove redundant `bg-card/95 backdrop-blur-xl border-border/50` from DialogContent
- Add gradient title: `className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"`

### 5. Replace primary CTA buttons with EngageButton in key locations
- **ContactsList.tsx**: "Add Contact" button
- **JourneysList.tsx**: "New Journey" button
- **AutomationsList.tsx**: "New Automation" button
- **SocialDashboard.tsx**: "New Post" button
- **SegmentsList.tsx**: "New Segment" button
- **ActivityLog.tsx**: "Export CSV" button
- **EmailDashboard.tsx**: "Compose" button (if applicable)

These replacements swap `<Button>` with the spring-animated `<EngageButton>` for consistent motion feedback across all primary actions.

## Scope
- 4 dialog files: remove old overrides + add gradient titles
- 7 page files: swap primary CTA to EngageButton
- Zero database changes
- Zero breaking changes
