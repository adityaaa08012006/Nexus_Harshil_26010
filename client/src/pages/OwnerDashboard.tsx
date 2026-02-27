import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import { supabase } from "../lib/supabase";
import type { Warehouse } from "../lib/supabase";
import { MetricCards } from "../components/dashboard/MetricCards";
import { RiskChart } from "../components/dashboard/RiskChart";
import { InventoryTable } from "../components/dashboard/InventoryTable";

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<
    string | undefined
  >(undefined);
  const [warehousesLoading, setWarehousesLoading] = useState(true);

  const { batches, stats, isLoading, error } =
    useInventory(selectedWarehouseId);

  // ── Load all warehouses ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchWarehouses = async () => {
      setWarehousesLoading(true);
      const { data } = await supabase
        .from("warehouses")
        .select("*")
        .order("name", { ascending: true });
      setWarehouses(data ?? []);
      setWarehousesLoading(false);
    };
    fetchWarehouses();
  }, []);

  const selectedWarehouse = warehouses.find(
    (w) => w.id === selectedWarehouseId,
  );

  // ── Loading / error states ───────────────────────────────────────────────────
  if (warehousesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-6 border text-sm"
        style={{
          backgroundColor: "#FEF2F2",
          borderColor: "#DC2626",
          color: "#DC2626",
        }}
      >
        Failed to load inventory: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Organization Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Multi-warehouse inventory and performance monitoring
          </p>
        </div>

        {/* Warehouse selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">
            Warehouse:
          </label>
          <select
            value={selectedWarehouseId ?? "all"}
            onChange={(e) =>
              setSelectedWarehouseId(
                e.target.value === "all" ? undefined : e.target.value,
              )
            }
            className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white"
            style={
              {
                borderColor: "#E5E7EB",
                "--tw-ring-color": "#48A111",
              } as React.CSSProperties
            }
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Warehouse count */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Warehouses
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: "#25671E" }}
              >
                {warehouses.length}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#48A11120" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "#48A111" }}
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
            </div>
          </div>
        </div>

        {/* Batch count (filtered by warehouse if selected) */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Active Batches
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: "#25671E" }}
              >
                {stats.total}
              </p>
              {selectedWarehouse && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedWarehouse.name}
                </p>
              )}
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#48A11120" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "#48A111" }}
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
            </div>
          </div>
        </div>

        {/* High-risk count */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">High Risk</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: "#DC2626" }}
              >
                {stats.highRisk}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#DC262610" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "#DC2626" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total inventory weight */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Stock</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: "#25671E" }}
              >
                {(stats.totalQuantity / 1000).toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  tons
                </span>
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F2B50B20" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "#F2B50B" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <MetricCards
        totalBatches={stats.total}
        freshCount={stats.fresh}
        moderateCount={stats.moderate}
        highRiskCount={stats.highRisk}
        totalQuantity={stats.totalQuantity}
        warehouseName={selectedWarehouse?.name}
      />

      {/* ── Risk chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskChart batches={batches} />

        {/* Quick warehouse list */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold mb-5 text-gray-700">
            Your Warehouses
          </h3>
          {warehouses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No warehouses configured yet.
            </p>
          ) : (
            <div className="space-y-2">
              {warehouses.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWarehouseId(w.id)}
                  className="w-full text-left px-4 py-3 rounded-lg border transition-all hover:shadow-sm"
                  style={
                    selectedWarehouseId === w.id
                      ? { borderColor: "#48A111", backgroundColor: "#F0F9FF" }
                      : { borderColor: "#E5E7EB", backgroundColor: "#fff" }
                  }
                >
                  <p
                    className="font-medium text-sm"
                    style={{ color: "#1F2937" }}
                  >
                    {w.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{w.location}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Read-only inventory table ── */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {selectedWarehouse
              ? `${selectedWarehouse.name} Inventory`
              : "All Inventory"}
          </h2>
          <button
            onClick={() => navigate("/owner/inventory")}
            className="text-xs font-medium hover:underline"
            style={{ color: "#48A111" }}
          >
            View all →
          </button>
        </div>
        {isLoading ? (
          <div className="p-12 text-center">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <InventoryTable
            batches={batches}
            maxRows={10}
            readOnly
            onView={(id) => navigate(`/owner/batch/${id}`)}
          />
        )}
      </div>
    </div>
  );
};
