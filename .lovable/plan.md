

# Multi-Perspective Visualization Sidebar

## Understanding Your Request

You want the visualization sidebar to show the same data from **multiple perspectives** - not just one chart, but potentially two charts that reveal different aspects of the information. The flow you described:

1. Chart 1 (primary view)
2. Summary (AI narrative)
3. Chart 2 (different perspective)
4. Key Metrics

This creates a richer analytical experience where users can see trends, distributions, and comparisons without switching views.

---

## Visual Layout (New Structure)

```text
┌─────────────────────────────────┐
│ Header                          │
├─────────────────────────────────┤
│ [Chart] [Table] ─ Type: ▼       │
│ ┌─────────────────────────────┐ │
│ │  CHART 1: Primary View      │ │
│ │  (e.g., Trend over time)    │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ✨ AI Summary                   │
│ "Revenue grew 23% with..."      │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  CHART 2: Alternate View    │ │
│ │  (e.g., Distribution/Pie)   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ KEY METRICS                     │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ 23K │ │ +12%│ │ 4.2K│ │ 89% │ │
│ └─────┘ └─────┘ └─────┘ └─────┘ │
├─────────────────────────────────┤
│ 💡 AI Insights (collapsed)      │
└─────────────────────────────────┘
```

---

## How It Works

### Smart Chart Selection
When the AI generates data, the system will:
1. Use `visualData.charts[]` array if the AI provides multiple chart configurations
2. Auto-generate a secondary perspective if only one chart is provided:
   - If primary is **bar/line** → secondary shows **pie** (distribution)
   - If primary is **pie** → secondary shows **bar** (comparison)
   - If primary is **area** → secondary shows **radar** (multi-dimensional)

### Conditional Display
- Shows **two charts** only when multiple perspectives add value
- Single chart mode still available when data doesn't warrant dual views
- Each chart can have its own title/subtitle explaining what it represents

---

## Implementation Details

### File: `VisualizationSidebar.tsx`

**1. Add Secondary Chart State**
```typescript
const [secondaryChartType, setSecondaryChartType] = useState<ChartType>('pie');
```

**2. Smart Secondary Chart Selection**
```typescript
const secondaryChartConfig = useMemo(() => {
  // Use AI-provided secondary chart if available
  if (visualData?.charts && visualData.charts.length > 1) {
    return visualData.charts[1];
  }
  // Auto-generate complementary view
  const complementaryType = chartType === 'bar' ? 'pie' : 
                            chartType === 'line' ? 'pie' : 
                            chartType === 'pie' ? 'bar' : 'radar';
  return { ...chartConfig, type: complementaryType };
}, [visualData, chartConfig, chartType]);
```

**3. New Content Order**
```typescript
<ScrollArea className="flex-1">
  <div className="p-6 pb-28 space-y-6">
    {/* 1. PRIMARY CHART */}
    <ChartBlock 
      title="Overview"
      chart={renderChart(chartType)} 
      controls={<SegmentedControl />}
    />

    {/* 2. AI SUMMARY */}
    <AISummaryCard ... />

    {/* 3. SECONDARY CHART (Conditional) */}
    {hasSecondaryData && (
      <ChartBlock 
        title="Distribution"
        chart={renderChart(secondaryChartType)}
        compact={true}
      />
    )}

    {/* 4. KEY METRICS */}
    <MetricsGrid ... />

    {/* 5. INSIGHTS (collapsed) */}
    <InsightsCollapsible ... />
  </div>
</ScrollArea>
```

**4. Compact Chart Block Component**
For the secondary chart, use a more compact presentation:
```typescript
const ChartBlock = ({ title, subtitle, chart, compact }) => (
  <div className={cn(
    "rounded-xl bg-card/30 border border-border/30",
    compact ? "p-4" : "p-5"
  )}>
    {title && (
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {/* Type selector for this chart */}
      </div>
    )}
    <div className={compact ? "h-[160px]" : "h-[220px]"}>
      {chart}
    </div>
  </div>
);
```

---

## Chart Heights

| Chart | Height | Purpose |
|-------|--------|---------|
| Primary | 220px | Main visualization with full detail |
| Secondary | 160px | Complementary view, more compact |

---

## Files to Modify

| File | Changes |
|------|---------|
| `VisualizationSidebar.tsx` | Add secondary chart logic, reorder content sections, create ChartBlock component |

---

## Technical Flow

The system prioritizes AI-provided chart configurations:

1. **AI provides `charts[]` array** → Use first as primary, second as secondary
2. **AI provides single `chartConfig`** → Use as primary, auto-generate complementary secondary
3. **Minimal data** → Show only primary chart (skip secondary)

This ensures maximum flexibility while maintaining a clean, multi-perspective view that shows your data from different angles.

