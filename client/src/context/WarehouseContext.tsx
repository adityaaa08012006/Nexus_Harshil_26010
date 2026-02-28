import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, Warehouse } from "../lib/supabase";
import { useAuthContext } from "./AuthContext";
import { API_URL } from "../config/api";

interface WarehouseContextType {
  warehouses: Warehouse[];
  selectedWarehouseId: string | undefined;
  setSelectedWarehouseId: (id: string | undefined) => void;
  selectedWarehouse: Warehouse | undefined;
  isLoading: boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(
  undefined,
);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<
    string | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch warehouses based on user role
  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!user) {
        setWarehouses([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let warehouseData: Warehouse[] = [];

        // Role-based fetching
        if (user.role === "manager" || user.role === "qc_rep") {
          // Managers and QC fetch from API (uses junction table)
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;

          if (token) {
            const response = await fetch(`${API_URL}/api/warehouses`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const result = await response.json();
              warehouseData = result.warehouses || [];
            }
          }
        } else if (user.role === "owner") {
          // Owners fetch directly from Supabase
          const { data, error } = await supabase
            .from("warehouses")
            .select("*")
            .eq("owner_id", user.id)
            .order("name", { ascending: true });

          if (error) {
            console.error("Error fetching warehouses:", error);
          } else {
            warehouseData = data ?? [];
          }
        }

        setWarehouses(warehouseData);

        // Auto-select warehouse based on role
        if (user.role === "manager" || user.role === "qc_rep") {
          // For managers/QC, try to restore from localStorage
          const storedId = localStorage.getItem(
            `selectedWarehouseId_${user.id}`,
          );
          if (storedId && warehouseData.some((w) => w.id === storedId)) {
            setSelectedWarehouseId(storedId);
          } else {
            // Don't auto-select - require explicit selection
            setSelectedWarehouseId(undefined);
          }
        } else if (user.role === "owner") {
          // For owners, try to restore from localStorage or select first
          const storedId = localStorage.getItem(
            `selectedWarehouseId_${user.id}`,
          );
          if (storedId && warehouseData.some((w) => w.id === storedId)) {
            setSelectedWarehouseId(storedId);
          } else if (warehouseData.length > 0) {
            setSelectedWarehouseId(warehouseData[0].id);
          }
        }
      } catch (err) {
        console.error("Error in fetchWarehouses:", err);
        setWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
  }, [user]);

  // Persist warehouse selection to localStorage (user-specific)
  useEffect(() => {
    if (user?.id && selectedWarehouseId) {
      localStorage.setItem(
        `selectedWarehouseId_${user.id}`,
        selectedWarehouseId,
      );
    }
  }, [selectedWarehouseId, user?.id]);

  const selectedWarehouse = warehouses.find(
    (w) => w.id === selectedWarehouseId,
  );

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        selectedWarehouseId,
        setSelectedWarehouseId,
        selectedWarehouse,
        isLoading,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
};
