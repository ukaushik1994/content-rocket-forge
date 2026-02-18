

# Auth Pages — Apple-Inspired Theme Alignment

## Overview

Strip all gradient fills, colored glows, animated shimmer effects, and shadow-heavy styling from the auth pages. Replace with the same flat, transparent, monochrome aesthetic used throughout the rest of the app.

## Files and Changes

### 1. AnimatedBackground.tsx — Simplify to subtle monochrome

**Remove:**
- Purple/blue radial gradients (`rgba(155,135,245,0.15)`, `rgba(59,130,246,0.1)`)
- Colored floating orbs (`from-primary/20 to-blue-500/20`, `from-blue-500/20 to-purple-500/20`)
- Colored floating particles (`bg-primary/60`)

**Replace with:**
- Single neutral radial gradient: `bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.03)_0%,transparent_60%)]`
- Two monochrome orbs using `bg-foreground/5` with `blur-3xl` (keep the gentle breathing animation but no color)
- Remove floating particles entirely (visual noise)

### 2. RocketLogo.tsx — Remove gradient text

**Remove:**
- `bg-gradient-to-r from-primary via-blue-500 to-primary bg-300% bg-clip-text text-transparent animate-gradient-shift` on the "Creaiter" heading

**Replace with:**
- `text-foreground text-2xl font-bold` (plain monochrome)
- Tagline stays as `text-muted-foreground`

### 3. EnhancedAuthForm.tsx — Flatten inputs and buttons

**Header:**
- Title: Remove `bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent` — use `text-foreground`

**Inputs:**
- Remove focus glow: `shadow-lg shadow-primary/10` and `border-primary/60` on focus
- Use flat focus: `border-border/40` default, `focus:border-border/60` on focus, no shadow, no ring color override

**Submit button:**
- Remove `bg-gradient-to-r from-primary to-blue-500` and `shadow-lg shadow-primary/25`
- Replace with `bg-foreground text-background hover:bg-foreground/90` (solid monochrome, same as onboarding Next button)
- Remove `whileHover scale` and `whileTap scale` on wrapper
- Remove Sparkles icon — just show the text

**Google button:**
- Remove `whileHover scale` and `whileTap scale` on wrapper
- Flatten to `bg-transparent border border-border/20 hover:border-border/40 hover:bg-muted/20`

**Divider:**
- Change `border-border/30` to `border-border/10`

**Toggle mode link:**
- Change `text-primary` to `text-foreground` with `underline underline-offset-4`

### 4. Auth.tsx — Flatten container

- Replace `glass-panel` class with `bg-background/90 backdrop-blur-md border border-border/10 rounded-3xl`
- Remove `shadow-2xl`
- Keep the fade-in animation (subtle, functional)

### 5. CheckEmail.tsx — Same treatment

- Replace `glass-panel` class with `bg-background/90 backdrop-blur-md border border-border/10 rounded-3xl`
- Remove `shadow-2xl`
- Back link: Change `text-white/80 hover:text-white` to `text-muted-foreground hover:text-foreground`
- Mail icon container: Change `bg-primary/20` to `bg-transparent border border-border/20`; icon from `text-primary` to `text-muted-foreground`
- Heading: Change `text-white` to `text-foreground`
- Body text: Change `text-white/80` to `text-muted-foreground`
- Footer text: Change `text-white/60` to `text-muted-foreground/60`
- "Try signing up again" link: Change `text-primary` to `text-foreground underline`

### 6. AuthCallback.tsx — Flatten callback page

- Background: Change `bg-gradient-to-br from-background via-background to-primary/5` to plain `bg-background`
- Logo: Change `bg-gradient-to-br from-primary to-primary/80 shadow-lg` to `bg-transparent border border-border/20`; Rocket icon to `text-muted-foreground`
- Card: Change `bg-card shadow-xl border-border/50` to `bg-background/90 backdrop-blur-md border border-border/10`; remove `shadow-xl`
- Spinner: Change `text-primary` to `text-muted-foreground`
- Success icon: Keep `text-green-500` (semantic color is fine for success)
- Error buttons: Primary button becomes `bg-foreground text-background`; outline button becomes `bg-transparent border border-border/20`
- All redirects: Change `/dashboard` to `/ai-chat` (from previously approved plan)

## Summary of Removals
- All `bg-gradient-to-r` and `bg-gradient-to-br` color fills
- All `shadow-lg`, `shadow-xl`, `shadow-2xl`
- All `shadow-primary/*` colored shadows
- All `text-primary` accent colors (replaced with `text-foreground` or `text-muted-foreground`)
- All `whileHover/whileTap scale` bounce animations
- `animate-gradient-shift` on logo
- `glass-panel` class usage (replaced with explicit transparent styling)
- Floating particles in background
- Sparkles icon on submit button

