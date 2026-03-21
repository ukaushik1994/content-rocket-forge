# Analyst Sidebar — Stitch Build Prompt

> Build a right-side panel (sidebar) for an AI chat application. This is the "Analyst" — a data intelligence companion that accumulates insights, metrics, charts, and alerts as the user interacts with the AI chat.

---

## Layout Specifications

- **Position:** Fixed, right side of screen
- **Width:** Full width on mobile, 400px on sm, 520px on lg, 600px on xl
- **Height:** From `top: 80px` to `bottom: 96px` (leaves room for chat header and input)
- **Background:** `background/90` with `backdrop-blur-md`
- **Border:** Left border, `border/10` opacity
- **Animation:** Slide in from right (`x: 100%` → `x: 0`) with spring animation (damping 30, stiffness 300)
- **Mobile:** Full-width overlay with backdrop blur background behind it
- **Z-index:** 35

---

## Component Structure (top to bottom)

### 1. HEADER

**Layout:** Flex row with icon, title block, and close button.

```
[BarChart3 icon] [Title + Subtitle]                    [X close button]
                 [Topic Tags row]
                 [Goal Progress bar]
```

**Elements:**

- **Icon:** BarChart3 (20x20, muted foreground). If `isEnriching` is true, show a pulsing 8x8 primary-colored dot on top-right of the icon.
- **Title:** "Analyst" (text-base, font-medium)
- **Subtitle:** Dynamic:
  - If has data: "[N] insights · [N] topics"
  - If no data: "Charts & insights companion"
- **Close button:** Ghost variant, rounded-full, X icon (16x16)

**Topic Tags:** Horizontal flex-wrap row below title. Each tag is a Badge (outline variant):
- Text: topic name (10px font, uppercase not needed)
- If `mentionCount > 1`: show "×[count]" suffix in primary/70 color
- Styling: `px-2 py-0.5 bg-muted/20 border-border/30 text-muted-foreground`
- Only show when `topics.length > 0`

**Goal Progress:** Below topic tags. Only show when `goalProgress` exists.
- Small card/container with border
- Top row: goal name (10px uppercase tracking-wide muted) + percentage (10px semibold primary) — flex between
- Progress bar: 6px height, rounded-full, primary color fill, animated width
- Below bar: status badge + next step text
  - Status badge colors: completed = emerald, nearly_done = blue, in_progress = amber, not_started = muted
  - Next step: "Next: [text]" in 9px muted

**Header bottom border:** `border-b border-border/10`

---

### 2. SCROLLABLE CONTENT AREA

Entire content area is a ScrollArea. Padding: `px-6 py-5 pb-28`. Space between sections: `space-y-5`.

---

### 3. HEALTH SCORE SECTION

Only shows when `healthScore` exists.

**Layout:** Card-like container with two columns: circular score ring (left) and details (right).

**Score Ring:**
- SVG circle, 64x64 viewbox
- Background track: 4px stroke, `border/20` color, radius 28
- Score arc: 4px stroke, `strokeDasharray` proportional to score (max circumference ~175.9)
- Arc color: green if score ≥ 70, amber if ≥ 40, red if < 40
- Center text: score number (text-xl font-bold)
- Ring rotated -90deg so arc starts from top

**Details (right of ring):**
- "Workspace Health" (text-sm font-medium)
- Trend indicator: "📈 Improving" / "📉 Declining" / "→ Stable" (text-xs muted)
- If `topCritical` exists: "⚡ [text] needs attention" (text-10px amber-500)

**Expandable factors list:** Collapsible below the score card.
Each factor is a row:
- Colored dot: green/amber/red based on status
- Factor name (text-xs)
- Score: "[score]/[maxScore]" (text-xs muted)
- Detail text below name (text-9px muted/60)

---

### 4. KEY METRICS SECTION

Only shows when `cumulativeMetrics.length > 0`.

**Section label:** "Key Metrics" (10px uppercase tracking-widest muted/50)

**Layout:** 2-column grid, gap-2. Show max 4 metric cards.

**Each Metric Card (PremiumMetricCard):**
- Small card with glass effect
- Label: metric title (10px muted, uppercase tracking)
- Value: metric value (text-lg font-semibold)
- Trend indicator: up arrow (green) / down arrow (red) / neutral, with percentage value
- Optional sparkline mini-chart if trend data available
- Stagger animation: each card fades in with 50ms delay

---

### 5. PLATFORM STATS SECTION

Only shows when `platformData.length > 0`.

**Section label:** "Platform Stats" (10px uppercase tracking-widest muted/50)

**Layout:** 2-column grid, gap-2.

**Each Platform Stat Card:**
- Small card: `p-3 bg-muted/10 border-border/20`
- Top row: label (10px muted uppercase tracking-wide) + optional sparkline (right-aligned)
  - Sparkline: mini SVG polyline (48x16), 4 data points showing weekly trend
