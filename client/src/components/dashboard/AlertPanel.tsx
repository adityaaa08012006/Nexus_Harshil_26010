import React from "react";
import { Alert } from "../../lib/supabase";
import { formatRelativeTime } from "../../utils/formatters";

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
  maxItems?: number;
  isLoading?: boolean;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: "🚨",
    border: "#DC2626",
    bg: "#FEF2F2",
    text: "#991B1B",
    label: "Critical",
  },
  warning: {
    icon: "⚠️",
    border: "#F2B50B",
    bg: "#FFFBEB",
    text: "#92400E",
    label: "Warning",
  },
  info: {
    icon: "ℹ️",
    border: "#3B82F6",
    bg: "#EFF6FF",
    text: "#1E40AF",
    label: "Info",
  },
};

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  onAcknowledge,
  maxItems = 5,
  isLoading = false,
}) => {
  const active = alerts.filter((a) => !a.is_acknowledged).slice(0, maxItems);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border"
      style={{ backgroundColor: "#F7F0F0", borderColor: "#25671E20" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold" style={{ color: "#25671E" }}>
          Active Alerts
        </h3>
        {active.length > 0 && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#DC262620", color: "#DC2626" }}
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
        <div className="flex flex-col items-center gap-2 py-6">
          <span className="text-3xl">✅</span>
          <p className="text-sm text-gray-500">All clear — no active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity];
            return (
              <div
                key={alert.id}
                className="border-l-4 rounded-r-xl p-3 flex items-start gap-3"
                style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}
              >
                <span className="text-lg flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: cfg.text }}
                  >
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p
                      className="text-xs opacity-60"
                      style={{ color: cfg.text }}
                    >
                      {alert.zone ? `Zone ${alert.zone} · ` : ""}
                      {formatRelativeTime(alert.created_at)}
                    </p>
                    {onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: "#48A11120",
                          color: "#48A111",
                        }}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
