import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import { useWarehouse } from "../context/WarehouseContext";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Warehouse,
  ArrowRight,
  DollarSign,
  Activity,
  Calendar,
  MapPin,
  Truck,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { formatNumber, formatCurrency } from "../utils/formatters";

// ─── Modern Stat Card Component ──────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: "green" | "blue" | "orange" | "red";
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  color = "green",
  delay = 0 
}) => {


  const iconStyles = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconStyles[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
};

// ─── Dispatch Preview Row ────────────────────────────────────────────────────

const DispatchRow = ({ dispatch }: { dispatch: any }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0 group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
        <Package size={18} />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{dispatch.details || "Crop Shipment"}</h4>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={10} /> {new Date(dispatch.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-gray-900 text-sm">{dispatch.quantity} kg</p>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
        dispatch.status === 'completed' ? 'bg-green-100 text-green-700' : 
        dispatch.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {dispatch.status}
      </span>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedWarehouseId, warehouses } = useWarehouse();
  const { batches, stats, isLoading } = useInventory(selectedWarehouseId);
  const [recentDispatches, setRecentDispatches] = useState<any[]>([]);

  // Derived Metrics
  const totalValue = stats.totalQuantity * 2.5; // Dummy multiplier for value
  const activeWarehouses = warehouses.length;
  const highRiskCount = batches.filter(b => b.risk_score > 70).length;

  // Chart Data Preparation
  const riskData = [
    { name: "Fresh", value: batches.filter(b => b.risk_score <= 30).length, color: "#48A111" },
    { name: "Moderate", value: batches.filter(b => b.risk_score > 30 && b.risk_score <= 70).length, color: "#F59E0B" },
    { name: "High Risk", value: batches.filter(b => b.risk_score > 70).length, color: "#EF4444" },
  ].filter(d => d.value > 0);

  // Simplified Warehouse Distribution for Bar Chart
  const warehouseDistribution = warehouses.slice(0, 5).map(w => ({
    name: w.name,
    capacity: w.capacity,
    usage: Math.floor(Math.random() * w.capacity * 0.8) // Mock usage for now
  }));

  useEffect(() => {
    // Fetch limited recent dispatches for the widget
    const fetchDispatches = async () => {
      const { data } = await supabase
        .from('dispatch_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setRecentDispatches(data);
    };
    fetchDispatches();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      
      {/* ── Welcome Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="text-[#48A111]">{user?.name?.split(' ')[0] || 'Owner'}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Here's what's happening across your supply chain today.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
           <Calendar size={16} className="text-gray-400" />
           <span className="text-sm font-medium text-gray-600">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </span>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Inventory" 
          value={`${formatNumber(stats.totalQuantity)} kg`}
          icon={<Package size={24} />}
          color="blue"
          trend="12% vs last month"
          trendUp={true}
          delay={0.1}
        />
        <StatCard 
          title="Active Warehouses" 
          value={activeWarehouses}
          icon={<Warehouse size={24} />}
          color="green"
          trend="All operational"
          trendUp={true}
          delay={0.2}
        />
        <StatCard 
          title="Est. Value" 
          value={formatCurrency(totalValue)}
          icon={<DollarSign size={24} />}
          color="orange"
          delay={0.3}
        />
        <StatCard 
          title="Critical Alerts" 
          value={highRiskCount}
          icon={<AlertTriangle size={24} />}
          color="red"
          trend={highRiskCount > 0 ? "Action needed" : "All good"}
          trendUp={highRiskCount === 0}
          delay={0.4}
        />
      </div>

      {/* ── Main Dashboard Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Inventory Health & Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Distribution Chart */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[350px] flex flex-col hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-[#48A111]" />
                Inventory Health
              </h3>
              <div className="flex-1 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-xs text-gray-400 font-medium uppercase">Total</span>
                   <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                   <span className="text-xs text-gray-400">Batches</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {riskData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-xs font-medium text-gray-600">{d.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Warehouse Capacity Chart */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[350px] flex flex-col hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Warehouse size={18} className="text-blue-600" />
                Warehouse Capacity
              </h3>
              <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={warehouseDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="usage" name="Used Capacity" fill="#4B5563" radius={[0, 4, 4, 0]} barSize={20} />
                      <Bar dataKey="capacity" name="Total Capacity" fill="#E5E7EB" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions / Featured Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { icon: <AlertTriangle size={20} />, label: "View Alerts", path: "/owner/alerts", color: "text-red-600 bg-red-50 hover:bg-red-100 border-red-100" },
               { icon: <MapPin size={20} />, label: "Warehouses", path: "/owner/warehouses", color: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100" },
               { icon: <Activity size={20} />, label: "Analytics", path: "/owner/analytics", color: "text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100" },
               { icon: <Package size={20} />, label: "Inventory", path: "/owner/inventory", color: "text-green-600 bg-green-50 hover:bg-green-100 border-green-100" }
             ].map((action, i) => (
               <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.path)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 shadow-sm ${action.color}`}
               >
                 <div className="shrink-0">{action.icon}</div>
                 <span className="font-semibold text-sm text-gray-800">{action.label}</span>
               </motion.button>
             ))}
          </div>
          
        </div>

        {/* Right Column: Recent Activity (1/3 width) */}
        <div className="space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900">Recent Dispatches</h3>
               <button onClick={() => navigate('/owner/dispatch')} className="text-xs font-semibold text-[#48A111] hover:underline flex items-center gap-1">
                 View All <ArrowRight size={12} />
               </button>
             </div>
             
             <div className="max-h-[500px] overflow-y-auto">
                {recentDispatches.length > 0 ? (
                  recentDispatches.map((dispatch) => (
                    <DispatchRow key={dispatch.id} dispatch={dispatch} />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    No recent dispatches found.
                  </div>
                )}
             </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#122C1A] rounded-2xl p-6 text-white overflow-hidden relative group cursor-pointer shadow-lg shadow-green-900/20"
            onClick={() => navigate('/owner/allocations')}
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-500">
                <Truck size={140} />
             </div>
             <div className="relative z-10">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner border border-white/5">
                 <ArrowRight size={20} className="text-white" />
               </div>
               <h3 className="text-lg font-bold mb-1">Pending Allocations</h3>
               <p className="text-green-200/80 text-sm mb-4">Review requests from managers</p>
               <button className="text-xs font-bold bg-[#48A111] hover:bg-[#3d8b0e] text-white px-4 py-2 rounded-lg transition-colors shadow-md">
                  Check Requests
               </button>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
