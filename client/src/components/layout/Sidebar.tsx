import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  Leaf
} from "lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  user: any;
  onLogout: () => void;
  roleLabel: string;
  logoUrl?: string;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  user,
  onLogout,
  roleLabel,
  logoUrl,
  alertCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
  };

  const NavItem = ({ item }: { item: SidebarItem }) => {
    const isActive = location.pathname.startsWith(item.path);
    const isAlertItem = item.id === "alerts";

    return (
      <Link to={item.path} onClick={() => setIsOpen(false)}>
        <motion.div
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative flex items-center gap-4 px-4 py-3 my-1 mx-2 rounded-xl transition-all duration-200
            ${
              isActive
                ? "bg-white/10 text-white shadow-lg border-l-4 border-[#48A111]"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }
          `}
        >
          {/* Active Indicator Glow */}
          {isActive && (
            <motion.div
              layoutId="activeGlow"
              className="absolute inset-0 bg-gradient-to-r from-[#48A111]/20 to-transparent rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}

          <span className={`${isActive ? "text-[#48A111]" : "text-gray-400"}`}>
            {item.icon}
          </span>
          <span className="font-medium text-sm tracking-wide flex-1">
            {item.label}
          </span>
          
          {isAlertItem && alertCount > 0 && (
             <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {alertCount > 99 ? "99+" : alertCount}
             </span>
          )}

          {isActive && !isAlertItem && (
            <ChevronRight className="ml-auto w-4 h-4 text-[#48A111]" />
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-full shadow-lg text-[#1a4a15] hover:bg-gray-50 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-[#122C1A] text-white
          flex flex-col border-r border-white/5 shadow-2xl h-screen
        `}
        variants={sidebarVariants}
        initial="closed"
        animate={isDesktop ? "open" : isOpen ? "open" : "closed"}
        style={{ x: 0, opacity: 1 }} 
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#48A111] to-[#2E7D32] flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain filter brightness-0 invert" />
            ) : (
              <Leaf className="text-white w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
              Godam
            </h1>
            <p className="text-[10px] text-[#48A111] font-bold uppercase tracking-widest leading-none">
              Solutions
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-hide">
             <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
             </div>
             {items.map((item) => (
                <NavItem key={item.id} item={item} />
             ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0e2315]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center border-2 border-[#48A111]">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {roleLabel || user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 text-sm font-medium transition-all group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
};
