import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Batch } from "../lib/supabase";
import { RiskBadge } from "../components/common/RiskBadge";
import { RiskProgressBar } from "../components/common/RiskProgressBar";
import { getDaysRemaining, getRiskLevel } from "../utils/riskCalculation";
import { formatDate } from "../utils/formatters";

interface FarmerContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  growing_crop: string | null;
  crop_variety: string | null;
}

export const BatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [farmer, setFarmer] = useState<FarmerContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatch = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from("batches")
        .select("*")
        .eq("batch_id", id)
        .single();

      if (fetchErr) {
        setError(fetchErr.message);
      } else {
        setBatch(data);
        // Fetch linked farmer from contacts table
        if (data?.farmer_id) {
          const { data: farmerData } = await supabase
            .from("contacts")
            .select("id, name, phone, email, location, growing_crop, crop_variety")
            .eq("id", data.farmer_id)
            .single();
          setFarmer(farmerData ?? null);
        }
      }
      setIsLoading(false);
    };

    fetchBatch();
  }, [id]);

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

  if (error || !batch) {
    return (
      <div
        className="rounded-xl p-6 border text-sm"
        style={{
          backgroundColor: "#FEF2F2",
          borderColor: "#DC2626",
          color: "#DC2626",
        }}
      >
        <p className="font-semibold mb-1">Failed to load batch</p>
        <p>{error ?? "Batch not found"}</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm underline">
          Go back
        </button>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(batch.entry_date, batch.shelf_life);
  const riskLevel = getRiskLevel(batch.risk_score ?? 0);
  const isExpired = daysRemaining < 0;
  const isExpiringSoon = daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <div className="space-y-6">
      {/* ── Header + back button ── */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-medium mb-3 hover:underline"
          style={{ color: "#48A111" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to inventory
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#25671E" }}>
              Batch {batch.batch_id.slice(0, 12).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {batch.crop} {batch.variety ? `(${batch.variety})` : ""} · Zone{" "}
              {batch.zone}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {batch.status === "dispatched" && (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{ backgroundColor: "#48A11120", color: "#48A111" }}
              >
                Dispatched
              </span>
            )}
            {batch.status === "expired" && (
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{ backgroundColor: "#DC262620", color: "#DC2626" }}
              >
                Expired
              </span>
            )}
            <RiskBadge score={batch.risk_score ?? 0} showScore size="md" />
          </div>
        </div>
      </div>

      {/* ── Risk overview card ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "#25671E" }}>
          Risk Overview
        </h2>
        <div className="space-y-4">
          <RiskProgressBar score={batch.risk_score ?? 0} label />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Days Remaining
              </p>
              {isExpired ? (
                <p
                  className="text-xl font-bold mt-1"
                  style={{ color: "#DC2626" }}
                >
                  Expired
                </p>
              ) : (
                <p
                  className="text-xl font-bold mt-1"
                  style={{ color: isExpiringSoon ? "#F2B50B" : "#25671E" }}
                >
                  {daysRemaining}d
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Shelf Life</p>
              <p className="text-xl font-bold mt-1 text-gray-700">
                {batch.shelf_life}d
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Entry Date</p>
              <p className="text-sm font-semibold mt-1 text-gray-700">
                {formatDate(batch.entry_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Status</p>
              <p
                className="text-sm font-semibold mt-1 capitalize"
                style={{
                  color:
                    batch.status === "active"
                      ? "#48A111"
                      : batch.status === "dispatched"
                        ? "#3B82F6"
                        : "#DC2626",
                }}
              >
                {batch.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "#25671E" }}
          >
            Batch Information
          </h2>
          <dl className="space-y-3">
            <DetailRow
              label="Batch ID"
              value={batch.batch_id.toUpperCase()}
              mono
            />
            <DetailRow label="Crop" value={batch.crop} />
            {batch.variety && (
              <DetailRow label="Variety" value={batch.variety} />
            )}
            <DetailRow
              label="Quantity"
              value={`${batch.quantity.toLocaleString()} ${batch.unit}`}
            />
            <DetailRow label="Storage Zone" value={batch.zone} />
            <DetailRow
              label="Entry Date"
              value={formatDate(batch.entry_date)}
            />
            {batch.dispatch_date && (
              <DetailRow
                label="Dispatch Date"
                value={formatDate(batch.dispatch_date)}
              />
            )}
            {batch.destination && (
              <DetailRow label="Destination" value={batch.destination} />
            )}
          </dl>
        </div>

        {/* Farmer info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "#25671E" }}
          >
            Farmer Information
          </h2>
          {farmer ? (
            <dl className="space-y-3">
              <DetailRow label="Name" value={farmer.name} />
              {farmer.phone && (
                <DetailRow label="Phone" value={farmer.phone} />
              )}
              {farmer.email && (
                <DetailRow label="Email" value={farmer.email} />
              )}
              {farmer.location && (
                <DetailRow label="Location" value={farmer.location} />
              )}
              {farmer.growing_crop && (
                <DetailRow label="Crop" value={farmer.growing_crop} />
              )}
              {farmer.crop_variety && (
                <DetailRow label="Variety" value={farmer.crop_variety} />
              )}
            </dl>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {batch?.farmer_id
                ? "Loading farmer details..."
                : "No farmer linked to this batch"}
            </p>
          )}
        </div>

        {/* Environmental data */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "#25671E" }}
          >
            Environmental Sensors
          </h2>

          {batch.temperature !== null ||
          batch.humidity !== null ||
          batch.ethylene ||
          batch.co2 ||
          batch.ammonia ? (
            <dl className="space-y-3">
              {batch.temperature !== null && (
                <DetailRow
                  label="Temperature"
                  value={`${batch.temperature.toFixed(1)}°C`}
                  badge={
                    batch.temperature > 15
                      ? "High"
                      : batch.temperature < 5
                        ? "Low"
                        : "Normal"
                  }
                  badgeColor={
                    batch.temperature > 15
                      ? "#DC2626"
                      : batch.temperature < 5
                        ? "#3B82F6"
                        : "#48A111"
                  }
                />
              )}
              {batch.humidity !== null && (
                <DetailRow
                  label="Humidity"
                  value={`${batch.humidity.toFixed(1)}%`}
                  badge={
                    batch.humidity > 80
                      ? "High"
                      : batch.humidity < 50
                        ? "Low"
                        : "Normal"
                  }
                  badgeColor={
                    batch.humidity > 80
                      ? "#DC2626"
                      : batch.humidity < 50
                        ? "#F2B50B"
                        : "#48A111"
                  }
                />
              )}
              {batch.ethylene && (
                <DetailRow label="Ethylene" value={batch.ethylene} />
              )}
              {batch.co2 && <DetailRow label="CO₂" value={batch.co2} />}
              {batch.ammonia && (
                <DetailRow label="Ammonia" value={batch.ammonia} />
              )}
            </dl>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No sensor data available
            </p>
          )}
        </div>

        {/* Risk factors */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "#25671E" }}
          >
            Risk Factors
          </h2>
          <div className="space-y-3">
            <RiskFactorBar
              label="Storage Duration"
              value={
                ((batch.shelf_life - daysRemaining) / batch.shelf_life) * 100
              }
              color="#F2B50B"
            />
            {batch.temperature !== null && (
              <RiskFactorBar
                label="Temperature Deviation"
                value={Math.min(100, Math.abs(batch.temperature - 10) * 5)}
                color="#DC2626"
              />
            )}
            {batch.humidity !== null && (
              <RiskFactorBar
                label="Humidity Deviation"
                value={Math.min(100, Math.abs(batch.humidity - 65) * 2)}
                color="#3B82F6"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helper Components ──────────────────────────────────────────────────────────

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
  badge?: string;
  badgeColor?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  mono,
  badge,
  badgeColor,
}) => (
  <div className="flex justify-between items-start">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900 font-medium text-right flex items-center gap-2">
      <span className={mono ? "font-mono" : ""}>{value}</span>
      {badge && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: badgeColor + "20", color: badgeColor }}
        >
          {badge}
        </span>
      )}
    </dd>
  </div>
);

interface RiskFactorBarProps {
  label: string;
  value: number;
  color: string;
}

const RiskFactorBar: React.FC<RiskFactorBarProps> = ({
  label,
  value,
  color,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-gray-700">
          {clamped.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
