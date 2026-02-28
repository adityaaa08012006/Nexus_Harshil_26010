import React from 'react';
import { RiskChart } from '../components/dashboard/RiskChart';
import { InventoryTable } from '../components/dashboard/InventoryTable';
import { AlertPanel } from '../components/dashboard/AlertPanel';
import { Thermometer, Droplets } from 'lucide-react';
import { Batch, Alert as AlertType } from '../lib/supabase';

// Mock Data matching Supabase types
const mockBatches: Batch[] = [
  {
    id: '1',
    batch_id: 'B-001',
    farmer_id: 'F-12345',
    warehouse_id: 'W-001',
    crop: 'Tomatoes',
    variety: 'Roma',
    quantity: 500,
    unit: 'kg',
    entry_date: new Date().toISOString(),
    shelf_life: 7,
    risk_score: 85,
    zone: 'A-1',
    status: 'active',
    temperature: 24.5,
    humidity: 65,
    co2: '400',
    ammonia: '0',
    ethylene: '0',
    destination: null,
    dispatch_date: null,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    batch_id: 'B-002',
    farmer_id: 'F-12346',
    warehouse_id: 'W-001',
    crop: 'Potatoes',
    variety: 'Russet',
    quantity: 1000,
    unit: 'kg',
    entry_date: new Date().toISOString(),
    shelf_life: 30,
    risk_score: 45,
    zone: 'B-2',
    status: 'active',
    temperature: 18,
    humidity: 55,
    co2: '400',
    ammonia: '0',
    ethylene: '0',
    destination: null,
    dispatch_date: null,
    created_at: new Date().toISOString()
  },
];

const mockAlerts: AlertType[] = [
  {
    id: '1',
    warehouse_id: 'W-001',
    zone: 'A-1',
    alert_type: 'temperature',
    severity: 'critical',
    message: 'Temperature in Zone A-1 exceeded threshold (28°C)',
    current_value: 28.5,
    threshold_value: 25.0,
    acknowledged: false,
    triggered_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    warehouse_id: 'W-001',
    zone: 'B-2',
    alert_type: 'humidity', // compliant with AlertType
    severity: 'warning',
    message: 'Batch B-001 approaching shelf life limit',
    current_value: 0,
    threshold_value: 0,
    acknowledged: false,
    triggered_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
];

export const Dashboard: React.FC = () => {
  
  // Calculate metrics
  const totalBatches = mockBatches.length;
  const freshCount = mockBatches.filter(b => b.risk_score <= 30).length;
  const highRiskCount = mockBatches.filter(b => b.risk_score > 70).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Warehouse Intelligence Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and analytics</p>
        </div>

        {/* Top Metric Cards (Simplied for demo) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Batches</p>
              <p className="text-2xl font-bold">{totalBatches}</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Fresh Stock</p>
              <p className="text-2xl font-bold text-green-600">{freshCount}</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
           </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Utilization</p>
              <p className="text-2xl font-bold text-blue-600">78%</p>
           </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {/* Updated Prop: 'batches' instead of 'data' */}
            <RiskChart batches={mockBatches} />
          </div>
          <div className="lg:col-span-1">
             {/* AlertPanel expects specific Alert type */}
            <AlertPanel 
              alerts={mockAlerts} 
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="mb-8">
           {/* Updated Prop: 'batches' instead of 'inventory' */}
          <InventoryTable batches={mockBatches} />
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
          </div>
        </div>
      </div>
    </div>
  );
};
