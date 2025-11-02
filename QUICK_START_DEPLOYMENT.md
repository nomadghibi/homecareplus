# Quick Start - Deploy to Your Supabase Project

**Project Reference**: `ijexrlbxjexouxvkakif`
**Project URL**: https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif

---

## Step 1: Check Existing Schema (5 minutes)

1. Go to: https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif/editor
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**
4. Paste this query:

```sql
-- Check what tables already exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

5. Click **"Run"** (or press Ctrl+Enter)

**What to look for:**
- ✅ If you see `clients`, `caregivers`, `visits`, `organizations` → Base schema exists, proceed to Step 2
- ❌ If you see NO tables or very few → You need to run base schema first (see Alternative Path below)

---

## Step 2: Run Migration 001 - Multi-Tenant Foundation (2 minutes)

**What this does:** Adds organization_id to all tables, creates user_profiles, RLS policies

1. In your code editor, open: `supabase/migrations/001_multi_tenant_foundation.sql`
2. **Select ALL** text (Ctrl+A)
3. **Copy** (Ctrl+C)
4. Go back to Supabase SQL Editor
5. Click **"New query"**
6. **Paste** the entire migration (Ctrl+V)
7. Click **"Run"**

**Expected output:**
```
✓ CREATE TABLE (user_profiles)
✓ CREATE TABLE (user_invitations)
✓ ALTER TABLE (adding organization_id columns)
✓ CREATE POLICY (RLS policies)
✓ CREATE FUNCTION (helper functions)
✓ NOTICE: Multi-tenant foundation migration completed successfully!
```

**If you see errors:**
- "already exists" errors = SAFE to ignore (means it ran before)
- Any other error = Stop and share the error message with me

---

## Step 3: Run Migration 002 - Auth & Signup Flow (1 minute)

**What this does:** Auto-creates organization when users sign up

1. Open: `supabase/migrations/002_auth_signup_flow.sql`
2. Copy ALL text
3. Go to SQL Editor → "New query"
4. Paste and click **"Run"**

**Expected output:**
```
✓ CREATE FUNCTION (handle_new_user_signup)
✓ CREATE TRIGGER (on_auth_user_created_org_profile)
✓ CREATE TABLE (user_mfa_methods, password_reset_log, user_sessions)
✓ NOTICE: Authentication & signup flow migration completed successfully!
```

---

## Step 4: Run Migration 003 - Stripe Integration (1 minute)

**What this does:** Adds Stripe webhook processing

1. Open: `supabase/migrations/003_stripe_integration.sql`
2. Copy ALL text
3. Go to SQL Editor → "New query"
4. Paste and click **"Run"**

**Expected output:**
```
✓ ALTER TABLE (adding Stripe columns to organizations)
✓ CREATE TABLE (stripe_webhook_events, payment_methods, subscription_events)
✓ CREATE FUNCTION (webhook processing functions)
✓ NOTICE: Stripe integration migration completed successfully!
```

---

## Step 5: Verify Everything Worked (2 minutes)

**Run this verification query:**

```sql
-- 1. Check new tables exist
SELECT 'New Tables Created:' as status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles',
    'user_invitations',
    'stripe_webhook_events',
    'payment_methods',
    'subscription_events'
  )
ORDER BY table_name;

-- 2. Check organization_id added to existing tables
SELECT 'organization_id added to:' as status;
SELECT table_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'organization_id'
ORDER BY table_name;

-- 3. Check RLS is enabled
SELECT 'RLS enabled on:' as status;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;

-- 4. Check signup trigger exists
SELECT 'Signup trigger:' as status;
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_org_profile';

-- 5. Check helper functions exist
SELECT 'Helper functions:' as status;
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_user_organization_id',
    'user_has_role',
    'handle_new_user_signup'
  )
ORDER BY routine_name;
```

**Expected results:**
- New tables: 5 rows (user_profiles, user_invitations, etc.)
- organization_id: ~18 rows (clients, caregivers, visits, etc.)
- RLS enabled: ~20+ tables
- Signup trigger: 1 row
- Helper functions: 3+ rows

---

## Step 6: Configure Authentication Settings (3 minutes)

1. Go to: https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif/auth/users
2. Click **"Configuration"** (top menu)
3. **Site URL**: Enter your app URL:
   - For development: `http://localhost:5173`
   - For production: `https://app.your-domain.com`
