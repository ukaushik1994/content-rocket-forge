

# Remove Home Page — Make AI Chat the Default

## What Changes

The `/dashboard` route and its `Index.tsx` page are removed entirely. The Creaiter logo in the navbar becomes the link to `/ai-chat`. All remaining references to `/dashboard` are updated.

## Files to Modify

### 1. src/App.tsx
- Remove `import Index from "./pages/Index"` (line 8)
- Remove the `/dashboard` route (line 128)
- Add a redirect: `<Route path="/dashboard" element={<Navigate to="/ai-chat" replace />} />` so any old bookmarks still work

### 2. src/components/layout/NavItems.tsx
- Remove the Home `NavItem` from the render (line 204)
- Remove `homeRoute` and `isHomeActive` variables (lines 196-197)
- Remove `Home` from the lucide-react import (line 3) if unused elsewhere

### 3. src/components/layout/Navbar.tsx
- Change the Creaiter logo `Link` destination from `"/"` to `"/ai-chat"` (line 48)
- Same for the mobile menu logo link

### 4. src/components/settings/HelpAndTourSettings.tsx
- Change `navigate('/dashboard?welcome=true')` to `navigate('/ai-chat?welcome=true')` (line 26)

### 5. supabase/functions/enhanced-ai-chat/index.ts
- Change `action: "navigate:/dashboard"` to `action: "navigate:/ai-chat"` (line 2977)

### 6. src/pages/Index.tsx
- Delete this file (no longer routed or needed)

## What Stays
- `/ai-chat` route unchanged — it is now the de facto home for logged-in users
- Auth redirects already point to `/ai-chat` (confirmed in Auth.tsx and AuthCallback.tsx)
- Landing page at `/` stays for non-logged-in visitors

