import React from 'react';
import { RiskBadge } from '../components/common/RiskBadge';

export const BatchDetails: React.FC = () => {
  // Mock data - replace with data from API/router params
  const batchData = {
    batchId: 'B-001',
    farmerId: 'F-12345',
    farmerName: 'Rajesh Kumar',
    farmerContact: '+91-9876543210',
    crop: 'Tomatoes',
    variety: 'Roma',
    quantity: 500,
    unit: 'kg',
    entryDate: '2026-02-20',
    shelfLife: 7,
    riskScore: 85,
    zone: 'A-1',
    temperature: 28,
    humidity: 70,
    ethylene: 'High',
    co2: 'Normal',
    status: 'Active',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Batch Details: {batchData.batchId}
          </h1>
          <div className="flex items-center gap-4">
            <RiskBadge score={batchData.riskScore} />
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {batchData.status}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Batch Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Information</h2>
            <dl className="space-y-3">
              <DetailRow label="Crop" value={batchData.crop} />
              <DetailRow label="Variety" value={batchData.variety} />
              <DetailRow label="Quantity" value={`${batchData.quantity} ${batchData.unit}`} />
              <DetailRow label="Entry Date" value={batchData.entryDate} />
              <DetailRow label="Shelf Life" value={`${batchData.shelfLife} days`} />
              <DetailRow label="Storage Zone" value={batchData.zone} />
            </dl>
          </div>

          {/* Farmer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Farmer Information</h2>
            <dl className="space-y-3">
              <DetailRow label="Farmer ID" value={batchData.farmerId} />
              <DetailRow label="Name" value={batchData.farmerName} />
              <DetailRow label="Contact" value={batchData.farmerContact} />
            </dl>
          </div>

          {/* Environmental Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Environmental Data</h2>
            <dl className="space-y-3">
              <DetailRow label="Temperature" value={`${batchData.temperature}°C`} />
              <DetailRow label="Humidity" value={`${batchData.humidity}%`} />
              <DetailRow label="Ethylene Level" value={batchData.ethylene} />
              <DetailRow label="CO₂ Level" value={batchData.co2} />
            </dl>
          </div>

          {/* Risk Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Analysis</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Overall Risk Score</p>
                <RiskBadge score={batchData.riskScore} />
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-700">
                  <strong>Recommendation:</strong> This batch shows elevated risk due to high
                  temperature and approaching shelf life limit. Prioritize for immediate
                  dispatch to processing units or quick commerce channels.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors min-h-[44px]">
            Trigger Early Dispatch
          </button>
          <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors min-h-[44px]">
            View Full History
          </button>
        </div>
      </div>
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
};
