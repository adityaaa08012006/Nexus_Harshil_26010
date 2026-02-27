/**
 * Server-side Risk Calculation Engine
 * Mirrors the client-side formula so DB values are always consistent.
 * Weights: storage duration 40% | temperature 25% | humidity 15% | gas 20%
 */

const OPTIMAL_TEMP = 10; // °C
const OPTIMAL_HUMIDITY = 65; // %

const gasLevelScore = (value) => {
  if (!value) return 30;
  if (typeof value === "number") return Math.min(100, (value / 10) * 100);
  switch (String(value).toLowerCase()) {
    case "low":
      return 10;
    case "normal":
      return 40;
    case "high":
      return 85;
    default:
      return 30;
  }
};

/**
 * @param {Object} batch  - Row from the batches table
 * @returns {number}       Risk score 0-100
 */
export const calculateRiskScore = (batch) => {
  const now = new Date();
  const entry = new Date(batch.entry_date);
  const elapsed = Math.max(0, (now - entry) / 86_400_000); // days

  // 1. Storage duration vs shelf life (40%)
  const shelfPct = Math.min(100, (elapsed / batch.shelf_life) * 100);

  // 2. Temperature deviation (25%)
  const tempDev =
    batch.temperature != null ? Math.abs(batch.temperature - OPTIMAL_TEMP) : 5;
  const tempScore = Math.min(100, tempDev * 8);

  // 3. Humidity deviation (15%)
  const humDev =
    batch.humidity != null ? Math.abs(batch.humidity - OPTIMAL_HUMIDITY) : 10;
  const humScore = Math.min(100, humDev * 4);

  // 4. Gas levels (20%)
  const gasScore =
    (gasLevelScore(batch.ethylene) +
      gasLevelScore(batch.co2) +
      gasLevelScore(batch.ammonia)) /
    3;

  const overall =
    shelfPct * 0.4 + tempScore * 0.25 + humScore * 0.15 + gasScore * 0.2;

  return Math.round(Math.min(100, Math.max(0, overall)));
};

export const getRiskLevel = (score) => {
  if (score <= 30) return "fresh";
  if (score <= 70) return "moderate";
  return "high";
};
