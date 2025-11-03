import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/api/supabaseClient';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing authentication callback...');

        // Get the hash from URL (Supabase uses URL hash for tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('[AuthCallback] Type:', type);
        console.log('[AuthCallback] Hash params:', Object.fromEntries(hashParams.entries()));

        // Check for errors
        if (error) {
          console.error('[AuthCallback] Error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed. Please try again.');

          setTimeout(() => {
            navigate(createPageUrl('AgencyLogin'));
          }, 3000);
          return;
        }

        // Wait a moment for Supabase to automatically process the token in the URL
        // (detectSessionInUrl is enabled in supabaseClient.js)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get the session to verify the token was processed
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('[AuthCallback] Session after processing:', !!session);
        console.log('[AuthCallback] Session error:', sessionError);

        if (sessionError) {
          throw sessionError;
        }

        // Handle different callback types
        if (type === 'signup' || type === 'email') {
          // Email confirmation callback
          if (session) {
            setStatus('success');
            setMessage('Email confirmed successfully! Please sign in with your credentials.');
            console.log('[AuthCallback] Email confirmed for user:', session.user.email);

            // Sign out the user - they should log in with password for security
            await supabase.auth.signOut();
            console.log('[AuthCallback] User signed out - must log in with password');

            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);

            // Wait 3 seconds then redirect to login
            setTimeout(() => {
              navigate(createPageUrl('AgencyLogin'));
            }, 3000);
          } else {
            throw new Error('No session established after token processing');
          }
        } else if (type === 'recovery') {
          // Password reset callback
          setStatus('success');
          setMessage('Redirecting to password reset page...');

          setTimeout(() => {
            navigate(createPageUrl('ResetPassword') + window.location.hash);
          }, 1000);
        } else {
          // Generic callback - check if user is authenticated
          if (session) {
            setStatus('success');
            setMessage('Authentication successful! Redirecting to dashboard...');

            setTimeout(() => {
              navigate(createPageUrl('Dashboard'));
            }, 1500);
          } else {
            throw new Error('Authentication failed - no session');
          }
        }

      } catch (error) {
        console.error('[AuthCallback] Error processing callback:', error);
        setStatus('error');
        setMessage('Something went wrong. Redirecting to login...');

        setTimeout(() => {
          navigate(createPageUrl('AgencyLogin'));
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="mb-6">
              <Loader2 className="w-16 h-16 mx-auto text-teal-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Processing...
            </h2>
            <p className="text-slate-600">
              {message}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Success!
            </h2>
            <p className="text-slate-600">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Oops!
            </h2>
            <p className="text-slate-600">
              {message}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
