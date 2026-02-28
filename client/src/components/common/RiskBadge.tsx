import React from "react";
import { getRiskLevel, RISK_COLORS } from "../../utils/riskCalculation";

interface RiskBadgeProps {
  score: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIndicator?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  showScore = true,
  size = "md",
  className = "",
  showIndicator = true,
}) => {
  const level = getRiskLevel(score);
  const { hex, label } = RISK_COLORS[level];
  
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };
  
  const indicatorSize = {
    sm: 5,
    md: 6,
    lg: 7,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full transition-all hover:shadow-md ${sizeStyles[size]} ${className}`}
      style={{
        backgroundColor: `${hex}15`,
        color: hex,
        border: `1.5px solid ${hex}50`,
      }}
    >
      {showIndicator && (
        <span
          className="rounded-full animate-pulse"
          style={{
            width: indicatorSize[size],
            height: indicatorSize[size],
            backgroundColor: hex,
            display: "inline-block",
            boxShadow: `0 0 6px ${hex}60`,
          }}
        />
      )}
      {label}
      {showScore && <span className="opacity-80 font-medium">({score}%)</span>}
    </span>
  );
};
