import React from 'react';

interface RiskBadgeProps {
  score: number;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, className = '' }) => {
  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: 'Low', color: 'bg-green-500' };
    if (score < 70) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'High', color: 'bg-red-500' };
  };

  const { label, color } = getRiskLevel(score);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${color}`}>
        {label} Risk
      </span>
      <span className="text-sm text-gray-600">({score}%)</span>
    </div>
  );
};
