import React from 'react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { RiskChart } from '../components/dashboard/RiskChart';
import { InventoryTable } from '../components/dashboard/InventoryTable';
import { AlertPanel } from '../components/dashboard/AlertPanel';
import { Thermometer, Droplets } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // Mock data - replace with real data from API
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
      severity: 'critical' as const,
      message: 'Temperature in Zone A-1 exceeded threshold (28°C)',
      triggered_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      acknowledged: false,
      zone: 'A-1',
    },
    {
      id: '2',
      severity: 'warning' as const,
      message: 'Batch B-001 approaching shelf life limit',
      triggered_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      acknowledged: false,
      zone: null,
    },
  ];

  // Calculate metrics from inventory
  const totalBatches = inventory.length;
  const freshCount = inventory.filter(b => b.riskScore <= 30).length;
  const moderateCount = inventory.filter(b => b.riskScore > 30 && b.riskScore <= 70).length;
  const highRiskCount = inventory.filter(b => b.riskScore > 70).length;
  const totalQuantity = inventory.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Warehouse Intelligence Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and analytics</p>
        </div>

        {/* Top Metric Cards */}
        <div className="mb-8">
          <MetricCards
            totalBatches={totalBatches}
            freshCount={freshCount}
            moderateCount={moderateCount}
            highRiskCount={highRiskCount}
            totalQuantity={totalQuantity}
            storageUtilization={78}
            warehouseName="Main Warehouse"
            trends={{
              batches: { value: 12, isPositive: true },
              fresh: { value: 8, isPositive: true },
              moderate: { value: 5, isPositive: false },
              highRisk: { value: 3, isPositive: false },
            }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RiskChart data={riskData} />
          </div>
          <div className="lg:col-span-1">
            <AlertPanel 
              alerts={alerts} 
              onAcknowledge={(id) => console.log('Acknowledge alert:', id)}
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="mb-8">
          <InventoryTable inventory={inventory} />
        </div>

        {/* Environmental Monitoring Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Environmental Monitoring
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-blue-500 rounded-lg">
                  <Thermometer size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <h4 className="text-sm font-semibold text-blue-900">Temperature</h4>
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-1">24.5°C</p>
              <p className="text-xs text-blue-700">Normal range • Zone A-1</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl p-5 border border-cyan-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-cyan-500 rounded-lg">
                  <Droplets size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <h4 className="text-sm font-semibold text-cyan-900">Humidity</h4>
              </div>
              <p className="text-3xl font-bold text-cyan-900 mb-1">65%</p>
              <p className="text-xs text-cyan-700">Optimal • Zone A-1</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-blue-500 rounded-lg">
                  <Thermometer size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <h4 className="text-sm font-semibold text-blue-900">Temperature</h4>
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-1">22.8°C</p>
              <p className="text-xs text-blue-700">Normal range • Zone B-2</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl p-5 border border-cyan-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-cyan-500 rounded-lg">
                  <Droplets size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <h4 className="text-sm font-semibold text-cyan-900">Humidity</h4>
              </div>
              <p className="text-3xl font-bold text-cyan-900 mb-1">58%</p>
              <p className="text-xs text-cyan-700">Optimal • Zone B-2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
