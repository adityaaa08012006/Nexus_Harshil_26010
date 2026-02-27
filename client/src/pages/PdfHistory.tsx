import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Eye,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Edit,
  RefreshCw,
  X,
} from "lucide-react";
import axios from "axios";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface ParsedItem {
  crop: string;
  variety?: string | null;
  quantity: number;
  unit: string;
  location: string;
  deadline?: string | null;
  grade?: string | null;
  notes?: string | null;
  confidence: number;
}

interface ParseHistory {
  id: string;
  filename: string;
  status: string;
  created_at: string;
  parsed_items: ParsedItem[];
  itemCount: number;
}

export const PdfHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ParseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ParseHistory | null>(
    null,
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reparsingId, setReparsingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await axios.get(`${API_URL}/api/pdf-parse/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setHistory(response.data.history || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      setError(err.response?.data?.error || "Failed to load upload history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      await axios.delete(`${API_URL}/api/pdf-parse/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh history list
      await fetchHistory();
    } catch (err: any) {
      console.error("Failed to delete record:", err);
      alert(err.response?.data?.error || "Failed to delete record");
    }
  };

  const handleViewDetails = (record: ParseHistory) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleEditAndResubmit = (record: ParseHistory) => {
    // Navigate to RequirementUpload with parsed data pre-loaded
    navigate("/qc/requirements", {
      state: {
        preloadedItems: record.parsed_items,
        filename: record.filename,
        mode: "edit",
      },
    });
  };

  const handleReparse = () => {
    // Navigate to upload page to upload a new file
    navigate("/qc/requirements");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { icon: React.ReactNode; bg: string; text: string; label: string }
    > = {
      draft: {
        icon: <Clock className="w-3 h-3" />,
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "Draft",
      },
      edited: {
        icon: <Edit className="w-3 h-3" />,
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Edited",
      },
      published: {
        icon: <CheckCircle className="w-3 h-3" />,
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Published",
      },
      archived: {
        icon: <AlertCircle className="w-3 h-3" />,
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Archived",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading upload history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                PDF Upload History
              </h1>
              <p className="text-gray-600 mt-2">
                View past uploads, re-parse files, or edit and resubmit
              </p>
            </div>
            <button
              onClick={() => navigate("/qc/requirements")}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: "#48A111" }}
            >
              <Upload className="w-4 h-4" />
              New Upload
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* History Table */}
        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Upload History
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't uploaded any PDF files yet. Start by uploading your
              first requirement document.
            </p>
            <button
              onClick={() => navigate("/qc/requirements")}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: "#48A111" }}
            >
              <Upload className="w-5 h-5" />
              Upload First PDF
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {record.filename}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {record.itemCount} items
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {new Date(record.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditAndResubmit(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit and Resubmit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setReparsingId(record.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Re-parse with new file"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedRecord.filename}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRecord.itemCount} items parsed •{" "}
                  {new Date(selectedRecord.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Status
                </h3>
                {getStatusBadge(selectedRecord.status)}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Parsed Items ({selectedRecord.itemCount})
                </h3>
                <div className="space-y-3">
                  {selectedRecord.parsed_items.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {item.crop}
                            {item.variety && (
                              <span className="text-gray-600 ml-2">
                                ({item.variety})
                              </span>
                            )}
                          </span>
                        </div>
                        {item.confidence !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.confidence >= 0.8
                                ? "bg-green-100 text-green-700"
                                : item.confidence >= 0.5
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {Math.round(item.confidence * 100)}% confident
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="ml-2 text-gray-900">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        {item.grade && (
                          <div>
                            <span className="text-gray-500">Grade:</span>
                            <span className="ml-2 text-gray-900">
                              {item.grade}
                            </span>
                          </div>
                        )}
                        {item.location && (
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-2 text-gray-900">
                              {item.location}
                            </span>
                          </div>
                        )}
                        {item.deadline && (
                          <div>
                            <span className="text-gray-500">Deadline:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(item.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      {item.notes && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Notes:</span>
                          <span className="ml-2 text-gray-700">
                            {item.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditAndResubmit(selectedRecord);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit and Resubmit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-parse Info Modal */}
      {reparsingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Re-parse Document
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              To re-parse this document with a new or better quality file,
              you'll need to upload the file again. The new parsed results will
              be available for review.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setReparsingId(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setReparsingId(null);
                  handleReparse();
                }}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: "#48A111" }}
              >
                Go to Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
