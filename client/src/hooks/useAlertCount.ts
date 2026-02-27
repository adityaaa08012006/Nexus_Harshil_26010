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
        const { count: alertCount, error } = await supabase
          .from("sensor_alerts")
          .select("*", { count: "exact", head: true })
          .eq("warehouse_id", user.warehouse_id)
          .eq("acknowledged", false);

        if (!error && alertCount !== null) {
          setCount(alertCount);
        }
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
