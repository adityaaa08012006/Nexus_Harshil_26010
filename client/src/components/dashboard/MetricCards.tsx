import React from "react";
import { formatNumber } from "../../utils/formatters";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  accentColor?: string;
  trend?: { value: number; label: string };
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sub,
  icon,
  accentColor = "#25671E",
  trend,
}) => (
  <div
    className="rounded-2xl p-5 flex flex-col gap-2 shadow-sm border"
    style={{ backgroundColor: "#F7F0F0", borderColor: `${accentColor}25` }}
  >
    <div className="flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      {trend && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: trend.value >= 0 ? "#48A11120" : "#DC262620",
            color: trend.value >= 0 ? "#48A111" : "#DC2626",
          }}
        >
          {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
        </span>
      )}
    </div>
    <p className="text-3xl font-extrabold" style={{ color: accentColor }}>
      {typeof value === "number" ? formatNumber(value) : value}
    </p>
    <p className="text-sm font-semibold text-gray-600">{label}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

interface MetricCardsProps {
  totalBatches: number;
  freshCount: number;
  moderateCount: number;
  highRiskCount: number;
  totalQuantity: number;
  storageUtilization?: number;
  warehouseName?: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalBatches,
  freshCount,
  moderateCount,
  highRiskCount,
  totalQuantity,
  storageUtilization,
  warehouseName,
}) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <MetricCard
      label="Total Batches"
      value={totalBatches}
      sub={warehouseName}
      icon="📦"
      accentColor="#25671E"
    />
    <MetricCard
      label="Fresh Batches"
      value={freshCount}
      sub="Risk ≤ 30%"
      icon="✅"
      accentColor="#48A111"
    />
    <MetricCard
      label="Moderate Risk"
      value={moderateCount}
      sub="Risk 31–70%"
      icon="⚠️"
      accentColor="#F2B50B"
    />
    <MetricCard
      label="High Risk"
      value={highRiskCount}
      sub="Risk > 70%"
      icon="🚨"
      accentColor="#DC2626"
    />
    <MetricCard
      label="Total Stock"
      value={`${formatNumber(Math.round(totalQuantity))} kg`}
      icon="🌾"
      accentColor="#25671E"
    />
    {storageUtilization != null && (
      <MetricCard
        label="Storage Utilization"
        value={`${storageUtilization}%`}
        icon="🏭"
        accentColor={
          storageUtilization > 85
            ? "#DC2626"
            : storageUtilization > 65
              ? "#F2B50B"
              : "#48A111"
        }
      />
    )}
  </div>
);
