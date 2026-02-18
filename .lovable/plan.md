

# Landing Page Redesign — Separate Storytelling Pages per Category

## The Big Idea

Transform the landing experience from a single scrolling page into an Apple-style multi-page product showcase. Each category (Content, Marketing, Audience, Analytics) becomes its own dedicated route with cinematic storytelling, large typography, gradient art, and rich animated mock UIs. The hero landing page becomes a gateway that teases all categories and routes visitors into each story.

The narrative thread: **"Your AI that creates, publishes, and grows your audience — while you sleep."**

---

## New Route Structure

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing (gateway hero) | Teaser of all categories, funnels visitors into each |
| `/features/content` | Content page | Deep storytelling for AI writing, image gen, video gen, SERP, strategy |
| `/features/marketing` | Marketing page | Email, social, automations, journeys — full narrative |
| `/features/audience` | Audience page | CRM, segments, activity feed storytelling |
| `/features/analytics` | Analytics page | Dashboards, insights, ROI tracking |
| Existing | `/auth`, investors, comparison | Stay as-is |

---

## Phase 1: Redesign the Landing Gateway (`/`)

The landing page becomes shorter and more cinematic — its job is to hook visitors and route them into category pages.

**Structure:**
1. **Hero** — Keep the headline "One Conversation. Every Content Operation." but make the AI Chat command card larger and more immersive. Add a typing animation simulating a real AI conversation.
2. **Category Teaser Grid** — Replace the current small 4-card grid with 4 large, full-width alternating sections (left-right layout like Apple's product pages). Each section:
   - Full-bleed background with category-colored gradient glow
   - Large headline (e.g., "Create anything. Text. Images. Video.")
   - 2-3 line description
   - A glassmorphic mock UI preview (smaller version of what's on the full page)
   - "Learn more" link that routes to `/features/content` etc.
   - These are NOT deep — they're teasers. The real story is on the dedicated page.
3. **AI Intelligence Showcase** — Keep (refined)
4. **Comparison Table** — Keep
5. **Investor Section** — Keep
6. **Footer** — Keep

---

## Phase 2: Update Navbar

The navbar links change behavior:
- **Content**, **Marketing**, **Audience**, **Analytics** now navigate to their dedicated routes (`/features/content`, etc.) instead of scrolling to anchors
- **Platform** scrolls to hero on the landing page
- **Investors** scrolls to investor section on landing page
- Each category page gets the same navbar, but with a "Back to Home" behavior for the logo click
- Active nav item highlights based on current route

---

## Phase 3: Create `/features/content` — Content Storytelling Page

**Color: Purple (primary)**

This page is a full cinematic journey through the Content suite. Each section is full-viewport or near-full, with large text and rich visuals.

**Section 1 — Hero (full viewport)**
- Large headline: "Create Anything. Text. Images. Video." with gradient text
- Subtitle: "Your AI writes, designs, and produces — learning your voice with every piece"
- Background: Large abstract gradient orb (purple to blue, blurred)
- CTA: "Start a conversation" (primary) + "Explore content tools" (secondary outline)

**Section 2 — AI Writer (alternating layout: text left, mock UI right)**
- Headline: "Writing that outranks. Automatically."
- Description about SERP-powered writing, competitor analysis, tone learning
- Mock UI: Glassmorphic content editor with typing animation, SERP score badge, word count
- Feature chips below: "SERP Analysis", "Competitor Research", "Tone Matching", "Auto-Optimization"

**Section 3 — Image Generation (text right, mock UI left)**
- Headline: "From prompt to production-ready visuals"
- Description about AI image generation, inpainting, variations, upscaling
- Mock UI: Image generation interface showing a prompt input, 4 generated image thumbnails in a grid, style selector
- Feature chips: "Text-to-Image", "Inpainting", "Upscaling", "Style Transfer"

**Section 4 — Video Generation (text left, mock UI right)**
- Headline: "Video content, without the production team"
- Description about text-to-video, Runway ML, Kling AI integrations
- Mock UI: Video timeline preview with play button, duration badge, resolution selector

**Section 5 — Keyword Research + Strategy (full-width)**
- Split into two glassmorphic cards side by side
- Left card: Keyword Research with mock SERP results table
- Right card: Content Strategy with mock calendar/pipeline view
- Bottom: "AI Strategy Coach" highlight with Brain icon

**Section 6 — AI Chat CTA (full-width glassmorphic banner)**
- "Or just tell your AI what you need" + mock chat bubble showing "Write me a blog post about..."
- Primary CTA: "Start a conversation" + Secondary: "Explore all content tools"

---

## Phase 4: Create `/features/marketing` — Marketing Storytelling Page

**Color: Pink (neon-pink)**

**Section 1 — Hero**
- Headline: "Marketing that publishes, sends, and follows up — while you sleep"
- Gradient orb: pink to purple
- CTAs: AI Chat primary + "Explore marketing tools" secondary

**Section 2 — Email Campaigns (alternating layout)**
- Headline: "Emails that write themselves and send at the perfect time"
- Mock UI: Email builder with drag-and-drop blocks, subject line AI suggestion, send time optimizer
- Feature chips: "AI Subject Lines", "Visual Builder", "Send Time AI", "A/B Testing"

**Section 3 — Social Publishing**
- Headline: "One dashboard. Every platform. AI captions included."
- Mock UI: Social calendar with multi-platform post previews (icons for Twitter, LinkedIn, Instagram), schedule grid
- Feature chips: "Multi-Platform", "AI Captions", "Scheduling", "Analytics"

**Section 4 — Automations + Journeys (full-width)**
- Headline: "Build workflows that run your marketing on autopilot"
- Mock UI: Visual workflow builder with nodes and connections (using simple SVG paths), trigger/action cards
- Feature chips: "Visual Builder", "Smart Triggers", "A/B Paths", "Conversion Tracking"

**Section 5 — AI Chat CTA banner**

---

## Phase 5: Create `/features/audience` — Audience Storytelling Page

**Color: Blue (neon-blue)**

**Section 1 — Hero**
- Headline: "Know every contact. Reach the right ones. Automatically."
- Gradient orb: blue to purple

**Section 2 — Contact CRM**
- Headline: "Every interaction, one unified profile"
- Mock UI: Contact card with engagement score ring, activity timeline, tags, custom fields

**Section 3 — Smart Segments**
- Headline: "Segments that build themselves with AI"
- Mock UI: Rule builder with conditions (dropdowns, toggles), segment size counter, AI suggestion badge

**Section 4 — Activity Feed**
- Headline: "See what your audience does, in real time"
- Mock UI: Live activity timeline with event icons (email opened, link clicked, page visited)

**Section 5 — AI Chat CTA banner**

---

## Phase 6: Create `/features/analytics` — Analytics Storytelling Page

**Color: Orange (neon-orange)**

**Section 1 — Hero**
- Headline: "Data-driven decisions. Not guesswork."
- Gradient orb: orange to pink

**Section 2 — Performance Dashboards**
- Mock UI: Full dashboard with stat cards, area chart, bar chart (using simple styled divs or small Recharts)

**Section 3 — Content Insights**
- Headline: "AI tells you what's working and what to fix"
- Mock UI: Content performance table with scores, recommendations, trend arrows

**Section 4 — ROI Tracking**
- Headline: "Connect content to business outcomes"
- Mock UI: Attribution funnel visualization

**Section 5 — AI Chat CTA banner**

---

## Phase 7: Shared Components

### `FeaturePageHero` — Reusable hero for all 4 category pages
- Props: headline, subtitle, gradient colors, badge text, badge icon
- Full-viewport centered layout with abstract gradient orb background
- Dual CTA: AI Chat primary + category secondary

### `FeatureSection` — Reusable alternating section
- Props: headline, description, features[], mockUI (React node), direction (left/right), color
- Handles the left-text-right-visual / right-text-left-visual alternation
- Glassmorphic container for mock UI with colored glow behind it

### `AIChatCTA` — Reusable bottom banner for every page
- Glassmorphic full-width card with chat bubble mock
- "Start a conversation" primary + "Explore [category] tools" secondary
- Category color accent

### `FeatureChip` — Small pill showing a feature name
- `bg-{color}/10 border border-{color}/20 text-{color} rounded-full px-3 py-1 text-xs`

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Landing.tsx` | Modify — shorter gateway with category teasers |
| `src/components/landing/LandingHero.tsx` | Modify — add typing animation to AI chat card |
| `src/components/landing/LandingNavbar.tsx` | Modify — nav items route to `/features/*` |
| `src/components/landing/ContentShowcase.tsx` | Remove (replaced by full page) |
| `src/components/landing/MarketingShowcase.tsx` | Remove (replaced by full page) |
| `src/components/landing/AudienceShowcase.tsx` | Remove (replaced by full page) |
| `src/components/landing/AnalyticsShowcase.tsx` | Remove (replaced by full page) |
| `src/pages/features/ContentPage.tsx` | **New** — full storytelling page |
| `src/pages/features/MarketingPage.tsx` | **New** — full storytelling page |
| `src/pages/features/AudiencePage.tsx` | **New** — full storytelling page |
| `src/pages/features/AnalyticsPage.tsx` | **New** — full storytelling page |
| `src/components/landing/shared/FeaturePageHero.tsx` | **New** — reusable hero |
| `src/components/landing/shared/FeatureSection.tsx` | **New** — alternating section |
| `src/components/landing/shared/AIChatCTA.tsx` | **New** — bottom CTA banner |
| `src/components/landing/shared/FeatureChip.tsx` | **New** — feature pill |
| `src/components/landing/CategoryTeaser.tsx` | **New** — teaser card for landing gateway |
| `src/App.tsx` | Modify — add 4 new routes under `/features/*` |

**Kept unchanged:** AIIntelligenceShowcase, ComparisonTable, InvestorSection, LandingFooter, AnimatedBackground

---

## Visual Design Principles

- **Full-viewport sections** with generous whitespace (Apple-style breathing room)
- **Large typography**: Headlines at `text-5xl lg:text-7xl`, descriptions at `text-xl`
- **Abstract gradient orbs**: Each page has 1-2 large blurred gradient shapes (`blur-3xl`) using category colors as background art
- **Glassmorphic mock UIs**: `bg-white/[0.04] backdrop-blur-xl border border-{color}/20` with macOS-style window dots
- **Smooth scroll animations**: `whileInView` with staggered delays, no scale bounces
- **Color per category**: Purple (Content), Pink (Marketing), Blue (Audience), Orange (Analytics) — vibrant, not monotone
- **AI Chat thread**: Every page ends with the same AI Chat CTA banner, reinforcing the "one conversation" narrative

---

## Implementation Order

1. Shared components (FeaturePageHero, FeatureSection, AIChatCTA, FeatureChip)
2. ContentPage (most features to showcase)
3. MarketingPage
4. AudiencePage
5. AnalyticsPage
6. Update Landing gateway (remove old showcases, add teasers)
7. Update Navbar + App.tsx routes

