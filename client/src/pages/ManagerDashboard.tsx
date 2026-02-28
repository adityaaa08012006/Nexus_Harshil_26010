import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import { useWarehouse } from "../context/WarehouseContext";
import { useAuth } from "../hooks/useAuth";
import { useAlertCount } from "../hooks/useAlertCount";
import { supabase } from "../lib/supabase";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Truck,
  FileCheck
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { formatNumber } from "../utils/formatters";

// ─── Modern Stat Card Component (Shared Style) ───────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: "green" | "blue" | "orange" | "red" | "purple";
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
    purple: "bg-purple-100 text-purple-700",
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

// ─── Incoming Order Row ──────────────────────────────────────────────────────

interface IncomingOrder {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  status: string;
  created_at: string;
  requester?: { name: string; email: string };
}

const OrderRow = ({ order, onRefresh }: { order: IncomingOrder, onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await supabase
        .from('allocation_requests')
        .update({ status })
        .eq('id', order.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
          <Truck size={18} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{order.crop} Order</h4>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            From: {order.requester?.name || 'Unknown'} • <Clock size={10} /> {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <div className="text-right">
           <p className="font-bold text-gray-900 text-sm">{order.quantity} {order.unit}</p>
           <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium uppercase">
              {order.status}
           </span>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => handleAction('approved')} 
             disabled={loading}
             className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors disabled:opacity-50"
             title="Accept"
           >
             <CheckCircle2 size={18} />
           </button>
           <button 
             onClick={() => handleAction('rejected')} 
             disabled={loading}
             className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
             title="Reject"
           >
             <XCircle size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedWarehouseId, selectedWarehouse } = useWarehouse();
  const { batches, stats } = useInventory(selectedWarehouseId);
  const { count: alertCount } = useAlertCount();
  
  const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Derived Metrics
  const freshBatches = batches.filter(b => b.risk_score <= 30).length;
  const riskBatches = batches.filter(b => b.risk_score > 70).length;

  // Chart Data
  const riskData = [
    { name: "Fresh", value: freshBatches, color: "#48A111" },
    { name: "Moderate", value: batches.filter(b => b.risk_score > 30 && b.risk_score <= 70).length, color: "#F59E0B" },
    { name: "High Risk", value: riskBatches, color: "#EF4444" },
  ].filter(d => d.value > 0);

  const fetchIncomingOrders = async () => {
    try {
      setLoadingOrders(true);
      let query = supabase
        .from("allocation_requests")
        .select("*")
        .in("status", ["pending", "reviewing"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (selectedWarehouseId) {
        query = query.eq("warehouse_id", selectedWarehouseId);
      }

      const { data: orders, error } = await query;
      if (error) throw error;

      if (orders && orders.length > 0) {
        // Fetch requester details manually
        const requesterIds = [...new Set(orders.map((o) => o.requester_id).filter(Boolean))];
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, name, email")
          .in("id", requesterIds);

        const ordersWithProfiles = orders.map((order) => ({
          ...order,
          requester: profiles?.find((p) => p.id === order.requester_id),
        }));
        setIncomingOrders(ordersWithProfiles);
      } else {
        setIncomingOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchIncomingOrders();
  }, [selectedWarehouseId]);

  return (
    <div className="space-y-8 pb-10">
      
      {/* ── Welcome Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="text-[#48A111]">{user?.name?.split(' ')[0] || 'Manager'}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-medium flex items-center gap-2">
            Managing: <span className="text-gray-900 font-semibold">{selectedWarehouse?.name || 'All Warehouses'}</span>
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
          title="Total Batches" 
          value={stats.total}
          icon={<Package size={24} />}
          color="blue"
          trend={`${freshBatches} fresh`}
          trendUp={true}
          delay={0.1}
        />
        <StatCard 
          title="Pending Orders" 
          value={incomingOrders.length}
          icon={<Truck size={24} />}
          color="purple"
          trend={incomingOrders.length > 0 ? "Needs review" : "All cleared"}
          trendUp={incomingOrders.length === 0}
          delay={0.2}
        />
        <StatCard 
          title="Active Alerts" 
          value={alertCount}
          icon={<AlertTriangle size={24} />}
          color="red"
          delay={0.3}
        />
        <StatCard 
          title="Total Quantity" 
          value={`${formatNumber(stats.totalQuantity)} kg`}
          icon={<TrendingUp size={24} />}
          color="green"
          delay={0.4}
        />
      </div>

      {/* ── Main Dashboard Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Orders & Inventory */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Orders Section */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div>
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   <FileCheck size={18} className="text-purple-600" />
                   Pending Orders
                 </h3>
                 <p className="text-xs text-gray-500 mt-1">Allocation requests awaiting your approval</p>
               </div>
               <button onClick={() => navigate('/manager/allocations')} className="text-xs font-semibold text-[#48A111] hover:underline flex items-center gap-1">
                 View All <ArrowRight size={12} />
               </button>
             </div>
             
             <div className="divide-y divide-gray-50">
                {loadingOrders ? (
                  <div className="p-8 text-center text-gray-400">Loading orders...</div>
                ) : incomingOrders.length > 0 ? (
                  incomingOrders.map((order) => (
                    <OrderRow key={order.id} order={order} onRefresh={fetchIncomingOrders} />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-gray-900 font-medium">All caught up!</p>
                    <p className="text-sm text-gray-500">No pending orders to review.</p>
                  </div>
                )}
             </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { icon: <Package size={20} />, label: "Add Batch", path: "/manager/inventory", color: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100" },
               { icon: <AlertTriangle size={20} />, label: "View Alerts", path: "/manager/alerts", color: "text-red-600 bg-red-50 hover:bg-red-100 border-red-100" },
               { icon: <Truck size={20} />, label: "Dispatch", path: "/manager/dispatch", color: "text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-100" },
               { icon: <Clock size={20} />, label: "History", path: "/manager/allocations", color: "text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-100" }
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

        {/* Right Column: Inventory Health */}
        <div className="space-y-6">
           <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[350px] flex flex-col"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Package size={18} className="text-[#48A111]" />
                Batch Status
              </h3>
              <p className="text-xs text-gray-500 mb-6">Current quality distribution of your stock</p>
              
              <div className="flex-1 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-10">
                   <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                   <span className="text-xs text-gray-400">Total</span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {riskData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <span className="text-gray-600 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="bg-[#122C1A] rounded-2xl p-6 text-white text-center">
              <p className="text-sm text-green-200/80 mb-2">Need to update inventory?</p>
              <button 
                onClick={() => navigate('/manager/inventory')}
                className="w-full py-3 bg-[#48A111] hover:bg-[#3d8b0e] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Scan / Add Batch
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};
