import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { SensorReading } from "../../hooks/useEnvironmentalData";

interface HistoricalChartsSectionProps {
  warehouseId: string;
  selectedZone: string;
}

type DateRange = "7d" | "30d" | "90d" | "custom";

interface SensorVisibility {
  temperature: boolean;
  humidity: boolean;
  ethylene: boolean;
  co2: boolean;
  ammonia: boolean;
}

const HistoricalChartsSection: React.FC<HistoricalChartsSectionProps> = ({
  warehouseId,
  selectedZone,
}) => {
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [historicalData, setHistoricalData] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which sensors are visible on the chart
  const [sensorVisibility, setSensorVisibility] = useState<SensorVisibility>({
    temperature: true,
    humidity: true,
    ethylene: true,
    co2: true,
    ammonia: true,
  });

  // Calculate start time based on selected date range
  const getStartTime = (): string => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        if (customStartDate) {
          startDate = new Date(customStartDate);
        } else {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        break;
    }

    return startDate.toISOString();
  };

  const getEndTime = (): string => {
    if (dateRange === "custom" && customEndDate) {
      return new Date(customEndDate).toISOString();
    }
    return new Date().toISOString();
  };

  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!warehouseId) return;

      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("No authentication token found");
        }

        const startTime = getStartTime();
        const endTime = getEndTime();

        const url = new URL(
          `http://localhost:5000/api/sensors/readings/${warehouseId}/history`,
        );
        url.searchParams.append("zone", selectedZone);
        url.searchParams.append("startTime", startTime);
        url.searchParams.append("endTime", endTime);
        url.searchParams.append("limit", "500");

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch historical data");
        }

        const data = await response.json();
        // Sort by reading_time ascending for proper chart display
        const sortedData = (data.readings || []).sort(
          (a: SensorReading, b: SensorReading) =>
            new Date(a.reading_time).getTime() -
            new Date(b.reading_time).getTime(),
        );
        setHistoricalData(sortedData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching historical data:", message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [warehouseId, selectedZone, dateRange, customStartDate, customEndDate]);

  // Toggle sensor visibility
  const toggleSensor = (sensor: keyof SensorVisibility) => {
    setSensorVisibility((prev) => ({
      ...prev,
      [sensor]: !prev[sensor],
    }));
  };

  // Format data for Recharts
  const chartData = historicalData.map((reading) => ({
    time: new Date(reading.reading_time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: reading.temperature,
    humidity: reading.humidity,
    ethylene: reading.ethylene,
    co2: reading.co2,
    ammonia: reading.ammonia,
  }));

  // Custom tooltip for better readability
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(2)}{" "}
              {entry.name === "Temperature"
                ? "°C"
                : entry.name === "Humidity"
                  ? "%"
                  : "ppm"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Historical Trends
            </h2>
            <p className="text-sm text-gray-600">
              {selectedZone} - Last{" "}
              {dateRange === "custom" ? "custom range" : dateRange}
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex gap-2">
            {(["7d", "30d", "90d", "custom"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range === "custom" ? "Custom" : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {dateRange === "custom" && (
        <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {/* Sensor Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700 mr-2">
          Show/Hide:
        </span>
        {Object.entries(sensorVisibility).map(([sensor, visible]) => {
          const colors = {
            temperature: "bg-blue-500",
            humidity: "bg-cyan-500",
            ethylene: "bg-orange-500",
            co2: "bg-purple-500",
            ammonia: "bg-red-500",
          };
          return (
            <button
              key={sensor}
              onClick={() => toggleSensor(sensor as keyof SensorVisibility)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                visible
                  ? `${colors[sensor as keyof typeof colors]} text-white`
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {sensor.charAt(0).toUpperCase() + sensor.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Chart */}
      {!isLoading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />

            {sensorVisibility.temperature && (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Temperature"
                dot={false}
              />
            )}
            {sensorVisibility.humidity && (
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#06b6d4"
                strokeWidth={2}
                name="Humidity"
                dot={false}
              />
            )}
            {sensorVisibility.ethylene && (
              <Line
                type="monotone"
                dataKey="ethylene"
                stroke="#f97316"
                strokeWidth={2}
                name="Ethylene"
                dot={false}
              />
            )}
            {sensorVisibility.co2 && (
              <Line
                type="monotone"
                dataKey="co2"
                stroke="#a855f7"
                strokeWidth={2}
                name="CO₂"
                dot={false}
              />
            )}
            {sensorVisibility.ammonia && (
              <Line
                type="monotone"
                dataKey="ammonia"
                stroke="#ef4444"
                strokeWidth={2}
                name="Ammonia"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* No Data State */}
      {!isLoading && !error && chartData.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            No historical data available for this time range.
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoricalChartsSection;
