

# Comprehensive Bug Fix Plan: Issues Found During Pro User Testing

## Issues Discovered

### 1. CRITICAL: Duplicate Solution Creation
**What happens**: Clicking "Save" in the Add Solution modal creates a new record each time. If a user clicks Save twice (or the button is slow to respond), duplicate solutions are created.
**Root cause**: The Save button does not disable after first click, and there is no duplicate-prevention logic (no idempotency check).
**Fix**:
- Add `isSaving` state to disable the Save button immediately after first click
- Re-enable only after success/error response
- Optionally add an optimistic lock or check for existing solution with same name before inserting

**File to modify**: The Solution form component (likely in `src/components/solutions/` or `src/components/company/`)

---

### 2. HIGH: No Onboarding Guidance for New Users
**What happens**: A fresh user lands on the dashboard carousel without any prompt to set up their company, add solutions, or configure API keys. The setup is buried under avatar menu > Solutions.
**Impact**: Users don't know where to start, leading to confusion and empty dashboards.
**Fix**:
- Ensure the `?welcome=true` onboarding trigger fires for new users
- Add a prominent "Get Started" banner on the dashboard when company_info is empty
- Consider adding a setup checklist widget showing: Company Info, Solutions, API Keys, First Research

**Files to modify**: Dashboard component, potentially the auth callback redirect logic

---

### 3. HIGH: API Services Show Offline with No Guidance
**What happens**: Research Hub shows red dots for "AI Service" and "SERP Service" with no explanation or link to fix it.
**Impact**: Users cannot use Research, Strategy generation, or AI Chat effectively.
**Fix**:
- Make the red dot indicators clickable, linking to Settings > API Keys
- Add a tooltip or inline message: "Configure your API keys in Settings to enable this service"
- Consider showing a setup prompt when user first visits Research without configured keys

**File to modify**: The Research Hub status indicators component

---

### 4. MEDIUM: Streaming Not Connected to Active Chat
**What happens**: The streaming edge function exists but the active chat interface still uses the blocking `supabase.functions.invoke()` call.
**Impact**: 10-15 second wait for every AI response.
**Fix** (as previously planned):
- Modify `useEnhancedAIChatDB.ts` to use streaming `fetch()` to the `ai-streaming` endpoint
- Create placeholder assistant message immediately
- Parse SSE tokens and update message content progressively
- Fall back to non-streaming if stream fails

**File to modify**: `src/hooks/useEnhancedAIChatDB.ts`

---

### 5. MEDIUM: AI Chat Missing Visual Insights
**What happens**: All AI chat messages return `visual_data: null` - no charts, metric cards, or visual insights.
**Impact**: Users get plain text responses without the data visualizations the system is designed to provide.
**Fix** (previously deployed but needs verification):
- The fallback chart generation was added to `enhanced-ai-chat/index.ts`
- Need to verify the deployment is active and the fallback triggers correctly
- May need to strengthen the system prompt to request structured visualData in responses

**File to modify**: `supabase/functions/enhanced-ai-chat/index.ts`

---

### 6. LOW: SERP Hijacking Internal Queries
**What happens**: Asking about "campaign trends" or "proposal performance" routes to external SERP instead of internal data.
**Impact**: Users get irrelevant external search data instead of their own campaign analytics.
**Fix** (previously deployed):
- Internal data exclusion patterns added to `serp-intelligence.ts`
- Query analyzer updated to prioritize campaign/performance categories
- Needs end-to-end testing to verify

---

## Implementation Priority

| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | Duplicate Solution Bug | Small - add loading state to Save button |
| 2 | Streaming Connection | Medium - rewire chat hook to use SSE |
| 3 | Onboarding Guidance | Medium - add setup checklist/banner |
| 4 | API Services Guidance | Small - add click-to-configure on status dots |
| 5 | Visual Insights Verification | Small - test and adjust fallback logic |
| 6 | SERP Routing Verification | Small - end-to-end test |

---

## Summary

The most impactful fixes are the duplicate solution bug (data integrity issue) and connecting streaming to the active chat (user experience). The onboarding and API key guidance issues affect first-time user experience significantly. All six issues can be addressed in a focused implementation session.

