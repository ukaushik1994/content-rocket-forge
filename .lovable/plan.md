
# Post-Tour Business Intelligence Setup Flow

## Overview

Transform the onboarding experience to collect essential business data immediately after the tour completes, triggering background intelligence gathering that populates the Solutions, Competitors, and Company profiles automatically.

## User Flow

```text
First Login
    │
    ▼
┌─────────────────────────┐
│   Onboarding Tour       │  ← 8-step carousel (existing)
│   (8 steps)             │
└─────────────────────────┘
    │
    ▼ Tour completes (final step "Next" click)
    │
┌─────────────────────────┐
│  Business Setup Form    │  ← NEW COMPONENT
│  ┌───────────────────┐  │
│  │ Your Company URL  │  │
│  ├───────────────────┤  │
│  │ Competitor URL    │  │
│  ├───────────────────┤  │
│  │ Solution 1        │  │
│  │ (name + brief)    │  │
│  ├───────────────────┤  │
│  │ + Add Another     │  │
│  └───────────────────┘  │
│  [Get Started]          │
└─────────────────────────┘
    │
    ▼ User submits
    │
┌─────────────────────────┐
│  Dashboard              │  ← User can start working
│                         │
│  [Background Intel]     │  ← Toast: "Analyzing your business..."
│  - company-intel runs   │
│  - competitor-intel runs│
│  - solution-intel runs  │
└─────────────────────────┘
```

## Technical Implementation

### Phase 1: New Components

#### 1.1 BusinessSetupForm Component
**File:** `src/components/onboarding/BusinessSetupForm.tsx`

A multi-step form within the same modal container (reusing `GradientBorder`):
- **Company URL input** with validation
- **Competitor URL input** (at least one, with "Add another" option, max 3)
- **Solutions section**: name + one-line description (at least one, max 3)
- **Get Started button** to submit and close

Design matches the existing glassmorphic carousel aesthetic.

#### 1.2 OnboardingSetupContext
**File:** `src/components/onboarding/OnboardingSetupContext.tsx`

New context to manage:
- `showSetupForm: boolean` - whether the setup form is visible
- `setupData: { companyUrl, competitors[], solutions[] }` - collected data
- `isProcessing: boolean` - background intel status
- `triggerIntelGathering()` - kicks off edge functions

### Phase 2: Modify Onboarding Flow

#### 2.1 OnboardingContext Changes
**File:** `src/components/onboarding/OnboardingContext.tsx`

Current flow:
```
Step 8 → nextStep() → endOnboarding() → localStorage flag → dashboard visible
```

New flow:
```
Step 8 → nextStep() → showBusinessSetupForm() → user submits → endOnboarding() → dashboard visible
```

Add new state:
- `showBusinessSetup: boolean`
- `setShowBusinessSetup()`

Modify `nextStep()`:
- When on final step, instead of calling `endOnboarding()`, set `showBusinessSetup = true`

#### 2.2 OnboardingCarousel Changes
**File:** `src/components/onboarding/OnboardingCarousel.tsx`

Conditionally render:
- If `!showBusinessSetup` → render current carousel
- If `showBusinessSetup` → render `<BusinessSetupForm />`

### Phase 3: Background Intelligence Service

#### 3.1 OnboardingIntelService
**File:** `src/services/onboardingIntelService.ts`

Orchestrates all three intel services in parallel:
```typescript
async function processOnboardingSetup(userId: string, data: SetupData) {
  // Show toast: "Analyzing your business..."
  
  // Fire all in parallel (non-blocking)
  const promises = [
    // Company intel
    companyIntelService.discoverCompanyInfo(data.companyUrl, userId),
    
    // Competitor intel (for each)
    ...data.competitors.map(url => 
      competitorIntelService.autoFillFromWebsite(url, userId)
    ),
    
    // Solution intel
    solutionIntelService.autoFillFromWebsite(data.companyUrl, userId)
  ];
  
  // Process results and save to database
  Promise.allSettled(promises).then(results => {
    // Insert into solutions, company_competitors tables
    // Update toast: "Setup complete!"
  });
}
```

#### 3.2 Database Inserts

After intel returns:
- **Company info** → `profiles` table update (company_id link)
- **Competitors** → `company_competitors` table inserts
- **Solutions** → `solutions` table inserts (with user-provided names + AI-extracted data)

### Phase 4: UI/UX Details

#### 4.1 BusinessSetupForm Layout

```text
┌────────────────────────────────────────────────────┐
│  🏢 Let's Set Up Your Business                     │
│  Tell us about your company so we can personalize  │
│  your experience                                   │
├────────────────────────────────────────────────────┤
│                                                    │
│  Your Company Website                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ https://yourcompany.com                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ─────────────────────────────────────────────────  │
│                                                    │
│  Your Main Competitor                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ https://competitor.com                       │  │
│  └──────────────────────────────────────────────┘  │
│  [+ Add Another Competitor]                        │
│                                                    │
│  ─────────────────────────────────────────────────  │
│                                                    │
│  Your Product/Solution                             │
│  ┌──────────────────────────────────────────────┐  │
│  │ Solution Name                                │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Brief description (1-2 sentences)            │  │
│  └──────────────────────────────────────────────┘  │
│  [+ Add Another Solution]                          │
│                                                    │
├────────────────────────────────────────────────────┤
│        [Skip for Now]    [Get Started →]           │
└────────────────────────────────────────────────────┘
```

#### 4.2 Validation Rules
- Company URL: Required, valid URL format
- Competitor URL: At least one, valid URL
- Solution: At least one with name (description optional)
- "Skip for Now" option available (completes onboarding without data)

#### 4.3 Loading States
When user clicks "Get Started":
1. Brief validation animation
2. Close modal immediately
3. Show persistent toast: "Setting up your workspace..."
4. Background processing continues
5. Success toast when complete: "Your business profile is ready!"

### Phase 5: Database Considerations

#### 5.1 New Table: `onboarding_setup`
Track onboarding completion with submitted data:

```sql
CREATE TABLE onboarding_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_url TEXT,
  setup_data JSONB,
  intel_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

This allows:
- Tracking who completed setup vs skipped
- Retry failed intel gathering
- Analytics on onboarding completion rates

### File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/onboarding/BusinessSetupForm.tsx` | Create | New form component for data collection |
| `src/components/onboarding/OnboardingContext.tsx` | Modify | Add `showBusinessSetup` state and flow control |
| `src/components/onboarding/OnboardingCarousel.tsx` | Modify | Conditionally render setup form after tour |
| `src/services/onboardingIntelService.ts` | Create | Orchestrate background intel gathering |
| `supabase/migrations/xxx_onboarding_setup.sql` | Create | New table for tracking setup completion |

### Edge Cases Handled

1. **User refreshes during setup form**: Form state persisted in context, localStorage backup
2. **Intel gathering fails**: Silent failure with retry option in Settings
3. **User clicks Skip**: Onboarding completes, no intel gathered, can do manually later
4. **Slow network**: Immediate modal close, background processing with toasts
5. **Duplicate URLs**: Validation prevents same competitor twice

### Success Criteria

After implementation:
- New users see tour, then setup form
- Company/competitor/solution data auto-populates in respective pages
- User can start using the app within 30 seconds (not blocked by AI processing)
- Skip option preserves user agency
- Existing users are not affected (localStorage flag honored)
