import React from "react";
import { Thermometer, Droplets, Wind, CloudOff } from "lucide-react";
import type {
  SensorReading,
  SensorThreshold,
} from "../../hooks/useEnvironmentalData";

interface SensorCardProps {
  reading: SensorReading;
  threshold: SensorThreshold | undefined;
  sensorType: "temperature" | "humidity" | "ethylene" | "co2" | "ammonia";
}

/**
 * Get sensor status based on reading and threshold
 */
function getSensorStatus(
  value: number,
  min: number | undefined,
  max: number,
): {
  status: "normal" | "warning" | "critical";
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  // Check if value is below minimum (if defined)
  if (min !== undefined && value < min) {
    if (value < min * 0.9) {
      return {
        status: "critical",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-300",
      };
    }
    return {
      status: "warning",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-300",
    };
  }

  // Check if value exceeds maximum
  if (value > max) {
    if (value > max * 1.1) {
      return {
        status: "critical",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-300",
      };
    }
    return {
      status: "warning",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-300",
    };
  }

  // Normal range
  return {
    status: "normal",
    bgColor: "bg-white",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  };
}

/**
 * Get icon and metadata for sensor type
 */
function getSensorMeta(sensorType: string) {
  switch (sensorType) {
    case "temperature":
      return {
        icon: Thermometer,
        label: "Temperature",
        unit: "°C",
        iconColor: "text-orange-500",
      };
    case "humidity":
      return {
        icon: Droplets,
        label: "Humidity",
        unit: "%",
        iconColor: "text-blue-500",
      };
    case "ethylene":
      return {
        icon: Wind,
        label: "Ethylene",
        unit: "ppm",
        iconColor: "text-purple-500",
      };
    case "co2":
      return {
        icon: CloudOff,
        label: "CO₂",
        unit: "ppm",
        iconColor: "text-gray-500",
      };
    case "ammonia":
      return {
        icon: Wind,
        label: "Ammonia",
        unit: "ppm",
        iconColor: "text-teal-500",
      };
    default:
      return {
        icon: Wind,
        label: "Unknown",
        unit: "",
        iconColor: "text-gray-500",
      };
  }
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  reading,
  threshold,
  sensorType,
}) => {
  const value = reading[sensorType];
  const meta = getSensorMeta(sensorType);
  const Icon = meta.icon;

  // Determine status based on threshold
  let statusInfo: {
    status: "normal" | "warning" | "critical";
    bgColor: string;
    textColor: string;
    borderColor: string;
  } = {
    status: "normal",
    bgColor: "bg-white",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  };

  let thresholdDisplay = null;

  if (threshold) {
    let min: number | undefined;
    let max: number;

    switch (sensorType) {
      case "temperature":
        min = threshold.temperature_min;
        max = threshold.temperature_max;
        break;
      case "humidity":
        min = threshold.humidity_min;
        max = threshold.humidity_max;
        break;
      case "ethylene":
        max = threshold.ethylene_max;
        break;
      case "co2":
        max = threshold.co2_max;
        break;
      case "ammonia":
        max = threshold.ammonia_max;
        break;
      default:
        max = 0;
    }

    statusInfo = getSensorStatus(value, min, max);

    // Build threshold display string
    if (min !== undefined) {
      thresholdDisplay = `${min} - ${max} ${meta.unit}`;
    } else {
      thresholdDisplay = `< ${max} ${meta.unit}`;
    }
  }

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all duration-200 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
    >
      {/* Header with icon and label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-gray-100 ${meta.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900">{meta.label}</h3>
        </div>

        {/* Status indicator */}
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusInfo.status === "critical"
              ? "bg-red-100 text-red-700"
              : statusInfo.status === "warning"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {statusInfo.status === "critical"
            ? "Critical"
            : statusInfo.status === "warning"
              ? "Warning"
              : "Normal"}
        </div>
      </div>

      {/* Current value */}
      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${statusInfo.textColor}`}>
            {value.toFixed(sensorType === "ethylene" ? 2 : 1)}
          </span>
          <span className="text-lg text-gray-500">{meta.unit}</span>
        </div>
      </div>

      {/* Threshold range */}
      {thresholdDisplay && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Range: </span>
          {thresholdDisplay}
        </div>
      )}

      {/* Last updated */}
      <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        {formatRelativeTime(reading.reading_time)}
      </div>
    </div>
  );
};
