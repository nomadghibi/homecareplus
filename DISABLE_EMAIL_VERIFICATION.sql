-- ============================================================================
-- TEMPORARY FIX: Disable Email Verification for Development
-- ============================================================================
-- Run this in Supabase SQL Editor to allow testing without email verification
-- ============================================================================

-- This allows you to:
-- 1. Sign up without needing to verify email
-- 2. Log in immediately after signup
-- 3. Test the full authentication flow

-- NOTE: In production, you should re-enable email verification for security!
-- ============================================================================

-- You cannot disable email verification via SQL - it's done in the dashboard
-- Go to: https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif/auth/providers
-- Scroll to "Email" provider
-- Uncheck "Enable email confirmations"
-- Click Save

-- However, you CAN manually confirm existing users:
-- If you already created a user and need to confirm their email, run:

-- REPLACE 'your-email@example.com' WITH YOUR ACTUAL EMAIL:
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com'
  AND email_confirmed_at IS NULL;

-- Check if it worked:
SELECT
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
