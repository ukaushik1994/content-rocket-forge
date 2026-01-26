
# Complete Sidebar Functionality Implementation Plan

## Overview

This plan addresses all 18 identified issues across 5 categories while respecting your preferences. The sidebar will become fully functional with real data, smart trend calculations, and all chart types working properly.

---

## Summary of Changes by Your Preferences

| Your Choice | Implementation |
|-------------|----------------|
| **Smart Auto-Detect for Historical Data** | New hook detects data source and queries appropriate table |
| **User-selectable Timeframe** | Dropdown in sidebar header for week/month/custom |
| **Add Missing Chart Types** | Scatter, Funnel, Composed charts with loading states |
| **Combined Data Quality** | Assessment based on completeness + volume + variation |
| **No Export/Feedback Changes** | Leave PNG/PDF disabled, feedback logs to console |
| **Deep Dive Closes Sidebar** | Keep current behavior |

---

## Phase 1: Smart Historical Data Fetching

### 1.1 Create New Hook: `useSidebarTrendData.ts`

**Purpose:** Fetch real historical data for trend calculations using smart auto-detection.

**Logic Flow:**
```text
INPUT: dataSource, userId, timeframe
           |
           v
    ┌──────────────────────────────────────────┐
    │         SMART AUTO-DETECT                │
    ├──────────────────────────────────────────┤
    │ dataSource contains 'Campaign'?          │
    │   → Query: campaign_analytics            │
    │   → Fields: views, clicks, conversions   │
    ├──────────────────────────────────────────┤
    │ dataSource contains 'Content'?           │
    │   → Query: content_items (count by date) │
    │   → Fields: status counts, SEO scores    │
    ├──────────────────────────────────────────┤
    │ dataSource contains 'Market/SERP'?       │
    │   → Query: serp_tracking_history         │
    │   → Fields: position, rankings           │
    ├──────────────────────────────────────────┤
    │ Else (AI Analysis / unknown)             │
    │   → Use chartData first-half/second-half │
    │   → No database query needed             │
    └──────────────────────────────────────────┘
           |
           v
    OUTPUT: { currentPeriod, previousPeriod, isLoading }
```

**File to create:** `src/hooks/useSidebarTrendData.ts`

```typescript
// Hook will:
// 1. Accept userId, dataSource, and selectedTimeframe
// 2. Determine which table to query based on dataSource
// 3. Query Supabase for current period and previous period data
// 4. Return calculated metrics for trend comparison
// 5. Handle loading and error states
```

### 1.2 Add Timeframe Selector to Sidebar Header

**File to modify:** `src/components/ai-chat/VisualizationSidebar.tsx`

**Location:** Inside the header badges section (around line 710-727)

**New State:**
```typescript
const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | 'custom'>('30d');
```

**UI Addition:** A small dropdown next to the existing badges:
- Options: "Last 7 days", "Last 30 days", "Custom"
- Compact design matching existing badge styles
- Updates trend calculations when changed

---

## Phase 2: Fix Mock/Fake Data Issues

### 2.1 Replace Hardcoded Trends (Issue A1)

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`  
**Lines:** 137-148

**Current (Mock):**
```typescript
const trends = ['up', 'down', 'neutral'] as const;
const trendValues = ['+12.5%', '-3.2%', '0.0%'];
return {
  trend: trends[idx % 3],
  trendValue: trendValues[idx % 3]
};
```

**New (Real Calculation):**
```typescript
// Use data from useSidebarTrendData hook
// OR calculate from chartData when no historical data available:
const midpoint = Math.floor(values.length / 2);
const firstHalfAvg = values.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint || 0;
const secondHalfAvg = values.slice(midpoint).reduce((a, b) => a + b, 0) / (values.length - midpoint) || 0;
const changePercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100) : 0;

return {
  trend: changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'neutral',
  trendValue: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
  previousValue: Math.round(firstHalfAvg),
  comparisonPeriod: `vs. earlier ${selectedTimeframe === '7d' ? 'days' : 'period'}`
};
```

### 2.2 Fix Comparison Value Fallback (Issue A2)

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`  
**Line:** 857

**Current:**
```typescript
comparisonValue={metric.previousValue || Math.round(Number(metric.value) * 0.85)}
```