4. **Redirect URLs**: Add these (click "Add URL" for each):
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/reset-password`
   - `https://app.your-domain.com/auth/callback` (when ready)
   - `https://app.your-domain.com/reset-password` (when ready)
5. Scroll down and click **"Save"**

**Enable Email Confirmation:**
1. Scroll to "Auth Providers"
2. Make sure **Email** is enabled
3. Toggle **"Enable email confirmations"** = ON
4. Click **"Save"**

---

## Step 7: Create Storage Buckets (2 minutes)

1. Go to: https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif/storage/buckets
2. Click **"Create a new bucket"**
3. Create these 3 buckets:

**Bucket 1: documents**
- Name: `documents`
- Public: **NO** (uncheck)
- Click "Create bucket"

**Bucket 2: avatars**
- Name: `avatars`
- Public: **YES** (check)
- Click "Create bucket"

**Bucket 3: exports**
- Name: `exports`
- Public: **NO** (uncheck)
- Click "Create bucket"

**Then add storage policies:**

Go back to SQL Editor and run:

```sql
-- Documents bucket - organization members only
CREATE POLICY "Users can upload documents to their organization"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM user_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view documents in their organization"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM user_profiles WHERE user_id = auth.uid()
  )
);

-- Avatars bucket - public read, user write
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Exports bucket - organization members only
CREATE POLICY "Users can create exports for their organization"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'exports' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM user_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view exports from their organization"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'exports' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM user_profiles WHERE user_id = auth.uid()
  )
);
```

---

## Step 8: Get Your API Keys (1 minute)

1. Go to: https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif/settings/api
2. **Copy these values** to a safe place (you'll need them for .env file):

```bash
# Project URL
VITE_SUPABASE_URL=https://ijexrlbxjexouxvkakif.supabase.co

# Anon/Public Key (safe for frontend)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# (copy the full key - starts with eyJ)

# Service Role Key (NEVER expose to frontend!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# (copy the full key - different from anon key)
```

3. Update your `.env.production` file with these values
4. Also update `.env` (for local development)

---

## Step 9: Test the Database (2 minutes)

**Create a test to verify RLS works:**

```sql
-- Test 1: Check subscription plans exist
SELECT name, display_name, monthly_price, max_clients
FROM subscription_plans
ORDER BY tier_level;

-- Expected: Should see Free, Starter, Professional, Enterprise

-- Test 2: Try to query clients (should be empty or blocked by RLS)
SELECT * FROM clients LIMIT 5;

-- Expected: Empty result (no clients yet) or RLS error (good!)

-- Test 3: Check helper function works
SELECT get_user_organization_id();

-- Expected: NULL (you're not logged in as a user yet)

-- Test 4: Check trigger is ready
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user_signup';

-- Expected: 1 row showing function exists
```

---

## ✅ Success Checklist

Mark off each item as you complete it:

- [ ] Migration 001 ran successfully
- [ ] Migration 002 ran successfully
- [ ] Migration 003 ran successfully
- [ ] Verification query shows all new tables
- [ ] organization_id exists on ~18 tables
- [ ] RLS enabled on all tables
- [ ] Auth settings configured (Site URL, Redirect URLs)
- [ ] 3 storage buckets created (documents, avatars, exports)
- [ ] Storage policies created
- [ ] API keys copied and saved
- [ ] Test queries ran successfully

---

## 🎉 You're Done with Backend Deployment!

**What you've accomplished:**
- ✅ Multi-tenant database with RLS (tenant isolation)
- ✅ Auto-signup flow (creates org + profile + trial)
- ✅ Stripe integration ready
- ✅ User invitation system
- ✅ Secure file storage with policies
- ✅ Authentication configured

---

## Next Steps

1. **Update your .env files** with the Supabase keys
2. **Deploy Stripe webhook Edge Function** (I'll help with this)
3. **Update frontend code** to use real Supabase Auth
4. **Configure Stripe** (products, prices, webhooks)
5. **Deploy to Vercel**

**Let me know when you complete the checklist above, and I'll help with the next phase!**

---

## Need Help?

If you encounter any errors:
1. Copy the full error message
2. Note which step you were on
3. Share with me and I'll troubleshoot

Common issues and fixes are in `MIGRATION_STEPS.md` (Troubleshooting section).
