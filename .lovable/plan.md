

# Onboarding Walkthrough Implementation Plan

## Overview

Your application already has a comprehensive **Grand App Tour** with 13+ detailed steps covering every feature. However, it's not being shown automatically to new users, and there's no way to revisit it from Settings. This plan will wire everything together for a seamless onboarding experience.

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| Grand Tour Content | Complete | 13+ steps covering all modules |
| Tour Modal UI | Complete | Beautiful, animated, with achievements |
| Auto-trigger for new users | Missing | Need to detect first login |
| Settings access | Missing | No "Help & Tour" tab in Settings |
| New user detection | Missing | No localStorage or DB flag |

---

## What Will Be Implemented

### 1. Auto-Trigger Tour for New Users

After signup/first login, automatically show the Grand Tour.

**Detection Logic:**
- Check if `localStorage` has `'grand-tour-completed'` key
- Check if `localStorage` has `'has-seen-onboarding'` key (new flag)
- If neither exists AND user just authenticated, trigger the tour

**File Changes:**
- `src/pages/Index.tsx` - Add useEffect to detect new users and auto-start tour

### 2. Add "Help & Tour" Tab to Settings

Users can revisit the walkthrough anytime from Settings.

**Design:**
```
+------------------------------------------+
|  Settings                           [X]  |
+------------------------------------------+
|  Profile          |                      |
|  API Keys         |   HELP & TOUR        |
|  Websites         |                      |
|  Notifications    |   [Icon] App Tour    |
|  Prompts          |   Experience the     |
|  Help & Tour  <-- |   complete walkthrough|
|                   |   of all features.   |
|                   |                      |
|                   |   [Start Tour]       |
|                   |                      |
|                   |   Achievements: 3/5  |
|                   |   [Trophy icons]     |
|                   |                      |
|                   |   ─────────────────  |
|                   |                      |
|                   |   Quick Links:       |
|                   |   - Documentation    |
|                   |   - Keyboard Shortcuts|
|                   |   - Contact Support  |
+------------------------------------------+
```

**File Changes:**
- `src/components/settings/HelpAndTourSettings.tsx` - New component
- `src/components/settings/SettingsPopup.tsx` - Add new tab
- `src/contexts/SettingsContext.tsx` - Add 'helpTour' to valid tabs

### 3. Enhanced New User Flow

After successful auth callback, pass a query parameter to dashboard indicating new user status.

**Flow:**
```
User Signs Up
      |
      v
Email Verification
      |
      v
AuthCallback.tsx
      |
      v
Navigate to /dashboard?newUser=true  <-- Add this
      |
      v
Index.tsx detects newUser param
      |
      v
Auto-triggers startTour()
      |
      v
Sets localStorage flags
```

**File Changes:**
- `src/pages/AuthCallback.tsx` - Add newUser detection and query param
- `src/pages/Index.tsx` - Read query param and trigger tour

---

## Technical Implementation Details

### File 1: `src/pages/AuthCallback.tsx`

Modify the success navigation to detect if this is a new user's first login:

```typescript
// In the success handling:
if (data.session) {
  setStatus('success');
  
  // Check if user is new (no tour completed flag)
  const isNewUser = !localStorage.getItem('grand-tour-completed') && 
                    !localStorage.getItem('has-seen-onboarding');
  
  setTimeout(() => {
    navigate(isNewUser ? '/dashboard?welcome=true' : '/dashboard', { replace: true });
  }, 1500);
}
```

### File 2: `src/pages/Index.tsx`

Add auto-trigger logic:

```typescript
import { useSearchParams } from 'react-router-dom';
import { useGrandTour } from '@/contexts/GrandTourContext';

// Inside component:
const [searchParams, setSearchParams] = useSearchParams();
const { startTour, hasCompletedTour } = useGrandTour();

useEffect(() => {
  const isWelcomeFlow = searchParams.get('welcome') === 'true';
  
  if (isWelcomeFlow && !hasCompletedTour) {
    // Clear the query param
    searchParams.delete('welcome');
    setSearchParams(searchParams, { replace: true });
    
    // Set flag to prevent re-triggering
    localStorage.setItem('has-seen-onboarding', 'true');
    
    // Small delay to let dashboard render, then start tour
    setTimeout(() => {
      startTour();
    }, 500);
  }
}, [searchParams, hasCompletedTour, startTour]);
```

### File 3: `src/components/settings/HelpAndTourSettings.tsx` (NEW)

Create a new component for the Help & Tour settings tab:

**Features:**
- "Start Tour" button that triggers the Grand Tour
- Achievement progress display (X/5 unlocked)
- Trophy icons for each achievement
- Quick links section (Documentation, Shortcuts, Support)
- Visual indication if tour was completed

### File 4: `src/components/settings/SettingsPopup.tsx`

Add the new tab to the tabs array:

```typescript
{
  id: 'helpTour',
  label: 'Help & Tour',
  icon: <Compass className="h-4 w-4" />,
  component: <HelpAndTourSettings />
}
```

### File 5: `src/contexts/SettingsContext.tsx`

Update valid tab list to include 'helpTour'.

---

## Tour Content Already Covered

The existing Grand Tour covers these modules in detail:

| Step | Module | What It Explains |
|------|--------|------------------|
| 1 | Welcome | Platform overview, 10+ modules, AI-powered |
| 2 | Dashboard | Command center, analytics, quick access |
| 3 | Quick Actions | One-click access to features |
| 4 | Content Builder | 6-step AI content creation process |
| 5 | Drafts & Library | Version control, collaboration, auto-save |
| 6 | Approval Workflows | Team reviews, quality scoring |
| 7 | Content Repurposing | Multi-format transformation |
| 8 | Content Strategy | Goal tracking, competitor analysis, calendar |
| 9 | Keyword Research | SERP data, clustering, competition |
| 10 | Answer The People | Question discovery, intent analysis |
| 11 | Topic Clusters | Content pillars, semantic architecture |
| 12 | Solutions Management | Product/service integration, brand guidelines |
| 13 | Analytics | SEO metrics, engagement, conversions, ROI |
| 14 | AI Conversational Mode | Natural language commands, automation |

This is comprehensive and covers everything a new user needs to know.

---

## User Experience Flow

### New User Experience:
1. User signs up with email/Google
2. Verifies email (if applicable)
3. Redirected to Dashboard with `?welcome=true`
4. Grand Tour modal appears automatically
5. User can navigate through all 14 steps or skip
6. Achievements unlock as they progress
7. Tour marked as complete in localStorage

### Returning User (Revisit Tour):
1. Click Settings icon
2. Navigate to "Help & Tour" tab
3. Click "Start Tour" button
4. Tour begins from step 1
5. Can also view achievements earned

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/AuthCallback.tsx` | Modify | Detect new users, add query param |
| `src/pages/Index.tsx` | Modify | Read query param, auto-trigger tour |
| `src/components/settings/HelpAndTourSettings.tsx` | Create | New settings tab for tour access |
| `src/components/settings/SettingsPopup.tsx` | Modify | Add Help & Tour tab |
| `src/contexts/SettingsContext.tsx` | Modify | Add 'helpTour' to valid tabs |

---

## Summary

This implementation leverages your existing comprehensive Grand Tour system by:

1. **Auto-triggering** for new users after signup
2. **Adding Settings access** so users can revisit anytime
3. **Preserving completion state** across sessions
4. **Showing achievements** to gamify the learning experience

No content changes needed - the existing 14-step tour already covers every feature in rich detail with beautiful animations and visual explanations.

