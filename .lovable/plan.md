

# Landing Page Visual Polish — Implementation

## What's Being Done

The previously approved landing page cleanup that was never executed. This covers branding cleanup and content improvements across 5 files.

## Changes

### 1. Remove "Investors" from Navbar
**File: `src/components/landing/LandingNavbar.tsx` (line 29)**
- Delete the `{ name: 'Investors', href: '/', isRoute: false, anchor: '#investors' }` entry from the `navItems` array

### 2. Remove InvestorSection from Landing Page
**File: `src/pages/Landing.tsx`**
- Remove the import of `InvestorSection` (line 10)
- Remove the `<section id="investors">` block (lines 239-241)

### 3. Clean Hero Text
**File: `src/components/landing/LandingHero.tsx`**
- Line 45: Change "Just tell your AI." to "Just tell Creaiter."
- Line 64 (subtitle area): Change "all from one AI conversation" style wording to "all from one conversation"

### 4. Clean ManualToolsStrip Labels
**File: `src/components/landing/ManualToolsStrip.tsx`**
- Line 8: "AI Writer" becomes "Writer"
- Line 32: "no AI required" becomes "always at your fingertips"

### 5. Clean Chat Window Branding
**File: `src/components/landing/AnimatedChatWindow.tsx`**
- Remove `Sparkles` icon from the AI avatar — replace with a simple gradient circle
- Remove any "creaiter.ai" label from the macOS title bar if present

### 6. Update Panel Descriptions
**File: `src/pages/Landing.tsx`**
- Content (line 189): "Writing, image generation, and video creation -- learning your brand voice with every piece."
- Marketing (line 200): "Email campaigns, social publishing, and automations -- learning what converts."
- Audience (line 211): "Unified profiles, smart segments, and real-time activity -- your audience, completely understood."
- Analytics (line 222): "Performance dashboards, insights, and ROI tracking that connect content to revenue."

## Technical Notes

- Pure text/import changes -- no new dependencies or components
- The `InvestorSection.tsx` file itself stays in the codebase (unused) to avoid accidental breakage elsewhere; it simply won't be rendered
- All changes are cosmetic/copy -- zero risk to functionality

