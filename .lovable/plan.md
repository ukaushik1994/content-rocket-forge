

# Engage Settings: API Keys Integration

## Goal
Make the Engage API keys (Resend for email) work exactly like the existing API key system (OpenRouter, SerpAPI, etc.) -- same storage, same encryption, same UI pattern -- but living in the Engage settings section.

## What Changes

### 1. Add Resend to the API Key System

**File: `src/services/apiKeyService.ts`**
- Add `'resend'` to the `ApiProvider` type union

**File: `src/components/settings/api/types.ts`**
- Add a Resend entry to `API_PROVIDERS` array with category `'Communication'`, serviceKey `'resend'`, link to `https://resend.com/api-keys`

This means Resend keys get encrypted and stored in the `api_keys` table just like every other provider -- same encryption, same RLS, same security model.

### 2. Redesign Engage Integration Settings

**File: `src/components/settings/engage/EngageIntegrationSettings.tsx`**

Replace the current manual API key input with the existing `SimpleProviderCard` component for Resend. The settings page will have:

- **Email Provider Section**: Uses `SimpleProviderCard` for Resend (same expand/collapse, save & test, enable/disable pattern as other API keys)
- **Email Sender Config**: Separate glassmorphism card for from_name, from_email, reply_to (these aren't secrets, just config stored in `email_provider_settings`)
- **Connection Status**: Shows whether the Resend key is configured (reads from `api_keys` table) and whether sender details are set
- **Social Accounts**: Keep as-is with "Coming Soon" badges
- **Demo Data**: Keep as-is

### 3. Update Edge Function to Read Key from Database

**File: `supabase/functions/engage-email-send/index.ts`**

Currently reads `RESEND_API_KEY` from env only. Update to:
1. First check `Deno.env.get("RESEND_API_KEY")` (for users who set it as a secret)
2. If not found, query the `api_keys` table for the workspace owner's Resend key using the service role client
3. This way it works whether the key is stored via the UI (in `api_keys` table) or as an env secret

The edge function will look up the workspace owner from the email message's `workspace_id`, then query `api_keys` where `service = 'resend'` and `user_id = owner_id`.

### 4. Remove Duplicate API Key Storage

Currently the API key is stored in `email_provider_settings.config` as plain JSON. After this change:
- The key goes through the standard encrypted `api_keys` table
- `email_provider_settings` only stores non-secret config: provider name, from_name, from_email, reply_to
- The save flow no longer writes `api_key` to the config column

---

## Technical Details

### Files Modified
| File | Change |
|------|--------|
| `src/services/apiKeyService.ts` | Add `'resend'` to ApiProvider type |
| `src/components/settings/api/types.ts` | Add Resend to API_PROVIDERS array |
| `src/components/settings/engage/EngageIntegrationSettings.tsx` | Use SimpleProviderCard for Resend key, separate sender config card |
| `supabase/functions/engage-email-send/index.ts` | Add fallback to read key from api_keys table |

### How It Works End-to-End
1. User goes to Settings > Engage
2. Sees a Resend card (same pattern as OpenRouter card in API settings) -- clicks to expand, pastes key, clicks "Save & Test"
3. Key gets encrypted and stored in `api_keys` table via `apiKeyService.storeApiKey('resend', key)`
4. Below that, a separate card for sender details (from name, from email, reply-to) saved to `email_provider_settings`
5. When `engage-email-send` runs, it checks env first, then falls back to querying `api_keys` for the workspace owner's Resend key
6. Test Connection button invokes the edge function with a test payload

### No New Dependencies
Uses existing `SimpleProviderCard`, `apiKeyService`, `GlassCard`, `framer-motion`.

