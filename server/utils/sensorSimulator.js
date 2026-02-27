/**
 * Sensor Data Simulator
 * Generates realistic sensor readings for warehouse environmental monitoring
 * Includes random fluctuations and occasional critical scenarios for testing alerts
 */

// Warehouse zones with their ideal environmental parameters
const ZONE_PARAMETERS = {
  "Grain Storage": {
    temp: { ideal: 20, variance: 3, min: 15, max: 25 },
    humidity: { ideal: 50, variance: 8, min: 40, max: 60 },
    ethylene: { ideal: 0.1, variance: 0.2, max: 1.0 },
    co2: { ideal: 400, variance: 100, max: 1000 },
    ammonia: { ideal: 0, variance: 3, max: 25 },
  },
  "Cold Storage": {
    temp: { ideal: 5, variance: 2, min: 2, max: 8 },
    humidity: { ideal: 85, variance: 5, min: 80, max: 90 },
    ethylene: { ideal: 0.05, variance: 0.1, max: 1.0 },
    co2: { ideal: 400, variance: 50, max: 1000 },
    ammonia: { ideal: 0, variance: 2, max: 25 },
  },
  "Dry Storage": {
    temp: { ideal: 22, variance: 3, min: 18, max: 25 },
    humidity: { ideal: 45, variance: 5, min: 40, max: 50 },
    ethylene: { ideal: 0.05, variance: 0.1, max: 1.0 },
    co2: { ideal: 400, variance: 80, max: 1000 },
    ammonia: { ideal: 0, variance: 2, max: 25 },
  },
  "Fresh Produce": {
    temp: { ideal: 12, variance: 2, min: 10, max: 15 },
    humidity: { ideal: 90, variance: 5, min: 85, max: 95 },
    ethylene: { ideal: 0.2, variance: 0.3, max: 1.0 },
    co2: { ideal: 500, variance: 150, max: 1000 },
    ammonia: { ideal: 0, variance: 1, max: 25 },
  },
};

/**
 * Generate random value with normal distribution
 * @param {number} mean - Center value
 * @param {number} stdDev - Standard deviation
 * @returns {number} Random value
 */
