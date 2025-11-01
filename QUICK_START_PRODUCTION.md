# 🚀 Quick Start: Real User Signups with 30-Day Free Trial

## What You Get

✅ **Real user authentication** via Supabase
✅ **30-day free trial** automatically applied to all signups
✅ **Starter plan limits**: 50 clients, 15 caregivers, 500 visits/month
✅ **Automatic trial expiration** after 30 days
✅ **Resource limit enforcement** - users can't exceed their plan limits
✅ **Upgrade paths** to Professional ($399) or Enterprise ($659)

---

## ⚡ 5-Minute Setup

### 1. Create Supabase Project (2 min)

```bash
1. Go to https://supabase.com → New Project
2. Name: Care Connect Pro
3. Set password (save it!)
4. Choose region
5. Click "Create"
```

### 2. Run Database Schema (1 min)

```bash
1. Supabase Dashboard → SQL Editor → New Query
2. Copy & paste: supabase-trial-subscription-schema.sql
3. Click "Run"
4. Done! ✓
```

### 3. Get API Keys (30 sec)

```bash
1. Supabase Dashboard → Settings → API
2. Copy:
   - Project URL
   - anon/public key
```

### 4. Configure Environment (1 min)

```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
VITE_USE_MOCK_MODE=false
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. Test Locally (30 sec)

```bash
npm install
npm run dev
```

Go to http://localhost:5173 and create a test account!

---

## 📊 What Happens on Signup

**User fills out signup form:**
```
Email: user@example.com
Password: ******
Name: John Doe
Organization: ABC Home Care
```

**Automatic backend magic:**
1. ✅ Supabase creates auth user
2. ✅ Trigger creates subscription record:
   - Plan: Starter ($199/month)
   - Status: Trial
   - Trial end: 30 days from now
   - Limits: 50 clients, 15 caregivers, 500 visits/month
3. ✅ Organization record created
4. ✅ User logged in automatically
5. ✅ Redirected to onboarding/dashboard

---

## 🎯 Resource Limits in Action

### When User Tries to Create 51st Client:

```
❌ "Resource limit reached"
📊 "You've reached the maximum number of clients (50)
    for your current plan. Please upgrade to add more."
[Upgrade Plan Button]
```

### When Trial Expires (Day 31):

```
⚠️ "Trial expired"
📅 "Your 30-day trial has expired.
    Please upgrade to continue using Care Connect Pro."
[Upgrade Now Button]
```

---

## 🔍 Verify It's Working

### Check in Supabase

After a test signup, check these tables:

**1. Authentication → Users**
```
Should see: user@example.com
```

**2. Table Editor → subscriptions**
```sql
plan_name: starter
plan_status: trial
is_trial: true
trial_end_date: [30 days from now]
max_clients: 50
max_caregivers: 15
```

**3. Table Editor → organizations**
```sql
organization_name: ABC Home Care
user_id: [matches auth user]
```

---

## 🚀 Deploy to Production (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Setup production with trials"
git push
```

### 2. Deploy to Vercel

```bash
1. Go to https://vercel.com
2. New Project → Import your repo
3. Add Environment Variables:
   VITE_USE_MOCK_MODE=false
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
4. Click "Deploy"
```

### 3. Test Production

Visit your Vercel URL and create a test account!

---

## 📋 Plan Features & Limits

| Feature | Starter (Trial→$199) | Professional ($399) | Enterprise ($659) |
|---------|---------------------|---------------------|-------------------|
| **Trial Period** | 30 days free ✓ | 30 days free ✓ | 30 days free ✓ |
| **Clients** | 50 | 200 | Unlimited |
| **Caregivers** | 15 | 50 | Unlimited |
| **Visits/Month** | 500 | 2,000 | Unlimited |
| **Users** | 5 | 15 | Unlimited |
| **Storage** | 10 GB | 50 GB | Unlimited |
| **EVV Tracking** | ✓ | ✓ | ✓ |
| **Mobile App** | ✓ | ✓ | ✓ |
| **Family Portal** | ✓ | ✓ | ✓ |
| **Advanced Reports** | ✗ | ✓ | ✓ |
| **API Access** | ✗ | ✓ | ✓ |
| **White-label** | ✗ | ✗ | ✓ |
| **Support** | Email | Priority | 24/7 Phone |

---

## 💡 Common Use Cases

### Scenario 1: New User Signs Up

```
Day 1: Sign up → Gets Starter trial (30 days free)
Day 10: Adds 25 clients, 8 caregivers ✓
Day 20: Gets warning: "Trial ending in 10 days"
Day 28: Gets warning: "Trial ending in 2 days"
Day 30: Trial expires → Must upgrade to continue
```