**New:**
```typescript
// Remove arbitrary 85% fallback, use actual previousValue from calculation
comparisonValue={metric.previousValue}
comparisonPeriod={metric.comparisonPeriod || `vs. previous ${selectedTimeframe === '7d' ? 'week' : 'month'}`}
```

### 2.3 Implement Combined Data Quality Assessment (Issue A3)

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`  
**Lines:** 182-188

**Current (Arbitrary):**
```typescript
const quality = points > 50 ? 'high' : points > 20 ? 'medium' : 'low';
```

**New (Combined Assessment):**
```typescript
const dataInfo = useMemo(() => {
  const source = visualData?.dataSource || 'AI Analysis';
  const points = chartData.length;
  const timeframe = selectedTimeframe === '7d' ? 'Last 7 days' : 
                    selectedTimeframe === '30d' ? 'Last 30 days' : 'Custom';
  
  // Combined quality assessment
  const hasRequiredFields = chartData.every(item => 
    item.name !== undefined && 
    Object.values(item).some(v => typeof v === 'number')
  );
  const hasMinimumPoints = points >= 5;
  const noNullValues = chartData.every(item => 
    !Object.values(item).includes(null) && 
    !Object.values(item).includes(undefined)
  );
  const hasVariation = new Set(chartData.map(d => d.name)).size > 1;
  
  const qualityScore = [hasRequiredFields, hasMinimumPoints, noNullValues, hasVariation].filter(Boolean).length;
  const quality = qualityScore >= 4 ? 'high' : qualityScore >= 2 ? 'medium' : 'low';
  
  return { source, points, quality, timeframe };
}, [visualData, chartData, selectedTimeframe]);
```

### 2.4 Implement AI-Driven Insight Classification (Issue A4)

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`  
**Lines:** 161-169

**Current (Random Cycling):**
```typescript
const types = ['trend', 'warning', 'opportunity'] as const;
return {
  insightType: insight.insightType || types[idx % 3]
};
```

**New (Keyword-Based Classification):**
```typescript
// Add helper function before component
const classifyInsightType = (content: string): 'trend' | 'warning' | 'opportunity' => {
  const lower = content.toLowerCase();
  
  // Warning indicators
  if (/failed|error|issue|risk|problem|critical|urgent|alert|warning|down|decrease/.test(lower)) {
    return 'warning';
  }
  
  // Opportunity indicators  
  if (/opportunity|potential|improve|recommend|action|ready|suggest|could|boost|increase|growth/.test(lower)) {
    return 'opportunity';
  }
  
  // Default to trend for data observations
  return 'trend';
};

// Update insights memo
const insights = useMemo(() => {
  const rawInsights = visualData?.insights || visualData?.actionableItems?.map((item: any) => ({
    type: 'insight',
    content: item.description || item.title
  })) || [];

  return rawInsights.map((insight: any) => {
    const content = insight.content || insight.description || insight;
    return {
      ...insight,
      content,
      insightType: insight.insightType || classifyInsightType(content)
    };
  });
}, [visualData]);
```

---

## Phase 3: Add Missing Chart Types

