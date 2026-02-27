import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Alert } from "../lib/supabase";
import { formatRelativeTime } from "../utils/formatters";
import { AlertCircle, AlertTriangle, Filter } from "lucide-react";

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

export const AlertsPage: React.FC = () => {
  const { user } = useAuthContext();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "acknowledged" | "all">(
    "active",
  );

  useEffect(() => {
    fetchAlerts();
  }, [user?.warehouse_id, filter]);

  const fetchAlerts = async () => {
    if (!user?.warehouse_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("sensor_alerts")
        .select("*")
        .eq("warehouse_id", user.warehouse_id)
        .order("triggered_at", { ascending: false });

      if (filter === "active") {
        query = query.eq("acknowledged", false);
      } else if (filter === "acknowledged") {
        query = query.eq("acknowledged", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setAlerts(data ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    const { error } = await supabase
      .from("sensor_alerts")
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq("id", alertId);

    if (!error) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      // Trigger alert count refresh in sidebar
      window.dispatchEvent(new Event("alert-acknowledged"));
    }
  };

  const activeCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Alerts & Notifications
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Monitor and respond to sensor threshold breaches
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-4 p-4 border-b border-gray-200">
          <Filter size={20} className="text-gray-500" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "active"
                  ? "bg-red-100 text-red-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Active
              {filter === "active" && activeCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-900 rounded-full text-xs">
                  {activeCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("acknowledged")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "acknowledged"
                  ? "bg-green-100 text-green-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Acknowledged
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
            />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="p-4 rounded-full bg-green-50">
              <AlertCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {filter === "active"
                ? "No active alerts"
                : filter === "acknowledged"
                  ? "No acknowledged alerts"
                  : "No alerts found"}
            </h3>
            <p className="text-sm text-gray-500">
              {filter === "active"
                ? "All systems operating within normal parameters"
                : "Check back later for updates"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const cfg = SEVERITY_CONFIG[alert.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={alert.id}
                  className="rounded-lg p-4 border"
                  style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Icon
                        size={24}
                        style={{ color: cfg.text }}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="inline-block px-2 py-1 rounded text-xs font-semibold uppercase"
                              style={{
                                backgroundColor: cfg.border,
                                color: "white",
                              }}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              Zone {alert.zone}
                            </span>
                          </div>
                          <p
                            className="text-base font-medium mb-2"
                            style={{ color: cfg.text }}
                          >
                            {alert.message}
                          </p>
                          <div
                            className="text-sm space-y-1"
                            style={{ color: cfg.text, opacity: 0.8 }}
                          >
                            <p>
                              Current: <strong>{alert.current_value}</strong> |
                              Threshold:{" "}
                              <strong>{alert.threshold_value}</strong>
                            </p>
                            <p>
                              Alert Type:{" "}
                              <strong className="capitalize">
                                {alert.alert_type}
                              </strong>
                            </p>
                            <p>{formatRelativeTime(alert.triggered_at)}</p>
                          </div>
                          {alert.acknowledged && alert.acknowledged_at && (
                            <p className="text-xs text-gray-500 mt-2">
                              Acknowledged{" "}
                              {formatRelativeTime(alert.acknowledged_at)}
                            </p>
                          )}
                        </div>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all hover:opacity-90 shadow-sm"
                            style={{ backgroundColor: "#48A111" }}
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
