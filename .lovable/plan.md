

# Fix: Offerings page not showing saved data

## Root Cause
The console logs show `ℹ️ No authenticated user` from `supabase.auth.getUser()` at the same time as `Fetched solutions: []`. This indicates the Supabase client's auth session is stale or not yet refreshed when the DB query runs. The `AuthContext` uses `getSession()` (returns cached/local session), so `user` is set and `SolutionManager` fires the query — but the actual token sent to Supabase is expired or invalid, causing RLS to return zero rows silently.

## Fix

### Modify `src/services/offeringService.ts` — `getAllOfferings` method
Before querying, call `supabase.auth.getSession()` to ensure a fresh token is available. If no valid session exists, return early with an empty array and log a warning.

```typescript
async getAllOfferings(): Promise<EnhancedOffering[]> {
  try {
    // Ensure we have a valid session before querying
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.warn('No valid session for offerings query, attempting refresh...');
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      if (!refreshedSession) {
        console.error('Cannot fetch offerings: no authenticated session');
        return [];
      }
    }

    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offerings:', error);
      toast.error('Failed to load offerings');
      return [];
    }

    console.log('Fetched offerings count:', data?.length ?? 0);
    return this.transformDatabaseToEnhanced(data || []);
  } catch (error) { ... }
}
```

This ensures the token is refreshed before the RLS-dependent query runs, fixing the silent empty-result issue.

### Files changed
- `src/services/offeringService.ts` — add session validation/refresh before DB queries

