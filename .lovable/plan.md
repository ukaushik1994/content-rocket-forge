
# Onboarding Carousel — Complete Rebuild with Apple-Inspired Theme

## Why Rebuild

The current onboarding uses the old visual language heavily: animated gradient borders (`GradientBorder`), neon-purple/neon-blue color schemes, gradient-filled icon badges, shimmer effects, pulsing glow rings, `bg-slate-900/60`, and colored `bg-gradient-to-br` overlays. It also lacks coverage for the Engage, Audience, Glossary, and Enterprise modules added since the original 8-step design. A patch would be messier than a clean rewrite.

## New Step Structure (10 Steps)

The tour will be reorganized to match the current navigation structure:

| # | Title | Subtitle | Route | Key Benefits |
|---|-------|----------|-------|--------------|
| 1 | Welcome to Creaiter | The Self-Learning Content Engine | — | AI learns your style, Data-driven, End-to-end workflow, Continuous optimization |
| 2 | Content Creation Suite | Builder, Repository, Approvals, Keywords | /content-type-selection | 5-step AI writing, Version control, Team approvals, Quality scoring |
| 3 | Research and Strategy | SERP Intelligence, Content Strategy, Calendar | /research/content-strategy | Live SERP analysis, AI proposals, Editorial calendar, Topic clusters |
| 4 | Campaigns | Strategy, Generation, Execution | /campaigns | Strategy selection, Batch generation, Queue tracking, Solution branding |
| 5 | Email Marketing | Compose, Automate, Deliver | /engage/email | AI-powered copy, Template library, Scheduling, Performance tracking |
| 6 | Social Media | Create, Schedule, Analyze | /engage/social | Multi-channel posting, Content calendar, Engagement analytics, Auto-scheduling |
| 7 | Audience Management | Contacts, Segments, Activity | /engage/contacts | Contact database, Smart segments, Activity tracking, Behavioral insights |
| 8 | Analytics and Performance | Metrics, GA4, Search Console | /analytics | GA4 integration, Search Console, Content metrics, ROI tracking |
| 9 | AI Strategy Coach | Chat, Charts, Insights | /ai-chat | Natural language, Live charts, Campaign status, Smart suggestions |
| 10 | Integrations and Settings | Publishing, Analytics, AI Providers | /ai-settings | WordPress and Wix, GA4 and GSC, Multi-AI support, Slack alerts |

## Visual Theme Changes

### GradientBorder.tsx — Flatten completely
- Remove animated gradient border (`bg-gradient-to-r from-neon-purple via-neon-blue`)
- Remove outer glow blur
- Replace with `bg-background/90 backdrop-blur-md border border-border/10 rounded-3xl` — same as the rest of the app

### OnboardingCarousel.tsx — Clean container and controls
- **Backdrop**: Keep `bg-black/85 backdrop-blur-xl` (functional)
- **Header**: Replace `bg-slate-900/50` with `bg-transparent border-b border-border/10`
- **Logo icon**: Remove animated boxShadow glow and gradient fill — use `bg-transparent border border-border/20` with `text-muted-foreground` Sparkles icon
- **Step badge**: Remove `bg-gradient-to-r from-white/10` — use `bg-transparent border border-border/20` with `text-muted-foreground`
- **Progress segments**: Replace neon gradients with `bg-foreground` (completed) and `bg-muted-foreground/40` (current fill) and `bg-border/20` (empty)
- **Footer**: Replace `bg-slate-900/50` with `bg-transparent border-t border-border/10`
- **Segmented progress bar**: Replace colored gradients with `bg-foreground` (done) and `bg-muted-foreground/40` (current)
- **Step dots**: Replace neon gradients and pulse animations with `bg-foreground` (active/completed) and `bg-border/30` (empty) — no pulse
- **Next button**: Remove gradient background, shimmer, and glow — use `bg-foreground text-background` (solid, monochrome)
- **Previous/Skip**: Keep ghost style, use `border-border/20` and `text-muted-foreground`
- **Content area**: Replace `bg-slate-950/80` with `bg-transparent`

### OnboardingStep.tsx — Flat content layout
- **Illustration panel**: Remove multi-layer gradient backgrounds, animated colored overlays, grid patterns, radial glows, animated border glow, and corner accents — use `bg-transparent border border-border/20 rounded-2xl`
- **Icon badge**: Remove gradient fill, outer glow ring, and inner shine — use `bg-transparent border border-border/20 rounded-xl` with `text-muted-foreground` icon
- **Subtitle**: Remove gradient text clip — use `text-muted-foreground text-sm font-medium uppercase tracking-widest`
- **Title**: Keep `text-foreground` (already clean)
- **Description**: Keep `text-muted-foreground` (already clean)
- **Benefits checkmarks**: Remove green gradient circles and celebration burst animation — use `bg-transparent border border-border/20 rounded-full` with `text-foreground` Check icon
- **Pro Tip callout**: Remove amber gradient background — use `bg-transparent border border-border/20` with `text-muted-foreground` Lightbulb icon
- **Action button**: Remove gradient fill, shimmer, and glow — use `bg-foreground text-background rounded-xl` (solid monochrome button)

### getStepConfigs — Update data
- Update from 8 to 10 steps with new titles, descriptions, benefits, routes
- Remove `gradient` property from all steps (no longer used)
- Keep existing illustrations for steps that map 1:1; reuse closest illustration for new steps (Email reuses Campaign, Social reuses Campaign, Audience reuses Integrations)

### Illustrations — Keep as-is
The SVG illustrations inside the illustration panel are self-contained. They will render fine on the new transparent background. No changes needed to illustration files themselves.

## Files Changed

| File | What |
|---|---|
| `OnboardingCarousel.tsx` | Full rewrite: 10 steps, flat header/footer/controls, remove all neon/gradient/glow styling |
| `OnboardingStep.tsx` | Full rewrite: flat illustration panel, monochrome icon badge, remove gradients and animations |
| `ui/GradientBorder.tsx` | Strip to a simple transparent bordered container |

## What Gets Removed
- All `neon-purple`, `neon-blue` gradient references
- All `animate-gradient-shift`, shimmer animations, glow effects
- All `boxShadow` animated pulsing
- Colored progress bar gradients (replaced with monochrome)
- Celebration burst animation on benefit checkmarks
- Corner accent decorative borders on illustration panel
- Grid pattern overlay on illustration background
- Radial glow overlay
- `gradient` property from step configs

## What Stays
- Auto-advance timer logic (10s)
- Pause on hover behavior
- Keyboard-accessible dot navigation
- AnimatePresence step transitions (fade/slide)
- BusinessSetupForm integration
- All routing and action handling
- All illustrations (unchanged)
- Skip/Previous/Next flow
- OnboardingContext integration
