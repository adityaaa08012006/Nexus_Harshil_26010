import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

interface Props {
  children: React.ReactNode;
}

/** Redirects to /auth if the user is not authenticated. */
export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F0F0" }}
      >
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl animate-bounce">🌾</span>
          <p className="text-sm font-medium" style={{ color: "#25671E" }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
