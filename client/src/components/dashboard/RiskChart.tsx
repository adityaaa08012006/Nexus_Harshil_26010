import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
        className="rounded-2xl p-6 shadow-sm border flex items-center justify-center h-48"
        style={{ backgroundColor: "#F7F0F0", borderColor: "#25671E20" }}
      >
        <p className="text-gray-400 text-sm">No batch data yet</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border"
      style={{ backgroundColor: "#F7F0F0", borderColor: "#25671E20" }}
    >
      <h3 className="text-base font-bold mb-4" style={{ color: "#25671E" }}>
        Risk Distribution
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v} batches`]} />
          <Legend iconType="circle" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