### Scenario 2: User Hits Limit During Trial

```
Day 15: Has 49 clients
Tries to add 51st client → ❌ "Limit reached"
Options:
  A) Upgrade to Professional (200 clients)
  B) Delete old clients
  C) Wait for trial to end and upgrade
```

### Scenario 3: User Upgrades Mid-Trial

```
Day 20: Trial has 10 days left
Upgrades to Professional → $399/month
Trial ends immediately
Subscription starts (billed monthly)
New limits: 200 clients, 50 caregivers, 2000 visits
```

---

## 🛠️ How to Implement Resource Checks

### In Your Create Functions

```javascript
import { withResourceLimitCheck } from '@/utils/resourceLimits';

async function createClient(clientData) {
  try {
    // This checks limits AND increments usage automatically
    const client = await withResourceLimitCheck('clients', async () => {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    return client;
  } catch (error) {
    // User-friendly error already shown
    throw error;
  }
}
```

### Display Usage in Dashboard

```javascript
import { getUsageStats } from '@/utils/resourceLimits';

function UsageDisplay() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    getUsageStats().then(setUsage);
  }, []);

  return (
    <div>
      {usage?.isTrial && (
        <Alert>Trial ends in {usage.trialDaysRemaining} days</Alert>
      )}
      <Progress value={usage?.clients.percentage} />
      <span>{usage?.clients.current} / {usage?.clients.max} clients</span>
    </div>
  );
}
```

---

## 🔒 Security Features

✅ **Row-Level Security (RLS)** - Users can only see their own data
✅ **Secure API keys** - Anon key is safe for frontend use
✅ **Password hashing** - Handled by Supabase
✅ **SQL injection protection** - Parameterized queries
✅ **Rate limiting** - Built into Supabase

---

## 📊 Monitoring Your Users

### Daily Checks

```sql
-- New signups today
SELECT COUNT(*) FROM auth.users
WHERE created_at::date = CURRENT_DATE;

-- Active trials
SELECT COUNT(*) FROM subscriptions
WHERE is_trial = true AND plan_status = 'trial';

-- Trials expiring soon (next 7 days)
SELECT COUNT(*) FROM subscriptions
WHERE is_trial = true
AND trial_end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```

### Conversion Metrics

```sql
-- Trial to paid conversion rate
SELECT
  COUNT(CASE WHEN is_trial = false THEN 1 END) * 100.0 /
  COUNT(*) as conversion_rate
FROM subscriptions;
```

---

## 🆘 Troubleshooting

### Issue: New users don't get trial subscription

**Fix:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_subscription';

-- Manually create for existing user
SELECT create_trial_subscription();
```

### Issue: Resource limits not enforcing

**Fix:**
```sql
-- Test the function
SELECT check_resource_limit(
  'user-uuid-here'::uuid,
  'clients',
  1
);
```

### Issue: Trial not expiring

**Fix:**
```sql
-- Run expiration check manually
SELECT update_expired_trials();
```

---

## 📚 Files Created for You

| File | Purpose |
|------|---------|
| `supabase-trial-subscription-schema.sql` | Database schema with trials & limits |
| `src/utils/resourceLimits.js` | JavaScript utilities for limit checking |
| `PRODUCTION_SETUP_GUIDE.md` | Detailed step-by-step guide |
| `QUICK_START_PRODUCTION.md` | This file - quick reference |
| `.env.example` | Template with all required variables |

---

## ✅ Pre-Launch Checklist

Before going live with marketing:

- [ ] Supabase project created and schema deployed
- [ ] Test signup works locally
- [ ] Test signup works on Vercel
- [ ] Resource limits enforced correctly
- [ ] Trial expiration works (test with past date)
- [ ] Upgrade flow tested
- [ ] Email notifications set up
- [ ] Legal pages created (Terms, Privacy)
- [ ] Analytics installed (Google Analytics, Mixpanel)
- [ ] Error monitoring set up (Sentry)
- [ ] Pricing page updated
- [ ] Landing page ready
- [ ] Social media accounts created
- [ ] Support email set up

---

## 🎉 You're Ready!

Your platform now has:
✅ Real user signups
✅ 30-day free trials
✅ Resource limits
✅ Professional infrastructure

**Next steps:**
1. Test everything thoroughly
2. Deploy to production
3. Start marketing!
4. Watch the signups roll in 🚀

---

**Questions?** Check `PRODUCTION_SETUP_GUIDE.md` for detailed instructions.

**Need help?** Open an issue or check Supabase logs for debugging.

Good luck with your launch! 🎊
