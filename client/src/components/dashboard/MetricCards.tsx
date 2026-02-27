import React from "react";
import { formatNumber } from "../../utils/formatters";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Wheat,
} from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sub,
  icon,
  accentColor = "#25671E",
}) => (
  <div
    className="rounded-xl p-5 flex flex-col gap-3 shadow-sm border hover:shadow-md transition-shadow"
    style={{ backgroundColor: "white", borderColor: "#E5E7EB" }}
  >
    <div className="flex items-center justify-between">
      <div
        className="p-2.5 rounded-lg"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <div style={{ color: accentColor }}>{icon}</div>
      </div>
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold" style={{ color: "#1F2937" }}>
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
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
      icon={<Package size={20} strokeWidth={2} />}
      accentColor="#25671E"
    />
    <MetricCard
      label="Fresh Batches"
      value={freshCount}
      sub="Risk ≤ 30%"
      icon={<CheckCircle2 size={20} strokeWidth={2} />}
      accentColor="#48A111"
    />
    <MetricCard
      label="Moderate Risk"
      value={moderateCount}
      sub="Risk 31–70%"
      icon={<AlertTriangle size={20} strokeWidth={2} />}
      accentColor="#F2B50B"
    />
    <MetricCard
      label="High Risk"
      value={highRiskCount}
      sub="Risk > 70%"
      icon={<AlertCircle size={20} strokeWidth={2} />}
      accentColor="#DC2626"
    />
    <MetricCard
      label="Total Stock"
      value={`${formatNumber(Math.round(totalQuantity))} kg`}
      icon={<Wheat size={20} strokeWidth={2} />}
      accentColor="#25671E"
    />
    {storageUtilization != null && (
      <MetricCard
        label="Storage Utilization"
        value={`${storageUtilization}%`}
        icon={<Package size={20} strokeWidth={2} />}
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
