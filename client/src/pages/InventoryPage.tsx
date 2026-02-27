import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import { useAuthContext } from "../context/AuthContext";
import type { Batch, BatchInsert, BatchUpdate } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import { InventoryTable } from "../components/dashboard/InventoryTable";
import { CROP_OPTIONS, UNIT_OPTIONS, GRADE_OPTIONS } from "../constants/cropOptions";

interface FarmerContact {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  growing_crop: string | null;
  crop_variety: string | null;
}


// ─── BatchModal Component ──────────────────────────────────────────────────────

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BatchInsert | BatchUpdate) => Promise<void>;
  batch?: Batch | null;
  warehouseId: string;
}

const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  batch,
  warehouseId,
}) => {
  const [formData, setFormData] = useState({
    batch_id: batch?.batch_id ?? "",
    farmer_id: batch?.farmer_id ?? null as string | null,
    crop: batch?.crop ?? "",
    variety: batch?.variety ?? "",
    quantity: batch?.quantity ?? 0,
    unit: batch?.unit ?? "kg",
    shelf_life: batch?.shelf_life ?? 7,
    zone: batch?.zone ?? "",
    temperature: batch?.temperature ?? null,
    humidity: batch?.humidity ?? null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomCrop, setUseCustomCrop] = useState(false);
  const [customCrop, setCustomCrop] = useState("");
  const [farmers, setFarmers] = useState<FarmerContact[]>([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");

  // Fetch farmers from the database
  useEffect(() => {
    if (isOpen) {
      setLoadingFarmers(true);
      supabase
        .from("contacts")
        .select("id, name, phone, location, growing_crop, crop_variety")
        .eq("type", "farmer")
        .order("name")
        .then(({ data }) => {
          setFarmers(data ?? []);
          setLoadingFarmers(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (batch) {
      const isCustom = batch.crop && !CROP_OPTIONS.includes(batch.crop as any);
      setUseCustomCrop(!!isCustom);
      setCustomCrop(isCustom ? batch.crop : "");
      setFormData({
        batch_id: batch.batch_id,
        farmer_id: batch.farmer_id ?? null,
        crop: isCustom ? "Other" : batch.crop,
        variety: batch.variety ?? "",
        quantity: batch.quantity,
        unit: batch.unit,
        shelf_life: batch.shelf_life,
        zone: batch.zone,
        temperature: batch.temperature ?? null,
        humidity: batch.humidity ?? null,
      });
      // Pre-select the farmer in the dropdown when editing
      setSelectedFarmerId(batch.farmer_id ?? "");
    } else {
      // Generate batch ID for new batches
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 6);
      setFormData((prev) => ({
        ...prev,
        batch_id: `B-${timestamp}-${random}`.toUpperCase(),
        farmer_id: null,
      }));
      setUseCustomCrop(false);
      setCustomCrop("");
      setSelectedFarmerId("");
    }
  }, [batch]);

  // When a farmer is selected, store their UUID and auto-fill crop info
  const handleFarmerSelect = (farmerId: string) => {
    setSelectedFarmerId(farmerId);
    setFormData((prev) => ({ ...prev, farmer_id: farmerId || null }));
    if (!farmerId) return;
    const farmer = farmers.find((f) => f.id === farmerId);
    if (farmer) {
      const isCustom = farmer.growing_crop && !CROP_OPTIONS.includes(farmer.growing_crop as any);
      setFormData((prev) => ({
        ...prev,
        farmer_id: farmerId,
        crop: isCustom ? "Other" : (farmer.growing_crop ?? prev.crop),
        variety: farmer.crop_variety ?? prev.variety,
      }));
      if (isCustom) {
        setUseCustomCrop(true);
        setCustomCrop(farmer.growing_crop ?? "");
      } else if (farmer.growing_crop) {
        setUseCustomCrop(false);
        setCustomCrop("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const resolvedCrop =
      useCustomCrop || formData.crop === "Other" ? customCrop : formData.crop;

    try {
      if (batch) {
        // Update existing batch
        await onSubmit({
          farmer_id: formData.farmer_id ?? undefined,
          crop: resolvedCrop,
          variety: formData.variety || undefined,
          quantity: formData.quantity,
          unit: formData.unit,
          shelf_life: formData.shelf_life,
          zone: formData.zone,
          temperature: formData.temperature ?? undefined,
          humidity: formData.humidity ?? undefined,
        });
      } else {
        // Create new batch
        await onSubmit({
          batch_id: formData.batch_id,
          farmer_id: formData.farmer_id ?? undefined,
          crop: resolvedCrop,
          variety: formData.variety || undefined,
          quantity: formData.quantity,
          unit: formData.unit,
          shelf_life: formData.shelf_life,
          zone: formData.zone,
          warehouse_id: warehouseId,
          temperature: formData.temperature ?? undefined,
          humidity: formData.humidity ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save batch");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-bold" style={{ color: "#25671E" }}>
            {batch ? "Edit Batch" : "Add New Batch"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="rounded-lg p-3 text-sm border"
              style={{
                backgroundColor: "#FEF2F2",
                borderColor: "#DC2626",
                color: "#DC2626",
              }}
            >
              {error}
            </div>
          )}

          {/* Batch ID (read-only if editing) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch ID
            </label>
            <input
              type="text"
              value={formData.batch_id}
              disabled={!!batch}
              className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500"
              style={{ borderColor: "#E5E7EB" }}
            />
          </div>

          {/* Select from Farmer Database */}
          {!batch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select from Farmer Database
              </label>
              <select
                value={selectedFarmerId}
                onChange={(e) => handleFarmerSelect(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              >
                <option value="">
                  {loadingFarmers ? "Loading farmers..." : "-- Select a farmer (optional) --"}
                </option>
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.growing_crop ? `(${f.growing_crop})` : ""} {f.location ? `- ${f.location}` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Selecting a farmer auto-fills name, contact, and crop info
              </p>
            </div>
          )}

          {/* Selected farmer preview */}
          {selectedFarmerId && (() => {
            const f = farmers.find((fa) => fa.id === selectedFarmerId);
            return f ? (
              <div
                className="rounded-lg p-3 text-sm border flex items-center gap-3"
                style={{ backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#48A111" }}>
                  {f.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">
                    {[f.phone, f.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFarmerSelect("")}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            ) : null;
          })()}

          {/* Crop info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop <span className="text-red-500">*</span>
              </label>
              {useCustomCrop ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCrop}
                    onChange={(e) => setCustomCrop(e.target.value)}
                    required
                    placeholder="Enter crop name"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={
                      {
                        borderColor: "#E5E7EB",
                        "--tw-ring-color": "#48A111",
                      } as React.CSSProperties
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomCrop(false);
                      setCustomCrop("");
                      setFormData((prev) => ({ ...prev, crop: "" }));
                    }}
                    className="px-3 py-2 text-xs font-medium rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                  >
                    Use List
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={formData.crop}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setUseCustomCrop(true);
                        setFormData((prev) => ({ ...prev, crop: "Other" }));
                      } else {
                        setFormData((prev) => ({ ...prev, crop: e.target.value }));
                      }
                    }}
                    required
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={
                      {
                        borderColor: "#E5E7EB",
                        "--tw-ring-color": "#48A111",
                      } as React.CSSProperties
                    }
                  >
                    <option value="">Select crop</option>
                    {CROP_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUseCustomCrop(true)}
                    className="px-3 py-2 text-xs font-medium rounded-lg text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#48A111" }}
                    title="Manually enter crop name"
                  >
                    ✏️ Custom
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variety
              </label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, variety: e.target.value }))
                }
                placeholder="e.g., Russet, Roma"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              value={(formData as any).grade ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, grade: e.target.value } as any))
              }
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={
                {
                  borderColor: "#E5E7EB",
                  "--tw-ring-color": "#48A111",
                } as React.CSSProperties
              }
            >
              <option value="">Select grade (optional)</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Quantity + Unit + Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: parseFloat(e.target.value) || 0,
                  }))
                }
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zone: e.target.value }))
                }
                required
                placeholder="A1, B2, etc."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          {/* Shelf life */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shelf Life (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.shelf_life}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shelf_life: parseInt(e.target.value) || 0,
                }))
              }
              required
              min="1"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={
                {
                  borderColor: "#E5E7EB",
                  "--tw-ring-color": "#48A111",
                } as React.CSSProperties
              }
            />
          </div>

          {/* Environmental data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={formData.temperature ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    temperature: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  }))
                }
                step="0.1"
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Humidity (%)
              </label>
              <input
                type="number"
                value={formData.humidity ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    humidity: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  }))
                }
                min="0"
                max="100"
                step="0.1"
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
              style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "#48A111" }}
            >
              {submitting
                ? "Saving..."
                : batch
                  ? "Update Batch"
                  : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── DeleteConfirmDialog ───────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  batchId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  batchId,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#DC262620" }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "#DC2626" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Batch</h3>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to delete batch{" "}
              <span className="font-mono font-semibold">{batchId}</span>? This
              action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#DC2626" }}
          >
            Delete Batch
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── InventoryPage ─────────────────────────────────────────────────────────────

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const {
    batches,
    isLoading,
    error,
    refetch,
    createBatch,
    updateBatch,
    deleteBatch,
  } = useInventory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const isManager = user?.role === "manager";
  const isReadOnly = !isManager;

  // Handle URL params for opening modals from dashboard
  useEffect(() => {
    const action = searchParams.get("action");
    const editId = searchParams.get("edit");

    if (action === "add" && isManager) {
      setEditingBatch(null);
      setModalOpen(true);
    } else if (editId) {
      const batch = batches.find((b) => b.id === editId);
      if (batch) {
        setEditingBatch(batch);
        setModalOpen(true);
      }
    }
  }, [searchParams, batches, isManager]);

  const handleCreate = () => {
    setEditingBatch(null);
    setModalOpen(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setModalOpen(true);
  };

  const handleDeleteClick = (batch: Batch) => {
    setBatchToDelete(batch);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!batchToDelete) return;
    setActionInProgress(true);
    const { error: delErr } = await deleteBatch(batchToDelete.id);
    if (delErr) {
      alert(`Failed to delete: ${delErr}`);
    }
    setDeleteDialogOpen(false);
    setBatchToDelete(null);
    setActionInProgress(false);
  };

  const handleModalSubmit = async (data: BatchInsert | BatchUpdate) => {
    setActionInProgress(true);
    if (editingBatch) {
      const { error: updateErr } = await updateBatch(
        editingBatch.id,
        data as BatchUpdate,
      );
      if (updateErr) throw new Error(updateErr);
    } else {
      const { error: createErr } = await createBatch(data as BatchInsert);
      if (createErr) throw new Error(createErr);
    }
    await refetch();
    setActionInProgress(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-6 border text-sm"
        style={{
          backgroundColor: "#FEF2F2",
          borderColor: "#DC2626",
          color: "#DC2626",
        }}
      >
        Failed to load inventory: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#25671E" }}>
            {isReadOnly ? "View Inventory" : "Manage Inventory"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {batches.length} active batch{batches.length !== 1 ? "es" : ""} in
            storage
          </p>
        </div>
        {isManager && (
          <button
            onClick={handleCreate}
            disabled={actionInProgress}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#48A111" }}
          >
            + Add Batch
          </button>
        )}
      </div>

      {/* ── Inventory table ── */}
      <InventoryTable
        batches={batches}
        readOnly={isReadOnly}
        onView={(id) => navigate(`/${user?.role}/batch/${id}`)}
        onEdit={isManager ? handleEdit : undefined}
        onDelete={isManager ? handleDeleteClick : undefined}
      />

      {/* ── Modals ── */}
      {isManager && user?.warehouse_id && (
        <>
          <BatchModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditingBatch(null);
            }}
            onSubmit={handleModalSubmit}
            batch={editingBatch}
            warehouseId={user.warehouse_id}
          />

          <DeleteConfirmDialog
            isOpen={deleteDialogOpen}
            batchId={batchToDelete?.batch_id ?? ""}
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setDeleteDialogOpen(false);
              setBatchToDelete(null);
            }}
          />
        </>
      )}
    </div>
  );
};
