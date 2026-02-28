import React, { useState } from "react";
import {
  Warehouse,
  RefreshCw,
  Settings,
  Activity,
  Download,
} from "lucide-react";
import { SensorCard } from "../components/sensors/SensorCard";
import { useEnvironmentalData } from "../hooks/useEnvironmentalData";
import { useAuthContext } from "../context/AuthContext";
import { useWarehouse } from "../context/WarehouseContext";
import ThresholdConfigModal from "../components/sensors/ThresholdConfigModal";
import HistoricalChartsSection from "../components/sensors/HistoricalChartsSection";

const ZONES = ["Grain Storage", "Cold Storage", "Dry Storage", "Fresh Produce"];

export const SensorMonitoring: React.FC = () => {
  const { user } = useAuthContext();
  const {
    warehouses,
    selectedWarehouseId,
    setSelectedWarehouseId,
    selectedWarehouse,
    isLoading: warehousesLoading,
  } = useWarehouse();

  // Get available zones based on selected warehouse's zone count
  const availableZones = selectedWarehouse?.zones
    ? ZONES.slice(0, selectedWarehouse.zones)
    : ZONES;

  const [selectedZone, setSelectedZone] = useState<string>(availableZones[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  // Reset selected zone if it's no longer available
  React.useEffect(() => {
    if (selectedZone && !availableZones.includes(selectedZone)) {
      setSelectedZone(availableZones[0]);
    }
  }, [availableZones, selectedZone]);

  // Use selected warehouse ID from context
  const warehouseId = selectedWarehouseId || null;

  // Fetch sensor data with 10-second polling
  const {
    readings,
    thresholds,
    alerts,
    isLoading,
    error,
    refetch,
    updateThreshold,
    simulateData,
  } = useEnvironmentalData(warehouseId, undefined, 10000);

  // Filter readings for selected zone
  const zoneReading = readings.find((r) => r.zone === selectedZone);
  const zoneThreshold = thresholds.find((t) => t.zone === selectedZone);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Handle simulate button (for testing)
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await simulateData(0.15); // 15% chance of critical readings
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle CSV export of current zone readings
  const handleExportCSV = () => {
    if (!zoneReading) {
      alert("No sensor data available to export");
      return;
    }

    // Prepare CSV data
    const headers = [
      "Timestamp",
      "Zone",
      "Temperature (°C)",
      "Humidity (%)",
      "Ethylene (ppm)",
      "CO₂ (ppm)",
      "Ammonia (ppm)",
    ];

    const row = [
      new Date(zoneReading.reading_time).toLocaleString(),
      zoneReading.zone,
      zoneReading.temperature.toFixed(2),
      zoneReading.humidity.toFixed(2),
      zoneReading.ethylene.toFixed(2),
      zoneReading.co2.toFixed(2),
      zoneReading.ammonia.toFixed(2),
    ];

    // Create CSV content
    const csvContent = [headers.join(","), row.join(",")].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sensor-data-${selectedZone.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (warehousesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading warehouses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!warehouseId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {user?.role === "owner"
                ? "No Warehouses Available"
                : "No Warehouse Assigned"}
            </h2>
            <p className="text-gray-600">
              {user?.role === "owner"
                ? "Please add warehouses to view sensor data."
                : "Please contact your administrator to assign you to a warehouse."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && readings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sensor data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700 font-medium mb-2">
              Error loading sensor data
            </p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-godam-leaf/20 to-godam-forest/20 rounded-xl border border-godam-leaf/30">
                <Activity className="w-6 h-6 text-godam-forest" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Environmental Monitoring
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {selectedWarehouse
                    ? `${selectedWarehouse.name} - ${selectedWarehouse.location}`
                    : "Real-time sensor data across warehouse zones"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Warehouse selector for owners */}
              {user?.role === "owner" && warehouses.length > 0 && (
                <select
                  value={selectedWarehouseId ?? ""}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="px-4 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-godam-leaf bg-white font-medium shadow-sm hover:shadow transition-shadow"
                  style={
                    {
                      borderColor: "#E5E7EB",
                    } as React.CSSProperties
                  }
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Simulate button (for testing) */}
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Activity
                  className={`w-4 h-4 ${isSimulating ? "animate-pulse" : ""}`}
                />
                {isSimulating ? "Simulating..." : "Simulate Data"}
              </button>

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              {/* Export CSV button */}
              <button
                onClick={handleExportCSV}
                disabled={!zoneReading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>

              {/* Settings button */}
              <button
                onClick={() => setIsThresholdModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all hover:shadow-md shadow-sm"
                style={{ backgroundColor: "#48A111" }}
              >
                <Settings className="w-4 h-4" />
                Configure Thresholds
              </button>
            </div>
          </div>

          {/* Zone selector */}
          <div className="flex gap-2">
            {availableZones.map((zone) => {
              const hasAlert = alerts.some((a) => a.zone === zone);
              return (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all relative ${
                    selectedZone === zone
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {zone}
                  {hasAlert && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.filter((a) => a.zone === selectedZone).length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Active Alerts for {selectedZone}
                </h3>
                <div className="space-y-2">
                  {alerts
                    .filter((a) => a.zone === selectedZone)
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="bg-white rounded-lg p-3 border border-red-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-900">
                              {alert.message}
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              Triggered:{" "}
                              {new Date(alert.triggered_at).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === "critical"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sensor Cards Grid */}
        {zoneReading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SensorCard
                reading={zoneReading}
                threshold={zoneThreshold}
                sensorType="temperature"
              />
              <SensorCard
                reading={zoneReading}
                threshold={zoneThreshold}
                sensorType="humidity"
              />
              <SensorCard
                reading={zoneReading}
                threshold={zoneThreshold}
                sensorType="ethylene"
              />
              <SensorCard
                reading={zoneReading}
                threshold={zoneThreshold}
                sensorType="co2"
              />
              <SensorCard
                reading={zoneReading}
                threshold={zoneThreshold}
                sensorType="ammonia"
              />

              {/* Zone Info Card */}
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Warehouse className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Zone Info</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zone:</span>
                    <span className="font-medium text-gray-900">
                      {selectedZone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Alerts:</span>
                    <span
                      className={`font-medium ${alerts.filter((a) => a.zone === selectedZone).length > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {alerts.filter((a) => a.zone === selectedZone).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Update:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(zoneReading.reading_time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Auto-refreshing every 10 seconds
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Charts Section */}
            <HistoricalChartsSection
              warehouseId={warehouseId}
              selectedZone={selectedZone}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">
              No sensor data available for {selectedZone}
            </p>
            <button
              onClick={handleSimulate}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Test Data
            </button>
          </div>
        )}
      </div>

      {/* Threshold Configuration Modal */}
      <ThresholdConfigModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        zone={selectedZone}
        currentThreshold={zoneThreshold}
        onSave={updateThreshold}
      />
    </div>
  );
};