- Value: large number (text-lg font-semibold)
- Context text: one-line explanation in 9px muted/60
  - Examples: "25% published — aim for 50%+", "Building your library — 15+ is where momentum starts"

---

### 6. INSIGHTS FEED SECTION

The main scrollable feed of intelligence items.

**Section label:** "Insights" (10px uppercase tracking-widest muted/50) + Badge with count

**Each Insight Item:**
- Left color indicator: thin vertical bar (2px wide, rounded)
  - warning → red/amber
  - opportunity → green
  - trend → blue
  - stat → purple
  - search → cyan
  - memory (from previous session) → gray/muted
- Content text: 11px, foreground color
- Source badge: tiny pill showing "AI" / "Platform" / "Web" / "Cross-signal" / "Previous session"
- Timestamp: "2m ago" format (9px muted/50)

**Insight type styling:**
```
warning:     bg-red-500/10, border-red-500/20, red text accent
opportunity: bg-emerald-500/10, border-emerald-500/20, green text accent
trend:       bg-blue-500/10, border-blue-500/20, blue text accent
stat:        bg-purple-500/10, border-purple-500/20, purple text accent
search:      bg-cyan-500/10, border-cyan-500/20, cyan text accent
memory:      bg-muted/20, border-border/20, muted text
```

Feed should have subtle stagger animation on items. Max height: let it scroll naturally within the parent ScrollArea.

**Divider** after insights section: `border-t border-border/10`

---

### 7. ACCUMULATED CHARTS SECTION

Only shows when `accumulatedCharts.length > 0`.

**Section header:** "Session Charts" + Badge with chart count

**Layout:** Vertical stack of chart cards.

**Each Chart Card:**
- Title: chart title (text-xs font-medium)
- Chart: rendered using Recharts (ResponsiveContainer, 160px height)
  - Support types: bar, line, pie, area, radar, funnel, scatter, radial, composed
  - Minimal axis styling: thin gridlines, small font labels
  - Colors: use theme-appropriate palette (primary, blue, green, amber, purple)
- Chart type badge: tiny pill showing chart type

**Show first 4 charts by default.** If more exist, show "Show all ([N]) →" button to expand.

**Divider** after charts section.

---

### 8. WEB SEARCH RESULTS SECTION

Only shows when `webSearchResults.length > 0`.

**Section header:** "Web Intelligence" + Badge with search count (cyan styled)

**Each Search Result Group:**
- Query header: "🔍 [query text]" (text-xs font-medium)
- Answer box (if exists): highlighted card with answer text
- Results list: each result is:
  - Title (text-xs font-medium, truncated)
  - URL (text-9px muted, truncated)
  - Snippet (text-10px muted/80, 2 lines max)

**Web search CTA:** If no web searches exist but topics include keywords/competitors, show a subtle prompt: "Try web search for real-time market data" with a button.

---

### 9. SUGGESTED PROMPTS SECTION

Always shows at the bottom of the content area.

**Section label:** "Explore" or "Ask about your data"

**Dynamic prompts:** 2-4 pill buttons generated from:
1. Detected topics → "Deep dive: [topic name]"
2. Warning insights → "Address warning: [warning text truncated]"
3. Suggested actions → action title as prompt
4. Fallback static prompts if nothing dynamic: "Show content performance", "Campaign health overview", "Keyword rankings analysis"

**Prompt styling:** Small rounded-full buttons (text-xs font-medium)
- Normal: `bg-muted/40 border border-border/20 text-muted-foreground`
- Hover: `bg-primary/10 text-primary border-primary/20`

**Loading state:** If `isEnriching` is true, show a subtle "Refreshing data..." indicator with a spinning icon.

---

### 10. SESSION SUMMARY FOOTER

Shows at the very bottom when there's accumulated data.

**Content:** Compact text summarizing the session:
- "[N] charts, [N] insights, [N] web searches" — joined with commas
- Only show counts that are > 0
- Style: 9px muted/50, centered

---

## Data Model Reference

