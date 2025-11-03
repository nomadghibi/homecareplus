# 🔧 FIX: Email Verification Sending Wrong Template

## Problem
When users sign up, they receive a **password reset** email instead of an **email confirmation** email.

## Root Cause
The Supabase "Confirm Signup" email template is not configured correctly in the dashboard, so it's falling back to the wrong template.

---

## ✅ Solution: Configure Email Template in Supabase Dashboard

### Step 1: Access Email Templates

1. Go to your Supabase Dashboard:
   **https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/templates**

2. Or navigate manually:
   - Open your Supabase project
   - Click **Authentication** in the left sidebar
   - Click **Email Templates**

---

### Step 2: Configure "Confirm Signup" Template

1. Click on **"Confirm signup"** template in the list

2. **Replace the entire template** with the content from:
   `EMAIL_TEMPLATE_CONFIRM_SIGNUP_WITH_REDIRECT.html`

3. **Subject Line:**
   ```
   Confirm your Care Connect Pro email address
   ```

4. **Key parts of the template URL** (line 42):
   ```html
   <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup&next=/login"
   ```

5. Click **Save Changes**

---

### Step 3: Verify Site URL Configuration

1. Go to **Authentication** → **URL Configuration**

2. Set **Site URL** to your production URL:
   ```
   https://care-connect-pro-3454f6a2-nsycrwitj.vercel.app
   ```

3. Add these to **Redirect URLs**:
   ```
   https://care-connect-pro-3454f6a2-nsycrwitj.vercel.app/auth/callback
   https://care-connect-pro-3454f6a2-nsycrwitj.vercel.app/agency-login
   http://localhost:5173/auth/callback
   http://localhost:5173/agency-login
   ```

4. Click **Save**

---

### Step 4: Test the Fix

1. Go to your signup page: `/signup`
2. Create a test account with a real email you can access
3. Check your email inbox (and spam folder)
4. You should now receive:
   - ✅ **Subject:** "Confirm your Care Connect Pro email address"
   - ✅ **Button:** "✓ Confirm Email Address"
   - ✅ **Link goes to:** `/auth/callback?token_hash=...&type=signup`

5. Click the verification link
6. You should be redirected to `/agency-login`
7. Log in with your credentials

---

## 📋 Template File Locations

The correct templates are already created in your project:

- **Email Verification Template:**
  `EMAIL_TEMPLATE_CONFIRM_SIGNUP_WITH_REDIRECT.html`

- **Password Reset Template:**
  See documentation in `supabase-email-templates.md`

---

## 🔍 How to Check If It's Fixed

### Before Fix:
```
User signs up → Receives "Reset Password" email → Wrong link
```

### After Fix:
```
User signs up → Receives "Confirm Email" email → Correct verification link
```

---

## ⚠️ Important Notes

1. **Don't edit the HTML directly in Supabase** - Copy the entire content from `EMAIL_TEMPLATE_CONFIRM_SIGNUP_WITH_REDIRECT.html`

2. **The template uses these variables:**
   - `{{ .SiteURL }}` - Your app URL (auto-filled by Supabase)
   - `{{ .TokenHash }}` - Secure verification token
   - `{{ .Email }}` - User's email address

3. **Template must redirect to `/auth/callback`** - This is where your AuthCallback page handles verification

4. **The `next=/login` parameter** - Tells the callback page where to redirect after verification

---

## 🆘 Still Having Issues?

### Email not arriving at all?
1. Check spam/junk folder
2. Verify Site URL matches your domain exactly
3. Try a different email provider (Gmail, Outlook)

### Getting wrong template?
1. Clear Supabase cache (wait 5 minutes after saving)
2. Test with a brand new email address
3. Check that you saved the "Confirm signup" template (not "Reset password")

### Link not working?
1. Verify `/auth/callback` route exists in your app ✅ (it does)
2. Check that redirect URLs are configured in Supabase
3. Look at browser console for errors

---

## 🎯 Quick Checklist

- [ ] Open Supabase Dashboard → Authentication → Email Templates
- [ ] Click "Confirm signup" template
- [ ] Copy content from `EMAIL_TEMPLATE_CONFIRM_SIGNUP_WITH_REDIRECT.html`
- [ ] Paste into template editor
- [ ] Update subject line
- [ ] Save changes
- [ ] Verify Site URL configuration
- [ ] Add redirect URLs
- [ ] Test with new signup

---

Once you complete these steps, the email verification flow will work correctly! 🎉
