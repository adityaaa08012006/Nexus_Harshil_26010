import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, Warehouse } from "../lib/supabase";
import { useAuthContext } from "./AuthContext";

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
        let query = supabase.from("warehouses").select("*");

        // Role-based filtering
        if (user.role === "manager" || user.role === "qc_rep") {
          // Managers and QC only see their assigned warehouse
          if (user.warehouse_id) {
            query = query.eq("id", user.warehouse_id);
          }
        } else if (user.role === "owner") {
          // Owners see all their warehouses
          query = query.eq("owner_id", user.id);
        }

        const { data, error } = await query.order("name", { ascending: true });

        if (error) {
          console.error("Error fetching warehouses:", error);
          setWarehouses([]);
        } else {
          setWarehouses(data ?? []);

          // Auto-select warehouse based on role
          if (user.role === "manager" || user.role === "qc_rep") {
            // For managers/QC, always use their assigned warehouse
            setSelectedWarehouseId(user.warehouse_id ?? undefined);
          } else if (user.role === "owner") {
            // For owners, try to restore from localStorage or select first
            const storedId = localStorage.getItem("selectedWarehouseId");
            if (storedId && data?.some((w) => w.id === storedId)) {
              setSelectedWarehouseId(storedId);
            } else if (data && data.length > 0) {
              setSelectedWarehouseId(data[0].id);
            }
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

  // Persist owner's warehouse selection to localStorage
  useEffect(() => {
    if (user?.role === "owner" && selectedWarehouseId) {
      localStorage.setItem("selectedWarehouseId", selectedWarehouseId);
    }
  }, [selectedWarehouseId, user?.role]);

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
