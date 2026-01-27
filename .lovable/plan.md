
# Fix Modal Height Consistency

## Problem Analysis

The onboarding modal changes height as users navigate between steps because:

1. **Illustrations have varying heights**: Each illustration (Welcome, Analytics, AI Chat, etc.) has different amounts of content - some are compact, others are tall
2. **Content side varies too**: Different step descriptions and benefits take different vertical space
3. **No fixed container height**: The current layout uses `min-h-[380px]` which allows content to push the modal taller
4. **Buttons shift position**: Footer controls move up/down as the content area expands/contracts

## The Solution

Create a **fixed-height modal** with proper internal layout:

```
┌────────────────────────────────────────────┐
│  Header (fixed height ~70px)               │
├────────────────────────────────────────────┤
│                                            │
│  Content Area (FIXED HEIGHT)               │
│  ┌──────────────┬──────────────────────┐   │
│  │ Illustration │ Text Content         │   │
│  │ (centered    │ (scrollable if       │   │
│  │  in fixed    │  content overflows)  │   │
│  │  container)  │                      │   │
│  └──────────────┴──────────────────────┘   │
│                                            │
├────────────────────────────────────────────┤
│  Footer Controls (fixed height ~90px)      │
│  [Progress] [Prev] [Dots] [Next] [Skip]    │
└────────────────────────────────────────────┘
```

## Technical Changes

### File 1: `OnboardingCarousel.tsx`

**Changes:**
- Set explicit fixed height on main container: `h-[680px]` (desktop) / responsive for mobile
- Use flexbox with `flex-col` to create fixed header/footer with flexible middle
- Remove `max-h-[calc(90vh-180px)]` from content area, replace with `flex-1 overflow-hidden`
- Content area becomes a flex container that fills remaining space

### File 2: `OnboardingStep.tsx`

**Changes:**
- Change illustration container from `min-h-[380px]` to `h-full` to fill available space
- Add `overflow-hidden` to illustration container to prevent overflow
- Make the right content column scrollable with `overflow-y-auto` if content exceeds space
- Illustrations will be centered within their fixed-height container

### Files 3-10: All Illustration Components

**Changes:**
- Add `max-h-full` to prevent illustrations from exceeding their container
- Wrap content in a container with `scale-[0.9]` or similar to ensure fit
- Use `overflow-hidden` on root container to clip any overflow
- Keep animations but constrain them within boundaries

**Illustrations to update:**
- `WelcomeIllustration.tsx`
- `ContentSuiteIllustration.tsx`
- `ResearchIllustration.tsx`
- `StrategyIllustration.tsx`
- `CampaignIllustration.tsx`
- `AnalyticsIllustration.tsx`
- `AIChatIllustration.tsx`
- `IntegrationsIllustration.tsx`

## Layout Specifications

```css
/* Modal container */
height: 680px (fixed)
max-height: 90vh (safety for small screens)

/* Header */
height: ~72px (flex-shrink-0)

/* Footer */
height: ~96px (flex-shrink-0)

/* Content area */
height: remaining space (~512px)
display: flex
overflow: hidden

/* Illustration side */
width: 50%
height: 100%
display: flex
align-items: center
justify-content: center
overflow: hidden

/* Text content side */
width: 50%
height: 100%
overflow-y: auto (if needed)
padding: appropriate
```

## Expected Result

After these changes:
- Modal will maintain **exactly the same height** on all 8 steps
- Navigation buttons (Previous, Next, Skip) will **never shift position**
- Illustrations will be **centered and scaled** to fit within their fixed container
- Text content that's too long will scroll **within its column only**
- Smooth user experience with predictable, stable layout
