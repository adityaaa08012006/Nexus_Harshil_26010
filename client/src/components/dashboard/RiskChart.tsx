import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Batch } from "../../lib/supabase";

interface RiskChartProps {
  batches: Batch[];
}

export const RiskChart: React.FC<RiskChartProps> = ({ batches }) => {
  const fresh = batches.filter((b) => b.risk_score <= 30).length;
  const moderate = batches.filter(
    (b) => b.risk_score > 30 && b.risk_score <= 70,
  ).length;
  const high = batches.filter((b) => b.risk_score > 70).length;

  const pieData = [
    { name: "Fresh", value: fresh, color: "#48A111" },
    { name: "Moderate", value: moderate, color: "#F2B50B" },
    { name: "High Risk", value: high, color: "#DC2626" },
  ].filter((d) => d.value > 0);

  if (batches.length === 0) {
    return (
      <div
        className="rounded-xl p-6 shadow-sm border flex items-center justify-center h-64"
        style={{ backgroundColor: "white", borderColor: "#E5E7EB" }}
      >
        <p className="text-gray-400 text-sm">No batch data yet</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-6 shadow-sm border"
      style={{ backgroundColor: "white", borderColor: "#E5E7EB" }}
    >
      <h3 className="text-sm font-semibold mb-6 text-gray-700">
        Batch Health Overview
      </h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">In good health:</p>
          <p className="text-3xl font-bold text-gray-900">{fresh}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "#48A111" }}
            />
            <span className="text-xs font-medium text-gray-600">Fresh</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{fresh}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "#F2B50B" }}
            />
            <span className="text-xs font-medium text-gray-600">Moderate</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{moderate}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "#DC2626" }}
            />
            <span className="text-xs font-medium text-gray-600">High Risk</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{high}</p>
        </div>
      </div>
    </div>
  );
};
