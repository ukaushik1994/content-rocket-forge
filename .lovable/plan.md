

# Update Page Thumbnail / Open Graph Image

## Current Problem

The page thumbnail shown when sharing your site (on Social Media, Slack, Discord, etc.) is using a **default Lovable placeholder image** that doesn't represent your brand. This dark, generic preview doesn't showcase what CreAiter actually does.

**Current configuration in `index.html`:**
```html
<meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
<meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
<meta name="twitter:site" content="@lovable_dev" />  <!-- Wrong Twitter handle! -->
```

---

## Solution Overview

| Step | Action | Description |
|------|--------|-------------|
| 1 | Create OG Image | Generate a branded 1200×630 image for CreAiter |
| 2 | Host the Image | Add to `public/` folder so it's served at a static URL |
| 3 | Update Meta Tags | Point `og:image` and `twitter:image` to the new image |
| 4 | Fix Twitter Handle | Update from `@lovable_dev` to your actual handle |
| 5 | Add to Landing.tsx | Ensure Helmet includes the OG image for the homepage |

---

## Recommended OG Image Design

A professional Open Graph image should be **1200×630 pixels** and include:

- **CreAiter logo/brand name** prominently displayed
- **Tagline**: "The Self-Learning Content Engine" or similar
- **Visual elements**: Abstract AI/content imagery, gradient background matching your brand colors (purple/blue)
- **Clean, high contrast** - readable even as a small thumbnail

**Design concept:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     ╔═══════════════════════════════════════════════╗       │
│     ║                                               ║       │
│     ║            🚀 CreAiter                        ║       │
│     ║                                               ║       │
│     ║    The Self-Learning Content Engine           ║       │
│     ║    That Gets Smarter With Every Post          ║       │
│     ║                                               ║       │
│     ║    [AI • Content • Strategy • Growth]         ║       │
│     ║                                               ║       │
│     ╚═══════════════════════════════════════════════╝       │
│                                                             │
│           (Gradient background: purple → blue)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `public/og-image.png` | **Create** - Add the branded OG image |
| `index.html` | **Modify** - Update meta tags to point to new image |
| `src/pages/Landing.tsx` | **Modify** - Add explicit og:image in Helmet |

### 1. Update index.html

Replace lines 24-31 with:

```html
<meta property="og:title" content="CreAiter - AI-Powered Content Creation Platform" />
<meta property="og:description" content="The self-learning content engine that gets smarter with every post. AI-powered content creation with team collaboration and enterprise-grade features." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://creaiter.lovable.app" />
<meta property="og:image" content="https://creaiter.lovable.app/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="CreAiter - AI Content Creation Platform" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@creaiter" />
<meta name="twitter:title" content="CreAiter - AI-Powered Content Creation" />
<meta name="twitter:description" content="The self-learning content engine that gets smarter with every post." />
<meta name="twitter:image" content="https://creaiter.lovable.app/og-image.png" />
```

### 2. Update Landing.tsx Helmet

Add explicit OG image tags in the Helmet section:

```tsx
<Helmet>
  <title>CreAiter - The Self-Learning Content Engine That Gets Smarter With Every Post</title>
  <meta name="description" content="..." />
  <meta name="keywords" content="..." />
  <meta property="og:title" content="CreAiter - AI-Powered Content Creation Platform" />
  <meta property="og:description" content="..." />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://creaiter.lovable.app/og-image.png" />
  <meta name="twitter:image" content="https://creaiter.lovable.app/og-image.png" />
  <link rel="canonical" href="https://creaiter.com" />
</Helmet>
```

---

## Image Generation Options

### Option A: Use AI to Generate
I can generate a professional OG image using the AI image generation tool, then save it to your `public/` folder.

### Option B: You Provide an Image
If you have a specific design or brand asset you'd like to use, you can upload it and I'll integrate it.

### Option C: Create a Simple Branded Image
Generate a clean gradient image with your logo/text using code (SVG-based).

---

## After Implementation

1. **Publish the app** - The new image must be accessible at the production URL
2. **Clear social media caches** - Use these tools to force refresh:
   - Twitter: https://cards-dev.twitter.com/validator
   - Facebook: https://developers.facebook.com/tools/debug/
   - LinkedIn: https://www.linkedin.com/post-inspector/
3. **Verify** - Share a link and confirm the new thumbnail appears

---

## Summary

The current thumbnail uses a default Lovable placeholder. By creating a branded 1200×630 OG image and updating the meta tags in `index.html` and `Landing.tsx`, your social shares will display a professional, on-brand preview that represents CreAiter properly.

