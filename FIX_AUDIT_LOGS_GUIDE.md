# 🔧 Fix: Audit Logs Schema Mismatch

## Issue Identified

**Problem:** The signup trigger tries to insert `organization_id` into the `audit_logs` table, but this column doesn't exist in the base schema.

**Symptoms:**
- Signup may fail with database error
- Error logs show: `column "organization_id" does not exist`
- Users can't complete registration

**Root Cause:**
- `supabase-schema.sql` defines `audit_logs` without `organization_id`
- `002_auth_signup_flow.sql` tries to INSERT with `organization_id`
- Schema mismatch causes signup failure

---

## ✅ Solution Applied

Created migration **`003_fix_audit_logs_schema.sql`** that:

1. ✅ Adds `organization_id` column to `audit_logs` (idempotent)
2. ✅ Adds index on `organization_id` for performance
3. ✅ Wraps audit log insertions with error handling
4. ✅ Ensures auth operations NEVER fail due to audit log issues

---

## 📦 Apply the Fix

### Option 1: Using Supabase CLI (Recommended)

**Windows PowerShell:**
```powershell
# From project root
cd C:\Users\fredd\Downloads\care-connect-pro-3454f6a2

# Login to Supabase (if not already)
supabase login

# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration to production
supabase db push
```

**For Local Development:**
```powershell
# Start local Supabase (if not running)
supabase start

# Apply migrations
supabase db reset

# Or just push the new migration
supabase db push
```

---

### Option 2: Manual SQL (If No CLI)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

2. **Copy the entire SQL** from:
   - `supabase/migrations/003_fix_audit_logs_schema.sql`

3. **Paste and Run** in the SQL editor

4. **Verify Success:**
   - You should see: "Migration 003 completed successfully!"
   - Check that `organization_id` column exists:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'audit_logs';
   ```

---

## 🧪 Verify the Fix

### 1. Check Column Exists

Run in Supabase SQL Editor:
```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;
```

**Expected:** You should see `organization_id` in the list.

### 2. Test Signup Flow

**Manual Test:**
1. Go to `/signup`
2. Fill in organization details
3. Create account
4. Should receive verification email ✅
5. No database errors in logs ✅

**Check Audit Log:**
```sql
SELECT
  id,
  organization_id,
  user_name,
  action,
  entity_type,
  created_at
FROM audit_logs
WHERE action = 'SIGNUP'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** Recent signups should have `organization_id` populated.

---

## 🔍 What Changed

### Before Fix:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name VARCHAR(200) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  changes JSONB,
  -- ❌ organization_id missing!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### After Fix:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name VARCHAR(200) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  changes JSONB,
  organization_id UUID REFERENCES organizations(id),  -- ✅ Added!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ Index added for performance
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
```

### Error Handling Added:
```sql
-- Log the signup in audit logs (with error handling)
BEGIN
  INSERT INTO audit_logs (...) VALUES (...);
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block signup
    RAISE WARNING 'Failed to log signup audit: %', SQLERRM;
END;
```

**Benefit:** Even if audit logging fails, signup will succeed!

---

## 📊 Migration File Structure

Your project now has:

```
supabase/
└── migrations/
    ├── 001_multi_tenant_foundation.sql   ✅
    ├── 002_auth_signup_flow.sql          ✅
    └── 003_fix_audit_logs_schema.sql     ✅ NEW
```

---

## ⚠️ Important Notes

1. **Safe to Run Multiple Times:**
   - Migration checks if column exists before adding
   - Won't break if already applied

2. **No Data Loss:**
   - Adds column, doesn't drop anything
   - Existing audit_logs remain intact

3. **Backward Compatible:**
   - Old code still works
   - New code now works correctly

4. **Production Safe:**
   - No downtime required
   - Can be applied during live traffic

---

## 🎯 Success Criteria

After applying the fix:

- ✅ Signup completes without database errors
- ✅ `audit_logs` table has `organization_id` column
- ✅ New signups are logged with organization context
- ✅ Existing audit logs remain accessible
- ✅ Error handling prevents auth failures

---

## 🚀 Next Steps

1. **Apply migration** to production (see Option 1 or 2 above)
2. **Test signup** with a new test account
3. **Verify audit log** entry was created
4. **Monitor logs** for any remaining errors

If you see any issues, check:
- Supabase logs for detailed error messages
- That the migration ran successfully
- That organizations table exists (required reference)

---

**Status:** ✅ Migration created and ready to apply
