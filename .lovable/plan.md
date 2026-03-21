

# Fix: Repository Infinite Refresh Loop

## Root Cause

In `src/pages/Repository.tsx` line 65, the `useEffect` dependency array is:
```
[refreshContent, contentItems.length]
```

Every time `refreshContent()` runs, it updates `contentItems`, which changes `contentItems.length`, which re-triggers the effect, which calls `refreshContent()` again — infinite loop.

## Fix

**File: `src/pages/Repository.tsx` (line 29-65)**

Remove `contentItems.length` from the dependency array. The session storage check logic doesn't need it — it only needs to run once on mount.

Change the `useEffect` to run only on mount by using an empty dependency array (or just `[]`), and move `refreshContent` call outside the dependency concern:

```typescript
useEffect(() => {
  refreshContent();

  const contentDraftSaved = sessionStorage.getItem('content_draft_saved');
  const glossarySaved = sessionStorage.getItem('glossary_saved');
  const strategyContentSaved = sessionStorage.getItem('strategy_content_saved');
  
  if (contentDraftSaved === 'true' || glossarySaved === 'true' || strategyContentSaved === 'true') {
    const toastMessage = strategyContentSaved === 'true' 
      ? 'Loading your strategy content...'
      : 'Loading your new content...';
    const toastId = toast.loading(toastMessage);
    
    setTimeout(async () => {
      await refreshContent();
      const successMessage = strategyContentSaved === 'true'
        ? 'Strategy content saved and published successfully!'
        : 'Content loaded successfully';
      toast.success(successMessage, { id: toastId });
    }, 1000);
  }

  return () => {
    sessionStorage.removeItem('content_draft_saved');
    sessionStorage.removeItem('glossary_saved');
    sessionStorage.removeItem('strategy_content_saved');
    sessionStorage.removeItem('from_content_builder');
    sessionStorage.removeItem('from_glossary_builder');
    sessionStorage.removeItem('content_save_timestamp');
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**1 file, 1 line changed** (the dependency array). This stops the infinite loop while preserving the mount-time refresh and session storage handling.

