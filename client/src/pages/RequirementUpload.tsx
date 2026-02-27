import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Upload,
  FileText,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
} from "lucide-react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import {
  CROP_OPTIONS,
  UNIT_OPTIONS,
  GRADE_OPTIONS,
} from "../constants/cropOptions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Confidence badge helper component
const ConfidenceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
  const percentage = Math.round(confidence * 100);

  let bgColor, textColor, label;
  if (percentage >= 80) {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
    label = "High";
  } else if (percentage >= 50) {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-700";
    label = "Medium";
  } else {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
    label = "Low";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}
      title={`Confidence: ${percentage}%`}
    >
      {label} ({percentage}%)
    </span>
  );
};

export const RequirementUpload: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"pdf" | "manual">("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedId, setParsedId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [rawResponse, setRawResponse] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Fetch warehouses on mount
  React.useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await axios.get(`${API_URL}/api/warehouses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.warehouses) {
          setWarehouses(response.data.warehouses);
        }
      } catch (err) {
        console.error("Failed to fetch warehouses:", err);
      }
    };

    fetchWarehouses();
  }, []);

  // Handle preloaded data from navigation (for edit/resubmit flow)
  React.useEffect(() => {
    const state = location.state as any;
    if (state?.preloadedItems && state?.mode === "edit") {
      console.log("[PRELOAD] Loading preloaded items:", state.preloadedItems);
      setItems(state.preloadedItems);
      setFilename(state.filename || "Edited Document");
      setMode("pdf"); // Set to pdf mode to show the items form
      // Clear the state to prevent re-loading on subsequent visits
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle reorder data from navigation (for reorder from history)
  React.useEffect(() => {
    const state = location.state as any;
    if (state?.reorderData && state?.mode === "manual") {
      console.log("[REORDER] Loading reorder data:", state.reorderData);
      const reorder = state.reorderData;
      // Pre-fill the first manual item with reorder data
      setItems([
        {
          crop: reorder.crop || "",
          variety: reorder.variety || "",
          quantity: reorder.quantity || 0,
          unit: reorder.unit || "kg",
          location: reorder.location || "",
          grade: "",
          deadline: "",
          notes: reorder.notes || "",
          confidence: 1.0, // Manual entry, always high confidence
        },
      ]);
      setMode("manual");
      // Clear the state to prevent re-loading on subsequent visits
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (selectedFile && validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid document file (PDF, JPG, PNG, or DOCX)");
      setFile(null);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (droppedFile && validTypes.includes(droppedFile.type)) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please drop a valid document file (PDF, JPG, PNG, or DOCX)");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Upload and parse PDF
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setParsing(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await axios.post(
        `${API_URL}/api/pdf-parse/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        // Store parsed data for review (not yet saved to database)
        setFilename(response.data.filename);
        setExtractedText(response.data.extractedText || "");
        setRawResponse(response.data.rawResponse || "");
        setItems(response.data.items || []);
        setSuccess(
          `Successfully parsed ${response.data.itemCount} items from PDF. Review and edit before saving.`,
        );
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || "Failed to upload and parse PDF");
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  // Update item in list
  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // Delete item from list
  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Add new empty item
  const addItem = () => {
    setItems([
      ...items,
      {
        crop: "",
        variety: "",
        quantity: 0,
        unit: "kg",
        location: "",
        warehouse_id: "",
        deadline: "",
        grade: "",
        notes: "",
        confidence: 1.0,
      },
    ]);
  };

  // Save edited items
  const handleSave = async () => {
    // Validate items before saving
    if (items.length === 0) {
      setError("Cannot save empty list");
      return;
    }

    const invalidItems = items.filter(
      (item) => !item.crop || !item.quantity || parseFloat(item.quantity) <= 0,
    );

    if (invalidItems.length > 0) {
      setError("Please ensure all items have valid crop and quantity");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!parsedId) {
        // First save - create new record
        console.log("[SAVE] Creating new record with data:", {
          filename,
          itemsCount: items.length,
          hasExtractedText: !!extractedText,
        });

        const response = await axios.post(
          `${API_URL}/api/pdf-parse/save`,
          {
            filename,
            extractedText,
            items,
            rawResponse,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          console.log("[SAVE] Successfully saved with ID:", response.data.id);
          setParsedId(response.data.id);
          setSuccess("Items saved successfully! You can now publish them.");
        }
      } else {
        // Update existing record
        console.log("[SAVE] Updating existing record:", parsedId);
        await axios.put(
          `${API_URL}/api/pdf-parse/update/${parsedId}`,
          { items },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSuccess("Items updated successfully!");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.error || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Publish as allocation requests
  const handlePublish = async () => {
    if (!parsedId) {
      setError("Please save your changes first before publishing");
      return;
    }

    if (items.length === 0) {
      setError("Cannot publish empty list");
      return;
    }

    // Validate all items
    const hasInvalidItems = items.some(
      (item) => !item.crop || !item.quantity || parseFloat(item.quantity) <= 0,
    );

    if (hasInvalidItems) {
      setError("Please ensure all items have valid crop and quantity");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      console.log(`[PUBLISH] Attempting to publish parsedId: ${parsedId}`);

      const response = await axios.post(
        `${API_URL}/api/pdf-parse/publish/${parsedId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setSuccess(
          `Successfully created ${response.data.count} allocation requests!`,
        );
        setTimeout(() => {
          navigate("/qc/orders");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Publish error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.error || "Failed to publish orders");
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/qc/dashboard")}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              Upload Requirements
            </h1>
          </div>
        </div>
        <p className="text-sm text-gray-600 ml-11">
          Upload a PDF or manually enter agricultural product requirements.
        </p>
      </div>

      {/* ── Mode Selector ── */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("pdf")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              mode === "pdf"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload Document
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              mode === "manual"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Plus className="w-5 h-5" />
            Manual Entry
          </button>
        </div>
      </div>

      {/* ── Error/Success Messages ── */}
      {error && (
        <div
          className="rounded-xl p-4 border-l-4 flex items-start gap-3"
          style={{
            backgroundColor: "#FEF2F2",
            borderColor: "#DC2626",
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div
          className="rounded-xl p-4 border-l-4 flex items-start gap-3"
          style={{
            backgroundColor: "#D1FAE5",
            borderColor: "#065F46",
          }}
        >
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 flex-1">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Upload Section (PDF Mode) ── */}
      {mode === "pdf" && items.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all cursor-pointer hover:border-green-500 hover:bg-green-50/50"
            style={{
              borderColor: file ? "#48A111" : "#D1D5DB",
              backgroundColor: file ? "#F0F9FF" : "#FAFAFA",
            }}
          >
            <input
              type="file"
              accept="application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />

            {!file ? (
              <div className="space-y-4">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#E8F5E9" }}
                >
                  <Upload className="w-8 h-8" style={{ color: "#48A111" }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Drop your document here
                  </h3>
                  <p className="text-sm text-gray-500">
                    PDF, JPG, PNG, or DOCX • Maximum 10MB
                  </p>
                </div>
                <label
                  htmlFor="pdf-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium cursor-pointer transition-all hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: "#48A111" }}
                >
                  <Upload className="w-5 h-5" />
                  Select File
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#DBEAFE" }}
                >
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate px-4">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    style={{ backgroundColor: "#48A111" }}
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        {parsing ? "Parsing with AI..." : "Uploading..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Parse with AI
                      </>
                    )}
                  </button>
                  <label
                    htmlFor="pdf-upload"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Change File
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Manual Entry Section ── */}
      {mode === "manual" && items.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="text-center space-y-4">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E8F5E9" }}
            >
              <Package className="w-8 h-8" style={{ color: "#48A111" }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Manually Add Requirements
              </h3>
              <p className="text-sm text-gray-500">
                Click the button below to start adding items to your list
              </p>
            </div>
            <button
              onClick={() => {
                setItems([
                  {
                    crop: "",
                    variety: "",
                    quantity: "",
                    unit: "kg",
                    location: "",
                    deadline: "",
                    grade: "No specification",
                    price: "",
                    notes: "",
                    confidence: 1.0,
                  },
                ]);
                setFilename("Manual Entry");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90 shadow-sm"
              style={{ backgroundColor: "#48A111" }}
            >
              <Plus className="w-5 h-5" />
              Start Adding Items
            </button>
          </div>
        </div>
      )}

      {/* ── Parsed Items ── */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  📋 Requirements List ({items.length})
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {!parsedId
                    ? "Review and edit the items below, then save before publishing"
                    : "Review and edit the items below before publishing"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: "#48A111", color: "#25671E" }}
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {parsedId ? "Update" : "Save Draft"}
                    </>
                  )}
                </button>
                <button
                  onClick={addItem}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!parsedId}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#48A111" }}
                  title={!parsedId ? "Please save your changes first" : ""}
                >
                  <CheckCircle className="w-5 h-5" />
                  Publish Orders
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop *
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variety
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity *
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {item._customCrop ? (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={item.crop || ""}
                              onChange={(e) =>
                                updateItem(index, "crop", e.target.value)
                              }
                              placeholder="Enter crop/fruit"
                              className="w-full min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateItem(index, "_customCrop", false);
                                updateItem(index, "crop", "");
                              }}
                              className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                              title="Switch to dropdown"
                            >
                              📋
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <select
                              value={item.crop || ""}
                              onChange={(e) => {
                                if (e.target.value === "Other") {
                                  updateItem(index, "_customCrop", true);
                                  updateItem(index, "crop", "");
                                } else {
                                  updateItem(index, "crop", e.target.value);
                                }
                              }}
                              className="w-full min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select crop</option>
                              {CROP_OPTIONS.map((crop) => (
                                <option key={crop} value={crop}>
                                  {crop}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() =>
                                updateItem(index, "_customCrop", true)
                              }
                              className="px-2 py-1 text-xs rounded text-white whitespace-nowrap"
                              style={{ backgroundColor: "#48A111" }}
                              title="Manually enter fruit/type"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                        {item.confidence !== undefined && mode === "pdf" && (
                          <ConfidenceBadge confidence={item.confidence} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={item.variety || ""}
                        onChange={(e) =>
                          updateItem(index, "variety", e.target.value)
                        }
                        placeholder="Optional"
                        className="w-full min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="w-full min-w-[100px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.unit || "kg"}
                        onChange={(e) =>
                          updateItem(index, "unit", e.target.value)
                        }
                        className="w-full min-w-[100px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {UNIT_OPTIONS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.grade || ""}
                        onChange={(e) =>
                          updateItem(index, "grade", e.target.value)
                        }
                        className="w-full min-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select grade</option>
                        {GRADE_OPTIONS.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.warehouse_id || ""}
                        onChange={(e) => {
                          const selectedWarehouse = warehouses.find(
                            (w) => w.id === e.target.value,
                          );
                          updateItem(index, "warehouse_id", e.target.value);
                          updateItem(
                            index,
                            "location",
                            selectedWarehouse?.name || "",
                          );
                        }}
                        className="w-full min-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select warehouse</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} - {warehouse.location}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="date"
                        value={item.deadline || ""}
                        onChange={(e) =>
                          updateItem(index, "deadline", e.target.value)
                        }
                        className="w-full min-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (shown on mobile, hidden on desktop) */}
          <div className="lg:hidden divide-y divide-gray-200">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-900">
                    Item #{index + 1}
                  </span>
                  <button
                    onClick={() => deleteItem(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  {/* Crop */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Crop *
                    </label>
                    {item._customCrop ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.crop || ""}
                          onChange={(e) =>
                            updateItem(index, "crop", e.target.value)
                          }
                          placeholder="Enter crop/fruit name"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateItem(index, "_customCrop", false);
                            updateItem(index, "crop", "");
                          }}
                          className="px-3 py-2 text-xs rounded border border-gray-300 hover:bg-gray-50"
                        >
                          Use List
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={item.crop || ""}
                          onChange={(e) => {
                            if (e.target.value === "Other") {
                              updateItem(index, "_customCrop", true);
                              updateItem(index, "crop", "");
                            } else {
                              updateItem(index, "crop", e.target.value);
                            }
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select crop</option>
                          {CROP_OPTIONS.map((crop) => (
                            <option key={crop} value={crop}>
                              {crop}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => updateItem(index, "_customCrop", true)}
                          className="px-3 py-2 text-xs rounded text-white"
                          style={{ backgroundColor: "#48A111" }}
                          title="Manually enter fruit/type"
                        >
                          ✏️ Custom
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Variety */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Variety
                    </label>
                    <input
                      type="text"
                      value={item.variety || ""}
                      onChange={(e) =>
                        updateItem(index, "variety", e.target.value)
                      }
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Quantity and Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        value={item.unit || "kg"}
                        onChange={(e) =>
                          updateItem(index, "unit", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {UNIT_OPTIONS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Grade
                    </label>
                    <select
                      value={item.grade || ""}
                      onChange={(e) =>
                        updateItem(index, "grade", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select grade</option>
                      {GRADE_OPTIONS.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Delivery Location
                    </label>
                    <select
                      value={item.warehouse_id || ""}
                      onChange={(e) => {
                        const selectedWarehouse = warehouses.find(
                          (w) => w.id === e.target.value,
                        );
                        updateItem(index, "warehouse_id", e.target.value);
                        updateItem(
                          index,
                          "location",
                          selectedWarehouse?.name || "",
                        );
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={item.deadline || ""}
                      onChange={(e) =>
                        updateItem(index, "deadline", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Price (Optional) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price per Unit (Optional)
                    </label>
                    <input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) =>
                        updateItem(index, "price", e.target.value)
                      }
                      placeholder="Optional"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={item.notes || ""}
                      onChange={(e) =>
                        updateItem(index, "notes", e.target.value)
                      }
                      placeholder="Additional notes (optional)"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Package className="w-3 h-3" />
              <span className="font-medium">* Required fields.</span> Review all
              information carefully before publishing orders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
