import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import type { UserRole } from "../../lib/supabase";

interface Props {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

/**
 * Renders children only if the authenticated user's role is in `allowedRoles`.
 * Must be wrapped inside <ProtectedRoute> so we can assume the user is logged in.
 */
export const RoleRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const { user, roleRedirectPath } = useAuthContext();

  if (!user) return null; // ProtectedRoute handles the unauthenticated case

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleRedirectPath()} replace />;
  }

  return <>{children}</>;
};
