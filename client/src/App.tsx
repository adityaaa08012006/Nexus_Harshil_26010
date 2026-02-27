import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleRoute } from "./components/auth/RoleRoute";
import { AppLayout } from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { InventoryPage } from "./pages/InventoryPage";
import { BatchDetails } from "./pages/BatchDetails";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* ── Owner routes ── */}
          <Route
            path="/owner/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["owner"]}>
                  <AppLayout>
                    <Routes>
                      <Route path="dashboard" element={<OwnerDashboard />} />
                      <Route path="inventory" element={<InventoryPage />} />
                      <Route path="batch/:id" element={<BatchDetails />} />
                      <Route
                        path="*"
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </AppLayout>
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
                  <AppLayout>
                    <Routes>
                      <Route path="dashboard" element={<ManagerDashboard />} />
                      <Route path="inventory" element={<InventoryPage />} />
                      <Route path="batch/:id" element={<BatchDetails />} />
                      <Route
                        path="*"
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </AppLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── QC routes (placeholder for now) ── */}
          <Route
            path="/qc/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["qc_rep"]}>
                  <AppLayout>
                    <Routes>
                      <Route path="dashboard" element={<QCPlaceholder />} />
                      <Route path="inventory" element={<InventoryPage />} />
                      <Route path="batch/:id" element={<BatchDetails />} />
                      <Route
                        path="*"
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </AppLayout>
                </RoleRoute>
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

// ── QC Placeholder Dashboard ───────────────────────────────────────────────────

const QCPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <span className="text-4xl mb-4">🔬</span>
    <h2 className="text-xl font-bold mb-2" style={{ color: "#25671E" }}>
      QC Dashboard
    </h2>
    <p className="text-sm text-gray-500">Coming soon in Phase III</p>
  </div>
);

export default App;
