import React from "react";
import { formatNumber } from "../../utils/formatters";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Wheat,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sub,
  icon,
  accentColor = "#25671E",
  trend,
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div
        className="p-3 rounded-xl"
        style={{
          backgroundColor: "#25671E10",
          color: accentColor,
        }}
      >
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-gray-900">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
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
  trends?: {
    batches?: { value: number; isPositive: boolean };
    fresh?: { value: number; isPositive: boolean };
    moderate?: { value: number; isPositive: boolean };
    highRisk?: { value: number; isPositive: boolean };
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalBatches,
  freshCount,
  moderateCount,
  highRiskCount,
  totalQuantity,
  storageUtilization,
  warehouseName,
  trends,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <MetricCard
      label="Total Batches"
      value={totalBatches}
      sub={warehouseName}
      icon={<Package size={24} strokeWidth={2} />}
      accentColor="#25671E"
      trend={trends?.batches}
    />
    <MetricCard
      label="Fresh Batches"
      value={freshCount}
      sub="In good health"
      icon={<CheckCircle2 size={24} strokeWidth={2} />}
      accentColor="#48A111"
      trend={trends?.fresh}
    />
    <MetricCard
      label="Moderate Risk"
      value={moderateCount}
      sub="Needs attention"
      icon={<AlertTriangle size={24} strokeWidth={2} />}
      accentColor="#F2B50B"
      trend={trends?.moderate}
    />
    <MetricCard
      label="High Risk"
      value={highRiskCount}
      sub="Action required"
      icon={<AlertCircle size={24} strokeWidth={2} />}
      accentColor="#DC2626"
      trend={trends?.highRisk}
    />
    {storageUtilization != null && (
      <MetricCard
        label="Storage Used"
        value={`${storageUtilization}%`}
        sub="Total capacity"
        icon={<Package size={24} strokeWidth={2} />}
        accentColor={
          storageUtilization > 85
            ? "#DC2626"
            : storageUtilization > 65
              ? "#F2B50B"
              : "#48A111"
        }
      />
    )}
    <MetricCard
      label="Total Stock"
      value={`${formatNumber(Math.round(totalQuantity))} kg`}
      sub="Current inventory"
      icon={<Wheat size={24} strokeWidth={2} />}
      accentColor="#25671E"
    />
  </div>
);
