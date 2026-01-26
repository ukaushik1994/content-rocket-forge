

# Widen Visualization Sidebar

## Current State
The visualization sidebar has these widths:
- Mobile: Full width (100%)
- Tablet (≥640px): 400px
- Desktop (≥1024px): 480px

## Proposed Change
Increase widths for a more spacious visualization area:
- Mobile: Full width (unchanged)
- Tablet (≥640px): 400px → **480px**
- Desktop (≥1024px): 480px → **560px**

## File to Modify
`src/components/ai-chat/VisualizationSidebar.tsx` (line 404)

```typescript
// Before
"w-full sm:w-[400px] lg:w-[480px]"

// After  
"w-full sm:w-[480px] lg:w-[560px]"
```

## Also Update
The chat area margin in `EnhancedChatInterface.tsx` should be updated to match the new sidebar width so content doesn't overlap:

```typescript
// Before
'lg:mr-[480px] sm:mr-[400px]'

// After
'lg:mr-[560px] sm:mr-[480px]'
```

## Result
- Charts and tables will have more horizontal space
- Better readability for data visualizations
- Maintains responsive behavior across breakpoints

