
# Fix Email Verification 404 and Auto-Login with Onboarding Walkthrough

## Problem Identified

When clicking the email verification link, users see a **404 Page Not Found** error. This happens because:

1. **Route Mismatch**: Supabase's default email template redirects to `/auth/confirm`, but the app only defines `/auth/callback`
2. **Token Handling**: The current callback page only handles the implicit flow (access_token in URL) but doesn't support the PKCE flow (token_hash parameter)
3. **Missing Route**: There's no `/auth/confirm` route in the app

## Solution Overview

We need to:
1. Add support for both verification URL patterns (`/auth/callback` and `/auth/confirm`)
2. Handle both token types (direct tokens AND token_hash + type for OTP verification)
3. Ensure automatic login and seamless transition to the onboarding walkthrough

```
Email Link Clicked
       │
       ▼
┌─────────────────────────────────┐
│  /auth/callback (or /confirm)   │
│  ────────────────────────────── │
│  Check URL parameters:          │
│  • token_hash + type → verifyOtp│
│  • access_token → setSession    │
└─────────────────────────────────┘
       │
       ▼ Session established
       │
┌─────────────────────────────────┐
│  Redirect to /dashboard         │
│  with ?welcome=true             │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Onboarding Tour starts         │
│  automatically for new users    │
└─────────────────────────────────┘
```

## Technical Changes

### 1. Update AuthCallback.tsx
Add support for PKCE token verification:

**Current Logic:**
```typescript
const accessToken = hashParams.get('access_token');
if (accessToken && refreshToken) {
  await supabase.auth.setSession({ access_token, refresh_token });
}
```

**New Logic (Add before the accessToken check):**
```typescript
// Check for PKCE flow (token_hash verification)
const tokenHash = queryParams.get('token_hash');
const type = queryParams.get('type');

if (tokenHash && type === 'email') {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email'
  });
  
  if (error) {
    setStatus('error');
    setErrorMessage(error.message);
    return;
  }
  
  if (data.session) {
    setStatus('success');
    // New user - redirect with welcome flag
    navigate('/dashboard?welcome=true', { replace: true });
    return;
  }
}
```

### 2. Add /auth/confirm Route to App.tsx
Add an alias route that points to the same AuthCallback component:

```typescript
<Route path="/auth/confirm" element={<AuthCallback />} />
```

This ensures both URL patterns work:
- `https://creaiter.lovable.app/auth/callback` (current)
- `https://creaiter.lovable.app/auth/confirm` (Supabase default)

### 3. Update Supabase Dashboard Configuration
**User Action Required**: Configure the Supabase email template to use the correct redirect URL:

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. In the "Confirm signup" template, ensure the confirmation link uses:
   ```
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
   ```
   
   OR (if using the default ConfirmationURL):
   ```
   {{ .ConfirmationURL }}
   ```

3. In **URL Configuration** → **Site URL**, set: `https://creaiter.lovable.app`
4. In **Redirect URLs**, add:
   - `https://creaiter.lovable.app/auth/callback`
   - `https://creaiter.lovable.app/auth/confirm`

### 4. Improve New User Detection in AuthCallback
Currently checking localStorage for tour completion, but for truly new users (fresh device), we should always trigger the tour:

```typescript
// For email verification (always a new signup flow)
// Skip localStorage check since this is email confirmation
const isVerificationFlow = tokenHash || queryParams.get('type') === 'signup';

if (isVerificationFlow) {
  // Always treat as new user for email verification
  navigate('/dashboard?welcome=true', { replace: true });
} else {
  // For OAuth/magic link, check localStorage
  const isNewUser = !localStorage.getItem('creAiter-onboarding-completed');
  navigate(isNewUser ? '/dashboard?welcome=true' : '/dashboard', { replace: true });
}
```

## File Changes Summary

| File | Change |
|------|--------|
| `src/pages/AuthCallback.tsx` | Add `verifyOtp` support for token_hash, improve new user detection |
| `src/App.tsx` | Add `/auth/confirm` route as alias to AuthCallback |

## User Action Required

After implementation, you'll need to:
1. Go to your Supabase Dashboard (link will be provided)
2. Update the Site URL configuration
3. Add redirect URLs to the allowed list
4. Optionally customize the email template

## Expected Flow After Fix

1. **User signs up** → Receives verification email
2. **Clicks email link** → `/auth/callback?token_hash=xxx&type=email`
3. **AuthCallback page** → Shows "Verifying your email..."
4. **verifyOtp succeeds** → Shows "Email verified!"
5. **Auto-redirect** → `/dashboard?welcome=true`
6. **Dashboard loads** → Onboarding tour starts automatically
7. **Tour completes** → Business Setup Form appears
8. **User submits** → Dashboard with background intel processing
