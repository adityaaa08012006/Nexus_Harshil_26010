import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useWarehouse } from "../context/WarehouseContext";

/**
 * Hook to fetch and track the number of unacknowledged alerts
 * Updates every 30 seconds and when "alert-acknowledged" event is dispatched
 * Supports both managers (fixed warehouse) and owners (selected warehouse)
 */
export const useAlertCount = () => {
  const { user } = useAuth();
  const { selectedWarehouseId } = useWarehouse();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Determine the warehouse to check alerts for
  const warehouseId =
    user?.role === "owner" ? selectedWarehouseId : user?.warehouse_id;

  useEffect(() => {
    if (!warehouseId) {
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      try {
        let totalCount = 0;

        // Fetch sensor alerts count
        const { count: sensorAlertCount, error: sensorError } = await supabase
          .from("sensor_alerts")
          .select("*", { count: "exact", head: true })
          .eq("warehouse_id", warehouseId)
          .eq("acknowledged", false);

        if (!sensorError && sensorAlertCount !== null) {
          totalCount += sensorAlertCount;
        }

        // Fetch order alerts count for managers and owners
        if (
          (user?.role === "manager" || user?.role === "owner") &&
          warehouseId
        ) {
          const { count: orderAlertCount, error: orderError } = await supabase
            .from("alerts")
            .select("*", { count: "exact", head: true })
            .eq("type", "order")
            .eq("warehouse_id", warehouseId)
            .eq("is_acknowledged", false);

          if (!orderError && orderAlertCount !== null) {
            totalCount += orderAlertCount;
          }
        }

        setCount(totalCount);
      } catch (error) {
        console.error("Error fetching alert count:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    // Listen for manual refresh events
    const handleRefresh = () => fetchCount();
    window.addEventListener("alert-acknowledged", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("alert-acknowledged", handleRefresh);
    };
  }, [warehouseId, user?.role]);

  return { count, loading };
};
