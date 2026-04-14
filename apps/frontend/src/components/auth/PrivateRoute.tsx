import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Wraps routes that require authentication.
 * If user is not authenticated, redirects to /login with the attempted URL saved.
 */
export const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // While auth is loading (initial refresh), show a minimal loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-brand-600/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#818cf8" />
            </svg>
          </div>
          <p className="text-sm text-theme-muted font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

/**
 * Wraps routes that require admin role.
 */
export const AdminRoute = () => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!user?.role || !['super-admin', 'content-admin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
