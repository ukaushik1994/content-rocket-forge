

# Comprehensive Plan: AI Chat Awareness, Solutions Auto-Fill Fix, and Settings Engage Tab

This plan covers three distinct issues that need to be addressed together.

---

## Issue 1: AI Chat Has No Awareness of the Engage Module

**Current State:** The `enhanced-ai-chat` edge function has 13 tools covering content, keywords, proposals, solutions, competitors, campaigns, and SERP -- but zero tools for the Engage module (contacts, segments, journeys, automations, email campaigns, social).

**What Needs to Happen:** Add Engage intelligence tools so the AI can answer questions like "How many contacts do I have?", "Show my active journeys", "What automations are running?", and "What's my email campaign status?".

### Changes

**New file: `supabase/functions/enhanced-ai-chat/engage-intelligence-tool.ts`**
- Create 4 new tool definitions:
  - `get_engage_contacts` -- Fetch contacts with filters (tags, subscription status, date range)
  - `get_engage_segments` -- Fetch audience segments with member counts
  - `get_engage_journeys` -- Fetch journeys with status and step counts
  - `get_engage_automations` -- Fetch automation rules with trigger info
- Each tool queries the appropriate `engage_*` tables scoped to the user's workspace (fetched via `team_members` table)
- Returns structured data the AI can reason about

**Edit: `supabase/functions/enhanced-ai-chat/tools.ts`**
- Import the new engage tool definitions and executor
- Add them to the `TOOL_DEFINITIONS` array
- Add engage tool names to routing logic

**Edit: `supabase/functions/enhanced-ai-chat/index.ts`**
- Add Engage data counts to the system prompt context (contact count, segment count, journey count, automation count)
- Add Engage examples to the tool usage instructions (e.g., "How many contacts?" -> `get_engage_contacts`)
- Add Engage intent patterns to the query analyzer routing

**Edit: `supabase/functions/enhanced-ai-chat/query-analyzer.ts`**
- Add Engage-related intent patterns: "contacts", "segments", "journeys", "automations", "email", "engage"
- Route these to the appropriate engage tools

---

## Issue 2: Solutions and Company Info Auto-Fill Not Working

**Current State:** The `solution-intel` and `company-intel` edge functions exist and are well-structured. They use the user's SERP API key (via `getApiKey('serp', userId)`) and AI proxy correctly. However, no logs appear at all -- the functions are never being called successfully.

**Root Cause Analysis:** The edge functions are deployed but the `getApiKey` function reads from the `api_keys` table looking for `encrypted_key`. The issue is likely one of:
1. No SERP API key is configured for the user (the function falls back to generic URLs, which may fail to fetch)
2. The `ai-proxy` call may be failing silently (no AI provider configured)
3. The function may not be deployed at all

### Changes

**Deploy edge functions:**
- Ensure `solution-intel` and `company-intel` are deployed
- Test them directly with curl to identify the actual failure point

**Edit: `supabase/functions/solution-intel/index.ts`**
- Add better error logging at each stage (SERP fallback, page fetch, AI proxy call)
- When no SERP key exists, improve the fallback URL strategy to actually work (try fetching the homepage + common paths like /products, /solutions, /pricing, /features directly)
- Add a timeout for page fetches (currently no timeout, could hang forever)
- Return diagnostic info about which stage failed

**Edit: `supabase/functions/company-intel/index.ts`**
- Same improvements: better error logging, timeout handling
- When no SERP key exists, improve fallback to try homepage + /about + /about-us + /team directly (instead of returning "no pages found")
- Make the fallback path actually fetch content, not just add URLs to the list

**Edit: `src/services/solutionIntelService.ts`**
- Add better error messages to surface to the user what went wrong (e.g., "No SERP API key configured -- using limited fallback")

**Edit: `src/services/companyIntelService.ts`**
- Same: add descriptive error handling

---

## Issue 3: Engage Section in Global Settings is Empty

**Current State:** The `EngageIntegrationSettings` component at `src/components/settings/engage/EngageIntegrationSettings.tsx` shows a connection status summary and a "Go to Engage Settings" button. It works correctly when a workspace exists but shows "No workspace found" when one doesn't.

**The Problem:** The component queries `team_members` to find a workspace, but if the user hasn't visited Engage yet, no workspace exists. Also, the component is very sparse -- just a status card with a redirect button. It should be more useful.

### Changes

**Edit: `src/components/settings/engage/EngageIntegrationSettings.tsx`**
- Instead of showing "No workspace found", auto-provision the workspace using the same RPC call (`ensure_engage_workspace`) that WorkspaceContext uses
- Embed the full Engage settings inline (Resend API key, sender config, social accounts, demo data) rather than just showing a redirect button
- Reuse the same components from `EngageSettings.tsx` or import `EngageSettings` directly as the content

The simplest approach: replace the content of `EngageIntegrationSettings` with a direct render of the `EngageSettings` component (which already has all the settings UI). This way the global Settings popup shows the full Engage configuration inline.

---

## Technical Summary

| Area | Files Changed | Complexity |
|------|--------------|------------|
| AI Chat Engage Awareness | 4 edge function files | Medium |
| Solutions/Company Auto-Fill Fix | 2 edge functions + 2 services | Medium |
| Settings Engage Tab | 1 component | Low |

### Execution Order
1. Fix the Settings Engage tab (quick win, low risk)
2. Fix the solutions/company auto-fill pipeline (deploy + debug + improve fallbacks)
3. Add Engage intelligence tools to AI Chat (new capability)

