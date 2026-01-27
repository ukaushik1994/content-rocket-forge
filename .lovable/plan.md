

# Fix Email Confirmation Flow - Redirect to Production URL

## Problem Analysis

When you create a new account, two things are broken:

### Issue 1: Confirmation Link Goes to Localhost
The confirmation email contains a link like `http://localhost:3000/auth/callback?token=...` instead of `https://creaiter.lovable.app/auth/callback?token=...`

**Root Cause:** The code uses `window.location.origin` which evaluates to whatever environment you're running the signup from:
```typescript
// src/contexts/AuthContext.tsx line 96
emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`
```

If you were testing locally, this captured `http://localhost:3000` as the redirect URL.

### Issue 2: Missing `/auth/callback` Route
Even if the redirect worked, there's no route handler for `/auth/callback` to process the token and complete verification.

### Issue 3: Poor Email Content
The confirmation email uses Supabase's default template which is generic and not branded.

---

## Solution Overview

| Fix | Description | Location |
|-----|-------------|----------|
| 1. Production URL | Use your published URL for all auth redirects | `AuthContext.tsx` |
| 2. Auth Callback Route | Create callback handler + add route | New file + `App.tsx` |
| 3. Email Template | Improve branding in Supabase Dashboard | Dashboard config |

---

## Technical Implementation

### 1. Fix Redirect URLs in AuthContext.tsx

Replace `window.location.origin` with the production URL:

**Current Code:**
```typescript
emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`
```

**Fixed Code:**
```typescript
// Use production URL for auth redirects to ensure email links work correctly
const getAuthRedirectUrl = (path: string) => {
  // Production URL - always use this for auth emails
  const productionUrl = 'https://creaiter.lovable.app';
  return `${productionUrl}${path}`;
};

// In signUp:
emailRedirectTo: redirectTo || getAuthRedirectUrl('/auth/callback')

// In resetPassword:
redirectTo: getAuthRedirectUrl('/auth/reset-password')
```

### 2. Create AuthCallback Component

New file: `src/pages/AuthCallback.tsx`

This component will:
- Detect that Supabase has appended tokens to the URL
- Let the Supabase client automatically exchange the tokens (via `detectSessionInUrl: true`)
- Show a loading state while processing
- Redirect to dashboard on success, or show error

```typescript
// Key behavior:
1. On mount, check if URL has auth tokens
2. Wait for onAuthStateChange to fire 'SIGNED_IN' event
3. Redirect to /dashboard on success
4. Show error message if verification fails
5. Timeout after 10 seconds and show manual instructions
```

### 3. Add Route in App.tsx

Add new route for the callback:

```typescript
import AuthCallback from "./pages/AuthCallback";

// Add in Routes:
<Route path="/auth/callback" element={<AuthCallback />} />
```

### 4. Update Supabase Dashboard (Manual Step Required)

You'll need to configure two things in the Supabase Dashboard:

**A. Site URL & Redirect URLs:**
1. Go to: https://supabase.com/dashboard/project/iqiundzzcepmuykcnfbc/auth/url-configuration
2. Set **Site URL** to: `https://creaiter.lovable.app`
3. Add to **Redirect URLs**: 
   - `https://creaiter.lovable.app/auth/callback`
   - `https://creaiter.lovable.app/auth/reset-password`
   - `https://id-preview--ae13b72c-00ff-4e50-bd02-cd9edb6bbaf5.lovable.app/auth/callback` (for preview)

**B. Email Template (Confirmation Email):**
1. Go to: https://supabase.com/dashboard/project/iqiundzzcepmuykcnfbc/auth/templates
2. Select "Confirm signup" template
3. Update with branded content:

```html
<h2>Welcome to CreAIter! 🚀</h2>

<p>Thanks for signing up! Please confirm your email address to activate your account.</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Confirm Your Email</a></p>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>— The CreAIter Team</p>
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/AuthCallback.tsx` | **Create** | Handles email verification callback |
| `src/contexts/AuthContext.tsx` | **Modify** | Use production URL for redirects |
| `src/App.tsx` | **Modify** | Add `/auth/callback` route |

---

## Complete AuthCallback Component Design

```text
┌─────────────────────────────────────────────────┐
│              [Animated Background]              │
├─────────────────────────────────────────────────┤
│                                                 │
│                  [Rocket Logo]                  │
│                                                 │
│              ┌───────────────┐                  │
│              │   Spinner     │                  │
│              └───────────────┘                  │
│                                                 │
│         "Verifying your email..."               │
│                                                 │
│    (On success → redirect to /dashboard)        │
│    (On failure → show error + retry link)       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Testing Checklist

After implementation:
- [ ] Sign up with a new email
- [ ] Check that confirmation email has `creaiter.lovable.app` URL (not localhost)
- [ ] Click confirmation link
- [ ] Should land on `/auth/callback` → show loading → redirect to `/dashboard`
- [ ] User should be logged in with email verified

---

## Summary

The localhost redirect happens because the code captures the current browser URL when you trigger signup. By hardcoding the production URL for auth emails, all confirmation links will correctly point to your live site regardless of where the signup was initiated.

