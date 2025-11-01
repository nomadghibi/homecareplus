# 🚀 Care Connect Pro - Production Setup Guide

## Real User Signups with 30-Day Free Trial

This guide will help you set up Care Connect Pro for production with:
- ✅ Real user authentication via Supabase
- ✅ 30-day free trial on Starter plan
- ✅ Automatic resource limits based on subscription
- ✅ Trial expiration tracking
- ✅ Upgrade paths to paid plans

---

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] Supabase account (https://supabase.com)
- [ ] Vercel account for deployment (optional, but recommended)
- [ ] Domain name (optional, for custom domain)
- [ ] Stripe account (for paid plans - can be set up later)

---

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name:** Care Connect Pro
   - **Database Password:** Save this securely!
   - **Region:** Choose closest to your users
4. Click "Create new project"
5. Wait for setup to complete (~2 minutes)

### 1.2 Run the Subscription Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-trial-subscription-schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press `Ctrl/Cmd + Enter`)
6. Verify success: Should show "Success. No rows returned"

This creates:
- ✅ `subscriptions` table - Manages plans, trials, and limits
- ✅ `organizations` table - Stores agency details
- ✅ `usage_tracking` table - Tracks resource usage
- ✅ Automatic functions for limit checking
- ✅ Trigger to create trial subscription on signup

### 1.3 Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure settings:
   - ✅ Enable email confirmations: **OFF** (for faster signups)
     - OR: **ON** if you want to verify emails
   - ✅ Enable email OTP: **Optional**
4. Save changes

### 1.4 Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize these templates:
   - **Confirm Signup** - Welcome email
   - **Password Reset** - Reset instructions
   - **Magic Link** - If using magic links

---

## 🔑 Step 2: Get Supabase Credentials

### 2.1 Find Your Project URL and Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGci...
service_role key: eyJhbGci... (keep this SECRET!)
```

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Create `.env` File

Create a `.env` file in your project root:

```bash
# ============================================
# PRODUCTION CONFIGURATION
# ============================================

# Switch to Supabase (not mock mode)
VITE_USE_MOCK_MODE=false

# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...YOUR_ANON_KEY

# Stripe Configuration (for paid plans - optional for now)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_KEY
VITE_STRIPE_STARTER_PRICE_ID=price_xxx
VITE_STRIPE_PROFESSIONAL_PRICE_ID=price_xxx
VITE_STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# Application Settings
VITE_APP_NAME=Care Connect Pro
VITE_APP_URL=https://your-domain.com

# Email Service (if using Resend)
VITE_RESEND_API_KEY=re_xxxxx
```

### 3.2 Update `.env.example`

Make sure `.env.example` has all the variables (without actual values)

---

## 🚀 Step 4: Deploy to Vercel

### 4.1 Connect Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 4.2 Add Environment Variables in Vercel

1. In Vercel project settings, go to **Environment Variables**
2. Add ALL variables from your `.env` file:

```
VITE_USE_MOCK_MODE = false
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...
```

3. Click "Save"
4. Redeploy if needed

---

## 🧪 Step 5: Test the System

### 5.1 Test Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit http://localhost:5173 and test:

### 5.2 Test Signup Flow

1. Go to signup page
2. Create a new account:
   - Email: test@example.com
   - Password: Test123!
   - Name: Test User
   - Organization: Test Agency
3. Check Supabase:
   - **Authentication** → **Users**: Should see new user
   - **Table Editor** → **subscriptions**: Should see trial subscription
   - **Table Editor** → **organizations**: Should see organization

### 5.3 Verify Trial Settings

In Supabase, check the `subscriptions` table for your test user:

```sql
SELECT
    plan_name,
    plan_status,
    is_trial,
    trial_end_date,
    max_clients,
    max_caregivers,
    max_visits_per_month
FROM subscriptions
WHERE user_id = 'your-user-id';
```

Should show:
- `plan_name`: starter
- `plan_status`: trial
- `is_trial`: true
- `trial_end_date`: 30 days from signup
- `max_clients`: 50
- `max_caregivers`: 15
- `max_visits_per_month`: 500

---

## 📊 Step 6: Implement Resource Limits in Your App

### 6.1 Example: Checking Limits Before Creating Client

```javascript
import { withResourceLimitCheck } from '@/utils/resourceLimits';

// In your create client function
async function createClient(clientData) {
  try {
    // Wrap the create function with resource limit check
    const client = await withResourceLimitCheck('clients', async () => {
      // Your existing create logic
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    toast.success('Client created successfully!');
    return client;
  } catch (error) {
    // Error is already shown by withResourceLimitCheck
    console.error('Failed to create client:', error);
    throw error;
  }
}
```

### 6.2 Display Usage Stats in Dashboard

```javascript
import { getUsageStats } from '@/utils/resourceLimits';
import { useEffect, useState } from 'react';

function DashboardStats() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    async function loadUsage() {
      const stats = await getUsageStats();
      setUsage(stats);
    }
    loadUsage();
  }, []);

  if (!usage) return null;

  return (
    <div>
      <h3>Your Usage</h3>
      {usage.isTrial && (
        <p>Trial ends in {usage.trialDaysRemaining} days</p>
      )}
      <div>
        <p>Clients: {usage.clients.current} / {usage.clients.max}</p>
        <p>Caregivers: {usage.caregivers.current} / {usage.caregivers.max}</p>
        <p>Visits this month: {usage.visits.current} / {usage.visits.max}</p>
      </div>
    </div>
  );
}
```

---

## 🔄 Step 7: Set Up Automated Jobs

### 7.1 Reset Monthly Visit Counter

Create a Supabase Edge Function or use cron-job.org:

1. Go to **Database** → **Functions**
2. Create new function: `reset_monthly_visits`
3. Schedule to run on 1st of each month

Or use external cron service to call:
```sql
SELECT reset_monthly_visit_counters();
```

### 7.2 Update Expired Trials

Schedule daily to check for expired trials:

```sql
SELECT update_expired_trials();
```

This updates `plan_status` from `trial` to `expired` for trials past their end date.

---

## 💳 Step 8: Set Up Stripe (Optional - For Paid Plans)

### 8.1 Create Stripe Account

1. Go to https://stripe.com
2. Sign up and verify your account
3. Go to **Products** → Create products for each plan

### 8.2 Create Price IDs

For each plan (Starter, Professional, Enterprise):

1. Create product in Stripe
2. Add recurring price (monthly)
3. Copy the Price ID (`price_xxxxx`)
4. Add to environment variables:
   ```
   VITE_STRIPE_STARTER_PRICE_ID=price_xxx
   VITE_STRIPE_PROFESSIONAL_PRICE_ID=price_xxx
   VITE_STRIPE_ENTERPRISE_PRICE_ID=price_xxx
   ```

### 8.3 Set Up Webhooks

Create webhook endpoint for:
- `payment_intent.succeeded`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## 🎨 Step 9: Customize for Your Brand

### 9.1 Update Branding

All branding is already "Care Connect Pro". To customize:

1. Logo: Replace in `public/` directory
2. Colors: Update in `tailwind.config.js`
3. Fonts: Update in `index.html` or `tailwind.config.js`

### 9.2 Update Legal Pages

Create these pages:
- Terms of Service
- Privacy Policy
- Refund Policy

Link them in footer and signup flow.

---

## 📧 Step 10: Set Up Email Notifications

### 10.1 Trial Expiration Warnings

Send emails at:
- 7 days before expiration
- 3 days before expiration
- On expiration day
- 7 days after expiration (final reminder)

### 10.2 Resource Limit Warnings

Send email when users reach:
- 80% of any resource limit
- 100% of any resource limit

---

## 🚦 Step 11: Go Live!

### 11.1 Pre-Launch Checklist

- [ ] Supabase database set up and tested
- [ ] Environment variables configured
- [ ] Signup flow tested end-to-end
- [ ] Resource limits working correctly
- [ ] Trial expiration logic tested
- [ ] Email notifications configured
- [ ] Payment system tested (if using Stripe)
- [ ] Legal pages created
- [ ] Analytics set up (Google Analytics, etc.)
- [ ] Error monitoring set up (Sentry, etc.)

### 11.2 Launch!

1. Deploy to Vercel
2. Point custom domain (if applicable)
3. Enable SSL
4. Test everything in production
5. Start marketing!

---

## 📊 Monitoring & Maintenance

### Daily Tasks
- [ ] Check for signup errors
- [ ] Monitor resource usage
- [ ] Review trial expirations

### Weekly Tasks
- [ ] Review conversion rates (trial → paid)
- [ ] Check for abuse/spam signups
- [ ] Review support tickets

### Monthly Tasks
- [ ] Analyze churn rate
- [ ] Review pricing strategy
- [ ] Update features based on feedback

---

## 🆘 Troubleshooting

### Issue: Users not getting trial subscription

**Check:**
1. Is the trigger `on_auth_user_created_subscription` enabled?
2. Check Supabase logs for errors
3. Manually create subscription for testing:
```sql
SELECT create_trial_subscription();
```

### Issue: Resource limits not enforcing

**Check:**
1. Are the RPC functions created correctly?
2. Check function permissions
3. Test function manually:
```sql
SELECT check_resource_limit(
    'user-uuid'::uuid,
    'clients',
    1
);
```

### Issue: Trial not expiring

**Check:**
1. Is `update_expired_trials()` running daily?
2. Check `trial_end_date` values in database
3. Run manually:
```sql
SELECT update_expired_trials();
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Vercel Documentation](https://vercel.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

---

## 🎯 Key Features Enabled

✅ **Real User Signups** - Supabase Auth with email/password
✅ **30-Day Free Trial** - Automatically applied to all new signups
✅ **Starter Plan Limits** - 50 clients, 15 caregivers, 500 visits/month
✅ **Resource Enforcement** - Can't exceed limits without upgrading
✅ **Trial Expiration** - Automatic tracking and status updates
✅ **Upgrade Paths** - Seamless upgrade to Professional or Enterprise
✅ **Usage Tracking** - Real-time monitoring of resource consumption

---

## 💰 Next Steps for Monetization

1. **Complete Stripe Integration** - Enable paid subscriptions
2. **Add Payment Flow** - Checkout page for plan upgrades
3. **Trial Conversion Emails** - Automated email sequence
4. **Pricing Optimization** - A/B test different price points
5. **Annual Billing** - Offer discounts for annual plans
6. **Enterprise Sales** - White-glove onboarding for large agencies

---

**Ready to launch Care Connect Pro with real users and 30-day free trials!** 🚀

For questions or support, refer to the troubleshooting section or check Supabase logs.
