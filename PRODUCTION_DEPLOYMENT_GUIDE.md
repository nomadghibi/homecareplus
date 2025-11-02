# Care Connect Pro - Production Deployment Guide

This guide walks you through deploying Care Connect Pro to production as a secure, multi-tenant SaaS platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Stripe Configuration](#stripe-configuration)
4. [Supabase Configuration](#supabase-configuration)
5. [Environment Variables](#environment-variables)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Security Checklist](#security-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- [ ] Supabase account (Pro plan recommended)
- [ ] Stripe account (activated for live mode)
- [ ] Vercel account (or alternative hosting)
- [ ] Domain name (configured with SSL)
- [ ] Email service (Resend, SendGrid, or AWS SES)
- [ ] (Optional) Monitoring service (Sentry, LogRocket)

### Required Tools
- [ ] Node.js 18+ and npm/yarn installed
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] Git configured
- [ ] Access to project repository

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and set project details:
   - **Name**: care-connect-pro-production
   - **Database Password**: Generate strong password (save securely!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Pro (recommended for production)
4. Wait for project to initialize (~2 minutes)

### Step 2: Run Database Migrations

```bash
# Link your project
supabase link --project-ref your-project-ref

# Run migrations in order
supabase db push

# Or manually via SQL Editor:
# 1. Open Supabase SQL Editor
# 2. Run each migration file in order:
#    - supabase/migrations/001_multi_tenant_foundation.sql
#    - supabase/migrations/002_auth_signup_flow.sql
#    - supabase/migrations/003_stripe_integration.sql
#    - supabase-subscription-schema.sql
#    - supabase-pricing-schema.sql
#    - supabase-notifications-schema.sql
```

### Step 3: Verify Database Schema

```sql
-- Run in SQL Editor to verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Should return:
-- clients, caregivers, visits, organizations, user_profiles,
-- subscription_plans, invoices, payment_transactions, etc.
```

### Step 4: Populate Subscription Plans

The migration already includes default plans, but verify with:

```sql
SELECT name, display_name, tier_level, monthly_price, max_clients
FROM subscription_plans
ORDER BY tier_level;
```

Expected output:
- Free Trial ($0, 10 clients)
- Starter ($99, 50 clients)
- Professional ($299, 200 clients)
- Enterprise ($599, unlimited)

---

## Stripe Configuration

### Step 1: Activate Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete account activation (business details, tax info, bank account)
3. Switch to **Live Mode** (toggle in top right)

### Step 2: Create Products & Prices

```bash
# Or use Stripe Dashboard UI:
# Products → Create Product

# For each plan (Starter, Professional, Enterprise):
```

1. **Create Product**:
   - Name: "Care Connect Pro - Starter"
   - Description: "For small home care agencies getting started"
   - Upload product image (optional)

2. **Create Prices**:
   - **Monthly**:
     - Amount: $99.00
     - Billing period: Monthly
     - Currency: USD
   - **Annual**:
     - Amount: $990.00 (20% discount)
     - Billing period: Yearly
     - Currency: USD

3. **Copy Price IDs** (format: `price_xxxxxxxxxxxxx`)
   - Save for environment variables

### Step 3: Update Subscription Plans with Stripe IDs

```sql
-- Run in Supabase SQL Editor
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_starter_monthly_xxxx',
    stripe_price_id_annual = 'price_starter_annual_xxxx',
    stripe_product_id = 'prod_starter_xxxx'
WHERE name = 'starter';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_pro_monthly_xxxx',
    stripe_price_id_annual = 'price_pro_annual_xxxx',
    stripe_product_id = 'prod_pro_xxxx'
WHERE name = 'professional';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_enterprise_monthly_xxxx',
    stripe_price_id_annual = 'price_enterprise_annual_xxxx',
    stripe_product_id = 'prod_enterprise_xxxx'
WHERE name = 'enterprise';
```

### Step 4: Configure Stripe Webhooks

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://[your-project-ref].supabase.co/functions/v1/stripe-webhook`
4. **Select events to listen to**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.upcoming`
   - `payment_method.attached`
   - `payment_method.detached`
   - `customer.created`
   - `customer.updated`
5. Click **Add endpoint**
6. **Copy Signing Secret** (format: `whsec_xxxxx`) - save for environment variables

---

## Supabase Configuration

### Step 1: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider:
   - [x] Enable Email provider
   - [x] Confirm email
   - Email template: Customize with branding
3. Configure **Auth Settings**:
   - Site URL: `https://app.your-domain.com`
   - Redirect URLs:
     - `https://app.your-domain.com/auth/callback`
     - `https://app.your-domain.com/reset-password`
   - JWT expiry: 3600 (1 hour recommended)
   - Refresh token expiry: 604800 (7 days)
4. (Optional) Configure MFA:
   - Enable TOTP/SMS based MFA

### Step 2: Deploy Edge Functions

```bash
# Deploy Stripe webhook handler
supabase functions deploy stripe-webhook \
  --project-ref your-project-ref \
  --no-verify-jwt

# Set environment secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
```

### Step 3: Configure Storage Buckets

```bash
# Create storage buckets
supabase storage create documents --public false
supabase storage create avatars --public true
supabase storage create exports --public false

# Or via Dashboard:
# Storage → Create bucket
```

**Storage Policies** (run in SQL Editor):

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

### Step 4: Enable Realtime (Optional)

For real-time features (messages, notifications):

1. Go to **Database** → **Replication**
2. Enable replication for tables:
   - [ ] messages
   - [ ] notifications
   - [ ] visits (for live EVV updates)

### Step 5: Set up Database Backups

1. Go to **Settings** → **Database**
2. Enable **Point-in-Time Recovery** (Pro plan)
3. Set backup retention: 30 days
4. Configure backup notifications

---

## Environment Variables

### Step 1: Create Production Environment File

```bash
cp .env.production.example .env.production
```

### Step 2: Fill in All Required Values

See `.env.production.example` for complete list. **Critical variables**:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App URLs
VITE_APP_URL=https://app.your-domain.com
VITE_MOCK_MODE=false # CRITICAL: Must be false!

# Email
RESEND_API_KEY=re_xxxxx
VITE_EMAIL_FROM=notifications@your-domain.com
```

### Step 3: Verify No Secrets in Frontend Build

```bash
# Build frontend
npm run build

# Verify no secrets leaked
grep -r "sk_live" dist/ # Should return nothing
grep -r "service_role" dist/ # Should return nothing
```

---

## Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Set root directory: ./
# - Build command: npm run build
# - Output directory: dist
# - Install command: npm install

# Add environment variables via Vercel Dashboard:
# Settings → Environment Variables
# Copy all VITE_ prefixed variables from .env.production
```

**Configure Custom Domain**:
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `app.your-domain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~5-60 minutes)
5. Vercel will auto-issue SSL certificate

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Configure build settings:
# Build command: npm run build
# Publish directory: dist
```

### Option C: Self-Host with Nginx

```bash
# Build production bundle
npm run build

# Copy dist/ to web server
scp -r dist/* user@server:/var/www/care-connect-pro/

# Nginx configuration
# /etc/nginx/sites-available/care-connect-pro
```

```nginx
server {
    listen 443 ssl http2;
    server_name app.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/care-connect-pro;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

---

## Post-Deployment Verification

### Functional Testing Checklist

- [ ] **Signup Flow**:
  ```
  1. Navigate to /signup
  2. Enter organization details
  3. Create account
  4. Verify email sent
  5. Confirm email
  6. Check organization created in Supabase
  7. Check user_profile created with 'owner' role
  8. Verify 30-day trial subscription
  ```

- [ ] **Login Flow**:
  ```
  1. Logout
  2. Navigate to /login
  3. Login with credentials
  4. Verify redirected to Dashboard
  5. Check user session in browser devtools
  6. Verify organization context loaded
  ```

- [ ] **Multi-Tenancy**:
  ```
  1. Create second organization (different email)
  2. Login as org 1, create client
  3. Login as org 2, verify client not visible
  4. Check Supabase RLS working correctly
  ```

- [ ] **Subscription & Billing**:
  ```
  1. Navigate to Billing page
  2. Click "Upgrade Plan"
  3. Complete Stripe Checkout
  4. Verify subscription updated in Supabase
  5. Check webhook processed in stripe_webhook_events table
  6. Verify invoice created
  7. Test Customer Portal access
  ```

- [ ] **Data Isolation (Critical!)**:
  ```sql
  -- As org 1 admin, try to access org 2 data:
  SELECT * FROM clients WHERE organization_id = '<org-2-id>';
  -- Should return: empty (blocked by RLS)
  ```

- [ ] **Invitations**:
  ```
  1. Invite team member
  2. Check invitation email sent
  3. Accept invitation (new browser/incognito)
  4. Verify user added to organization
  5. Verify correct role assigned
  ```

- [ ] **Resource Limits**:
  ```
  1. Create clients up to plan limit
  2. Try to create one more
  3. Verify error: "Client limit reached"
  4. Check upgrade prompt shown
  ```

### Security Testing

- [ ] **Test RLS Policies**:
  ```bash
  # Use Supabase SQL Editor with 'RLS enabled' toggle
  SELECT * FROM clients; # Should only show own org's data
  ```

- [ ] **API Security**:
  ```bash
  # Try to call API without auth token
  curl https://your-project-ref.supabase.co/rest/v1/clients \
    -H "apikey: your_anon_key"
  # Should return: 401 Unauthorized
  ```

- [ ] **CORS Configuration**:
  ```bash
  # Test from unauthorized origin
  curl -H "Origin: https://malicious-site.com" \
       -H "Access-Control-Request-Method: POST" \
       -X OPTIONS \
       https://your-project-ref.supabase.co/rest/v1/clients
  # Should reject
  ```

### Performance Testing

- [ ] Run Lighthouse audit (target: 90+ score)
- [ ] Test page load times < 3 seconds
- [ ] Verify database queries using indexes
- [ ] Check bundle size < 500KB gzipped

---

## Monitoring & Maintenance

### Set Up Monitoring

1. **Supabase Monitoring**:
   - Dashboard → Reports
   - Monitor: API requests, database connections, storage usage
   - Set up alerts for:
     - High error rate (> 5%)
     - Database CPU > 80%
     - Storage > 80% capacity

2. **Sentry Error Tracking**:
   ```bash
   npm install @sentry/react @sentry/vite-plugin
   ```
   - Configure in `src/main.tsx`
   - Set up alerts for errors

3. **Uptime Monitoring**:
   - Use UptimeRobot, Pingdom, or StatusCake
   - Monitor endpoints:
     - `https://app.your-domain.com`
     - `https://your-project-ref.supabase.co/rest/v1/`
   - Alert if down > 1 minute

### Scheduled Maintenance Tasks

Set up Supabase **Database** → **Cron Jobs** (pg_cron):

```sql
-- Daily: Expire old invitations
SELECT cron.schedule(
  'expire-invitations',
  '0 2 * * *', -- Daily at 2 AM
  $$ SELECT auto_expire_invitations(); $$
);

-- Daily: Update trial statuses
SELECT cron.schedule(
  'update-trials',
  '0 3 * * *', -- Daily at 3 AM
  $$
    UPDATE organizations
    SET subscription_status = 'expired'
    WHERE subscription_status = 'trial'
      AND trial_ends_at < NOW();
  $$
);

-- Monthly: Reset visit counters
SELECT cron.schedule(
  'reset-visit-counters',
  '0 0 1 * *', -- 1st of month at midnight
  $$
    UPDATE organizations
    SET current_visits_this_month = 0;
  $$
);

-- Weekly: Clean up old audit logs (> 7 years for HIPAA)
SELECT cron.schedule(
  'cleanup-old-audits',
  '0 4 * * 0', -- Sundays at 4 AM
  $$
    DELETE FROM audit_logs
    WHERE created_at < NOW() - INTERVAL '7 years';
  $$
);
```

---

## Security Checklist

### Pre-Launch Security Audit

- [ ] **Authentication**:
  - [ ] Email verification required
  - [ ] Strong password policy (min 8 chars, complexity)
  - [ ] Rate limiting on login (max 5 attempts/15 min)
  - [ ] Session timeout configured (7 days max)
  - [ ] MFA available (optional but recommended)

- [ ] **Authorization**:
  - [ ] All RLS policies tested and verified
  - [ ] No direct database access from frontend
  - [ ] Role-based permissions enforced
  - [ ] API keys rotated and secured

- [ ] **Data Protection**:
  - [ ] All data encrypted in transit (HTTPS/TLS)
  - [ ] All data encrypted at rest (Supabase default)
  - [ ] PHI/PII properly secured
  - [ ] Backup encryption enabled
  - [ ] No sensitive data in logs

- [ ] **Infrastructure**:
  - [ ] Firewall rules configured
  - [ ] Database port not publicly exposed
  - [ ] Service role key never in frontend code
  - [ ] Environment variables properly secured
  - [ ] Secrets not in version control

- [ ] **Compliance**:
  - [ ] HIPAA compliance (if applicable)
  - [ ] Privacy policy published
  - [ ] Terms of service published
  - [ ] Cookie consent implemented
  - [ ] Data retention policies configured

- [ ] **Monitoring**:
  - [ ] Error tracking enabled (Sentry)
  - [ ] Access logs enabled
  - [ ] Audit trail implemented
  - [ ] Alerts configured for security events

---

## Troubleshooting

### Common Issues

**Issue**: "User not found" after signup
**Solution**: Check auth trigger fired:
```sql
SELECT * FROM user_profiles WHERE user_id = '<auth-user-id>';
-- If empty, trigger didn't fire. Run manually:
SELECT handle_new_user_signup();
```

**Issue**: RLS blocking legitimate queries
**Solution**: Check user's organization_id:
```sql
SELECT get_user_organization_id(); -- Should return UUID
```

**Issue**: Stripe webhook failing
**Solution**: Check Edge Function logs:
```bash
supabase functions logs stripe-webhook --tail
```

**Issue**: Invitations not working
**Solution**: Verify email service configured:
```sql
SELECT * FROM user_invitations WHERE status = 'pending';
```

### Support Resources

- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Community Discord: [Your Discord link]
- Support Email: support@your-domain.com

---

## Next Steps After Launch

1. **Monitor Key Metrics**:
   - Signups per day
   - Trial-to-paid conversion rate
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Support tickets

2. **Iterate Based on Feedback**:
   - User onboarding improvements
   - Feature requests
   - Bug fixes
   - Performance optimizations

3. **Scale Infrastructure**:
   - Upgrade Supabase plan as needed
   - Add caching layer (Cloudflare, Redis)
   - Implement CDN for assets
   - Optimize database queries

4. **Compliance & Security**:
   - Annual security audit
   - Penetration testing
   - HIPAA audit (if applicable)
   - SOC 2 certification (if applicable)

---

**Congratulations! Your Care Connect Pro SaaS platform is now live in production!** 🎉

For questions or issues, contact: support@your-domain.com
