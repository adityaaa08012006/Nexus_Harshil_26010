import React from "react";
import { Alert } from "../../lib/supabase";
import { formatRelativeTime } from "../../utils/formatters";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
  maxItems?: number;
  isLoading?: boolean;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    border: "#DC2626",
    bg: "#FEF2F2",
    text: "#991B1B",
    labelBg: "#FEE2E2",
    labelText: "#DC2626",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    border: "#F2B50B",
    bg: "#FFFBEB",
    text: "#92400E",
    labelBg: "#FEF3C7",
    labelText: "#92400E",
    label: "Warning",
  },
} as const;

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  onAcknowledge,
  maxItems = 5,
  isLoading = false,
}) => {
  const active = alerts.filter((a) => !a.acknowledged).slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Alerts & Notifications
        </h3>
        {active.length > 0 && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
          >
            {active.length} Active
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div
            className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
          />
        </div>
      ) : active.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="p-4 rounded-full" style={{ backgroundColor: "#48A11110" }}>
            <CheckCircle2 size={32} className="text-godam-leaf" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">All Clear!</p>
            <p className="text-xs text-gray-500 mt-1">No active alerts at the moment</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity];
            const Icon = cfg.icon;
            return (
              <div
                key={alert.id}
                className="rounded-lg p-4 flex items-start gap-3 border-l-4 shadow-sm hover:shadow transition-shadow"
                style={{ 
                  borderLeftColor: cfg.border, 
                  backgroundColor: cfg.bg,
                  borderTop: `1px solid ${cfg.border}20`,
                  borderRight: `1px solid ${cfg.border}20`,
                  borderBottom: `1px solid ${cfg.border}20`,
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${cfg.border}20` }}
                  >
                    <Icon size={18} style={{ color: cfg.text }} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{ color: cfg.text }}
                    >
                      {alert.message}
                    </p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ 
                        backgroundColor: cfg.labelBg,
                        color: cfg.labelText,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-2 font-medium"
                    style={{ color: `${cfg.text}90` }}
                  >
                    {alert.zone ? `Zone ${alert.zone} · ` : ""}
                    {formatRelativeTime(alert.triggered_at)}
                  </p>
                  {onAcknowledge && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 mt-3"
                      style={{
                        backgroundColor: "#48A111",
                        color: "white",
                      }}
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
