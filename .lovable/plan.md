

# Move Quick Filters into a Dropdown Next to Search Bar

## What Changes

### 1. Remove quick filters from Hero (`ContentApprovalHero.tsx`)
Delete lines 164-195 (the entire "Quick Filters" `motion.div` block). Also remove the `quickFilters` array definition (lines 45-51) and unused imports (`Clock`, `AlertCircle`, `CheckCircle2`, `XCircle`, `FileText` if no longer used). Remove `onQuickFilter` and `activeFilter` from props.

### 2. Add Status Filter dropdown in search bar area (`ModernContentApproval.tsx`)
In the search/filter section (lines 404 area), add a new `Select` dropdown for status filtering next to the existing Sort dropdown:

```tsx
<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-40 bg-background/40 border-border/50">
    <Filter className="h-4 w-4 mr-2" />
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All ({contentStats.all})</SelectItem>
    <SelectItem value="draft">Draft ({contentStats.draft})</SelectItem>
    <SelectItem value="pending_review">Pending ({contentStats.pending_review})</SelectItem>
    <SelectItem value="needs_changes">Changes ({contentStats.needs_changes})</SelectItem>
    <SelectItem value="approved">Approved ({contentStats.approved})</SelectItem>
    <SelectItem value="rejected">Rejected ({contentStats.rejected})</SelectItem>
  </SelectContent>
</Select>
```

### 3. Update Hero component call (`ModernContentApproval.tsx` ~line 375)
Remove `onQuickFilter` and `activeFilter` props from the `<ContentApprovalHero>` usage.

### Files Changed
- `src/components/approval/modern/ContentApprovalHero.tsx` — remove filters block + clean props
- `src/components/approval/modern/ModernContentApproval.tsx` — add status Select dropdown next to search, remove props from Hero call

