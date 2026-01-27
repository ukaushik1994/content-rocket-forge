

# Google Sign-In / Sign-Up / Login Integration

## What I'll Build

Adding a "Continue with Google" button to your authentication flow that allows users to sign up OR sign in with their Google account - all in one click.

---

## How It Will Look

```
+------------------------------------------+
|              [Rocket Logo]               |
|                                          |
|  Welcome Back / Start Your Journey       |
|                                          |
|  [Email input]                           |
|  [Password input]                        |
|  [Launch Dashboard / Create Account]     |
|                                          |
|  ─────────── or continue with ─────────  |
|                                          |
|  [G]  Continue with Google               |  ← NEW BUTTON
|                                          |
|  Don't have an account? Create one       |
+------------------------------------------+
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/AuthContext.tsx` | Add `signInWithGoogle()` method |
| `src/components/auth/EnhancedAuthForm.tsx` | Add Google button with proper styling |
| `src/pages/Auth.tsx` | Add Google sign-in handler |

---

## Technical Details

### 1. AuthContext - Add Google OAuth Method

Add to the context interface and implementation:

```typescript
signInWithGoogle: () => Promise<{ error: AuthError | null }>

// Implementation:
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUrl('/auth/callback'),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  return { error };
};
```

### 2. EnhancedAuthForm - Add Google Button

- New props: `onGoogleSignIn`, `isGoogleLoading`
- Google button with official "G" logo (inline SVG)
- Proper styling matching the glassmorphism design
- Loading state support

### 3. Auth.tsx - Wire Up Handler

```typescript
const [isGoogleLoading, setIsGoogleLoading] = useState(false);

const handleGoogleSignIn = async () => {
  setIsGoogleLoading(true);
  const { error } = await signInWithGoogle();
  if (error) {
    toast.error(error.message);
    setIsGoogleLoading(false);
  }
  // Page redirects to Google - no need to reset loading
};
```

### 4. AuthCallback - Already Ready!

The existing callback component already handles OAuth tokens correctly. No changes needed.

---

## Google Button Design

- White background with subtle border (matching Google branding guidelines)
- Official Google "G" multicolor logo
- Hover: slight elevation increase
- Loading: spinner replaces text
- Disabled state when form is submitting

---

## User Flow

```
User clicks "Continue with Google"
         ↓
Browser redirects to Google login
         ↓
User selects/enters Google account
         ↓
Google redirects to Supabase callback
         ↓
Supabase redirects to /auth/callback
         ↓
AuthCallback processes tokens
         ↓
User lands on /dashboard ✓
```

---

## Manual Configuration Required (After Code Deploy)

### Step 1: Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth credentials:
   - **Type**: Web application
   - **Authorized JavaScript origins**:
     - `https://creaiter.lovable.app`
   - **Authorized redirect URIs**:
     - `https://iqiundzzcepmuykcnfbc.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret

### Step 2: Supabase Dashboard

1. Go to **Authentication → Providers → Google**
2. Enable Google provider
3. Paste your Client ID and Client Secret
4. Save

---

## Summary

This adds seamless Google authentication - users can sign up OR sign in with one click. New users get an account created automatically, existing users are logged in. The button matches your current design language and the callback infrastructure is already in place.

