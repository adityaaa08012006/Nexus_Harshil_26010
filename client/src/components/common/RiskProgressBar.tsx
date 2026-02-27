import React from "react";
import { getRiskLevel, RISK_COLORS } from "../../utils/riskCalculation";

interface RiskProgressBarProps {
  score: number;
  showLabel?: boolean;
  height?: number;
  className?: string;
}

export const RiskProgressBar: React.FC<RiskProgressBarProps> = ({
  score,
  showLabel = true,
  height = 8,
  className = "",
}) => {
  const level = getRiskLevel(score);
  const { hex, label } = RISK_COLORS[level];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium" style={{ color: hex }}>
            {label}
          </span>
          <span className="text-xs text-gray-500">{score}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: "#E5E7EB" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: hex }}
        />
      </div>
    </div>
  );
};
