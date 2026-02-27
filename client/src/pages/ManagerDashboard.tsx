import React from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import { useAuthContext } from "../context/AuthContext";
import { MetricCards } from "../components/dashboard/MetricCards";
import { RiskChart } from "../components/dashboard/RiskChart";
import { InventoryTable } from "../components/dashboard/InventoryTable";

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { batches, stats, isLoading, error } = useInventory();

  // Top 5 high-risk batches for the spotlight table
  const highRiskBatches = [...batches]
    .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))
    .slice(0, 5);

  // ── Loading / error states ───────────────────────────────────────────────────
  if (isLoading) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Warehouse Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.name} ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/manager/inventory")}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-all hover:bg-gray-50"
            style={{ borderColor: "#E5E7EB", color: "#374151" }}
          >
            View Inventory
          </button>
          <button
            onClick={() => navigate("/manager/inventory?action=add")}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "#48A111" }}
          >
            Add Batch
          </button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <MetricCards
        totalBatches={stats.total}
        freshCount={stats.fresh}
        moderateCount={stats.moderate}
        highRiskCount={stats.highRisk}
        totalQuantity={stats.totalQuantity}
      />

      {/* ── Risk Chart ── */}
      <RiskChart batches={batches} />

      {/* ── High-risk spotlight table ── */}
      {highRiskBatches.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              High-Risk Batches
            </h2>
            <button
              onClick={() => navigate("/manager/inventory?filter=high")}
              className="text-xs font-medium hover:underline"
              style={{ color: "#48A111" }}
            >
              View all →
            </button>
          </div>
          <InventoryTable
            batches={highRiskBatches}
            readOnly={false}
            title=""
            maxRows={5}
            showSearch={false}
            onView={(id) => navigate(`/manager/batch/${id}`)}
            onEdit={(batch) => navigate(`/manager/inventory?edit=${batch.id}`)}
          />
        </div>
      )}

      {/* ── Full inventory (collapsed by default on mobile) ── */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Batch Inventory
          </h2>
          <button
            onClick={() => navigate("/manager/inventory")}
            className="text-xs font-medium hover:underline"
            style={{ color: "#48A111" }}
          >
            View all →
          </button>
        </div>
        <InventoryTable
          batches={batches}
          maxRows={10}
          showSearch={false}
          readOnly={false}
          onView={(id) => navigate(`/manager/batch/${id}`)}
          onEdit={(batch) => navigate(`/manager/inventory?edit=${batch.id}`)}
        />
      </div>
    </div>
  );
};