function randomNormal(mean, stdDev) {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate sensor reading for a specific parameter
 * @param {Object} params - Parameter configuration
 * @param {number} criticalChance - Probability of critical scenario (0-1)
 * @returns {number} Generated reading
 */
function generateReading(params, criticalChance = 0.05) {
  // Determine if this should be a critical scenario
  const isCritical = Math.random() < criticalChance;

  if (isCritical) {
    // Generate critical value (outside normal range)
    const exceedThreshold = Math.random() > 0.5;
    if (exceedThreshold) {
      // Exceed max threshold
      return (
        params.ideal + params.variance * 2 + Math.random() * params.variance
      );
    } else {
      // Drop below min (for temp/humidity)
      return (
        params.ideal - params.variance * 2 - Math.random() * params.variance
      );
    }
  }

  // Normal reading with small fluctuation
  const reading = randomNormal(params.ideal, params.variance / 2);

  // Clamp to realistic bounds
  if (params.min !== undefined && params.max !== undefined) {
    return clamp(reading, params.min * 0.8, params.max * 1.2);
  }

  return Math.max(0, reading); // Ensure non-negative
}

/**
 * Generate complete sensor reading for a zone
 * @param {string} zone - Zone name
 * @param {number} criticalChance - Probability of critical scenario
 * @returns {Object} Sensor readings
 */
function generateZoneReading(zone, criticalChance = 0.05) {
  const params = ZONE_PARAMETERS[zone];

  if (!params) {
    throw new Error(`Unknown zone: ${zone}`);
  }

  return {
    temperature: parseFloat(
      generateReading(params.temp, criticalChance).toFixed(2),
    ),
    humidity: parseFloat(
      generateReading(params.humidity, criticalChance).toFixed(2),
    ),
    ethylene: parseFloat(
      generateReading(params.ethylene, criticalChance).toFixed(3),
    ),
    co2: parseFloat(generateReading(params.co2, criticalChance).toFixed(0)),
    ammonia: parseFloat(
      generateReading(params.ammonia, criticalChance).toFixed(2),
    ),
  };
}

/**
 * Generate readings for all zones in a warehouse
 * @param {string} warehouseId - Warehouse UUID
 * @param {number} criticalChance - Probability of critical scenario
 * @returns {Array} Array of readings for all zones
 */
function generateWarehouseReadings(warehouseId, criticalChance = 0.05) {
  const zones = Object.keys(ZONE_PARAMETERS);
  const timestamp = new Date().toISOString();

  return zones.map((zone) => ({
    warehouse_id: warehouseId,
    zone,
    ...generateZoneReading(zone, criticalChance),
    reading_time: timestamp,
  }));
}

/**
 * Check if reading exceeds threshold
 * @param {number} value - Current reading
 * @param {number} min - Minimum threshold (optional)
 * @param {number} max - Maximum threshold
 * @returns {Object|null} Alert info if threshold exceeded, null otherwise
 */
function checkThreshold(value, min, max) {
  if (min !== undefined && value < min) {
    return {
      severity: value < min * 0.9 ? "critical" : "warning",
      exceeded: "min",
      difference: (min - value).toFixed(2),
    };
  }

  if (value > max) {
    return {
      severity: value > max * 1.1 ? "critical" : "warning",
      exceeded: "max",
      difference: (value - max).toFixed(2),
    };
  }

  return null;
}

/**
 * Detect threshold breaches and generate alerts
 * @param {Object} reading - Sensor reading
 * @param {Object} thresholds - Threshold configuration
 * @returns {Array} Array of alerts
 */
function detectAlerts(reading, thresholds) {
  const alerts = [];
  const timestamp = new Date().toISOString();

  // Check temperature
  const tempAlert = checkThreshold(
    reading.temperature,
    thresholds.temp_min,
    thresholds.temp_max,
  );
  if (tempAlert) {
    alerts.push({
      warehouse_id: reading.warehouse_id,
      zone: reading.zone,
      alert_type: "temperature",
      severity: tempAlert.severity,
      message: `Temperature ${tempAlert.exceeded === "max" ? "above" : "below"} threshold in ${reading.zone}: ${reading.temperature}°C (threshold: ${tempAlert.exceeded === "max" ? thresholds.temp_max : thresholds.temp_min}°C)`,
      current_value: reading.temperature,
      threshold_value:
        tempAlert.exceeded === "max"
          ? thresholds.temp_max
          : thresholds.temp_min,
      triggered_at: timestamp,
    });
  }

  // Check humidity
  const humidityAlert = checkThreshold(
    reading.humidity,
    thresholds.humidity_min,
    thresholds.humidity_max,
  );
  if (humidityAlert) {
    alerts.push({
      warehouse_id: reading.warehouse_id,
      zone: reading.zone,
      alert_type: "humidity",
      severity: humidityAlert.severity,
      message: `Humidity ${humidityAlert.exceeded === "max" ? "above" : "below"} threshold in ${reading.zone}: ${reading.humidity}% (threshold: ${humidityAlert.exceeded === "max" ? thresholds.humidity_max : thresholds.humidity_min}%)`,
      current_value: reading.humidity,
      threshold_value:
        humidityAlert.exceeded === "max"
          ? thresholds.humidity_max
          : thresholds.humidity_min,
      triggered_at: timestamp,
    });
  }

  // Check ethylene
  const ethyleneAlert = checkThreshold(
    reading.ethylene,
    undefined,
    thresholds.ethylene_max,
  );
  if (ethyleneAlert) {
    alerts.push({
      warehouse_id: reading.warehouse_id,
      zone: reading.zone,
      alert_type: "ethylene",
      severity: ethyleneAlert.severity,
      message: `Ethylene levels above threshold in ${reading.zone}: ${reading.ethylene} ppm (threshold: ${thresholds.ethylene_max} ppm)`,
      current_value: reading.ethylene,
      threshold_value: thresholds.ethylene_max,
      triggered_at: timestamp,
    });
  }

  // Check CO2
  const co2Alert = checkThreshold(reading.co2, undefined, thresholds.co2_max);
  if (co2Alert) {
    alerts.push({
      warehouse_id: reading.warehouse_id,
      zone: reading.zone,
      alert_type: "co2",
      severity: co2Alert.severity,
      message: `CO2 levels above threshold in ${reading.zone}: ${reading.co2} ppm (threshold: ${thresholds.co2_max} ppm)`,
      current_value: reading.co2,
      threshold_value: thresholds.co2_max,
      triggered_at: timestamp,
    });
  }

  // Check ammonia
  const ammoniaAlert = checkThreshold(
    reading.ammonia,
    undefined,
    thresholds.ammonia_max,
  );
  if (ammoniaAlert) {
    alerts.push({
      warehouse_id: reading.warehouse_id,
      zone: reading.zone,
      alert_type: "ammonia",
      severity: ammoniaAlert.severity,
      message: `Ammonia levels above threshold in ${reading.zone}: ${reading.ammonia} ppm (threshold: ${thresholds.ammonia_max} ppm)`,
      current_value: reading.ammonia,
      threshold_value: thresholds.ammonia_max,
      triggered_at: timestamp,
    });
  }

  return alerts;
}

/**
 * Get all available zones
 * @returns {Array<string>} Array of zone names
 */
function getAllZones() {
  return Object.keys(ZONE_PARAMETERS);
}

export {
  generateZoneReading,
  generateWarehouseReadings,
  detectAlerts,
  getAllZones,
  ZONE_PARAMETERS,
};
