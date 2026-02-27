import { useState, useEffect, useCallback, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { AllocationRequest, AllocationInsert } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";

const API_BASE = "http://localhost:5000/api/allocation";

interface UseAllocationsReturn {
  allocations: AllocationRequest[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createRequest: (data: AllocationInsert) => Promise<{ error: string | null }>;
  approveRequest: (
    id: string,
    batchId: string,
  ) => Promise<{ error: string | null; data?: any }>;
  rejectRequest: (
    id: string,
    reason?: string,
  ) => Promise<{ error: string | null }>;
}

export const useAllocations = (): UseAllocationsReturn => {
  const { session } = useAuthContext();
  const [allocations, setAllocations] = useState<AllocationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const headers = useCallback(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      h["Authorization"] = `Bearer ${session.access_token}`;
    }
    return h;
  }, [session]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAllocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { headers: headers() });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data: AllocationRequest[] = await res.json();
      setAllocations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load allocations",
      );
    } finally {
      setIsLoading(false);
    }
  }, [headers]);

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    fetchAllocations();

    const channel = supabase
      .channel("allocations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "allocation_requests" },
        () => {
          // Re-fetch on any change — the server join (requester) means we
          // can't trivially merge the payload; a full refetch is simpler and
          // still instant thanks to realtime triggering it.
          fetchAllocations();
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
  }, [fetchAllocations]);

  // ── Create request (any authenticated user, typically QC rep) ─────────────
  const createRequest = async (
    data: AllocationInsert,
  ): Promise<{ error: string | null }> => {
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { error: body.error || `HTTP ${res.status}` };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to create request",
      };
    }
  };

  // ── Approve (manager/owner) ───────────────────────────────────────────────
  const approveRequest = async (
    id: string,
    batchId: string,
  ): Promise<{ error: string | null; data?: any }> => {
    try {
      const res = await fetch(`${API_BASE}/${id}/approve`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ batch_id: batchId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { error: body.error || `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { error: null, data };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to approve",
      };
    }
  };

  // ── Reject (manager/owner) ────────────────────────────────────────────────
  const rejectRequest = async (
    id: string,
    reason?: string,
  ): Promise<{ error: string | null }> => {
    try {
      const res = await fetch(`${API_BASE}/${id}/reject`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { error: body.error || `HTTP ${res.status}` };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to reject",
      };
    }
  };

  return {
    allocations,
    isLoading,
    error,
    refetch: fetchAllocations,
    createRequest,
    approveRequest,
    rejectRequest,
  };
};
