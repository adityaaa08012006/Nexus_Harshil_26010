import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAlertCount } from "../../hooks/useAlertCount";

// ─── Role-Based Nav ────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const EyeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const GridIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);
const BoxIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);
const BellIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);
const UsersIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const ClipboardIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);
const WarehouseIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);
const SensorsIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const TruckIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
    />
  </svg>
);

const managerNav: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/manager/dashboard",
    icon: <GridIcon />,
  },
  {
    id: "inventory",
    label: "Inventory",
    path: "/manager/inventory",
    icon: <BoxIcon />,
  },
  {
    id: "allocations",
    label: "Allocations",
    path: "/manager/allocations",
    icon: <TruckIcon />,
  },
  {
    id: "sensors",
    label: "Sensors",
    path: "/manager/sensors",
    icon: <SensorsIcon />,
  },
  {
    id: "alerts",
    label: "Alerts",
    path: "/manager/alerts",
    icon: <BellIcon />,
  },
];

const ownerNav: NavItem[] = [
  {
    id: "dashboard",
    label: "Overview",
    path: "/owner/dashboard",
    icon: <GridIcon />,
  },
  {
    id: "warehouses",
    label: "Warehouses",
    path: "/owner/warehouses",
    icon: <WarehouseIcon />,
  },
  {
    id: "sensors",
    label: "Sensors",
    path: "/owner/sensors",
    icon: <SensorsIcon />,
  },
  {
    id: "alerts",
    label: "Alerts",
    path: "/owner/alerts",
    icon: <BellIcon />,
  },
  {
    id: "inventory",
    label: "All Inventory",
    path: "/owner/inventory",
    icon: <BoxIcon />,
  },
  {
    id: "allocations",
    label: "Allocations",
    path: "/owner/allocations",
    icon: <TruckIcon />,
  },
  {
    id: "contacts",
    label: "Contacts",
    path: "/owner/contacts",
    icon: <UsersIcon />,
  },
];

const qcNav: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/qc/dashboard",
    icon: <GridIcon />,
  },
  {
    id: "allocations",
    label: "My Requests",
    path: "/qc/allocations",
    icon: <TruckIcon />,
  },
  {
    id: "view",
    label: "View Batches",
    path: "/qc/inventory",
    icon: <EyeIcon />,
  },
  { id: "alerts", label: "Alerts", path: "/qc/alerts", icon: <BellIcon /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, isManager, isOwner } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { count: alertCount } = useAlertCount();

  const navItems = isOwner() ? ownerNav : isManager() ? managerNav : qcNav;

  const activePath = location.pathname;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const roleLabel =
    user?.role === "owner"
      ? "Owner"
      : user?.role === "manager"
        ? "Warehouse Manager"
        : "QC Representative";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      {/* ── Sidebar ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 flex flex-col
            w-64 transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{ backgroundColor: "#25671E" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#48A111", color: "#fff" }}
            >
              G
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">
                Godam
              </p>
              <p className="text-xs" style={{ color: "#48A111" }}>
                Solutions
              </p>
            </div>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-white/10">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm mb-2"
              style={{ backgroundColor: "#48A111", color: "#fff" }}
            >
              {initials}
            </div>
            <p className="text-white text-sm font-medium truncate">
              {user?.name}
            </p>
            <p className="text-xs truncate" style={{ color: "#a7d8a0" }}>
              {roleLabel}
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                activePath === item.path ||
                activePath.startsWith(item.path + "/");
              const showBadge = item.id === "alerts" && alertCount > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#48A111",
                          color: "#fff",
                          fontWeight: 600,
                        }
                      : { color: "#d1f0c9" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "rgba(255,255,255,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span
                      className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: "#DC2626",
                        color: "#fff",
                        minWidth: "20px",
                        textAlign: "center",
                      }}
                    >
                      {alertCount > 99 ? "99+" : alertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={async () => {
                await logout();
                navigate("/auth");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{ color: "#d1f0c9" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(220,38,38,0.2)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#d1f0c9";
              }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </aside>
      </>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Breadcrumb from path */}
          <div className="hidden lg:flex items-center gap-1 text-sm text-gray-500">
            <span style={{ color: "#25671E" }}>Godam</span>
            <span>/</span>
            <span className="font-medium text-gray-700 capitalize">
              {activePath.split("/").filter(Boolean).join(" / ")}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification bell placeholder */}
            <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors relative">
              <BellIcon />
            </button>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white cursor-default"
              style={{ backgroundColor: "#48A111" }}
              title={user?.name ?? ""}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};
