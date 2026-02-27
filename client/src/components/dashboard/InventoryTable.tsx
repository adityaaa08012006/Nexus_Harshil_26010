import React, { useState, useMemo } from "react";
import { RiskBadge } from "../common/RiskBadge";
import { getDaysRemaining } from "../../utils/riskCalculation";
import type { Batch } from "../../lib/supabase";

type SortKey =
  | "batch_id"
  | "farmer_name"
  | "crop"
  | "quantity"
  | "days_remaining"
  | "risk_score";
type SortDir = "asc" | "desc";

interface InventoryTableProps {
  batches: Batch[];
  onView?: (batchId: string) => void;
  onEdit?: (batch: Batch) => void;
  onDelete?: (batch: Batch) => void;
  readOnly?: boolean;
  title?: string;
  maxRows?: number;
  showSearch?: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  batches,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
  title = "Batch Inventory",
  maxRows,
  showSearch = true,
}) => {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<
    "all" | "fresh" | "moderate" | "high"
  >("all");
  const [sortKey, setSortKey] = useState<SortKey>("risk_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const getRiskCategory = (score: number) =>
    score >= 70 ? "high" : score >= 40 ? "moderate" : "fresh";

  const filtered = useMemo(() => {
    let rows = [...batches];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (b) =>
          b.batch_id.toLowerCase().includes(q) ||
          (b.farmer_name ?? "").toLowerCase().includes(q) ||
          (b.crop ?? "").toLowerCase().includes(q) ||
          (b.zone ?? "").toLowerCase().includes(q),
      );
    }

    if (riskFilter !== "all") {
      rows = rows.filter(
        (b) => getRiskCategory(b.risk_score ?? 0) === riskFilter,
      );
    }

    rows.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortKey === "days_remaining") {
        aVal = getDaysRemaining(a.entry_date, a.shelf_life);
        bVal = getDaysRemaining(b.entry_date, b.shelf_life);
      } else {
        aVal = (a[sortKey] ?? "") as string | number;
        bVal = (b[sortKey] ?? "") as string | number;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    if (maxRows) rows = rows.slice(0, maxRows);

    return rows;
  }, [batches, search, riskFilter, sortKey, sortDir, maxRows]);

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) => {
    if (sortKey !== col) return <span className="ml-1 text-gray-300">↕</span>;
    return (
      <span className="ml-1" style={{ color: "#48A111" }}>
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const headerTh =
    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap";

  const riskFilterColors: Record<string, string> = {
    all: "#6B7280",
    fresh: "#48A111",
    moderate: "#F2B50B",
    high: "#DC2626",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <h3
          className="text-base font-semibold flex-1"
          style={{ color: "#25671E" }}
        >
          {title}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filtered.length})
          </span>
        </h3>

        {showSearch && (
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search batch, farmer, crop…"
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 w-48"
                style={{ "--tw-ring-color": "#48A111" } as React.CSSProperties}
              />
            </div>

            {/* Risk filter pills */}
            <div className="flex gap-1">
              {(["all", "fresh", "moderate", "high"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRiskFilter(f)}
                  className="px-2.5 py-1 text-xs font-medium rounded-full border transition-colors"
                  style={
                    riskFilter === f
                      ? {
                          backgroundColor: riskFilterColors[f] + "20",
                          borderColor: riskFilterColors[f],
                          color: riskFilterColors[f],
                        }
                      : { borderColor: "#E5E7EB", color: "#9CA3AF" }
                  }
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead style={{ backgroundColor: "#F9FAF9" }}>
            <tr>
              {(
                [
                  { key: "batch_id", label: "Batch ID" },
                  { key: "farmer_name", label: "Farmer" },
                  { key: "crop", label: "Crop / Variety" },
                  { key: "quantity", label: "Qty (kg)" },
                  { key: null, label: "Zone" },
                  { key: "days_remaining", label: "Days Left" },
                  { key: "risk_score", label: "Risk" },
                ] as Array<{ key: SortKey | null; label: string }>
              ).map((col) => (
                <th
                  key={col.label}
                  className={headerTh + (col.key ? "" : " cursor-default")}
                  style={{ color: "#25671E" }}
                  onClick={() => col.key && handleSort(col.key)}
                >
                  {col.label}
                  {col.key && <SortIcon col={col.key} />}
                </th>
              ))}
              {!readOnly && (onEdit || onDelete || onView) && (
                <th
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#25671E" }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 7 : 8}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  {search || riskFilter !== "all"
                    ? "No batches match your filters."
                    : "No batches recorded yet."}
                </td>
              </tr>
            ) : (
              filtered.map((batch) => {
                const daysLeft = getDaysRemaining(
                  batch.entry_date,
                  batch.shelf_life,
                );
                const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0;
                const isExpired = daysLeft < 0;

                return (
                  <tr
                    key={batch.batch_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Batch ID */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => onView?.(batch.batch_id)}
                        className="text-sm font-mono font-medium hover:underline"
                        style={{ color: "#48A111" }}
                      >
                        {batch.batch_id.slice(0, 8).toUpperCase()}
                      </button>
                    </td>

                    {/* Farmer */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {batch.farmer_name ?? "—"}
                    </td>

                    {/* Crop / Variety */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-800">
                        {batch.crop ?? "—"}
                      </span>
                      {batch.variety && (
                        <span className="ml-1 text-xs text-gray-400">
                          {batch.variety}
                        </span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {batch.quantity?.toLocaleString() ?? "—"}
                    </td>

                    {/* Zone */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {batch.zone ? (
                        <span
                          className="px-2 py-0.5 text-xs font-medium rounded"
                          style={{
                            backgroundColor: "#25671E15",
                            color: "#25671E",
                          }}
                        >
                          {batch.zone}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Days Remaining */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isExpired ? (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#DC2626" }}
                        >
                          Expired
                        </span>
                      ) : (
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: isExpiringSoon ? "#DC2626" : "#374151",
                          }}
                        >
                          {daysLeft}d
                          {isExpiringSoon && (
                            <span
                              className="ml-1 text-xs"
                              style={{ color: "#F2B50B" }}
                            >
                              ⚠
                            </span>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Risk Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RiskBadge
                        score={batch.risk_score ?? 0}
                        showScore
                        size="sm"
                      />
                    </td>

                    {/* Actions */}
                    {!readOnly && (onView || onEdit || onDelete) && (
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1">
                          {onView && (
                            <button
                              onClick={() => onView(batch.batch_id)}
                              title="View details"
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                              style={{ color: "#48A111" }}
                            >
                              <svg
                                className="w-4 h-4"
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
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(batch)}
                              title="Edit batch"
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(batch)}
                              title="Delete batch"
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                              style={{ color: "#DC2626" }}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
