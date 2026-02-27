import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

/**
 * Hook to fetch and track the number of unacknowledged alerts
 * Updates every 30 seconds and when "alert-acknowledged" event is dispatched
 */
export const useAlertCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.warehouse_id) {
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
          .eq("warehouse_id", user.warehouse_id)
          .eq("acknowledged", false);

        if (!sensorError && sensorAlertCount !== null) {
          totalCount += sensorAlertCount;
        }

        // Fetch order alerts count for managers
        if (user.role === "manager" && user.warehouse_id) {
          const { count: orderAlertCount, error: orderError } = await supabase
            .from("alerts")
            .select("*", { count: "exact", head: true })
            .eq("type", "order")
            .eq("warehouse_id", user.warehouse_id)
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
  }, [user?.warehouse_id]);

  return { count, loading };
};
