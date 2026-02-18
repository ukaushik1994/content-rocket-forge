

# Navbar Restructure: Option B (Content / Marketing / Audience / Analytics)

## Current State (6 top-level items)
Home | Content (dropdown) | Strategy | Campaigns | Engage (dropdown) | Analytics

## New State (4 top-level items)
Home | Content (dropdown) | Marketing (dropdown) | Audience (dropdown) | Analytics

## Only File Changed
`src/components/layout/NavItems.tsx` -- nothing else is touched. All routes, pages, and layouts remain exactly as they are.

## New Dropdown Structure

### Content (absorbs Strategy + Keywords)
- Builder -> `/content-type-selection`
- Approval -> `/content-approval`
- Repository -> `/repository`
- Keywords -> `/keywords`
- Strategy -> `/research/content-strategy`

Active when on any of: `/content-builder`, `/content-approval`, `/glossary-builder`, `/repository`, `/drafts`, `/content-type-selection`, `/keywords`, `/research/content-strategy`

### Marketing (absorbs Campaigns + distribution channels)
- Campaigns -> `/campaigns`
- Email -> `/engage/email`
- Social -> `/engage/social`
- Automations -> `/engage/automations`
- Journeys -> `/engage/journeys`

Active when on: `/campaigns` or `/engage/email`, `/engage/social`, `/engage/automations`, `/engage/journeys`

### Audience (people-focused items)
- Contacts -> `/engage/contacts`
- Segments -> `/engage/segments`
- Activity -> `/engage/activity`

Active when on: `/engage/contacts`, `/engage/segments`, `/engage/activity`

### Analytics (standalone, unchanged)
- Direct link to `/analytics`

## Technical Details

### What changes in NavItems.tsx
1. Add `/research/content-strategy` to the `contentRoutes` array so the Content dropdown highlights for Strategy too
2. Add Strategy as a new item inside the existing Content dropdown (with Target icon)
3. Remove the standalone Strategy `NavItem`
4. Remove the standalone Campaigns `NavItem`
5. Replace the Engage dropdown with two new dropdowns:
   - **Marketing** (Megaphone icon) -- contains Campaigns, Email, Social, Automations, Journeys
   - **Audience** (Users icon) -- contains Contacts, Segments, Activity
6. Clean up unused icon imports if any

### Icons
- Marketing trigger: Megaphone
- Audience trigger: Users
- Individual items keep their current icons (Mail, Share2, Zap, GitBranch, Users, Layers, Activity, Target, etc.)

### Result
The navbar goes from 6 items down to 4 (Home + 3 dropdowns + Analytics = 5 clickable elements), making it cleaner and more intuitive.
