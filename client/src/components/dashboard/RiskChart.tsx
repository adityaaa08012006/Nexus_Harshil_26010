import React from 'react';

interface RiskChartProps {
  data: Array<{
    batchId: string;
    riskScore: number;
  }>;
}

export const RiskChart: React.FC<RiskChartProps> = ({ data }) => {
  const getColorClass = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Distribution</h3>
      <div className="space-y-4">
        {data.map((batch) => (
          <div key={batch.batchId} className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 w-24">{batch.batchId}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full ${getColorClass(batch.riskScore)} transition-all duration-300 flex items-center justify-end pr-2`}
                style={{ width: `${batch.riskScore}%` }}
              >
                <span className="text-xs text-white font-medium">{batch.riskScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
