# Supabase Database Migration - Step-by-Step Guide

## Prerequisites Check

Before running migrations, verify you have:
- [ ] Supabase project created (Free or Pro tier)
- [ ] Access to Supabase SQL Editor (Dashboard → SQL Editor)
- [ ] Project reference ID handy (from project settings)

---

## Step 1: Verify Existing Schema

**Go to:** Supabase Dashboard → SQL Editor → "New query"

**Run this query to check existing tables:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected result:** If you see tables like `clients`, `caregivers`, `visits`, etc., your base schema is already in place. ✅

**If NO tables exist**, you need to run the base schema first:
1. Open `supabase-schema.sql`
2. Copy entire contents
3. Paste in SQL Editor
4. Click "Run"
5. Then run `supabase-subscription-schema.sql`
6. Then run `supabase-pricing-schema.sql`

---

## Step 2: Run Migration 001 - Multi-Tenant Foundation

**Purpose:** Adds organization_id to all tables, creates RLS policies, user_profiles, and invitations.

**Steps:**
1. Open file: `supabase/migrations/001_multi_tenant_foundation.sql`
2. Copy **entire contents** (400+ lines)
3. Go to SQL Editor → "New query"
4. Paste the contents
5. Click **"Run"** (bottom right)
6. Wait for completion (~5-10 seconds)

**Expected output:**
```
✓ Table user_profiles created
✓ Table user_invitations created
✓ organization_id added to 18 tables
✓ RLS policies created
✓ Helper functions created
✓ Success message displayed
```

**If you see errors:**
- "relation already exists" = OK, means table already there (from previous run)
- "function already exists" = OK, safe to ignore
- Any other error = Share with me for troubleshooting

---

## Step 3: Run Migration 002 - Auth & Signup Flow

**Purpose:** Auto-creates organization and user profile when users sign up.

**Steps:**
1. Open file: `supabase/migrations/002_auth_signup_flow.sql`
2. Copy **entire contents** (350+ lines)
3. Go to SQL Editor → "New query"
4. Paste the contents
5. Click **"Run"**
6. Wait for completion (~3-5 seconds)

**Expected output:**
```
✓ Trigger handle_new_user_signup created
✓ MFA tables created
✓ Session management ready
✓ Helper functions created
✓ Success message displayed
```

---

## Step 4: Run Migration 003 - Stripe Integration

**Purpose:** Adds Stripe customer/subscription tracking and webhook processing.

**Steps:**
1. Open file: `supabase/migrations/003_stripe_integration.sql`
2. Copy **entire contents** (600+ lines)
3. Go to SQL Editor → "New query"
4. Paste the contents
5. Click **"Run"**
6. Wait for completion (~5-10 seconds)

**Expected output:**
```
✓ stripe_webhook_events table created
✓ payment_methods table created
✓ subscription_events table created
✓ Webhook processing functions created
✓ Success message displayed
```

---

## Step 5: Verify Migration Success

**Run this verification query:**

```sql
-- Check new tables exist
SELECT
  COUNT(*) FILTER (WHERE table_name = 'user_profiles') as user_profiles_exists,
  COUNT(*) FILTER (WHERE table_name = 'user_invitations') as invitations_exists,
  COUNT(*) FILTER (WHERE table_name = 'stripe_webhook_events') as webhooks_exists,
  COUNT(*) FILTER (WHERE table_name = 'payment_methods') as payments_exists,
  COUNT(*) FILTER (WHERE table_name = 'subscription_events') as sub_events_exists
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Expected result:** All counts should be 1

**Check organization_id was added to tables:**

```sql
-- Verify organization_id column exists on key tables
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'organization_id'
ORDER BY table_name;
```

**Expected result:** Should show ~18 rows (clients, caregivers, visits, etc.)

**Check RLS is enabled:**

```sql
-- Verify RLS enabled on tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('clients', 'caregivers', 'visits', 'user_profiles')
ORDER BY tablename;
```

**Expected result:** All should have `rowsecurity = true`

**Check triggers were created:**

```sql
-- Verify signup trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%'
   OR trigger_name LIKE '%signup%';
