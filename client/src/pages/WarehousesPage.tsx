import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Warehouse, StorageType } from "../lib/supabase";
import {
  MapPin,
  Plus,
  X,
  Users,
  UserPlus,
  UserMinus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Modal for creating new warehouse
const CreateWarehouseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    zones: "4",
    storage_type: "mixed" as StorageType,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(`${API_URL}/api/warehouses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity),
          zones: parseInt(formData.zones),
          storage_type: formData.storage_type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create warehouse");
      }

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        location: "",
        capacity: "",
        zones: "4",
        storage_type: "mixed",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create warehouse",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Add New Warehouse
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#48A111] focus:border-transparent"
                placeholder="e.g., Central Warehouse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#48A111] focus:border-transparent"
                placeholder="e.g., Mumbai, Maharashtra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (kg)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#48A111] focus:border-transparent"
                placeholder="e.g., 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Zones
              </label>
              <select
                value={formData.zones}
                onChange={(e) =>
                  setFormData({ ...formData, zones: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#48A111] focus:border-transparent"
              >
                <option value="1">1 Zone</option>
                <option value="2">2 Zones</option>
                <option value="3">3 Zones</option>
                <option value="4">4 Zones</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Type
              </label>
              <select
                value={formData.storage_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    storage_type: e.target.value as StorageType,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#48A111] focus:border-transparent"
              >
                <option value="ambient">Ambient</option>
                <option value="refrigerated">Refrigerated</option>
                <option value="controlled_atmosphere">
                  Controlled Atmosphere
                </option>
                <option value="dry">Dry Storage</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#48A111] text-white rounded-lg font-medium hover:bg-[#3a8a0d] transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Warehouse"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal for assigning managers
const AssignManagerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  warehouseId: string;
  warehouseName: string;
  onSuccess: () => void;
}> = ({ isOpen, onClose, warehouseId, warehouseName, onSuccess }) => {
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableManagers();
    }
  }, [isOpen]);

  const fetchAvailableManagers = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) return;

      const response = await fetch(`${API_URL}/api/warehouses/users/managers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setManagers(result.managers || []);
      }
    } catch (err) {
      console.error("Error fetching managers:", err);
    }
  };

  const handleAssign = async () => {
    if (!selectedManagerId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/warehouses/${warehouseId}/managers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            manager_id: selectedManagerId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign manager");
      }

      onSuccess();
      onClose();
      setSelectedManagerId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign manager");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Assign Manager</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Assign a manager to{" "}
              <span className="font-semibold">{warehouseName}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Manager
            </label>
            <select
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#48A111] focus:border-transparent"
            >
              <option value="">Choose a manager...</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name} ({manager.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={loading || !selectedManagerId}
              className="flex-1 px-4 py-2 bg-[#48A111] text-white rounded-lg font-medium hover:bg-[#3a8a0d] transition-colors disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal for delete confirmation
const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warehouseName: string;
  loading: boolean;
}> = ({ isOpen, onClose, onConfirm, warehouseName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Delete Warehouse
            </h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{warehouseName}"
              </span>
              ?
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 font-medium mb-2">
            This action cannot be undone. This will permanently delete:
          </p>
          <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
            <li>All batches in this warehouse</li>
            <li>All sensor readings and thresholds</li>
            <li>All manager assignments</li>
            <li>All related alerts and data</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Warehouse"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const WarehousesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<
    Record<string, { batches: number; highRisk: number }>
  >({});
  const [warehouseManagers, setWarehouseManagers] = useState<
    Record<string, any[]>
  >({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignModalState, setAssignModalState] = useState<{
    isOpen: boolean;
    warehouseId: string;
    warehouseName: string;
  }>({
    isOpen: false,
    warehouseId: "",
    warehouseName: "",
  });
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    warehouseId: string;
    warehouseName: string;
  }>({
    isOpen: false,
    warehouseId: "",
    warehouseName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      // Fetch warehouses
      const { data: warehouseData, error: warehouseError } = await supabase
        .from("warehouses")
        .select("*")
        .order("name", { ascending: true });

      if (warehouseError) {
        console.error("Error fetching warehouses:", warehouseError);
        return;
      }

      setWarehouses(warehouseData ?? []);

      // Fetch batch counts per warehouse
      const warehouseStats: Record<
        string,
        { batches: number; highRisk: number }
      > = {};

      for (const warehouse of warehouseData ?? []) {
        // Total batches
        const { count: batchCount } = await supabase
          .from("batches")
          .select("*", { count: "exact", head: true })
          .eq("warehouse_id", warehouse.id);

        // High risk batches (risk_score >= 70)
        const { count: highRiskCount } = await supabase
          .from("batches")
          .select("*", { count: "exact", head: true })
          .eq("warehouse_id", warehouse.id)
          .gte("risk_score", 70);

        warehouseStats[warehouse.id] = {
          batches: batchCount ?? 0,
          highRisk: highRiskCount ?? 0,
        };
      }

      setStats(warehouseStats);

      // Fetch assigned managers for each warehouse (if owner)
      if (user?.role === "owner") {
        await fetchAllWarehouseManagers(warehouseData ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWarehouseManagers = async (warehouses: Warehouse[]) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) return;

      const managersData: Record<string, any[]> = {};

      for (const warehouse of warehouses) {
        const response = await fetch(
          `${API_URL}/api/warehouses/${warehouse.id}/managers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const result = await response.json();
          managersData[warehouse.id] = result.managers || [];
        }
      }

      setWarehouseManagers(managersData);
    } catch (err) {
      console.error("Error fetching warehouse managers:", err);
    }
  };

  const handleUnassignManager = async (
    warehouseId: string,
    managerId: string,
  ) => {
    if (!confirm("Are you sure you want to unassign this manager?")) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        alert("Not authenticated");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/warehouses/${warehouseId}/managers/${managerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to unassign manager");
      }

      // Refresh managers for this warehouse
      await fetchAllWarehouseManagers(warehouses);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unassign manager");
    }
  };

  const handleDeleteWarehouse = async () => {
    setIsDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        alert("Not authenticated");
        setIsDeleting(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/warehouses/${deleteModalState.warehouseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setDeleteModalState({
          isOpen: false,
          warehouseId: "",
          warehouseName: "",
        });
        fetchWarehouses(); // Reload the list
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete warehouse");
      }
    } catch (err) {
      console.error("Error deleting warehouse:", err);
      alert(err instanceof Error ? err.message : "Failed to delete warehouse");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage and monitor all warehouse facilities
          </p>
        </div>

        {/* Add Warehouse Button (Owners Only) */}
        {user?.role === "owner" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#48A111] text-white rounded-lg font-medium hover:bg-[#3a8a0d] transition-colors"
          >
            <Plus size={20} />
            Add Warehouse
          </button>
        )}
      </div>

      {/* Warehouses Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          All Warehouses
        </h2>

        {warehouses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="p-4 rounded-full bg-gray-100">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No warehouses found
            </h3>
            <p className="text-sm text-gray-500">
              Add your first warehouse to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse) => {
              const warehouseStats = stats[warehouse.id] ?? {
                batches: 0,
                highRisk: 0,
              };
              const utilizationPercent = warehouse.capacity
                ? Math.round(
                    (warehouseStats.batches / warehouse.capacity) * 100,
                  )
                : 0;

              return (
                <div
                  key={warehouse.id}
                  className="border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderColor: "#E5E7EB" }}
                  onClick={() =>
                    navigate(`/owner/inventory?warehouse=${warehouse.id}`)
                  }
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-base mb-1"
                        style={{ color: "#1F2937" }}
                      >
                        {warehouse.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>{warehouse.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#48A11120" }}
                      >
                        <MapPin size={20} style={{ color: "#48A111" }} />
                      </div>
                      {user?.role === "owner" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModalState({
                              isOpen: true,
                              warehouseId: warehouse.id,
                              warehouseName: warehouse.name,
                            });
                          }}
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete warehouse"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-medium text-gray-900">
                        {(warehouse.capacity / 1000).toFixed(1)} tons
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Active Batches</span>
                      <span className="font-medium text-gray-900">
                        {warehouseStats.batches}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">High Risk</span>
                      <span
                        className="font-medium"
                        style={{
                          color:
                            warehouseStats.highRisk > 0 ? "#DC2626" : "#48A111",
                        }}
                      >
                        {warehouseStats.highRisk}
                      </span>
                    </div>

                    {/* Utilization Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Utilization</span>
                        <span className="font-medium">
                          {utilizationPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(utilizationPercent, 100)}%`,
                            backgroundColor:
                              utilizationPercent > 90
                                ? "#DC2626"
                                : utilizationPercent > 70
                                  ? "#F2B50B"
                                  : "#48A111",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assigned Managers (Owners Only) */}
                  {user?.role === "owner" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                          <Users size={14} />
                          <span>Assigned Managers</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignModalState({
                              isOpen: true,
                              warehouseId: warehouse.id,
                              warehouseName: warehouse.name,
                            });
                          }}
                          className="text-[#48A111] hover:text-[#3a8a0d] transition-colors"
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {warehouseManagers[warehouse.id]?.length > 0 ? (
                          warehouseManagers[warehouse.id].map(
                            (manager: any) => (
                              <div
                                key={manager.manager_id}
                                className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded text-xs"
                              >
                                <span className="text-gray-700">
                                  {manager.full_name}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnassignManager(
                                      warehouse.id,
                                      manager.manager_id,
                                    );
                                  }}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                  title="Unassign manager"
                                >
                                  <UserMinus size={14} />
                                </button>
                              </div>
                            ),
                          )
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            No managers assigned
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/owner/inventory?warehouse=${warehouse.id}`);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: "#48A111",
                        color: "white",
                      }}
                    >
                      View Inventory
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/owner/sensors?warehouse=${warehouse.id}`);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors hover:bg-gray-50"
                      style={{
                        borderColor: "#E5E7EB",
                        color: "#374151",
                      }}
                    >
                      Sensors
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateWarehouseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchWarehouses}
      />

      <AssignManagerModal
        isOpen={assignModalState.isOpen}
        onClose={() =>
          setAssignModalState({
            isOpen: false,
            warehouseId: "",
            warehouseName: "",
          })
        }
        warehouseId={assignModalState.warehouseId}
        warehouseName={assignModalState.warehouseName}
        onSuccess={fetchWarehouses}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({
            isOpen: false,
            warehouseId: "",
            warehouseName: "",
          })
        }
        onConfirm={handleDeleteWarehouse}
        warehouseName={deleteModalState.warehouseName}
        loading={isDeleting}
      />
    </div>
  );
};
