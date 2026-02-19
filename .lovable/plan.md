

# Landing Page — Complete Storytelling Redesign

## Problem with Current State
The landing page looks like a standard SaaS template: boxed cards, bullet lists, small mock UIs. It lacks visual drama, narrative flow, and the premium "Apple keynote" feeling. The AI Chat positioning is present but not emotionally compelling.

## The New Narrative Arc

The story across the entire site is: **"Just tell your AI. It handles everything."**

Each page follows a cinematic scroll journey where the visitor *experiences* the product through animated mock conversations, not just reads about features.

---

## Architecture (unchanged routes)

- `/` — Gateway landing (complete rewrite)
- `/features/content` — Content storytelling (complete rewrite)
- `/features/marketing` — Marketing storytelling (complete rewrite)
- `/features/audience` — Audience storytelling (complete rewrite)
- `/features/analytics` — Analytics storytelling (complete rewrite)

---

## Phase 1: Complete Rewrite of Landing Gateway (`/`)

### Section 1 — Cinematic Hero (full viewport)

**No badge. No cards. Just impact.**

- Large centered headline in `text-6xl lg:text-8xl`:
  - Line 1: "Just tell your AI."
  - Line 2: (gradient `from-primary via-neon-blue to-neon-pink`): "It handles everything."
- Below: a single-line subtitle in `text-xl text-muted-foreground`
- Below: An animated **AI Chat conversation** that auto-types in real-time:
  - A glassmorphic chat window (`bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl`) taking ~60% width
  - Shows a user message typing: "Create a blog post about sustainable fashion, generate hero images, and schedule it across all platforms"
  - Then an AI response appears with typing animation: "Done. I've written a 2,400-word SEO-optimized post, generated 4 hero images, and scheduled it on LinkedIn, Twitter, and Instagram for optimal engagement times."
  - Below the AI response: small action chips appear (View Post, See Images, Edit Schedule) in category colors
- Two CTAs below the chat: "Start Free" (gradient) + "Watch Demo" (outline)
- Background: Two large abstract gradient orbs (`blur-[180px]`) — one purple-blue top-left, one pink-orange bottom-right

### Section 2 — "What can you ask?" (Scrolling Showcase)

**Not a grid of cards. A flowing sequence of AI conversations.**

4 cinematic panels, each taking near-full viewport, staggered with `whileInView` animations. Each panel shows a different AI conversation with a rich mock UI response.

**Panel 1 — Content (Purple)**
- Left side: Large text `text-5xl`: "Write. Design. Produce."
- Smaller description about AI Writer, Image Gen, Video Gen
- Right side: Glassmorphic mock showing an AI chat where user says "Write me a product launch post" and AI responds with a content preview (editor mockup with typing animation, image thumbnails, SEO score badge)
- Bottom: "Explore Content" link with arrow

**Panel 2 — Marketing (Pink)**
- Right side text (alternating): `text-5xl`: "Send. Publish. Automate."
- Left side: Mock AI chat showing user asking "Launch my spring campaign" and AI responding with email preview, social calendar, and automation workflow nodes
- Bottom: "Explore Marketing" link

**Panel 3 — Audience (Blue)**
- Left side text: `text-5xl`: "Know. Segment. Engage."
- Right side: Mock AI chat showing user asking "Who are my most engaged contacts?" and AI responding with a contact card, segment visualization, engagement score ring
- Bottom: "Explore Audience" link

**Panel 4 — Analytics (Orange)**
- Right side text: `text-5xl`: "Track. Learn. Grow."
- Left side: Mock AI chat showing user asking "How did last month perform?" and AI responding with mini dashboard (stat cards + chart + AI insight)
- Bottom: "Explore Analytics" link

Each panel:
- Full-bleed category-colored gradient orb in the background (`opacity-20 blur-[160px]`)
- The mock chat window has a subtle glow behind it matching the category color
- `whileInView` fade-up animation with stagger
- macOS-style window dots on mock UIs

### Section 3 — "Or take full control" (Manual tools strip)

A single horizontal row showing 6-8 tool icons in glassmorphic circles with labels: AI Writer, Image Gen, Email Builder, Social Calendar, CRM, Analytics, Strategy Coach, Keyword Research. Scrollable on mobile. Reinforces that manual control exists alongside AI Chat.

### Section 4 — AI Intelligence Showcase (kept, existing component)

### Section 5 — Comparison Table (kept, existing component)

### Section 6 — Investor Section (kept, existing component)

### Section 7 — Footer (kept)

---

## Phase 2: Rewrite Feature Pages

Each feature page follows the same cinematic pattern but goes deeper.

### Shared Layout for All Feature Pages

1. **Hero** — Full viewport. Category-colored gradient orbs. Large headline + subtitle. AI Chat primary CTA + category secondary CTA.
2. **3-5 Feature Deep-Dives** — Each is a near-full-viewport section with alternating left/right layout. Each features:
   - `text-4xl lg:text-6xl` headline
   - Rich description paragraph
   - A **large** glassmorphic mock UI (not a small card — takes 50-60% of the section width)
   - Feature chips below the mock UI
   - Smooth `whileInView` entrance animations
3. **AI Chat CTA Banner** — Every page ends with: "Or just tell your AI" + mock chat bubble + dual CTA

### Content Page (`/features/content`) — Purple

Hero headline: "Create Anything. Text. Images. Video."

Deep-dives:
1. **AI Writer** — Mock content editor with live typing, SERP score, word count, competitor analysis sidebar
2. **Image Generation** — Mock showing prompt bar, 4-image grid with gradient placeholders, style selector pills
3. **Video Generation** — Mock with video player (progress bar animation), resolution/duration badges
4. **Keyword Research** — Mock SERP results table with volume bars, difficulty indicators
5. **Content Strategy** — Mock calendar pipeline + AI Strategy Coach highlight

