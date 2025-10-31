# 🎯 Deploy Edge Function Via Supabase Dashboard (Easy!)

## No CLI Required - Do This Instead!

### Step 1: Open Supabase Dashboard

Go to: **https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif**

### Step 2: Navigate to Edge Functions

1. Click **Edge Functions** in the left sidebar
2. Click **"Create a new function"** or **"+ New function"**

### Step 3: Create the Function

**Function name:** `send-email`

**Copy and paste this code:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, replyTo } = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured in Edge Function secrets')
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@careconnectpro.com',
        to: [to],
        subject,
        html,
        reply_to: replyTo || 'support@careconnectpro.com',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
```

### Step 4: Add Your Resend API Key

1. In the Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **Edge Functions** in the left menu
3. Scroll to **"Secrets"** section
4. Click **"Add new secret"**
5. **Name:** `RESEND_API_KEY`
6. **Value:** `re_CgaC89L1_AKjbwdHqNPnWRokdX4dbBHnZ`
7. Click **"Save"**

### Step 5: Deploy the Function

1. Go back to **Edge Functions**
2. Click **"Deploy"** button for your `send-email` function
3. Wait for deployment to complete (should take 10-30 seconds)

---

## ✅ Test It!

After deployment:

1. **Refresh** your browser: http://localhost:5173/EmailTest
2. **Enter** your email address
3. **Click** any test button
4. **Check** your inbox! 📬

**No more CORS errors!**

---

## Verify It's Working

### Check Function Logs

1. In Supabase Dashboard → **Edge Functions**
2. Click on `send-email` function
3. Click **"Logs"** tab
4. You'll see each email send attempt here

### Test Manually

You can also test the function directly from the dashboard:

1. Go to Edge Functions → `send-email`
2. Click **"Invoke"** tab
3. Paste this test payload:
```json
{
  "to": "your-email@example.com",
  "subject": "Test Email",
  "html": "<h1>Hello!</h1><p>This is a test email.</p>"
}
```
4. Click **"Run"**
5. Check your email!

---

## Troubleshooting

### "Function not found" in your app?

Make sure the function name is exactly: `send-email` (not `send_email` or anything else)

### "RESEND_API_KEY not configured" error?

1. Go to Project Settings → Edge Functions → Secrets
2. Make sure `RESEND_API_KEY` is listed there
3. Value should be: `re_CgaC89L1_AKjbwdHqNPnWRokdX4dbBHnZ`

### Still getting CORS errors?

1. Make sure the function is deployed (green checkmark in dashboard)
2. Refresh your browser with Ctrl+Shift+R (hard refresh)
3. Check browser console for the actual error

---

## Your Function URL

After deployment, your function will be available at:

```
https://ijexrlbxjexouxvkakif.supabase.co/functions/v1/send-email
```

Your app is already configured to use this URL!

---

## Next Steps

1. ✅ **Deploy the function** (follow steps above)
2. 📧 **Test emails** from http://localhost:5173/EmailTest
3. 🔍 **Monitor logs** in Supabase Dashboard
4. 🎉 **Start integrating** into your app!

---

**This is the easiest way to deploy - no CLI installation needed!** 🚀
