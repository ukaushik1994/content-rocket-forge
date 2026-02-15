

# Fix Seed Data & Column Mismatches Across Engage Module

## Problem Identified

The seed data utility (`seedData.ts`) and several component mutations reference **columns that don't exist** in the actual database tables. This causes the "Load Demo Data" function to fail silently, leaving all pages empty. Additionally, some component CRUD operations (social account linking) use wrong column names, so even manual creation would fail.

## Root Cause: Column Name Mismatches

| Table | Seed Data / Component Uses | Actual DB Column | Fix |
|-------|---------------------------|-------------------|-----|
| `social_posts` | `platform` | *(doesn't exist)* | Remove `platform` from seed inserts |
| `engage_automations` | `trigger_type`, `is_active` | *(don't exist)* -- uses `trigger_config`, `status` | Map to correct columns |
| `social_inbox_items` | `contact_id`, `channel` | `linked_contact_id`, *(no channel)* | Fix column names |
| `social_accounts` (link mutation) | `account_name`, `access_token`, `status` | `display_name`, `auth_data` | Fix SocialDashboard linkAccount mutation |

## Implementation Steps

### Step 1: Fix Seed Data (`src/utils/engage/seedData.ts`)

- **Social posts** (line ~203-228): Remove `platform` field from all 3 post objects
- **Automations** (line ~86-109): Replace `trigger_type` and `is_active` with proper `trigger_config` (already has it as nested) and `status` (`'active'`/`'paused'`)
- **Social inbox items** (line ~152-191): Rename `contact_id` to `linked_contact_id`, remove `channel` field

### Step 2: Fix Social Account Linking (`src/components/engage/social/SocialDashboard.tsx`)

- The `linkAccount` mutation (line ~202-220) inserts `account_name`, `access_token`, `status` which don't exist on `social_accounts`
- Fix to use `display_name` instead of `account_name` and wrap token in `auth_data` JSON instead of `access_token`
- Remove `status` field (doesn't exist on table)

### Step 3: Verify & Test

After fixing the column mappings, the "Load Demo Data" button in Settings will successfully populate all tables and every module page will show data.

## Files to Modify

1. `src/utils/engage/seedData.ts` -- fix all column name mismatches
2. `src/components/engage/social/SocialDashboard.tsx` -- fix linkAccount mutation columns

## No Database Changes Required

All tables have the correct schema already. Only the frontend code references need correction.

