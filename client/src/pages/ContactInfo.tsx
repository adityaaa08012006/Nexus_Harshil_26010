import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  MapPin,
  AlertCircle,
} from "lucide-react";

interface WarehouseManager {
  id: string;
  name: string;
  email: string;
  warehouse_id: string;
}

interface WarehouseInfo {
  id: string;
  name: string;
  location: string;
}

export const ContactInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [manager, setManager] = useState<WarehouseManager | null>(null);
  const [warehouse, setWarehouse] = useState<WarehouseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContactInfo();
  }, [user]);

  const fetchContactInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setError("User not authenticated");
        return;
      }

      // Get QC Rep's warehouse ID from their profile
      const { data: qcProfile, error: qcError } = await supabase
        .from("user_profiles")
        .select("warehouse_id")
        .eq("id", user.id)
        .single();

      if (qcError) throw qcError;

      if (!qcProfile?.warehouse_id) {
        setError("You are not assigned to a warehouse yet.");
        return;
      }

      // Fetch warehouse details
      const { data: warehouseData, error: warehouseError } = await supabase
        .from("warehouses")
        .select("id, name, location")
        .eq("id", qcProfile.warehouse_id)
        .single();

      if (warehouseError) throw warehouseError;
      setWarehouse(warehouseData);

      // Fetch manager details for this warehouse
      const { data: managerData, error: managerError } = await supabase
        .from("user_profiles")
        .select("id, name, email, warehouse_id")
        .eq("warehouse_id", qcProfile.warehouse_id)
        .eq("role", "manager")
        .single();

      if (managerError) {
        // If no manager found, it's not necessarily an error
        if (managerError.code === "PGRST116") {
          setError("No manager assigned to your warehouse yet.");
        } else {
          throw managerError;
        }
        return;
      }

      setManager(managerData);
    } catch (err: any) {
      console.error("Error fetching contact info:", err);
      setError(err.message || "Failed to load contact information");
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="space-y-6 pb-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/qc/dashboard")}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              Contact Information
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Warehouse manager contact details
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Unable to Load Contact Information
            </h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ── Warehouse Info ── */}
      {warehouse && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="px-5 py-4 border-b border-gray-200"
            style={{ backgroundColor: "#F7F0F0" }}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: "#25671E" }} />
              <h2 className="text-lg font-bold text-gray-900">
                Your Warehouse
              </h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Warehouse Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {warehouse.name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-sm text-gray-700">{warehouse.location}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manager Contact Card ── */}
      {manager && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="px-5 py-4 border-b border-gray-200"
            style={{ backgroundColor: "#F7F0F0" }}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: "#25671E" }} />
              <h2 className="text-lg font-bold text-gray-900">
                Warehouse Manager
              </h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {manager.name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <a
                  href={`mailto:${manager.email}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: "#48A111" }}
                >
                  {manager.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {!error && !manager && !isLoading && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-600 font-medium mb-2">
            No Manager Information Available
          </p>
          <p className="text-xs text-gray-500">
            Contact your warehouse owner for assistance.
          </p>
        </div>
      )}
    </div>
  );
};
