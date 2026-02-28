import React, { useState, useMemo } from "react";
import { RiskBadge } from "../common/RiskBadge";
import { getDaysRemaining } from "../../utils/riskCalculation";
import { AlertTriangle, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import type { Batch } from "../../lib/supabase";

type SortKey =
  | "batch_id"
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
    score > 70 ? "high" : score > 30 ? "moderate" : "fresh";

  const filtered = useMemo(() => {
    let rows = [...batches];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (b) =>
          b.batch_id.toLowerCase().includes(q) ||
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
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortKey === "days_remaining") {
        aVal = getDaysRemaining(a.entry_date, a.shelf_life);
        bVal = getDaysRemaining(b.entry_date, b.shelf_life);
      } else {
        // @ts-ignore
        aVal = (a[sortKey] ?? "") as string | number;
        // @ts-ignore
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
    if (sortKey !== col) return <ArrowUpDown size={14} className="ml-1 text-gray-300 inline" />;
    return (
      <span className="ml-1 inline-flex text-[#48A111]">
        {sortDir === "asc" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      </span>
    );
  };

  const headerTh =
    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap group hover:bg-gray-50 transition-colors";

  const riskFilterColors: Record<string, string> = {
    all: "#6B7280",
    fresh: "#48A111",
    moderate: "#F2B50B",
    high: "#DC2626",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3
          className="text-base font-bold flex items-center gap-2 text-gray-900"
        >
          {title}
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {filtered.length}
          </span>
        </h3>

        {showSearch && (
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#48A111] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
               <input
                 type="text"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search inventory..."
                 className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48A111]/20 focus:border-[#48A111] w-48 transition-all"
               />
            </div>

            {/* Risk filter pills */}
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
              {(["all", "fresh", "moderate", "high"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRiskFilter(f)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 capitalize ${riskFilter === f ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  style={ riskFilter === f ? { color: riskFilterColors[f] } : {} }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/50">
              <th className={headerTh} onClick={() => handleSort("batch_id")}>
                Batch ID <SortIcon col="batch_id" />
              </th>
              <th className={headerTh} onClick={() => handleSort("crop")}>
                Crop / Variety <SortIcon col="crop" />
              </th>
              <th className={headerTh} onClick={() => handleSort("quantity")}>
                Qty (kg) <SortIcon col="quantity" />
              </th>
              <th className={headerTh}>
                Zone
              </th>
              <th className={headerTh} onClick={() => handleSort("days_remaining")}>
                Days Left <SortIcon col="days_remaining" />
              </th>
              <th className={headerTh} onClick={() => handleSort("risk_score")}>
                 Health <SortIcon col="risk_score" />
              </th>
              {(onEdit || onDelete || onView) && (
                 <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                   Actions
                 </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((batch) => {
                const daysLeft = getDaysRemaining(
                  batch.entry_date,
                  batch.shelf_life,
                );
                return (
                  <tr
                    key={batch.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-[#48A111] transition-colors">
                      {batch.batch_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium">{batch.crop}</div>
                      <div className="text-xs text-gray-400">{batch.variety}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">
                      {batch.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {batch.zone}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className={`flex items-center gap-1.5 font-medium ${daysLeft < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                        {daysLeft} days
                        {daysLeft < 5 && <AlertTriangle size={12} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RiskBadge score={batch.risk_score} />
                    </td>
                    {(onEdit || onDelete || onView) && (
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 transition-opacity">
                            {onView && (
                              <button
                                onClick={() => onView(batch.batch_id)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors text-xs"
                              >
                                ViewDetails
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(batch)}
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors text-xs"
                              >
                                Edit
                              </button>
                            )}
                            {onDelete && (
                               <button
                                  onClick={() => onDelete(batch)}
                                  className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors text-xs"
                               >
                                  Del
                               </button>
                            )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                     <AlertTriangle className="w-8 h-8 text-gray-300" />
                     <p>No batches found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