### Marketing Page (`/features/marketing`) — Pink

Hero headline: "Marketing that runs while you sleep."

Deep-dives:
1. **Email Campaigns** — Mock email builder with subject line AI, send time optimizer, A/B badge
2. **Social Publishing** — Mock social calendar with platform icons, scheduled post previews
3. **Automations** — Mock visual workflow builder with SVG node connections, trigger/action cards
4. **Customer Journeys** — Mock journey map with branching paths and conversion tracking

### Audience Page (`/features/audience`) — Blue

Hero headline: "Know every contact. Reach the right ones."

Deep-dives:
1. **Contact CRM** — Mock contact profile card with engagement score ring, activity timeline
2. **Smart Segments** — Mock rule builder with conditions, AI suggestion badge, segment counter
3. **Activity Feed** — Mock real-time timeline with event icons and timestamps

### Analytics Page (`/features/analytics`) — Orange

Hero headline: "Data-driven decisions. Not guesswork."

Deep-dives:
1. **Performance Dashboards** — Mock full dashboard with stat cards, area chart, bar chart
2. **Content Insights** — Mock performance table with scores, trend arrows, AI recommendations
3. **ROI Tracking** — Mock attribution funnel visualization

---

## Phase 3: Update Shared Components

### Rewrite `FeaturePageHero.tsx`
- Add abstract gradient orbs to background
- Keep the dual CTA pattern (already exists)
- Ensure `text-5xl lg:text-8xl` headline sizing

### Rewrite `FeatureSection.tsx`
- Make mock UI container LARGER (min-h-[400px])
- Add stronger category-colored glow behind the mock (`blur-3xl opacity-20`)
- Add feature chips display (using existing `FeatureChip.tsx`)
- Ensure alternating direction works cleanly

### Rewrite `AIChatCTA.tsx`
- Make it more cinematic — larger chat bubble mock with typing animation
- Stronger gradient glow
- Dual CTA buttons

### New: `ConversationPanel.tsx` — for the gateway page
- Props: headline, description, chatMessages[], mockUI, accentColor, direction, learnMoreRoute
- Renders the full-viewport alternating panel with AI conversation mock
- Used 4 times on the gateway landing page

### New: `AnimatedChatWindow.tsx` — for the hero
- Self-contained animated chat that auto-types user message and AI response
- Glassmorphic container with macOS dots
- Configurable messages and timing
- Action chips appear after AI response

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Landing.tsx` | **Full rewrite** — new cinematic gateway |
| `src/components/landing/LandingHero.tsx` | **Full rewrite** — cinematic hero with animated chat |
| `src/components/landing/CategoryTeaser.tsx` | **Remove** (replaced by ConversationPanel) |
| `src/components/landing/ConversationPanel.tsx` | **New** — full-viewport AI conversation showcase |
| `src/components/landing/AnimatedChatWindow.tsx` | **New** — typing animation chat component |
| `src/components/landing/ManualToolsStrip.tsx` | **New** — horizontal tools showcase |
| `src/components/landing/shared/FeaturePageHero.tsx` | **Rewrite** — larger, more cinematic |
| `src/components/landing/shared/FeatureSection.tsx` | **Rewrite** — bigger mock UIs, stronger glows |
| `src/components/landing/shared/AIChatCTA.tsx` | **Rewrite** — animated chat bubble |
| `src/pages/features/ContentPage.tsx` | **Rewrite** — richer mock UIs, more cinematic sections |
| `src/pages/features/MarketingPage.tsx` | **Rewrite** — richer mock UIs |
| `src/pages/features/AudiencePage.tsx` | **Rewrite** — richer mock UIs |
| `src/pages/features/AnalyticsPage.tsx` | **Rewrite** — richer mock UIs |

**Kept unchanged:** LandingNavbar, AIIntelligenceShowcase, ComparisonTable, InvestorSection, LandingFooter, AnimatedBackground, App.tsx routes

---

## Visual Design Standards

- **Full-viewport sections** with generous breathing room (`py-32 md:py-48`)
- **Headlines**: `text-5xl lg:text-7xl xl:text-8xl`, tight leading
- **Abstract gradient orbs**: 2 per section, `w-[500px] h-[500px] blur-[180px] opacity-20`, category-colored
- **Mock UI containers**: `bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl` with macOS dots, min 400px tall
- **Category color glow behind mocks**: `absolute -inset-8 blur-3xl opacity-15` using category color
- **Animations**: `whileInView` with `opacity: 0, y: 40` to `opacity: 1, y: 0`, staggered children
- **No boxed card grids** — everything flows as full-width alternating sections
- **Colors**: Purple (Content), Pink (Marketing), Blue (Audience), Orange (Analytics) — vibrant throughout
- **AI Chat is always the hero**: Every section shows the product through the lens of an AI conversation

---

## Implementation Order

1. `AnimatedChatWindow.tsx` + `ConversationPanel.tsx` (new shared components)
2. `LandingHero.tsx` (full rewrite with animated chat)
3. `ManualToolsStrip.tsx` (new)
4. `Landing.tsx` (full rewrite using new components)
5. `FeaturePageHero.tsx` + `FeatureSection.tsx` + `AIChatCTA.tsx` (rewrites)
6. `ContentPage.tsx` (rewrite with richer mocks)
7. `MarketingPage.tsx` (rewrite)
8. `AudiencePage.tsx` (rewrite)
9. `AnalyticsPage.tsx` (rewrite)
10. Remove `CategoryTeaser.tsx`

