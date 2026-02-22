

## Undo Accidental Profile Columns Migration

You added 8 columns to the `profiles` table that need to be removed. Since these are brand new columns with no data in them, this is safe to reverse.

### What will be removed
- `full_name`, `birthdate`, `title`, `organization`, `bio`, `location`, `linkedin_url`, `phone`

### How to do it
Run this SQL in your **Supabase SQL Editor**:

```sql
ALTER TABLE profiles
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS birthdate,
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS organization,
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS linkedin_url,
  DROP COLUMN IF EXISTS phone;
```

### Steps
1. Go to **Supabase SQL Editor**
2. Paste and run the SQL above
3. Confirm the columns are gone

No code changes are needed since these columns were never used in the app.

