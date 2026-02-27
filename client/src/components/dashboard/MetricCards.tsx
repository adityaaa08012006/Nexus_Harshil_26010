import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-green-600">{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
        </p>
      )}
    </div>
  );
};

interface MetricCardsProps {
  metrics: {
    totalInventory: number;
    highRiskPercentage: number;
    storageUtilization: number;
    activeAlerts: number;
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard title="Total Inventory" value={`${metrics.totalInventory} units`} />
      <MetricCard title="High-Risk Batch %" value={`${metrics.highRiskPercentage}%`} />
      <MetricCard title="Storage Utilization" value={`${metrics.storageUtilization}%`} />
      <MetricCard title="Active Alerts" value={metrics.activeAlerts} />
    </div>
  );
};
