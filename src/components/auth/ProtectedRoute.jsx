import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createPageUrl } from '@/utils';

/**
 * ProtectedRoute Component
 *
 * Wrapper component that protects routes from unauthenticated access.
 * Automatically redirects to login if user is not authenticated.
 *
 * Usage:
 * <ProtectedRoute>
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 *
 * Or with custom redirect:
 * <ProtectedRoute redirectTo="AgencyLogin">
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({
  children,
  redirectTo = "AgencyLogin"
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={createPageUrl(redirectTo)} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};
