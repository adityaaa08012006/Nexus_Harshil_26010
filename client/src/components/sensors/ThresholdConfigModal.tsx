import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SensorThreshold } from "../../hooks/useEnvironmentalData";

interface ThresholdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: string;
  currentThreshold?: SensorThreshold;
  onSave: (
    zone: string,
    thresholdData: Partial<SensorThreshold>,
  ) => Promise<void>;
}

const ThresholdConfigModal: React.FC<ThresholdConfigModalProps> = ({
  isOpen,
  onClose,
  zone,
  currentThreshold,
  onSave,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    temperature_min: 2,
    temperature_max: 25,
    humidity_min: 30,
    humidity_max: 70,
    ethylene_max: 100,
    co2_max: 5000,
    ammonia_max: 25,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current threshold values when modal opens or threshold changes
  useEffect(() => {
    if (currentThreshold) {
      setFormData({
        temperature_min: currentThreshold.temperature_min,
        temperature_max: currentThreshold.temperature_max,
        humidity_min: currentThreshold.humidity_min,
        humidity_max: currentThreshold.humidity_max,
        ethylene_max: currentThreshold.ethylene_max,
        co2_max: currentThreshold.co2_max,
        ammonia_max: currentThreshold.ammonia_max,
      });
    }
  }, [currentThreshold]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate min/max ranges
    if (formData.temperature_min >= formData.temperature_max) {
      setError("Temperature minimum must be less than maximum");
      return;
    }
    if (formData.humidity_min >= formData.humidity_max) {
      setError("Humidity minimum must be less than maximum");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(zone, formData);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save thresholds",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate pr-2">
            Configure Thresholds - {zone}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Temperature */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Temperature (°C)
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_min}
                  onChange={(e) =>
                    handleInputChange("temperature_min", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Maximum
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_max}
                  onChange={(e) =>
                    handleInputChange("temperature_max", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              Humidity (%)
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.humidity_min}
                  onChange={(e) =>
                    handleInputChange("humidity_min", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Maximum
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.humidity_max}
                  onChange={(e) =>
                    handleInputChange("humidity_max", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Gas Levels (Max Only) */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              Gas Levels (Maximum)
            </h3>

            {/* Ethylene */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Ethylene (ppm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.ethylene_max}
                onChange={(e) =>
                  handleInputChange("ethylene_max", e.target.value)
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* CO2 */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                CO₂ (ppm)
              </label>
              <input
                type="number"
                step="1"
                value={formData.co2_max}
                onChange={(e) => handleInputChange("co2_max", e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Ammonia */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Ammonia (ppm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.ammonia_max}
                onChange={(e) =>
                  handleInputChange("ammonia_max", e.target.value)
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Thresholds"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThresholdConfigModal;
