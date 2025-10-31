# 🔑 Add RESEND_API_KEY Secret - Step by Step

## You're Almost Done! Just Need to Add the Secret

The Edge Function is deployed and working - it just needs the API key.

---

## Method 1: Via Edge Function Settings (Easiest)

### Step 1: Open Your Supabase Dashboard

Click this link: **https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif**

### Step 2: Click "Edge Functions" in Left Sidebar

Look for the menu on the left side:
- Database
- Authentication
- Storage
- **👈 Edge Functions** (click this)
- Logs
- etc.

### Step 3: Find Your "send-email" Function

You should see a list of functions. Click on **"send-email"**

### Step 4: Go to Settings Tab

At the top of the function page, you'll see tabs:
- Invocations
- Logs
- **👈 Settings** (click this)

### Step 5: Add Environment Variable / Secret

On the Settings page, look for:
- "Environment Variables" section, OR
- "Secrets" section, OR
- "Configuration" section

Click **"Add new variable"** or **"Add secret"** button

### Step 6: Enter the Secret

- **Key/Name:** `RESEND_API_KEY`
- **Value:** `re_CgaC89L1_AKjbwdHqNPnWRokdX4dbBHnZ`

Click **"Save"** or **"Add"**

### Step 7: Redeploy the Function

After saving, you might see a message like "Function needs to be redeployed"

Click the **"Deploy"** or **"Redeploy"** button at the top

---

## Method 2: Via Project Settings

If you can't find it in the Edge Function settings:

### Step 1: Click the Gear Icon (⚙️)

Bottom left of the dashboard → **"Project Settings"**

### Step 2: Click "Edge Functions" in Left Menu

Under Project Settings, look for:
- General
- Database
- API
- **👈 Edge Functions** (click this)
- etc.

### Step 3: Scroll to "Secrets" Section

Look for a section called "Secrets" or "Environment Variables"

### Step 4: Add Secret

Click **"Add new secret"** and enter:
- **Name:** `RESEND_API_KEY`
- **Value:** `re_CgaC89L1_AKjbwdHqNPnWRokdX4dbBHnZ`

Click **"Save"**

---

## Method 3: Using Access Token (Advanced)

If you have a Supabase access token:

1. Get your access token from: https://supabase.com/dashboard/account/tokens
2. Run this command:

```bash
npx supabase@latest secrets set RESEND_API_KEY=re_CgaC89L1_AKjbwdHqNPnWRokdX4dbBHnZ --project-ref ijexrlbxjexouxvkakif --token YOUR_ACCESS_TOKEN
```

---

## ✅ Verify It Worked

After adding the secret:

1. Go to: **http://localhost:5173/EmailTest**
2. Enter your email
3. Click any test button
4. Check your inbox! 📬

If you still get the error, **redeploy the function**:
- Go to Edge Functions → send-email
- Click **"Deploy"** button at the top

---

## Troubleshooting

### Can't Find "Secrets" Section?

The Supabase UI changes sometimes. Try:
1. Edge Functions → send-email → Settings tab
2. Or: Project Settings → Edge Functions → Secrets
3. Or: Edge Functions → Configuration

### Secret Added But Still Getting Error?

**You MUST redeploy the function after adding secrets!**

1. Go to Edge Functions
2. Click on `send-email` function
3. Click the **"Deploy"** or **three dots ⋮** menu
4. Select **"Redeploy"**
5. Wait 10-20 seconds for redeployment

### Function Won't Redeploy?

Try creating a new deployment:
1. Go to Edge Functions → send-email
2. Click the code editor
3. Add a comment line (like `// Updated`)
4. Click **"Deploy"** again

---

## Still Stuck?

### Quick Check:

1. **Is the function deployed?**
   - Go to Edge Functions → should see green checkmark next to `send-email`

2. **Is the secret added?**
   - Project Settings → Edge Functions → Secrets
   - Should see `RESEND_API_KEY` listed with value masked as `••••••`

3. **Did you redeploy after adding secret?**
   - This is the most common issue! Secrets don't take effect until redeployment

---

## Screenshot Guide

If you're still having trouble, here's what to look for:

**Dashboard → Edge Functions:**
```
Edge Functions
├── send-email (your function)
│   ├── Invocations
│   ├── Logs
│   └── Settings ← Look here
│       └── Environment Variables/Secrets ← Add here
```

**Or Dashboard → Settings:**
```
Project Settings
├── General
├── Database
├── API
└── Edge Functions ← Look here
    └── Secrets ← Add here
```

---

## The Secret You Need to Add

Copy these exact values:

**Name/Key:**
```
RESEND_API_KEY
```

**Value:**
```
re_CgaC89L1_AKjbwdHqNPnWRokdX4dbBHnZ
```

---

**Once you add the secret and redeploy, emails will work!** 🚀
