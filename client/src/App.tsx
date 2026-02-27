import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleRoute } from "./components/auth/RoleRoute";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { BatchDetails } from "./pages/BatchDetails";

// ── Placeholder dashboard shells (replace with real pages later) ───────────────
const DashboardShell: React.FC<{ role: string }> = ({ role }) => {
  const { user, logout } = useAuthContext();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: "#F7F0F0" }}
    >
      <span className="text-5xl">🌾</span>
      <h1 className="text-3xl font-extrabold" style={{ color: "#25671E" }}>
        {role} Dashboard
      </h1>
      <p className="text-sm" style={{ color: "rgba(37,103,30,0.6)" }}>
        Logged in as <strong>{user?.name}</strong> ({user?.email})
      </p>
      <button
        onClick={logout}
        className="px-6 py-2 rounded-xl text-sm font-bold"
        style={{ backgroundColor: "#25671E", color: "#F7F0F0" }}
      >
        Sign out
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* ── Owner routes ── */}
          <Route
            path="/owner/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["owner"]}>
                  <DashboardShell role="Owner" />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── Manager routes ── */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["manager"]}>
                  <DashboardShell role="Manager" />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── QC routes ── */}
          <Route
            path="/qc/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["qc_rep"]}>
                  <DashboardShell role="QC Representative" />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── Legacy dashboard (protected, any role) ── */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batch-details"
            element={
              <ProtectedRoute>
                <BatchDetails />
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