```

**Expected result:** Should see `on_auth_user_created_org_profile` trigger

---

## Step 6: Test the Signup Flow (Optional but Recommended)

**Create a test user to verify everything works:**

```sql
-- Simulate user signup (this would normally come from Supabase Auth)
-- First, manually create a test auth user in: Authentication → Users → Add user

-- After creating user in Auth UI, manually trigger the signup function:
-- Replace 'user-uuid-here' with actual UUID from auth.users table

-- First check auth users exist:
SELECT id, email FROM auth.users LIMIT 5;

-- Pick one user ID and test the signup trigger:
-- (This would normally run automatically, but we're testing manually)

-- Example: Check if trigger created organization for existing users
SELECT
  u.id as user_id,
  u.email,
  up.id as profile_id,
  up.organization_id,
  o.name as org_name,
  o.subscription_status
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN organizations o ON o.id = up.organization_id
LIMIT 5;
```

**Expected result:**
- If users exist but no profiles: Trigger needs to be run manually OR create new user via signup flow
- If profiles exist: ✅ Everything working!

---

## Step 7: Set Up Authentication Email Templates (Important!)

1. Go to **Authentication** → **Email Templates**
2. Customize these templates with your branding:
   - **Confirm signup** - Sent when user signs up
   - **Magic Link** - For passwordless login (if using)
   - **Change Email Address** - When user changes email
   - **Reset Password** - For password resets

**Key settings:**
- Site URL: `https://app.your-domain.com` (or localhost for dev)
- Redirect URLs: Add these:
  - `https://app.your-domain.com/auth/callback`
  - `https://app.your-domain.com/reset-password`
  - `http://localhost:5173/auth/callback` (for local dev)
  - `http://localhost:5173/reset-password` (for local dev)

---

## Step 8: Configure Storage Buckets

**Create storage buckets for documents:**

1. Go to **Storage** → Click "Create bucket"

**Create these buckets:**

| Bucket Name | Public | Description |
|-------------|--------|-------------|
| `documents` | No | Client documents, care plans, PHI |
| `avatars` | Yes | User profile photos |
| `exports` | No | Data exports, reports |

**Then run these storage policies:**

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
```

---

## Step 9: Get Your API Keys

**You'll need these for the frontend:**

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (starts with eyJ)
   - **service_role key**: `eyJhbGc...` (different key, NEVER expose to frontend!)

**Save these securely** - you'll add them to `.env.production`

---

## Step 10: Enable Realtime (Optional)

For real-time features (messages, notifications):

1. Go to **Database** → **Replication**
2. Enable replication for:
   - [ ] `messages`
   - [ ] `notifications`
   - [ ] `visits` (for live EVV updates)

---

## Troubleshooting

### Error: "permission denied for schema public"
**Fix:** Your user needs permissions. Run:
```sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### Error: "relation already exists"
**Fix:** Table already exists from previous run. Safe to ignore or use `IF NOT EXISTS`.

### Error: "function already exists"
**Fix:** Function already created. Safe to ignore or add `OR REPLACE`.

### Error: "trigger already exists"
**Fix:** Trigger already created. Drop and recreate:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created_org_profile ON auth.users;
-- Then re-run the CREATE TRIGGER statement
```

### Migrations partially completed
**Fix:** Run this to see what succeeded:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles', 'user_invitations',
    'stripe_webhook_events', 'payment_methods'
  );
```

Then re-run only the failed migration.

---

## Success Checklist

After completing all steps, verify:

- [ ] All 3 migrations ran without errors
- [ ] `user_profiles` table exists
- [ ] `organization_id` column on all tables (clients, caregivers, visits, etc.)
- [ ] RLS enabled on all tables
- [ ] Signup trigger exists (`on_auth_user_created_org_profile`)
- [ ] Helper functions created (`get_user_organization_id`, etc.)
- [ ] Stripe tables created (`stripe_webhook_events`, `payment_methods`)
- [ ] Storage buckets created
- [ ] API keys copied to safe location

---

## Next Steps

Once migrations are complete:

1. ✅ **Backend deployed** (you just did this!)
2. ⏳ **Deploy Edge Function** (for Stripe webhooks)
3. ⏳ **Update frontend** (replace mock auth)
4. ⏳ **Configure Stripe** (products, prices, webhooks)
5. ⏳ **Deploy to Vercel/Netlify**

---

**Need help?** Share any error messages you encounter and I'll help troubleshoot!
