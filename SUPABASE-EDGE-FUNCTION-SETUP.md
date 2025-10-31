# Supabase Edge Function Setup for Email Notifications

## Why Edge Functions?

Email APIs cannot be called directly from the browser due to CORS security restrictions. We need a backend service to send emails. Supabase Edge Functions are perfect for this - they're serverless, secure, and easy to deploy.

---

## Quick Setup (5 Steps)

### Step 1: Install Supabase CLI

```bash
# Windows (PowerShell as Administrator)
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser for authentication.

### Step 3: Link Your Project

```bash
cd "C:\Users\fredd\Downloads\care-connect-pro-3454f6a2"
supabase link --project-ref ijexrlbxjexouxvkakif
```

### Step 4: Set Your Resend API Key as Secret

```bash
supabase secrets set RESEND_API_KEY=re_CgaC89L1_AKjbwdHqNPnWRokdX4dbBHnZ
```

### Step 5: Deploy the Edge Function

```bash
supabase functions deploy send-email
```

---

## Update Your Code

After deployment, your Edge Function will be available at:
```
https://ijexrlbxjexouxvkakif.supabase.co/functions/v1/send-email
```

The email services are already configured to use this! No code changes needed.

---

## Test It

After deploying, go back to:
**http://localhost:5173/EmailTest**

Enter your email and click any button. Emails should now send successfully!

---

## Troubleshooting

### Edge Function Not Working?

1. Check deployment status:
```bash
supabase functions list
```

2. View logs:
```bash
supabase functions logs send-email
```

3. Test the function directly:
```bash
curl -X POST https://ijexrlbxjexouxvkakif.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello!</h1><p>This is a test.</p>"
  }'
```

### Common Issues

**"RESEND_API_KEY not configured"**
- Run: `supabase secrets set RESEND_API_KEY=re_CgaC89L1_AKjbwdHqNPnWRokdX4dbBHnZ`

**"Function not found"**
- Make sure you deployed: `supabase functions deploy send-email`

**"401 Unauthorized"**
- Check your Supabase anon key is correct in `.env`

---

## Alternative: Local Development

For local testing without deploying:

1. Start Supabase locally:
```bash
supabase start
```

2. Serve the function locally:
```bash
supabase functions serve send-email --env-file .env
```

3. Update `.env` to use local function:
```env
VITE_SUPABASE_FUNCTIONS_URL=http://localhost:54321/functions/v1
```

---

## Production Checklist

- [ ] Supabase CLI installed
- [ ] Logged into Supabase
- [ ] Project linked
- [ ] Resend API key set as secret
- [ ] Edge Function deployed
- [ ] Tested email sending from app
- [ ] Monitored function logs

---

## Next Steps

1. **Deploy now** using the 5 steps above
2. **Test emails** from your app
3. **Monitor** function logs for any issues
4. **Celebrate** - your email system is production-ready! 🎉

---

## Need Help?

- Supabase CLI Docs: https://supabase.com/docs/guides/cli
- Edge Functions Guide: https://supabase.com/docs/guides/functions
- Check function logs: `supabase functions logs send-email --tail`

---

**This is the proper, production-ready solution for sending emails!**
