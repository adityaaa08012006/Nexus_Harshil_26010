import { useState, useEffect, useCallback, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
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

/**
 * Helper: check if a batch row matches the current filter criteria.
 * Mirrors the filtering used in the initial fetch.
 */
const matchesFilter = (row: Batch, filterWarehouseId?: string): boolean => {
  if (row.status === "expired") return false;
  if (filterWarehouseId) {
    return row.warehouse_id === filterWarehouseId;
  }
  return true;
};

export const useInventory = (warehouseId?: string): UseInventoryReturn => {
  const { user } = useAuthContext();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ── Initial Fetch ─────────────────────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("batches")
        .select("*")
        .neq("status", "expired")
        .order("entry_date", { ascending: false });

      // Warehouse-based filtering
      if (warehouseId) {
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
  }, [warehouseId]);

  // ── Supabase Realtime Subscription ────────────────────────────────────────
  useEffect(() => {
    fetchInventory();

    // Subscribe to all changes on the batches table
    const channel = supabase
      .channel("inventory-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "batches" },
        (payload) => {
          const newRow = payload.new as Batch;
          if (matchesFilter(newRow, warehouseId)) {
            setBatches((prev) => {
              // Avoid duplicates
              if (prev.some((b) => b.id === newRow.id)) return prev;
              return [newRow, ...prev];
            });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "batches" },
        (payload) => {
          const updated = payload.new as Batch;
          setBatches((prev) => {
            // If updated to expired or no longer matches filter, remove it
            if (!matchesFilter(updated, warehouseId)) {
              return prev.filter((b) => b.id !== updated.id);
            }
            // Replace existing row, or add if new
            const idx = prev.findIndex((b) => b.id === updated.id);
            if (idx === -1) return [updated, ...prev];
            const next = [...prev];
            next[idx] = updated;
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "batches" },
        (payload) => {
          const deleted = payload.old as Batch;
          setBatches((prev) => prev.filter((b) => b.id !== deleted.id));
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchInventory, user, warehouseId]);

  // ── CRUD Operations ───────────────────────────────────────────────────────

  const createBatch = async (
    data: BatchInsert,
  ): Promise<{ error: string | null }> => {
    try {
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
      // Realtime subscription will handle the state update
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
      // Realtime subscription will handle the state update
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
      // Realtime subscription will handle the state update
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Delete failed" };
    }
  };

  // ── Derived Stats ─────────────────────────────────────────────────────────

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
