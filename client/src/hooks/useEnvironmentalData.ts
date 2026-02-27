import { useState, useEffect, useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

export interface SensorReading {
  id: string;
  warehouse_id: string;
  zone: string;
  temperature: number;
  humidity: number;
  ethylene: number;
  co2: number;
  ammonia: number;
  reading_time: string;
  created_at: string;
}

export interface SensorThreshold {
  id: string;
  warehouse_id: string;
  zone: string;
  temperature_min: number;
  temperature_max: number;
  humidity_min: number;
  humidity_max: number;
  ethylene_max: number;
  co2_max: number;
  ammonia_max: number;
  created_at: string;
  updated_at: string;
}

export interface SensorAlert {
  id: string;
  warehouse_id: string;
  zone: string;
  alert_type: "temperature" | "humidity" | "ethylene" | "co2" | "ammonia";
  severity: "warning" | "critical";
  message: string;
  current_value: number;
  threshold_value: number;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  triggered_at: string;
  created_at: string;
}

interface UseEnvironmentalDataReturn {
  readings: SensorReading[];
  thresholds: SensorThreshold[];
  alerts: SensorAlert[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateThreshold: (
    zone: string,
    thresholdData: Partial<SensorThreshold>,
  ) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  simulateData: (criticalChance?: number) => Promise<void>;
}

// ============================================================================
// Hook: useEnvironmentalData
// ============================================================================

/**
 * Hook to fetch and manage sensor data, thresholds, and alerts
 * @param warehouseId - Warehouse UUID
 * @param zone - Optional zone filter
 * @param pollingInterval - Polling interval in ms (default: 10000)
 */
export const useEnvironmentalData = (
  warehouseId: string | null | undefined,
  zone?: string,
  pollingInterval: number = 10000,
): UseEnvironmentalDataReturn => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [thresholds, setThresholds] = useState<SensorThreshold[]>([]);
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch Current Readings ───────────────────────────────────────────────
  const fetchReadings = useCallback(async () => {
    if (!warehouseId) return;

    try {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = zone
        ? `http://localhost:5000/api/sensors/readings/${warehouseId}/zone/${zone}`
        : `http://localhost:5000/api/sensors/readings/${warehouseId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${JSON.parse(token).access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch sensor readings");
      }

      const data = await response.json();
      setReadings(data.readings || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching sensor readings:", message);
      setError(message);
    }
  }, [warehouseId, zone]);

  // ─── Fetch Thresholds ─────────────────────────────────────────────────────
  const fetchThresholds = useCallback(async () => {
    if (!warehouseId) return;

    try {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5000/api/sensors/thresholds/${warehouseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${JSON.parse(token).access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch thresholds");
      }

      const data = await response.json();
      setThresholds(data.thresholds || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching thresholds:", message);
      // Don't set error state here to avoid overriding readings error
    }
  }, [warehouseId]);

  // ─── Fetch Alerts ─────────────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    if (!warehouseId) return;

    try {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5000/api/sensors/alerts/${warehouseId}?acknowledged=false`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${JSON.parse(token).access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch alerts");
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching alerts:", message);
    }
  }, [warehouseId]);

  // ─── Fetch All Data ───────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    if (!warehouseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([fetchReadings(), fetchThresholds(), fetchAlerts()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [warehouseId, fetchReadings, fetchThresholds, fetchAlerts]);

  // ─── Update Threshold ─────────────────────────────────────────────────────
  const updateThreshold = useCallback(
    async (zone: string, thresholdData: Partial<SensorThreshold>) => {
      if (!warehouseId) return;

      try {
        const token = localStorage.getItem("supabase.auth.token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `http://localhost:5000/api/sensors/thresholds`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${JSON.parse(token).access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              warehouse_id: warehouseId,
              zone,
              ...thresholdData,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update threshold");
        }

        // Refetch thresholds after update
        await fetchThresholds();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Error updating threshold:", message);
        throw err;
      }
    },
    [warehouseId, fetchThresholds],
  );

  // ─── Acknowledge Alert ────────────────────────────────────────────────────
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:5000/api/sensors/alerts/${alertId}/acknowledge`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JSON.parse(token).access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to acknowledge alert");
      }

      // Remove acknowledged alert from state
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error acknowledging alert:", message);
      throw err;
    }
  }, []);

  // ─── Simulate Data (for testing) ──────────────────────────────────────────
  const simulateData = useCallback(
    async (criticalChance: number = 0.1) => {
      if (!warehouseId) return;

      try {
        const token = localStorage.getItem("supabase.auth.token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `http://localhost:5000/api/sensors/simulate/${warehouseId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${JSON.parse(token).access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ criticalChance }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to simulate sensor data");
        }

        // Refetch all data after simulation
        await fetchAllData();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Error simulating sensor data:", message);
        throw err;
      }
    },
    [warehouseId, fetchAllData],
  );

  // ─── Auto-Fetch on Mount and Poll ─────────────────────────────────────────
  useEffect(() => {
    fetchAllData();

    // Set up polling if polling interval is provided
    if (pollingInterval > 0) {
      const interval = setInterval(() => {
        fetchReadings();
        fetchAlerts();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [fetchAllData, fetchReadings, fetchAlerts, pollingInterval]);

  return {
    readings,
    thresholds,
    alerts,
    isLoading,
    error,
    refetch: fetchAllData,
    updateThreshold,
    acknowledgeAlert,
    simulateData,
  };
};
