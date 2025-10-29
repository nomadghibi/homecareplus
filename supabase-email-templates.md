# Supabase Email Templates Configuration

## 1. Reset Password Template

**Location:** Supabase Dashboard → Authentication → Email Templates → "Reset Password"

### Subject Line:
```
Reset your Care Connect Pro password
```

### HTML Body Template:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                🔒 Reset Your Password
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hi there,
                            </p>

                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                We received a request to reset the password for your <strong>Care Connect Pro</strong> account.
                            </p>

                            <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Click the button below to create a new password:
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{{ .SiteURL }}/reset-password?token={{ .TokenHash }}&type=recovery"
                                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>

                            <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 4px; color: #4b5563; font-size: 12px; word-break: break-all;">
                                {{ .SiteURL }}/reset-password?token={{ .TokenHash }}&type=recovery
                            </p>

                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                <strong>⏱️ This link will expire in 1 hour</strong>
                            </p>

                            <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                <strong>Care Connect Pro</strong>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Professional Home Care Management Platform
                            </p>
                            <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px;">
                                Need help? Contact
                                <a href="mailto:support@careconnect.com" style="color: #0d9488; text-decoration: none;">support@careconnect.com</a>
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Email Footer -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 20px;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © 2025 Care Connect Pro. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 2. Confirm Signup Template (Optional but Recommended)

**Location:** Email Templates → "Confirm Signup"

### Subject Line:
```
Welcome to Care Connect Pro - Verify your email
```

### HTML Body Template:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                🎉 Welcome to Care Connect Pro!
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hi there,
                            </p>

                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Thanks for signing up! We're excited to have you on board.
                            </p>

                            <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Please verify your email address by clicking the button below:
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{{ .SiteURL }}/auth/confirm?token={{ .TokenHash }}&type=signup"
                                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>

                            <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 4px; color: #4b5563; font-size: 12px; word-break: break-all;">
                                {{ .SiteURL }}/auth/confirm?token={{ .TokenHash }}&type=signup
                            </p>

                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                <strong>⏱️ This link will expire in 24 hours</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                <strong>Care Connect Pro</strong>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Professional Home Care Management Platform
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 3. Configuration Settings

### Site URL Configuration:
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://care-connect-pro-3454f6a2-nsycrwitj.vercel.app`
3. Add **Redirect URLs**:
   - `https://care-connect-pro-3454f6a2-nsycrwitj.vercel.app/reset-password`
   - `https://care-connect-pro-3454f6a2-nsycrwitj.vercel.app/auth/confirm`
   - `http://localhost:5173/reset-password` (for local testing)
   - `http://localhost:5173/auth/confirm` (for local testing)

### Email Settings:
1. Go to **Authentication** → **Providers** → **Email**
2. Make sure **Enable Email provider** is ON
3. **Confirm email** can be optional or required (your choice)
4. **Secure email change** - Recommended: ON

### SMTP Settings (Optional - for custom emails):
If you want to use your own email service instead of Supabase's default:
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure with SendGrid, Resend, or your SMTP provider
3. For now, Supabase's default should work fine

---

## 4. Testing the Email Templates

### Test Password Reset:
```bash
# Option 1: Use Supabase Dashboard
1. Go to Authentication → Users
2. Find a test user
3. Click "..." → "Send password reset email"
4. Check your email

# Option 2: Use your app
1. Go to login page
2. Click "Forgot password?"
3. Enter email
4. Click "Send Reset Link"
5. Check email
```

### Important Variables in Templates:
- `{{ .SiteURL }}` - Your app URL (auto-filled by Supabase)
- `{{ .TokenHash }}` - Secure token for verification
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Full confirmation URL (alternative to manual construction)

---

## 5. Troubleshooting

### Emails not arriving?
1. **Check spam folder** - Most common issue
2. **Verify Site URL** - Must match your domain exactly
3. **Check email provider limits** - Free tier has limits
4. **Test with different email** - Some providers block transactional emails
5. **Enable email confirmation** - In Auth settings

### Emails going to spam?
For production, consider:
1. Set up custom SMTP (SendGrid, Resend)
2. Configure SPF/DKIM records
3. Use a custom domain email
4. Warm up your sending reputation

---

## 6. Quick Setup Steps

**Do this now:**

1. ✅ Open: https://supabase.com/dashboard/project/ijexrlbxjexouxvkakif/auth/templates
2. ✅ Click "Reset Password" template
3. ✅ Copy the HTML template above
4. ✅ Paste it into the template editor
5. ✅ Update the subject line
6. ✅ Click **Save**
7. ✅ Go to URL Configuration
8. ✅ Set Site URL to: `https://care-connect-pro-3454f6a2-nsycrwitj.vercel.app`
9. ✅ Add redirect URLs
10. ✅ Click **Save**

---

**Once you've done this, test it by:**
1. Going to your login page
2. Clicking "Forgot password?"
3. Entering your email
4. Checking your inbox (and spam!)

Let me know if you see the email! 📧
