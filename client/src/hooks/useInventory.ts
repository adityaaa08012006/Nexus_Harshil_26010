import { useState, useEffect, useCallback } from "react";
import { supabase, Batch, BatchInsert, BatchUpdate } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";
import { calculateRiskScore } from "../utils/riskCalculation";

interface InventoryStats {
  total: number;
  fresh: number;
  moderate: number;
  highRisk: number;
  totalQuantity: number;
}

interface UseInventoryReturn {
  batches: Batch[];
  stats: InventoryStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createBatch: (data: BatchInsert) => Promise<{ error: string | null }>;
  updateBatch: (
    id: string,
    data: BatchUpdate,
  ) => Promise<{ error: string | null }>;
  deleteBatch: (id: string) => Promise<{ error: string | null }>;
}

export const useInventory = (warehouseId?: string): UseInventoryReturn => {
  const { user } = useAuthContext();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("batches")
        .select("*")
        .neq("status", "expired")
        .order("entry_date", { ascending: false });

      // Role-based filtering
      if (user?.role === "manager" && user?.warehouse_id) {
        query = query.eq("warehouse_id", user.warehouse_id);
      } else if (warehouseId) {
        query = query.eq("warehouse_id", warehouseId);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw new Error(fetchErr.message);
      setBatches(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  }, [user, warehouseId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const createBatch = async (
    data: BatchInsert,
  ): Promise<{ error: string | null }> => {
    try {
      // Calculate initial risk score client-side
      const risk_score = calculateRiskScore({
        entryDate: new Date().toISOString(),
        shelfLife: data.shelf_life,
        temperature: data.temperature,
        humidity: data.humidity,
      });

      const { error: insertErr } = await supabase
        .from("batches")
        .insert({ ...data, risk_score, status: "active" });

      if (insertErr) return { error: insertErr.message };
      await fetchInventory();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Insert failed" };
    }
  };

  const updateBatch = async (
    id: string,
    data: BatchUpdate,
  ): Promise<{ error: string | null }> => {
    try {
      const { error: updateErr } = await supabase
        .from("batches")
        .update(data)
        .eq("id", id);
      if (updateErr) return { error: updateErr.message };
      await fetchInventory();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Update failed" };
    }
  };

  const deleteBatch = async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error: deleteErr } = await supabase
        .from("batches")
        .delete()
        .eq("id", id);
      if (deleteErr) return { error: deleteErr.message };
      setBatches((prev) => prev.filter((b) => b.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Delete failed" };
    }
  };

  const stats: InventoryStats = {
    total: batches.length,
    fresh: batches.filter((b) => b.risk_score <= 30).length,
    moderate: batches.filter((b) => b.risk_score > 30 && b.risk_score <= 70)
      .length,
    highRisk: batches.filter((b) => b.risk_score > 70).length,
    totalQuantity: batches.reduce((sum, b) => sum + b.quantity, 0),
  };

  return {
    batches,
    stats,
    isLoading,
    error,
    refetch: fetchInventory,
    createBatch,
    updateBatch,
    deleteBatch,
  };
};
