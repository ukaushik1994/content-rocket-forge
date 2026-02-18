

# Settings Modal — Apple-Inspired Theme Alignment

This is a large scope covering the Settings modal shell and all 7 sub-tabs. We will work through them one by one in a single pass.

---

## Phase 1: Settings Shell (`SettingsPopup.tsx`)

**Dialog container** — already uses `bg-card/95 backdrop-blur-2xl` from the shared dialog primitive, which is fine.

**Header** (line 71)
- Change `border-b` to `border-b border-border/10` (thinner divider)
- Settings icon: change to `text-muted-foreground` (remove default foreground weight)

**Sidebar** (line 83)
- Change `bg-muted/20 border-r` to `bg-transparent border-r border-border/10`
- Tab triggers (line 90): Remove `data-[state=active]:shadow-sm` — replace with `data-[state=active]:bg-muted/30` only, no shadow

---

## Phase 2: Profile Tab (`ProfileSettingsTab.tsx`)

**Progress dots** (lines 71-74, 109)
- Change completed dot from `bg-primary` to `bg-foreground` (muted, no color accent)

**Profile picture card** (line 156)
- Change `border bg-card hover:bg-accent/50` to `border border-border/20 bg-transparent hover:bg-muted/20`

**Avatar circle** (line 157)
- Change `bg-muted border` to `bg-muted/30 border border-border/20`

**Inputs** — default styling is acceptable, no changes needed

**Save button** — keep as `Button` default (functional accent is fine)

---

## Phase 3: API Keys Tab (`ApiSettings.tsx` + `SimpleProviderCard.tsx` + `CategorySection.tsx`)

**ApiSettings.tsx**
- Progress dots: `bg-primary` to `bg-foreground` (same pattern as Profile)
- Search input: add `bg-transparent border-border/20 focus:border-border/40` classes

**SimpleProviderCard.tsx**
- Loading skeleton (line 231): Change `bg-card hover:bg-accent/50` to `bg-transparent border-border/20`
- Collapsed icon container (line 252): Change `bg-primary/10` to `bg-muted/30`, icon from `text-primary` to `text-muted-foreground`
- Required pulse dot (line 257): Change `bg-primary` to `bg-foreground`
- Expanded card (line 273): Change `border rounded-lg bg-card` to `border border-border/20 rounded-lg bg-transparent`
- Expanded icon (line 282): Same — `bg-muted/30` instead of `bg-primary/10`, `text-muted-foreground` instead of `text-primary`
- Required badge (line 289): Change `text-primary bg-primary/10` to `text-muted-foreground bg-muted/30`
- Config section (line 305): Change `bg-muted/20` to `bg-transparent`

**CategorySection.tsx (api/)**
- Required pulse dot (line 49): `bg-primary` to `bg-foreground`
- Progress dots (line 62): `bg-primary` to `bg-foreground`

---

## Phase 4: Websites Tab (`WebsiteConnectionsSettings.tsx` + `WebsiteProviderCard.tsx`)

**WebsiteConnectionsSettings.tsx**
- No heavy styling to change beyond inherited components

**WebsiteProviderCard.tsx**
- Card (line 35): Change `<Card className="p-4">` to `<Card className="p-4 bg-transparent border-border/20">`
- Provider icon (line 44): Change `text-primary` to `text-muted-foreground`
- Connected badge (line 29): Change `text-green-600 border-green-600` to `text-green-500/70 border-green-500/30` (softer)

---

## Phase 5: Notifications Tab (`NotificationSettings.tsx`)

**Notification rows** (lines 102, 112, 122, 176, 186)
- Change `border bg-card hover:bg-accent/50` to `border border-border/20 bg-transparent hover:bg-muted/20`

**Progress dots**
- `bg-primary` to `bg-foreground`

---

## Phase 6: Prompts Tab (prompts/ sub-components)

**prompts/CategorySection.tsx**
- Hover (line 35): Change `hover:bg-muted/50` to `hover:bg-muted/20`
- Progress bar track (line 58): Keep `bg-muted` — fine
- Progress bar fill (lines 60-61): Change `bg-primary` / `bg-primary/60` to `bg-foreground` / `bg-foreground/60`

**prompts/MinimalFormatCard.tsx**
- Card border (lines 34-36): Change `border-primary/20 bg-primary/5` (configured) to `border-border/20 bg-transparent`. Unconfigured: `border-border hover:border-border/60` to `border-border/20 hover:border-border/40`
- Remove `hover:shadow-sm`
- Status dot (line 45): Change `bg-primary text-primary-foreground` to `bg-foreground text-background`
- Expanded border (line 68): Change `border-border/50` to `border-border/20`

**prompts/SearchBar.tsx**
- Progress bar fill (line 60): `bg-primary` to `bg-foreground`
- No other heavy styling

---

## Phase 7: Help and Tour Tab (`HelpAndTourSettings.tsx`)

**Header icon** (line 56)
- Change `text-primary` to `text-muted-foreground`

**Tour card** (line 65)
- Change `bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20` to `bg-transparent border border-border/20`

**Tour icon container** (line 67)
- Change `bg-gradient-to-br from-primary to-primary/80` to `bg-muted/30 border border-border/20`
- Sparkles icon: `text-primary-foreground` to `text-muted-foreground`

**Quick links** (line 100)
- Change `bg-muted/50 hover:bg-muted` to `bg-transparent border border-border/20 hover:bg-muted/20`
- Icon container (line 102): Change `bg-background border` to `bg-transparent border border-border/20`

---

## Phase 8: Engage Tab (`EngageIntegrationSettings.tsx`)

This is a thin wrapper around `<EngageSettings />` — no styling to change in the wrapper itself. The inner Engage settings follow their own design system (addressed separately if needed).

---

## Summary

| File | Key Changes |
|------|-------------|
| `SettingsPopup.tsx` | Thinner borders, remove sidebar fill and active shadows |
| `ProfileSettingsTab.tsx` | Transparent cards, muted progress dots |
| `ApiSettings.tsx` | Muted dots, flattened search |
| `api/SimpleProviderCard.tsx` | Remove `bg-card`, `bg-primary/10` icons, transparent everywhere |
| `api/CategorySection.tsx` | Muted dots |
| `NotificationSettings.tsx` | Transparent notification rows |
| `websites/WebsiteProviderCard.tsx` | Transparent card, muted icons |
| `prompts/CategorySection.tsx` | Muted progress bar |
| `prompts/MinimalFormatCard.tsx` | Remove primary tints, transparent cards |
| `prompts/SearchBar.tsx` | Muted progress bar |
| `HelpAndTourSettings.tsx` | Remove gradients, transparent cards and icon containers |

**12 files total, all following the same pattern**: replace `bg-card`, `bg-primary/10`, `shadow-sm`, and `border-primary/20` with `bg-transparent`, `border-border/20`, and `text-muted-foreground`.

