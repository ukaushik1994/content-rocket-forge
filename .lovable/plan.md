

# Repository Restructure -- Format-Based Content Hub

## Overview

Transform the Repository from a flat "All Content" list into a format-organized hub with icon tabs at the top. Repurposed content (memes, social posts, emails, etc.) will be pulled from the `repurposed_contents` table and displayed under the correct category tab, each with a "link back" badge to its source article.

## How It Will Work

When you land on the Repository page, you'll see a row of icon tabs:

```text
[All] [Socials] [Email/Newsletter] [Blog/Articles] [Video Scripts] [Campaigns]
```

- **All**: Shows everything (current behavior)
- **Socials**: Twitter, LinkedIn, Facebook, Instagram posts + Carousels + Memes (all pulled from `repurposed_contents` where `format_code` starts with `social-`, plus `carousel` and `meme`)
- **Email/Newsletter**: Email content from `repurposed_contents` (format_code = `email`) + any `content_items` with `content_type = 'email'`
- **Blog/Articles**: Content items with `content_type` = `article` or `blog` + repurposed `blog` format
- **Video Scripts**: Repurposed content with `format_code = 'script'`
- **Campaigns**: Existing campaign tab (unchanged)

Each repurposed content card will show a small badge like "From: [Original Article Title]" linking back to the source.

## What Changes

### 1. New Data Hook: `useRepositoryContent`
A new hook that fetches from BOTH `content_items` (existing) AND `repurposed_contents` (new), merging them into a unified list. Each repurposed item gets normalized into a display-friendly shape with:
- `sourceType`: 'original' or 'repurposed'
- `sourceContentId`: link to parent article (for repurposed)
- `sourceContentTitle`: parent article title (for the badge)
- `formatCode`: the format identifier

### 2. Update `RepositoryTabs.tsx`
Replace the current 2-tab layout (All Content / Campaigns) with 6 icon tabs:
- Each tab gets an icon from the existing `platformIcons.ts` config
- Active tab highlights with the platform's color
- URL param `?tab=socials` keeps state on refresh

### 3. Update `RepositoryContent.tsx`
- Accept a `category` prop that determines which content to show
- For "socials" tab: filter for social format codes
- For "email" tab: filter for email format codes + email content_type
- For "blog" tab: filter for article/blog content_type
- For "scripts" tab: filter for script format codes

### 4. New Component: `RepurposedContentCard.tsx`
A card variant for repurposed content that shows:
- Format icon (Twitter, LinkedIn, Meme, etc.)
- Content preview (first ~150 chars)
- "From: [Article Title]" link badge
- Created date
- Quick actions (view, copy, delete)

### 5. Update `RepositoryCard.tsx` / `SimplifiedRepositoryCard.tsx`
Add a small format icon badge so original articles also show which repurposed formats exist (e.g., tiny Twitter + LinkedIn icons if those were generated).

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useRepositoryContent.ts` | Fetches + merges content_items and repurposed_contents |
| `src/components/repository/RepurposedContentCard.tsx` | Card component for repurposed content display |
| `src/components/repository/CategoryContent.tsx` | Wrapper that filters content by category |

### Files to Modify
| File | Changes |
|------|---------|
| `RepositoryTabs.tsx` | 6 icon tabs instead of 2 |
| `RepositoryContent.tsx` | Accept category filter, use new hook |
| `RepositoryCard.tsx` | Add repurposed format badges |
| `RepositoryHero.tsx` | Update subtitle to reflect multi-format hub |

### Data Flow
```text
Repository Page
  --> RepositoryTabs (6 icon tabs)
      --> CategoryContent (filters by selected tab)
          --> useRepositoryContent hook
              --> content_items table (originals)
              --> repurposed_contents table (repurposed)
          --> RepositoryCard (for originals)
          --> RepurposedContentCard (for repurposed, with "From:" badge)
```

### Category-to-Format Mapping
| Tab | Format Codes Included |
|-----|----------------------|
| All | Everything |
| Socials | `social-twitter`, `social-linkedin`, `social-facebook`, `social-instagram`, `carousel`, `meme` |
| Email | `email` + content_type `email` |
| Blog | content_type `article`, `blog` + format `blog` |
| Video Scripts | `script` |
| Campaigns | Existing campaign logic (unchanged) |

