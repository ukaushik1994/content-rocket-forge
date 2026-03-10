

# Phase 1 (cont.) + Phase 2: Global Search, Hero & Circular Stats

This covers Bug 4 (global search) and all 5 Phase 2 items (circular stats additions).

---

## Bug 4: Global Sidebar Search

**File**: `src/components/ai-chat/ChatHistorySidebar.tsx`

Create a new component `src/components/ai-chat/GlobalSearchResults.tsx` that:
- Accepts `searchTerm` as prop
- Queries `content_items` (title ilike), `keyword_library` (keyword ilike), `engage_contacts` (first_name/last_name/email ilike), and `campaigns` (name ilike) via Supabase with `.limit(5)` each
- Groups results under category headers: "Chats", "Content", "Keywords", "Contacts", "Campaigns"
- Each result is clickable: Content → `/repository`, Keywords → `/keywords`, Contacts → `/engage/contacts`, Campaigns → `/campaigns`
- Renders as a dropdown/overlay below the search input when `searchTerm` has 2+ characters

In `ChatHistorySidebar.tsx`:
- Import and render `GlobalSearchResults` when `searchActive && searchTerm.length >= 2`
- Show it above the existing conversation list (or as an overlay)
- Existing conversation filtering continues to work alongside

---

## Task 1: AI Chat Hero Header

**File**: `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 448-484)

Modify the welcome state to add a hero above the greeting:

1. Add badge pill: `"AI Content Assistant"` with `Sparkles` icon + green dot (same pattern as `EngagePageHero` badge)
2. Add gradient title: `"Content Studio"` with purple gradient (`from-foreground via-primary to-primary/70`)
3. Add subtitle: `"Your AI-powered workspace for creating, managing, and optimizing all your content"`
4. Convert `PlatformSummaryCard` from inline text metrics to circular icon stats matching `EngagePageHero` stat format:
   - `FileText` → totalContent → "Content"
   - `CheckCircle` → published → "Published"
   - `Clock` → inReview → "In Review"
   - `BarChart3` → avgSeoScore% → "SEO Score"
   - Each with `glass-card rounded-xl` icon container (same as `EngagePageHero` line 138)

Keep greeting, `EnhancedQuickActions`, and chat input unchanged below the hero.

---

## Task 2: Repository Circular Stats

**File**: `src/components/repository/RepositoryHero.tsx`

Between the "Create Content" button (line 73) and "Feature Tags" (line 76), add a circular stats row:
- 3 stats: `FileText` → total count → "Total Content", `CheckCircle` → published → "Published", `Pencil` → drafts → "Drafts"
- Accept `stats` prop: `{ total: number; published: number; drafts: number }`
- Use `glass-card rounded-xl` icon containers matching `EngagePageHero` pattern
- Parent component passes counts from content data

---

## Task 3: Offerings Circular Stats

**File**: `src/components/solutions/HeroSection.tsx`

Replace the large "X Offerings Available" box (line 118-123) with 3 circular icon stats inline:
- `Package` → total count → "Total Offerings"
- `CheckCircle` → active count → "Active"  
- `Star` → featured count → "Featured"

Add `activeCount` and `featuredCount` props. Parent `SolutionManager` derives these from the `solutions` array (filter by `status === 'active'` and `featured === true`).

---

## Task 4: Automations Circular Stats

**File**: `src/components/engage/automations/AutomationsList.tsx`

The automations page already HAS stats (lines 748-784) but in a horizontal card format. Convert these to the circular icon pattern:
- Replace the `flex items-center gap-3 px-5 py-3 glass-card rounded-2xl` cards with centered circular icon stats matching `EngagePageHero`:
  - Icon in `w-12 h-12 glass-card rounded-xl` container → value below → label below
- Keep the same 4 stats (Active, Paused, Total Runs, Success Rate)
- Use amber/orange tinted icon colors (already present)

---

## Task 5: Campaigns Stats → Circular

**File**: `src/components/campaigns/CampaignsHero.tsx` (lines 220-256)

Replace the 3 rectangular stat cards (`grid grid-cols-1 md:grid-cols-3`) with circular icon stats:
- `Target` → activeCampaigns → "Active"
- `TrendingUp` → contentPiecesCreated → "Content Created"
- `Sparkles` → completedCampaigns → "Completed"
- Use `flex justify-center gap-8` layout with `glass-card rounded-xl` icon containers
- Green/teal icon colors (`text-emerald-400`, `text-teal-400`)

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/components/ai-chat/GlobalSearchResults.tsx` | NEW — global search dropdown |
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Integrate GlobalSearchResults |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Add hero header to welcome state |
| `src/components/ai-chat/PlatformSummaryCard.tsx` | Convert to circular icon stats |
| `src/components/repository/RepositoryHero.tsx` | Add circular stats row + stats prop |
| `src/components/solutions/HeroSection.tsx` | Replace count box with circular stats |
| `src/components/solutions/manager/SolutionManager.tsx` | Pass activeCount/featuredCount |
| `src/components/engage/automations/AutomationsList.tsx` | Convert stats to circular format |
| `src/components/campaigns/CampaignsHero.tsx` | Convert rect cards to circular stats |

