

# Continue Implementation: Format Badges + Cleanup

## Remaining Items

Two things left from the original restructure plan:

### 1. Repurposed Format Badges on Original Article Cards

When an article has been repurposed into Twitter, LinkedIn, Email, etc., the `SimplifiedRepositoryCard` should show tiny platform icons in the footer area so users can see at a glance which formats were generated.

**How it works:**
- The `useRepositoryContent` hook already has all repurposed items with `sourceContentId` linking back to the original
- Build a lookup map: `contentId -> Set of formatCodes` from the repurposed items
- Pass the format codes to `SimplifiedRepositoryCard` as a prop
- Render small colored icons (from `platformIcons.ts`) next to the "Updated X ago" timestamp

**Changes:**
- `CategoryContent.tsx`: Build the format-badge map from `unifiedItems` and pass it to `RepositoryCard`
- `SimplifiedRepositoryCard.tsx`: Accept optional `repurposedFormats` prop, render a row of tiny platform icons (e.g., Twitter, LinkedIn, Mail) in the footer when formats exist

### 2. Remove Unused `RepositoryContent.tsx`

The old `RepositoryContent.tsx` component is no longer used by any active code path (replaced by `CategoryContent.tsx`). It is only referenced in the barrel export `index.ts`.

**Changes:**
- `src/components/repository/index.ts`: Remove the `RepositoryContent` export line
- `src/components/repository/RepositoryContent.tsx`: Delete the file

---

## Technical Details

### Format Badge Map Construction (in CategoryContent)

```text
repurposedFormats = Map<contentId, string[]>
  -- built by filtering unifiedItems where sourceType === 'repurposed'
  -- grouped by sourceContentId
  -- value = array of unique formatCodes (e.g., ['social-twitter', 'email', 'meme'])
```

### Badge UI (in SimplifiedRepositoryCard footer)

```text
[Updated 2 days ago]  [Twitter icon] [LinkedIn icon] [Email icon]  [Edit] [View]
```

- Each icon is 14x14px with its platform color from `getPlatformConfig()`
- Wrapped in a small `flex gap-1` container
- Tooltip on hover showing the platform name
- Max 5 icons shown; if more, show "+N" indicator

### Files to Modify
| File | Change |
|------|--------|
| `src/components/repository/CategoryContent.tsx` | Build format map, pass to RepositoryCard |
| `src/components/repository/SimplifiedRepositoryCard.tsx` | Accept + render format badges |
| `src/components/repository/RepositoryCard.tsx` | Pass through the new prop |
| `src/components/repository/index.ts` | Remove RepositoryContent export |

### File to Delete
| File |
|------|
| `src/components/repository/RepositoryContent.tsx` |
