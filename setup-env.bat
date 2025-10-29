@echo off
echo ========================================
echo Care Connect Pro - Environment Setup
echo ========================================
echo.

echo Please enter your credentials:
echo.

set /p SUPABASE_URL="Supabase URL: "
set /p SUPABASE_KEY="Supabase Anon Key: "
set /p STRIPE_PK="Stripe Publishable Key: "
set /p STRIPE_SK="Stripe Secret Key: "

echo.
echo Adding environment variables to Vercel...
echo.

vercel env add VITE_SUPABASE_URL production <<< %SUPABASE_URL%
vercel env add VITE_SUPABASE_ANON_KEY production <<< %SUPABASE_KEY%
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production <<< %STRIPE_PK%
vercel env add STRIPE_SECRET_KEY production <<< %STRIPE_SK%
vercel env add VITE_APP_URL production <<< https://care-connect-pro-3454f6a2-c5lticwcc.vercel.app

echo.
echo ========================================
echo Environment variables added successfully!
echo ========================================
echo.
echo Next step: Redeploy your application
echo Run: vercel --prod
pause
