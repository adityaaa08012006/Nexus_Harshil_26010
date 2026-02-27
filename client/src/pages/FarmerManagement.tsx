import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";
import {
  CROP_OPTIONS,
  UNIT_OPTIONS,
} from "../constants/cropOptions";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Farmer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  area_acres: number | null;
  growing_crop: string | null;
  crop_variety: string | null;
  expected_harvest_date: string | null;
  expected_quantity: number | null;
  quantity_unit: string | null;
  notes: string | null;
  warehouse_id: string | null;
  created_at: string;
  updated_at: string;
}

interface FarmerFormData {
  name: string;
  phone: string;
  email: string;
  location: string;
  area_acres: number | null;
  growing_crop: string;
  custom_crop: string;
  crop_variety: string;
  expected_harvest_date: string;
  expected_quantity: number | null;
  quantity_unit: string;
  notes: string;
}

const defaultForm: FarmerFormData = {
  name: "",
  phone: "",
  email: "",
  location: "",
  area_acres: null,
  growing_crop: "",
  custom_crop: "",
  crop_variety: "",
  expected_harvest_date: "",
  expected_quantity: null,
  quantity_unit: "kg",
  notes: "",
};

// ─── Farmer Form Modal ──────────────────────────────────────────────────────

interface FarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FarmerFormData) => Promise<void>;
  farmer?: Farmer | null;
}

