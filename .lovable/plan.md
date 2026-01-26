

# Reduce Chart Height

## Current State
All charts in the visualization sidebar use a fixed height of **320px** (set on line 218).

## Change
Reduce chart height from **320px** to **220px** for a more compact visualization that leaves more room for other content.

## File to Modify
`src/components/ai-chat/VisualizationSidebar.tsx` (line 218)

```typescript
// Before
const commonProps = { data: chartData, width: '100%', height: 320 };

// After
const commonProps = { data: chartData, width: '100%', height: 220 };
```

## Also Update Empty State
The empty state container (line 209) should match:

```typescript
// Before
<div className="flex items-center justify-center h-64 text-muted-foreground">

// After
<div className="flex items-center justify-center h-[220px] text-muted-foreground">
```

## Result
- Charts become more compact (220px vs 320px)
- More vertical space for summary and metrics below
- Maintains readability while reducing visual weight