```typescript
interface AnalystState {
  topics: AnalystTopic[];           // Detected conversation topics with mention counts
  insightsFeed: InsightItem[];      // All insights (AI, platform, cross-signal, memory)
  cumulativeMetrics: MetricCard[];  // Aggregated metric cards from AI responses
  suggestedActions: ActionableItem[]; // Uncovered topic suggestions
  accumulatedCharts: ChartConfiguration[]; // Last 6 charts from conversation
  platformData: PlatformDataPoint[];  // Real-time workspace stats with trend data
  webSearchResults: AnalystWebSearchData[]; // Web search results
  lastUpdated: Date | null;
  isEnriching: boolean;             // True while fetching platform data
  messageCount: number;             // Assistant message count
  healthScore: HealthScore | null;  // 0-100 workspace health with factors
  crossSignalInsights: InsightItem[]; // Cross-data-point pattern insights
  goalProgress: GoalProgress | null; // Conversation goal tracking
}

interface AnalystTopic {
  name: string;
  firstMentioned: Date;
  mentionCount: number;
  category: 'content' | 'campaigns' | 'keywords' | 'competitors' | 'email' | 'social' | 'analytics' | 'general';
}

interface InsightItem {
  id: string;
  content: string;
  type: 'trend' | 'warning' | 'opportunity' | 'stat' | 'search';
  source: 'ai' | 'platform' | 'web' | 'cross-signal' | 'memory';
  timestamp: Date;
  messageId?: string;
}

interface PlatformDataPoint {
  label: string;
  value: number;
  category: string;
  fetchedAt: Date;
  trendData?: number[]; // 4-week trend [oldest...newest]
}

interface HealthScore {
  total: number;           // 0-100
  trend: 'improving' | 'declining' | 'stable';
  factors: HealthFactor[];
  topCritical: string | null;
}

interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'critical';
  detail: string;
}

interface GoalProgress {
  goalName: string;
  percentage: number;       // 0-100
  status: 'not_started' | 'in_progress' | 'nearly_done' | 'completed';
  nextStep: string;
  milestones: { label: string; done: boolean }[];
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: { value: number; type: 'increase' | 'decrease'; period: string };
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  previousValue?: number;
  comparisonPeriod?: string;
  target?: number;
  targetLabel?: string;
}

interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'funnel' | 'scatter' | 'radial' | 'composed';
  data: any[];
  categories: string[];
  title: string;
  subtitle?: string;
  series?: Array<{ dataKey: string; name: string }>;
  colors?: string[];
  height?: number;
}

interface ActionableItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  estimatedImpact?: string;
  timeRequired?: string;
  icon?: string;
}

interface AnalystWebSearchData {
  query: string;
  results: Array<{ title: string; url: string; snippet: string; position?: number }>;
  answerBox?: string;
  relatedSearches?: string[];
}
```

---

## Visual Design Guidelines

- **Theme:** Dark mode primary. Use `bg-background`, `text-foreground`, `text-muted-foreground` for base.
- **Glass effect:** `bg-background/90 backdrop-blur-md` for the sidebar container.
- **Cards:** `bg-muted/10 border border-border/20 rounded-xl` for inner cards.
- **Typography scale:** 9px for tertiary info, 10px for labels/badges, 11px for body, 13px for section titles, base (16px) for header title.
- **Spacing:** Tight — `gap-2` for grids, `space-y-3` for list items, `space-y-5` for sections.
- **Animation:** Subtle — fade-in with slight y-offset (8px) for each section, stagger for list items (50ms delay each).
- **Color palette for insight types:**
  - Warning: red-500 with 10% bg opacity
  - Opportunity: emerald-500 with 10% bg opacity
  - Trend: blue-500 with 10% bg opacity
  - Stat: purple-500 with 10% bg opacity
  - Search: cyan-500 with 10% bg opacity
  - Memory: muted with 20% bg opacity
- **Health score ring colors:** Green ≥70, Amber 40-69, Red <40

---

## States to Handle

1. **Empty state (no data):** Show "Ask about your data" CTA with 3-4 suggested prompt pills and a brief description. Center vertically.
2. **Loading/enriching state:** Pulsing dot on header icon. "Refreshing data..." text near prompts. Skeleton loading for platform stats if first load.
3. **Populated state:** All sections render based on data availability. Sections with no data are hidden (not shown empty).
4. **Error state:** If platform data fetch fails, show a subtle "Some data unavailable" note. Don't break the rest of the sidebar.
5. **Previous session loaded:** Memory insights appear at top of insights feed with "Previous session:" prefix and muted/gray styling.

---

## Interaction Behaviors

- **Close button:** Fires `onClose()` callback
- **Suggested prompt click:** Fires `onSendMessage(promptText)` callback
- **Chart expand:** If chart is clicked, fires `onExpandVisualization(chartData, chartConfig)` callback
- **Any click inside sidebar:** Fires `onInteract()` callback (for smart persistence tracking)
- **Web search CTA click:** Fires `onSendMessage('[web-search] market trends for [top topic]')` callback
- **Insight click:** Optional — could scroll to the message that generated it (via `messageId`)

---

## Responsive Behavior

- **Mobile (< 640px):** Full-width overlay. Backdrop blur behind. Touch-friendly tap targets (min 44px).
- **Tablet (640-1024px):** 400px width, overlays chat.
- **Desktop (1024-1280px):** 520px width, overlays chat.
- **Large desktop (1280px+):** 600px width. Chat area gets `margin-right: 600px` to accommodate sidebar without overlay.