const FarmerModal: React.FC<FarmerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  farmer,
}) => {
  const [formData, setFormData] = useState<FarmerFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomCrop, setUseCustomCrop] = useState(false);

  useEffect(() => {
    if (farmer) {
      const isCustom =
        farmer.growing_crop &&
        !CROP_OPTIONS.includes(farmer.growing_crop as any);
      setUseCustomCrop(!!isCustom);
      setFormData({
        name: farmer.name,
        phone: farmer.phone ?? "",
        email: farmer.email ?? "",
        location: farmer.location ?? "",
        area_acres: farmer.area_acres,
        growing_crop: isCustom ? "Other" : (farmer.growing_crop ?? ""),
        custom_crop: isCustom ? (farmer.growing_crop ?? "") : "",
        crop_variety: farmer.crop_variety ?? "",
        expected_harvest_date: farmer.expected_harvest_date ?? "",
        expected_quantity: farmer.expected_quantity,
        quantity_unit: farmer.quantity_unit ?? "kg",
        notes: farmer.notes ?? "",
      });
    } else {
      setFormData(defaultForm);
      setUseCustomCrop(false);
    }
  }, [farmer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        growing_crop:
          useCustomCrop || formData.growing_crop === "Other"
            ? formData.custom_crop
            : formData.growing_crop,
      };
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save farmer");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    borderColor: "#E5E7EB",
    "--tw-ring-color": "#48A111",
  } as React.CSSProperties;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold" style={{ color: "#25671E" }}>
            {farmer ? "Edit Farmer" : "Add New Farmer"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="rounded-lg p-3 text-sm border"
              style={{ backgroundColor: "#FEF2F2", borderColor: "#DC2626", color: "#DC2626" }}
            >
              {error}
            </div>
          )}

          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farmer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Enter farmer name"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                placeholder="farmer@email.com"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                placeholder="Village, District, State"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Area (acres)
            </label>
            <input
              type="number"
              value={formData.area_acres ?? ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  area_acres: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
              min="0"
              step="0.1"
              placeholder="e.g. 5.5"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>

          {/* Crop Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Growing Crop <span className="text-red-500">*</span>
              </label>
              {useCustomCrop ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.custom_crop}
                    onChange={(e) => setFormData((p) => ({ ...p, custom_crop: e.target.value }))}
                    placeholder="Enter crop name"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomCrop(false);
                      setFormData((p) => ({ ...p, growing_crop: "", custom_crop: "" }));
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
                    required
                    value={formData.growing_crop}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setUseCustomCrop(true);
                        setFormData((p) => ({ ...p, growing_crop: "Other" }));
                      } else {
                        setFormData((p) => ({ ...p, growing_crop: e.target.value }));
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={inputStyle}
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
                Crop Variety
              </label>
              <input
                type="text"
                value={formData.crop_variety}
                onChange={(e) => setFormData((p) => ({ ...p, crop_variety: e.target.value }))}
                placeholder="e.g. Basmati, Roma"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Harvest Date + Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Harvest Date
              </label>
              <input
                type="date"
                value={formData.expected_harvest_date}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, expected_harvest_date: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Quantity
              </label>
              <input
                type="number"
                value={formData.expected_quantity ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    expected_quantity: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                min="0"
                step="0.01"
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={formData.quantity_unit}
                onChange={(e) => setFormData((p) => ({ ...p, quantity_unit: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
              style={inputStyle}
            />
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
              {submitting ? "Saving..." : farmer ? "Update Farmer" : "Add Farmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Dialog ──────────────────────────────────────────────────

interface DeleteDialogProps {
  isOpen: boolean;
  farmerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  farmerName,
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
            <svg className="w-5 h-5" style={{ color: "#DC2626" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Farmer</h3>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to delete <span className="font-semibold">{farmerName}</span>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border" style={{ borderColor: "#E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#DC2626" }}>Delete</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main FarmerManagement Page ─────────────────────────────────────────────

export const FarmerManagement: React.FC = () => {
  const { user } = useAuthContext();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [farmerToDelete, setFarmerToDelete] = useState<Farmer | null>(null);

  // ── Fetch farmers ─────────────────────────────────────────────────────────
  const fetchFarmers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("contacts")
        .select("*")
        .eq("type", "farmer")
        .order("created_at", { ascending: false });

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw new Error(fetchErr.message);
      setFarmers(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load farmers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleAddFarmer = async (data: FarmerFormData) => {
    const { error: insertErr } = await supabase.from("contacts").insert({
      type: "farmer",
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      location: data.location || null,
      area_acres: data.area_acres,
      growing_crop: data.growing_crop || null,
      crop_variety: data.crop_variety || null,
      expected_harvest_date: data.expected_harvest_date || null,
      expected_quantity: data.expected_quantity,
      quantity_unit: data.quantity_unit || "kg",
      notes: data.notes || null,
      warehouse_id: user?.warehouse_id || null,
    });
    if (insertErr) throw new Error(insertErr.message);
    await fetchFarmers();
  };

  const handleEditFarmer = async (data: FarmerFormData) => {
    if (!editingFarmer) return;
    const { error: updateErr } = await supabase
      .from("contacts")
      .update({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        location: data.location || null,
        area_acres: data.area_acres,
        growing_crop: data.growing_crop || null,
        crop_variety: data.crop_variety || null,
        expected_harvest_date: data.expected_harvest_date || null,
        expected_quantity: data.expected_quantity,
        quantity_unit: data.quantity_unit || "kg",
        notes: data.notes || null,
      })
      .eq("id", editingFarmer.id);
    if (updateErr) throw new Error(updateErr.message);
    await fetchFarmers();
  };

  const handleDeleteConfirm = async () => {
    if (!farmerToDelete) return;
    const { error: delErr } = await supabase
      .from("contacts")
      .delete()
      .eq("id", farmerToDelete.id);
    if (delErr) alert(`Failed to delete: ${delErr.message}`);
    setDeleteDialogOpen(false);
    setFarmerToDelete(null);
    await fetchFarmers();
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (f.phone ?? "").includes(search);
    const matchesCrop =
      !cropFilter ||
      (f.growing_crop ?? "").toLowerCase() === cropFilter.toLowerCase();
    return matchesSearch && matchesCrop;
  });

  const uniqueCrops = Array.from(
    new Set(farmers.map((f) => f.growing_crop).filter(Boolean))
  ) as string[];

  // ── Render ────────────────────────────────────────────────────────────────

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#25671E" }}>
            Farmer Database
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {farmers.length} farmer{farmers.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={() => {
            setEditingFarmer(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#48A111" }}
        >
          + Add Farmer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, location, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
        />
        <select
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
        >
          <option value="">All Crops</option>
          {uniqueCrops.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl p-4 border text-sm"
          style={{ backgroundColor: "#FEF2F2", borderColor: "#DC2626", color: "#DC2626" }}
        >
          {error}
        </div>
      )}

      {/* Table / Cards */}
      {filteredFarmers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-3 block">🌾</span>
          <p className="text-gray-500 text-sm">
            {farmers.length === 0
              ? "No farmers registered yet. Add your first farmer to get started."
              : "No farmers match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: "#F9FAFB" }}>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Farmer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Area</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Growing</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Harvest Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Exp. Quantity</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((f) => (
                  <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{f.name}</div>
                      <div className="text-xs text-gray-400">
                        {f.phone && <span>{f.phone}</span>}
                        {f.phone && f.email && <span> · </span>}
                        {f.email && <span>{f.email}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{f.location ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {f.area_acres != null ? `${f.area_acres} acres` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{f.growing_crop ?? "—"}</span>
                      {f.crop_variety && (
                        <span className="text-gray-400 ml-1">({f.crop_variety})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {f.expected_harvest_date
                        ? new Date(f.expected_harvest_date).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {f.expected_quantity != null
                        ? `${f.expected_quantity} ${f.quantity_unit ?? "kg"}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingFarmer(f);
                            setModalOpen(true);
                          }}
                          className="px-2 py-1 text-xs font-medium rounded border transition-colors hover:bg-gray-50"
                          style={{ borderColor: "#E5E7EB", color: "#48A111" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setFarmerToDelete(f);
                            setDeleteDialogOpen(true);
                          }}
                          className="px-2 py-1 text-xs font-medium rounded border transition-colors hover:bg-red-50"
                          style={{ borderColor: "#E5E7EB", color: "#DC2626" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {farmers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Farmers</p>
            <p className="text-2xl font-bold" style={{ color: "#25671E" }}>{farmers.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Unique Crops</p>
            <p className="text-2xl font-bold" style={{ color: "#48A111" }}>{uniqueCrops.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Area</p>
            <p className="text-2xl font-bold" style={{ color: "#25671E" }}>
              {farmers.reduce((sum, f) => sum + (f.area_acres ?? 0), 0).toFixed(1)} ac
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Upcoming Harvests</p>
            <p className="text-2xl font-bold" style={{ color: "#48A111" }}>
              {farmers.filter((f) => {
                if (!f.expected_harvest_date) return false;
                const d = new Date(f.expected_harvest_date);
                const now = new Date();
                const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 30;
              }).length}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <FarmerModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingFarmer(null);
        }}
        onSubmit={editingFarmer ? handleEditFarmer : handleAddFarmer}
        farmer={editingFarmer}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        farmerName={farmerToDelete?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setFarmerToDelete(null);
        }}
      />
    </div>
  );
};
