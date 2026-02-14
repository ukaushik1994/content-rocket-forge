

# Automated Business Intelligence Extraction

## Overview

Make the entire Solutions page self-populate from a single website URL. When a user signs up and provides their company URL during onboarding, the system extracts company info, solutions/offerings, AND brand guidelines -- all automatically. Brand guidelines specifically run after company info is saved (as you confirmed).

## Current State vs Target State

**Today:** User manually fills forms for Company Info, Solutions, and Brand Guidelines. There's an "AI Autofill from Website" button on Company section, and a solution-intel edge function for solutions -- but Brand Guidelines has zero auto-extraction.

**Target:** All three sections auto-populate. Company and Solutions during onboarding (already partially working). Brand Guidelines automatically extract after company info is saved.

---

## Phase 1: Brand Guidelines Auto-Extraction (New)

This is the biggest gap -- no extraction exists for brand data today.

### New Edge Function: `brand-intel`
- Input: website URL, user ID
- Process:
  1. Use SERP to discover the homepage + any `/brand`, `/style-guide`, `/about` pages
  2. Fetch pages using the existing `content-extractor.ts`
  3. Extract CSS-related data from HTML (inline styles, meta theme-color, Open Graph images for logo)
  4. Send all content to AI (Lovable Gateway) with a structured prompt to extract:
     - Colors (primary, secondary, accent, neutral) from actual page analysis
     - Font families from page content/CSS references
     - Brand tone and personality from website copy
     - Keywords from headings and meta descriptions
     - Do/Don't use rules inferred from writing style
     - Logo usage notes inferred from brand presence
     - Target audience from page messaging
     - Brand story from about pages
     - Mission statement
  5. Return structured `BrandGuidelines` object with confidence scores

### New Service: `brandIntelService.ts`
- Frontend service that calls the `brand-intel` edge function
- Returns typed `BrandGuidelines` data ready to save

### Auto-Trigger After Company Info Save
- In `Solutions.tsx`, after `handleSaveCompanyInfo` succeeds and a website URL exists:
  1. Call `brandIntelService.discoverBrandGuidelines(website, userId)`
  2. Auto-save the result to the `brand_guidelines` table
  3. Update the `brandGuidelines` state so the UI reflects immediately
  4. Show a toast: "Brand guidelines extracted from your website"
- This runs in the background -- user doesn't wait for it

---

## Phase 2: Enhance Onboarding Pipeline

### Update `onboardingIntelService.ts`
- After company intel completes and saves, chain a brand-intel call using the saved company website
- Add brand extraction as a 4th parallel promise (after company, competitors, solutions)
- Save brand guidelines to `brand_guidelines` table automatically

### Flow:
1. User provides company URL during onboarding
2. `company-intel` extracts company info (existing)
3. `solution-intel` extracts solutions/offerings (existing)
4. `competitor-intel` extracts competitor data (existing)
5. **NEW:** `brand-intel` extracts brand guidelines from the same website
6. User lands on Solutions page with everything populated

---

## Phase 3: Solution Intel Improvements

### Broader Offering Detection
- Update the `solution-intel` edge function's AI prompt to explicitly look for:
  - SaaS products
  - Professional services / consulting
  - Physical products
  - Subscription offerings
  - Training / courses
  - Any monetizable offering
- Currently the prompt focuses on "software solutions" -- broaden the extraction scope
- The prompt change happens in the existing `solution-intel/index.ts` AI extraction section

---

## Technical Details

### Files Created
| File | Purpose |
|------|---------|
| `supabase/functions/brand-intel/index.ts` | Edge function: scrape website, extract brand data via AI |
| `src/services/brandIntelService.ts` | Frontend service calling brand-intel edge function |

### Files Modified
| File | Change |
|------|--------|
| `src/pages/Solutions.tsx` | After company save, auto-trigger brand extraction in background |
| `src/services/onboardingIntelService.ts` | Add brand-intel as 4th extraction in the pipeline |
| `supabase/functions/solution-intel/index.ts` | Broaden AI prompt to detect all offering types (products, services, etc.) |
| `src/components/solutions/brand/BrandGuidelinesDisplay.tsx` | Add a manual "Re-extract from Website" button for re-runs |

### No Database Changes Required
- `brand_guidelines` table already exists with all needed columns
- `company_info` table already exists
- `solutions` table already exists

### AI Model
- Uses `google/gemini-2.5-flash` via Lovable AI Gateway (same pattern as `company-intel`)
- No user API key needed -- uses LOVABLE_API_KEY

### Scraping Method
- Uses existing `content-extractor.ts` (custom scraper) -- no Firecrawl dependency
- SERP discovery via SerpAPI / Serpstack (same as company-intel)

