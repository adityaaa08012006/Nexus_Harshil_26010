import React from 'react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { RiskChart } from '../components/dashboard/RiskChart';
import { InventoryTable } from '../components/dashboard/InventoryTable';
import { AlertPanel } from '../components/dashboard/AlertPanel';

export const Dashboard: React.FC = () => {
  // Mock data - replace with real data from API
  const metrics = {
    totalInventory: 12500,
    highRiskPercentage: 15,
    storageUtilization: 78,
    activeAlerts: 3,
  };

  const riskData = [
    { batchId: 'B-001', riskScore: 85 },
    { batchId: 'B-002', riskScore: 45 },
    { batchId: 'B-003', riskScore: 20 },
    { batchId: 'B-004', riskScore: 65 },
  ];

  const inventory = [
    {
      batchId: 'B-001',
      farmerId: 'F-12345',
      crop: 'Tomatoes',
      quantity: 500,
      shelfLife: 7,
      riskScore: 85,
      zone: 'A-1',
    },
    {
      batchId: 'B-002',
      farmerId: 'F-12346',
      crop: 'Potatoes',
      quantity: 1000,
      shelfLife: 30,
      riskScore: 45,
      zone: 'B-2',
    },
    {
      batchId: 'B-003',
      farmerId: 'F-12347',
      crop: 'Apples',
      quantity: 750,
      shelfLife: 60,
      riskScore: 20,
      zone: 'C-1',
    },
  ];

  const alerts = [
    {
      id: '1',
      type: 'danger' as const,
      message: 'Temperature in Zone A-1 exceeded threshold (28°C)',
      timestamp: '2 minutes ago',
    },
    {
      id: '2',
      type: 'warning' as const,
      message: 'Batch B-001 approaching shelf life limit',
      timestamp: '15 minutes ago',
    },
    {
      id: '3',
      type: 'info' as const,
      message: 'New order received from Quick Commerce partner',
      timestamp: '1 hour ago',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Warehouse Intelligence Dashboard</h1>

        {/* Top Metric Cards */}
        <div className="mb-8">
          <MetricCards metrics={metrics} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <RiskChart data={riskData} />
          </div>
          <div className="lg:col-span-1">
            <AlertPanel alerts={alerts} />
          </div>
        </div>

        {/* Inventory Table */}
        <div>
          <InventoryTable inventory={inventory} />
        </div>

        {/* Environmental Monitoring Section - Placeholder */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Environmental Monitoring
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Temperature</h4>
              <p className="text-2xl font-bold text-gray-900">24.5°C</p>
              <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Humidity</h4>
              <p className="text-2xl font-bold text-gray-900">65%</p>
              <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
