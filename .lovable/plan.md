

# Make Active Provider Icon Match Navbar Button Size

## What
Replace the text-based pill (`ActiveProviderIndicator`) with a proper icon button showing the provider logo, sized to match the calendar and user buttons (rounded-full, `size="icon"`), positioned immediately left of the calendar button.

## Changes

### `src/components/ai/ActiveProviderIndicator.tsx`
- Replace the `<div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">` text pill with a `<Button variant="ghost" size="icon">` matching the navbar button style (`rounded-full border border-border/10 hover:border-border/30`)
- Inside the button, render `<ProviderLogo provider={...} size="sm" />` (16×16, same as CalendarDays icon)
- Keep the tooltip showing provider name + model
- Loading state: same button shell with a `Loader2` icon inside
- Hidden state: return `null` (unchanged)

### `src/components/layout/Navbar.tsx`
- Move `<ActiveProviderIndicator />` to sit directly before the Calendar button (it's already there, just confirm ordering)

