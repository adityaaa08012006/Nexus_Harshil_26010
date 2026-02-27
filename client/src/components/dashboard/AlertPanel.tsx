import React from "react";
import { Alert } from "../../lib/supabase";
import { formatRelativeTime } from "../../utils/formatters";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

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
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    border: "#F2B50B",
    bg: "#FFFBEB",
    text: "#92400E",
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
    <div
      className="rounded-xl p-6 shadow-sm border"
      style={{ backgroundColor: "white", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-700">
          Alerts & Notifications
        </h3>
        {active.length > 0 && (
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
          >
            {active.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
          />
        </div>
      ) : active.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="p-3 rounded-full bg-green-50">
            <AlertCircle size={24} className="text-green-600" />
          </div>
          <p className="text-sm text-gray-500">All clear — no active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity];
            const Icon = cfg.icon;
            return (
              <div
                key={alert.id}
                className="rounded-lg p-3 flex items-start gap-3 border"
                style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon size={18} style={{ color: cfg.text }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium leading-snug"
                    style={{ color: cfg.text }}
                  >
                    {alert.message}
                  </p>
                  <p
                    className="text-xs mt-1.5 opacity-70"
                    style={{ color: cfg.text }}
                  >
                    {alert.zone ? `Zone ${alert.zone} · ` : ""}
                    {formatRelativeTime(alert.triggered_at)}
                  </p>
                  {onAcknowledge && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-xs font-medium px-3 py-1 rounded-md transition-colors hover:opacity-80 mt-2"
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
