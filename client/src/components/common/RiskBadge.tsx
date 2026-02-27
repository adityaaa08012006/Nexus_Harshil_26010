import React from "react";
import { getRiskLevel, RISK_COLORS } from "../../utils/riskCalculation";

interface RiskBadgeProps {
  score: number;
  showScore?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  showScore = true,
  size = "md",
  className = "",
}) => {
  const level = getRiskLevel(score);
  const { hex, label } = RISK_COLORS[level];
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${pad} ${className}`}
      style={{
        backgroundColor: `${hex}20`,
        color: hex,
        border: `1px solid ${hex}40`,
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: 6,
          height: 6,
          backgroundColor: hex,
          display: "inline-block",
        }}
      />
      {label}
      {showScore && <span className="opacity-70">({score}%)</span>}
    </span>
  );
};
