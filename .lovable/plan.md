

# What's Left to Implement -- Post-Testing Cleanup

## Completed (No Action Needed)
- Workspace provisioning fix (`ensure_engage_workspace` using `'admin'`)
- Settings removed from Engage sidebar navigation
- Settings route removed from Engage page router
- Full EngageSettings rendered inside global Settings > Engage tab
- All 7 Engage subpages functional (Email, Contacts, Segments, Journeys, Automations, Social, Activity)
- Offerings Hub clean (7 unique offerings, no duplicates)

---

## Remaining Issues to Fix

### 1. Dead Link: Email > Settings tab links to removed `/engage/settings` route
**File:** `src/components/engage/email/settings/EmailProviderSettings.tsx` (line 80)

The Email Dashboard has a "Settings" tab that renders `EmailProviderSettings`. Inside it, there's a "Go to Settings" button that links to `/engage/settings` -- a route that no longer exists. This needs to either:
- Open the global Settings dialog to the Engage tab, or
- Be removed entirely since the sender config is already duplicated in this same component

**Recommendation:** Remove the entire "API Key Configuration" card (lines 69-87) since it just points to a dead route, and the sender config below it is already self-contained. The Resend API key is managed in global Settings > Engage tab.

### 2. Duplicate Settings Tab inside Email Dashboard
**File:** `src/components/engage/email/EmailDashboard.tsx` (line 107, 116)

The Email Dashboard still has a "Settings" tab that renders `EmailProviderSettings` (sender config). Per the centralization decision, all Engage settings should live exclusively in global Settings > Engage tab. This tab should be removed to avoid confusion and duplication.

**Changes:**
- Remove the "Settings" TabsTrigger (line 107)
- Remove the "Settings" TabsContent (line 116)
- Remove the `EmailProviderSettings` import (line 14)
- Remove unused `Settings` icon import

### 3. Cleanup: `src/components/engage/email/settings/` directory
Once the Email Dashboard no longer uses `EmailProviderSettings`, the entire `src/components/engage/email/settings/` directory can be deleted since its only file is `EmailProviderSettings.tsx`, which duplicates functionality already in the centralized EngageSettings.

---

## Summary Table

| Item | File | Change |
|------|------|--------|
| Dead `/engage/settings` link | `EmailProviderSettings.tsx` | Remove file |
| Duplicate "Settings" tab in Email | `EmailDashboard.tsx` | Remove Settings tab + import |
| Orphaned directory | `email/settings/` | Delete directory |

## Impact
3 files touched. Zero database changes. Pure UI cleanup to complete the settings centralization that was started in the previous session.

