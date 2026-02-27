import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Warehouse } from "../lib/supabase";
import { MapPin } from "lucide-react";

export const WarehousesPage: React.FC = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<
    Record<string, { batches: number; highRisk: number }>
  >({});

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      // Fetch warehouses
      const { data: warehouseData, error: warehouseError } = await supabase
        .from("warehouses")
        .select("*")
        .order("name", { ascending: true });

      if (warehouseError) {
        console.error("Error fetching warehouses:", warehouseError);
        return;
      }

      setWarehouses(warehouseData ?? []);

      // Fetch batch counts per warehouse
      const warehouseStats: Record<
        string,
        { batches: number; highRisk: number }
      > = {};

      for (const warehouse of warehouseData ?? []) {
        // Total batches
        const { count: batchCount } = await supabase
          .from("batches")
          .select("*", { count: "exact", head: true })
          .eq("warehouse_id", warehouse.id);

        // High risk batches (risk_score >= 70)
        const { count: highRiskCount } = await supabase
          .from("batches")
          .select("*", { count: "exact", head: true })
          .eq("warehouse_id", warehouse.id)
          .gte("risk_score", 70);

        warehouseStats[warehouse.id] = {
          batches: batchCount ?? 0,
          highRisk: highRiskCount ?? 0,
        };
      }

      setStats(warehouseStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage and monitor all warehouse facilities
        </p>
      </div>

      {/* Warehouses Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          All Warehouses
        </h2>

        {warehouses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="p-4 rounded-full bg-gray-100">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No warehouses found
            </h3>
            <p className="text-sm text-gray-500">
              Add your first warehouse to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse) => {
              const warehouseStats = stats[warehouse.id] ?? {
                batches: 0,
                highRisk: 0,
              };
              const utilizationPercent = warehouse.capacity
                ? Math.round(
                    (warehouseStats.batches / warehouse.capacity) * 100,
                  )
                : 0;

              return (
                <div
                  key={warehouse.id}
                  className="border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderColor: "#E5E7EB" }}
                  onClick={() =>
                    navigate(`/owner/inventory?warehouse=${warehouse.id}`)
                  }
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-base mb-1"
                        style={{ color: "#1F2937" }}
                      >
                        {warehouse.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>{warehouse.location}</span>
                      </div>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#48A11120" }}
                    >
                      <MapPin size={20} style={{ color: "#48A111" }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-medium text-gray-900">
                        {(warehouse.capacity / 1000).toFixed(1)} tons
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Active Batches</span>
                      <span className="font-medium text-gray-900">
                        {warehouseStats.batches}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">High Risk</span>
                      <span
                        className="font-medium"
                        style={{
                          color:
                            warehouseStats.highRisk > 0 ? "#DC2626" : "#48A111",
                        }}
                      >
                        {warehouseStats.highRisk}
                      </span>
                    </div>

                    {/* Utilization Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Utilization</span>
                        <span className="font-medium">
                          {utilizationPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(utilizationPercent, 100)}%`,
                            backgroundColor:
                              utilizationPercent > 90
                                ? "#DC2626"
                                : utilizationPercent > 70
                                  ? "#F2B50B"
                                  : "#48A111",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/owner/inventory?warehouse=${warehouse.id}`);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: "#48A111",
                        color: "white",
                      }}
                    >
                      View Inventory
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/owner/sensors?warehouse=${warehouse.id}`);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors hover:bg-gray-50"
                      style={{
                        borderColor: "#E5E7EB",
                        color: "#374151",
                      }}
                    >
                      Sensors
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
