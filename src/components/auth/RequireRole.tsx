import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotAuthorizedPage } from '../../pages/NotAuthorizedPage';
import { centralStore } from '../../data/centralStore';

interface RequireRoleProps {
  roles: Array<'investigator' | 'normal_user' | 'recipient'>;
  children?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles, children }) => {
  const { user, isAuthenticated, role } = useAuth();
  const location = useLocation();
  const loggedAttemptRef = useRef<string | null>(null);

  const isAllowed = roles.some((r) => {
    const normalizedRole = r === 'recipient' ? 'normal_user' : r;
    return normalizedRole === role;
  });

  useEffect(() => {
    if (isAuthenticated && !isAllowed) {
      const attemptKey = `${location.pathname}::${user?.userId || 'ANON'}`;
      if (loggedAttemptRef.current !== attemptKey) {
        loggedAttemptRef.current = attemptKey;

        // Automatically log Access Denied to central store so it appears on the admin log
        centralStore.logAccessDenied({
          requester: user?.name || 'Unknown Officer',
          rank: user?.rank || 'Officer',
          unit: user?.unit || 'Naval Unit',
          deviceId: user?.deviceId || 'TERM-UNAUTH',
          documentId: location.pathname,
          documentName: `Restricted Area: ${location.pathname}`,
          reasonForDenial: 'Not Authorized',
        });
      }
    }
  }, [isAuthenticated, isAllowed, location.pathname, roles, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAllowed) {
    return <NotAuthorizedPage attemptedPath={location.pathname} requiredRole={roles.join(' / ')} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
