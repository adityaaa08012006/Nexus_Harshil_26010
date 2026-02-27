import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WarehouseProvider } from "./context/WarehouseContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleRoute } from "./components/auth/RoleRoute";
import { AppLayout } from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import { AuthPage } from "./pages/AuthPage";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { InventoryPage } from "./pages/InventoryPage";
import { BatchDetails } from "./pages/BatchDetails";
import { SensorMonitoring } from "./pages/SensorMonitoring";
import { AlertsPage } from "./pages/AlertsPage";
import { WarehousesPage } from "./pages/WarehousesPage";
import { RequirementUpload } from "./pages/RequirementUpload";
import { PdfHistory } from "./pages/PdfHistory";
import { QCDashboard } from "./pages/QCDashboard";
import { QCOrders } from "./pages/QCOrders";
import { QCOrderTracking } from "./pages/QCOrderTracking";
import { AllocationManagePage } from "./pages/AllocationManagePage";
import { AllocationRequestPage } from "./pages/AllocationRequestPage";
import { FarmerManagement } from "./pages/FarmerManagement";
import { DispatchHistory } from "./pages/DispatchHistory";
import { ContactInfo } from "./pages/ContactInfo";
import ClickSpark from "./components/home/ClickSpark";

function App() {
  return (
    <ClickSpark
      sparkColor="#48A111"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <Router>
        <AuthProvider>
          <WarehouseProvider>
            <Routes>
              {/* ── Public routes ── */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* ── Owner routes ── */}
              <Route
                path="/owner/*"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={["owner"]}>
                      <AppLayout>
                        <Routes>
                          <Route
                            path="dashboard"
                            element={<OwnerDashboard />}
                          />
                          <Route
                            path="warehouses"
                            element={<WarehousesPage />}
                          />
                          <Route path="inventory" element={<InventoryPage />} />
                          <Route path="batch/:id" element={<BatchDetails />} />
                          <Route
                            path="sensors"
                            element={<SensorMonitoring />}
                          />
                          <Route path="alerts" element={<AlertsPage />} />
                          <Route
                            path="allocations"
                            element={<AllocationManagePage />}
                          />
                          <Route
                            path="dispatch"
                            element={<DispatchHistory />}
                          />
                          <Route
                            path="farmers"
                            element={<FarmerManagement />}
                          />
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
                          <Route
                            path="dashboard"
                            element={<ManagerDashboard />}
                          />
                          <Route path="inventory" element={<InventoryPage />} />
                          <Route
                            path="sensors"
                            element={<SensorMonitoring />}
                          />
                          <Route path="alerts" element={<AlertsPage />} />
                          <Route path="batch/:id" element={<BatchDetails />} />
                          <Route
                            path="allocations"
                            element={<AllocationManagePage />}
                          />
                          <Route
                            path="dispatch"
                            element={<DispatchHistory />}
                          />
                          <Route
                            path="farmers"
                            element={<FarmerManagement />}
                          />
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
                          <Route path="dashboard" element={<QCDashboard />} />
                          <Route
                            path="upload"
                            element={<RequirementUpload />}
                          />
                          <Route path="pdf-history" element={<PdfHistory />} />
                          <Route path="orders" element={<QCOrders />} />
                          <Route
                            path="tracking"
                            element={<QCOrderTracking />}
                          />
                          <Route path="contacts" element={<ContactInfo />} />
                          <Route path="inventory" element={<InventoryPage />} />
                          <Route path="alerts" element={<AlertsPage />} />
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
          </WarehouseProvider>
        </AuthProvider>
      </Router>
    </ClickSpark>
  );
}

export default App;
