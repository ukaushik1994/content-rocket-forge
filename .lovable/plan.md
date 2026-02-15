

# Full Rename: Solutions to Offerings

## Overview

Rename "Solutions" to "Offerings" across the entire codebase -- UI text, routes, file names, component names, service names, and types. The database table stays as `solutions` (renaming live tables is destructive). The page title becomes **"Business Offerings Hub"**.

---

## What Changes

### 1. Route Change
- `/solutions` becomes `/offerings`
- Add redirect: `/solutions` redirects to `/offerings` (prevents broken bookmarks)
- Update all `navigate('/solutions')` calls across the app

### 2. Page & Component Renames

| Current File | New File |
|---|---|
| `src/pages/Solutions.tsx` | `src/pages/Offerings.tsx` |
| `src/components/solutions/` (entire directory) | `src/components/offerings/` |
| `src/components/solutions/SolutionCard.tsx` | `src/components/offerings/OfferingCard.tsx` |
| `src/components/solutions/EnhancedSolutionCard.tsx` | `src/components/offerings/EnhancedOfferingCard.tsx` |
| `src/components/solutions/EnhancedSolutionGrid.tsx` | `src/components/offerings/EnhancedOfferingGrid.tsx` |
| `src/components/solutions/HeroSection.tsx` | `src/components/offerings/HeroSection.tsx` |
| `src/components/solutions/SolutionUploader.tsx` | `src/components/offerings/OfferingUploader.tsx` |
| `src/components/solutions/SolutionCompetitiveIntelDialog.tsx` | `src/components/offerings/OfferingCompetitiveIntelDialog.tsx` |
| `src/components/solutions/manager/SolutionManager.tsx` | `src/components/offerings/manager/OfferingManager.tsx` |
| `src/components/solutions/manager/SolutionFormDialog.tsx` | `src/components/offerings/manager/OfferingFormDialog.tsx` |
| `src/components/solutions/manager/SolutionGrid.tsx` | `src/components/offerings/manager/OfferingGrid.tsx` |
| `src/components/solutions/manager/SolutionsHeader.tsx` | `src/components/offerings/manager/OfferingsHeader.tsx` |
| `src/components/solutions/manager/DeleteSolutionDialog.tsx` | `src/components/offerings/manager/DeleteOfferingDialog.tsx` |
| `src/components/solutions/manager/EnhancedSolutionFormDialog.tsx` | `src/components/offerings/manager/EnhancedOfferingFormDialog.tsx` |
| `src/components/solutions/manager/MultiSolutionPickerDialog.tsx` | `src/components/offerings/manager/MultiOfferingPickerDialog.tsx` |
| `src/components/solutions/manager/EmptyState.tsx` | `src/components/offerings/manager/EmptyState.tsx` |
| `src/components/solutions/hooks/useSolutionsData.ts` | `src/components/offerings/hooks/useOfferingsData.ts` |

### 3. Service & Type Renames

| Current File | New File |
|---|---|
| `src/services/solutionService.ts` | `src/services/offeringService.ts` |
| `src/services/brandIntelService.ts` | No rename (brand-related, stays) |
| `src/contexts/content-builder/types/solution-types.ts` | `src/contexts/content-builder/types/offering-types.ts` |
| `src/contexts/content-builder/types/enhanced-solution-types.ts` | `src/contexts/content-builder/types/enhanced-offering-types.ts` |
| `src/types/solution-intel.ts` | `src/types/offering-intel.ts` |

### 4. Type/Interface Renames (inside files)

| Current Name | New Name |
|---|---|
| `Solution` | `Offering` |
| `EnhancedSolution` | `EnhancedOffering` |
| `SolutionResource` | `OfferingResource` |
| `SolutionPersona` | `OfferingPersona` |
| `SolutionIntegrationMetrics` | `OfferingIntegrationMetrics` |
| `SolutionIntelRequest` | `OfferingIntelRequest` |
| `SolutionIntelResponse` | `OfferingIntelResponse` |
| `SolutionManager` | `OfferingManager` |
| `solutionService` | `offeringService` |
| `selectedSolution` | `selectedOffering` |
| `solutionId` | `offeringId` |

### 5. UI Text Changes

| Current | New |
|---|---|
| "Business Solutions Hub" | "Business Offerings Hub" |
| "Business Solutions (N)" | "Business Offerings (N)" |
| "Add New Solution" | "Add New Offering" |
| "N Solutions Available" | "N Offerings Available" |
| "Manage Solutions" | "Manage Offerings" |
| "Add your solutions" | "Add your offerings" |
| "Search solutions by name..." | "Search offerings by name..." |
| "Loading solutions..." | "Loading offerings..." |
| "Solution Uploader" | "Offering Uploader" |
| Navbar menu: "Solutions" | "Offerings" |
| "Add Your First Solution" | "Add Your First Offering" |
| "Manage your products and solutions" | "Manage your products and offerings" |

### 6. Edge Functions (internal variable names only)
- `solution-intel` edge function: keep the function name (it's deployed and referenced), but update internal comments and variable names where they face the user
- Database queries still reference `solutions` table -- no change needed there

### 7. Navigation & Cross-References
Files that reference `/solutions` route or import from `solutions/`:

- `src/App.tsx` -- route + import
- `src/components/layout/Navbar.tsx` -- menu item
- `src/components/dashboard/SetupChecklist.tsx` -- route reference
- `src/components/dashboard/QuickActionsGrid.tsx` -- route + label
- `src/components/ai-chat/QuickActionsPanel.tsx` -- label + action
- `src/components/ai-chat/SmartActionHandler.tsx` -- route handler
- `src/components/content-builder/steps/SolutionSelector.tsx` -- renamed to `OfferingSelector.tsx`
- `src/components/content-builder/steps/ContentTypeStep.tsx` -- navigate call
- `src/components/campaigns/` -- various imports and references
- `src/components/content-builder/final-review/` -- SolutionIntegrationCard references

### 8. Database Table
- **NOT renamed** -- `solutions` table stays as-is in Supabase
- All queries like `.from('solutions')` remain unchanged
- This avoids any data loss or migration risk

---

## Implementation Order

1. Create new directory `src/components/offerings/` with all renamed files
2. Create renamed service and type files
3. Update all imports across the codebase
4. Update route in `App.tsx` with redirect from old `/solutions`
5. Update all UI-facing text strings
6. Update navigation references (Navbar, QuickActions, SetupChecklist, AI Chat)
7. Delete old `src/components/solutions/` directory
8. Delete old service/type files

---

## What Stays The Same

- Database table name: `solutions` (all `.from('solutions')` queries unchanged)
- Edge function names: `solution-intel`, `brand-intel`, `company-intel` (deployed names)
- `supabase/functions/solution-intel/` directory (deployed function)
- Campaign types that reference `solutionId` in the database column

