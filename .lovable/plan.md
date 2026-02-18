

# Remove Home Button from Navigation Bar

Since the Creaiter logo (already in the navbar) serves as the home link, the separate "Home" nav item is redundant and can be removed.

## Change

**File: `src/components/layout/NavItems.tsx`**

Remove the Home `NavItem` from the desktop navigation render (line 204):
```
<NavItem to={homeRoute} icon={<Home className="h-4 w-4" />} label="Home" active={isHomeActive} />
```

Also clean up:
- Remove the `Home` icon import from lucide-react (line 3) if no longer used elsewhere
- Remove the `homeRoute` and `isHomeActive` variables (lines 196-197) if no longer referenced

The mobile menu should also drop the Home entry to stay consistent.

No other files affected — the Creaiter logo link in `Navbar.tsx` already points to `/`.

