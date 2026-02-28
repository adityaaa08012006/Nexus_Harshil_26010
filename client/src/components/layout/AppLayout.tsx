import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAlertCount } from "../../hooks/useAlertCount";
import { useWarehouse } from "../../context/WarehouseContext";
import { Sidebar, SidebarItem } from "./Sidebar";
import logo from "../../assets/public/logo1.png";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  Thermometer,
  AlertTriangle,
  ArrowRightLeft,
  Truck,
  Users,
  Tractor,
  BarChart3,
  Upload,
  FileText,
  Search,
  ChevronDown,
  Warehouse as WarehouseIcon,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Nav Configurations ────────────────────────────────────────────────────────

const ownerNav: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/owner/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "warehouses",
    label: "Warehouses",
    path: "/owner/warehouses",
    icon: <Warehouse size={20} />,
  },
  {
    id: "inventory",
    label: "Inventory",
    path: "/owner/inventory",
    icon: <Package size={20} />,
  },
  {
    id: "sensors",
    label: "Monitoring",
    path: "/owner/sensors",
    icon: <Thermometer size={20} />,
  },
  {
    id: "alerts",
    label: "Risk Alerts",
    path: "/owner/alerts",
    icon: <AlertTriangle size={20} />,
  },
  {
    id: "allocations",
    label: "Allocations",
    path: "/owner/allocations",
    icon: <ArrowRightLeft size={20} />,
  },
  {
    id: "dispatch",
    label: "Dispatches",
    path: "/owner/dispatch",
    icon: <Truck size={20} />,
  },
  {
    id: "farmers",
    label: "Farmers",
    path: "/owner/farmers",
    icon: <Tractor size={20} />,
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/owner/analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/owner/settings",
    icon: <Settings size={20} />,
  },
];

const managerNav: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/manager/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "inventory",
    label: "Inventory",
    path: "/manager/inventory",
    icon: <Package size={20} />,
  },
  {
    id: "sensors",
    label: "Monitoring",
    path: "/manager/sensors",
    icon: <Thermometer size={20} />,
  },
  {
    id: "alerts",
    label: "Risk Alerts",
    path: "/manager/alerts",
    icon: <AlertTriangle size={20} />,
  },
  {
    id: "allocations",
    label: "Allocations",
    path: "/manager/allocations",
    icon: <ArrowRightLeft size={20} />,
  },
  {
    id: "dispatch",
    label: "Dispatches",
    path: "/manager/dispatch",
    icon: <Truck size={20} />,
  },
  {
    id: "farmers",
    label: "Farmers",
    path: "/manager/farmers",
    icon: <Tractor size={20} />,
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/manager/analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/manager/settings",
    icon: <Settings size={20} />,
  },
];

const qcNav: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/qc/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "upload",
    label: "Upload Order",
    path: "/qc/upload",
    icon: <Upload size={20} />,
  },
  {
    id: "orders",
    label: "My Orders",
    path: "/qc/orders",
    icon: <FileText size={20} />,
  },
  {
    id: "tracking",
    label: "Tracking",
    path: "/qc/tracking",
    icon: <Search size={20} />,
  },
  {
    id: "view",
    label: "View Batches",
    path: "/qc/inventory",
    icon: <Package size={20} />,
  },
  {
    id: "alerts",
    label: "Alerts",
    path: "/qc/alerts",
    icon: <AlertTriangle size={20} />,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/qc/settings",
    icon: <Settings size={20} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, isManager, isOwner } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { count: alertCount } = useAlertCount();
  const {
    warehouses,
    selectedWarehouseId,
    setSelectedWarehouseId,
    selectedWarehouse,
  } = useWarehouse();
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);

  // Determine navigation items based on role
  const navItems = isOwner() ? ownerNav : isManager() ? managerNav : qcNav;

  const roleLabel =
    user?.role === "owner"
      ? "Owner"
      : user?.role === "manager"
        ? "Manager"
        : "QC Rep";

  const activePath = location.pathname;
  const pageTitle =
    activePath.split("/").pop()?.replace("-", " ") || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {/* ── Sidebar ── */}
      <Sidebar items={navItems} logoUrl={logo} alertCount={alertCount} />

      {/* ── Main Content Wrapper ── */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          {/* Left: Title & Breadcrumbs (Hidden on Mobile as Sidebar cover it) */}
          <div className="hidden lg:flex flex-col ml-2">
            <h1 className="text-xl font-bold text-gray-800 capitalize tracking-tight flex items-center gap-2">
              {pageTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span>Godam</span>
              <span>/</span>
              <span className="capitalize">
                {user?.role?.replace("_", " ")}
              </span>
              <span>/</span>
              <span className="capitalize text-[#48A111] font-medium">
                {pageTitle}
              </span>
            </div>
          </div>

          {/* Mobile Spacer to push right content */}
          <div className="lg:hidden"></div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Warehouse Selector */}
            {(isOwner() || isManager()) && (
              <div className="relative">
                <button
                  onClick={() =>
                    setWarehouseDropdownOpen(!warehouseDropdownOpen)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#48A111]/50 transition-all shadow-sm group"
                >
                  <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-[#48A111]/10 transition-colors">
                    <WarehouseIcon
                      size={16}
                      className="text-gray-500 group-hover:text-[#48A111]"
                    />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">
                      Warehouse
                    </p>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-[#48A111] leading-none mt-1">
                      {selectedWarehouse?.name || "All Warehouses"}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 ml-1 transition-transform ${warehouseDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {warehouseDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setWarehouseDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="py-1 max-h-80 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            Select Location
                          </span>
                        </div>
                        {(isOwner() || isManager()) && warehouses.length > 0 ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedWarehouseId(undefined); // undefined means 'All'
                                setWarehouseDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between group transition-colors ${!selectedWarehouseId ? "bg-green-50" : ""}`}
                            >
                              <span
                                className={`${!selectedWarehouseId ? "text-[#48A111] font-bold" : "text-gray-700"}`}
                              >
                                All Warehouses
                              </span>
                              {!selectedWarehouseId && (
                                <div className="w-2 h-2 rounded-full bg-[#48A111]"></div>
                              )}
                            </button>
                            {warehouses.map((w) => (
                              <button
                                key={w.id}
                                onClick={() => {
                                  setSelectedWarehouseId(w.id);
                                  setWarehouseDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between group transition-colors ${selectedWarehouseId === w.id ? "bg-green-50" : ""}`}
                              >
                                <span
                                  className={`${selectedWarehouseId === w.id ? "text-[#48A111] font-bold" : "text-gray-700"}`}
                                >
                                  {w.name}
                                </span>
                                {selectedWarehouseId === w.id && (
                                  <div className="w-2 h-2 rounded-full bg-[#48A111]"></div>
                                )}
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No warehouses found
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Notifications / Alerts - Quick Access */}
            <button
              onClick={() =>
                navigate(
                  isOwner()
                    ? "/owner/alerts"
                    : isManager()
                      ? "/manager/alerts"
                      : "/qc/alerts",
                )
              }
              className="relative p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-red-200 transition-colors group"
            >
              <AlertTriangle
                size={20}
                className="text-gray-400 group-hover:text-red-500 transition-colors"
              />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full flex-1 p-4 lg:p-6 lg:px-8 max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