### 3.1 Add Scatter Chart (Issue C2)

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`  
**Location:** Inside `renderChart` switch statement (after line 564)

```typescript
case 'scatter':
  return (
    <ResponsiveContainer {...commonProps}>
      <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
        <XAxis 
          dataKey={dataKeys[0] || 'x'} 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          dataKey={dataKeys[1] || 'y'}
          stroke="hsl(var(--muted-foreground))" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Scatter 
          data={chartData} 
          fill={modernColors[0]}
        >
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={modernColors[idx % modernColors.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
```

### 3.2 Add Funnel Chart (Issue C3)

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`  
**Location:** Inside `renderChart` switch statement

```typescript
case 'funnel':
  return (
    <ResponsiveContainer {...commonProps}>
      <FunnelChart>
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Funnel
          dataKey="value"
          data={chartData}
          isAnimationActive
        >
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={modernColors[idx % modernColors.length]} />
          ))}
          <LabelList 
            position="right" 
            fill="hsl(var(--foreground))" 
            fontSize={10}
            dataKey="name"
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
```

### 3.3 Add Composed Chart (Issue C4)

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`  
**Location:** Inside `renderChart` switch statement

```typescript
case 'composed':
  return (
    <ResponsiveContainer {...commonProps}>
      <ComposedChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <RechartsTooltip contentStyle={tooltipStyle} />
        {/* First data key as bars */}
        {dataKeys.slice(0, 1).map((key, idx) => (
          <Bar 
            key={key} 
            dataKey={key} 
            fill={modernColors[idx]} 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        ))}
        {/* Second data key as line overlay */}
        {dataKeys.slice(1, 2).map((key, idx) => (
          <Line 
            key={key} 
            type="monotone" 
            dataKey={key} 
            stroke={modernColors[idx + 1]} 
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
```

### 3.4 Add Chart Loading State

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`

**Add loading state:**
```typescript
const [isChartLoading, setIsChartLoading] = useState(false);
```

**Add loading skeleton component:**
```typescript
const ChartLoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    <p className="text-xs text-muted-foreground">Loading chart...</p>
  </div>
);
```

**Wrap chart render with loading check:**
```typescript
{isChartLoading ? (
  <ChartLoadingSkeleton />
) : (
  renderChart()
)}
```

---

## Phase 4: Fix Navigation Wiring

### 4.1 Use React Router for Internal Navigation (Issue D2)

**File:** `src/hooks/useChartActions.ts`

**Current:**
```typescript
window.location.href = action.targetUrl;
```

**New:**
```typescript
import { useNavigate } from 'react-router-dom';

export const useChartActions = ({ onSendMessage, onActionTrigger }: UseChartActionsProps = {}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleActionClick = useCallback((action: ActionableItem) => {
    switch (action.actionType) {
      case 'navigate':
        if (action.targetUrl) {
          // Check if internal or external link
          if (action.targetUrl.startsWith('http://') || action.targetUrl.startsWith('https://')) {
            window.open(action.targetUrl, '_blank');
          } else {
            navigate(action.targetUrl);
          }
        }
        toast({
          title: 'Navigating',
          description: action.title,
        });
        break;
      // ... rest of cases remain unchanged
    }
  }, [onSendMessage, onActionTrigger, toast, navigate]);
  
  return { handleActionClick, handleDeepDiveClick };
};
```

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/hooks/useSidebarTrendData.ts` | **CREATE** | Smart auto-detect hook for historical data |
| `src/components/ai-chat/VisualizationSidebar.tsx` | **MODIFY** | Timeframe selector, real trends, quality assessment, insight classification, 3 new chart types, loading state |
| `src/hooks/useChartActions.ts` | **MODIFY** | React Router navigation |

---

## What Will NOT Change (Per Your Choices)

| Feature | Current State | Reason |
|---------|---------------|--------|
| PNG/PDF Export | Disabled buttons | You said "No changes needed" |
| Feedback Buttons | Console.log only | You said "No changes needed" |
| Deep Dive Close | Closes sidebar | You said "Close sidebar" |
| Share Button | Copies URL | You said "No changes needed" |
| Fullscreen | Not wired | You said "No changes needed" |
| Excel Export | TSV with .xlsx | You said "No changes needed" |
| Table Edit Persist | Local state only | You said "No changes needed" |

---

## Implementation Order

1. **Phase 1** - Create `useSidebarTrendData.ts` hook with smart auto-detect
2. **Phase 2** - Update VisualizationSidebar:
   - Add timeframe selector state and UI
   - Integrate trend data hook
   - Replace mock trends with real calculations
   - Fix comparison value fallback
   - Add combined data quality assessment
   - Add insight classification function
3. **Phase 3** - Add missing chart types (scatter, funnel, composed) with loading skeleton
4. **Phase 4** - Update useChartActions with React Router navigation

---

## Database Tables Used (Read-Only)

The smart auto-detect will query these existing tables:

| Data Source | Table | Fields Used |
|-------------|-------|-------------|
| Campaign Analytics | `campaign_analytics` | views, clicks, conversions, date |
| Content Analytics | `content_items` | created_at, status counts |
| Market Research | `serp_tracking_history` | position, rankings, created_at |
