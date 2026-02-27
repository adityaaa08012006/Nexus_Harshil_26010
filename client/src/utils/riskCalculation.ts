/**
 * Risk Calculation Engine – Phase II
 * Weights: storage duration 40% | temperature 25% | humidity 15% | gas 20%
 */

export type RiskLevel = "fresh" | "moderate" | "high";

export interface RiskColor {
  bg: string; // tailwind bg class
  text: string; // tailwind text class
  hex: string; // brand hex
  label: string;
}

/** Brand-aligned risk classification */
export const getRiskLevel = (score: number): RiskLevel => {
  if (score <= 30) return "fresh";
  if (score <= 70) return "moderate";
  return "high";
};

export const RISK_COLORS: Record<RiskLevel, RiskColor> = {
  fresh: {
    bg: "bg-[#48A111]",
    text: "text-[#48A111]",
    hex: "#48A111",
    label: "Fresh",
  },
  moderate: {
    bg: "bg-[#F2B50B]",
    text: "text-[#F2B50B]",
    hex: "#F2B50B",
    label: "Moderate",
  },
  high: {
    bg: "bg-[#DC2626]",
    text: "text-[#DC2626]",
    hex: "#DC2626",
    label: "High Risk",
  },
};

export interface BatchRiskInput {
  entryDate: string; // ISO date when batch entered storage
  shelfLife: number; // total shelf life in days
  temperature?: number | null; // current °C
  humidity?: number | null; // current %
  ethylene?: string | null; // 'low' | 'normal' | 'high' or numeric ppm
  co2?: string | null;
  ammonia?: string | null;
}

/** Optimal ranges per commodity type (defaults used if no sensor data) */
const OPTIMAL_TEMP = 10; // °C — conservative middle ground
const OPTIMAL_HUMIDITY = 65; // %

/**
 * Convert gas level string or numeric ppm to a 0-100 score.
 */
const gasLevelScore = (value?: string | number | null): number => {
  if (!value) return 30; // assume normal if no data
  if (typeof value === "number") {
    // ppm-based: normalise ethylene 0-5ppm, CO2 0-5000ppm, ammonia 0-50ppm
    return Math.min(100, (value / 10) * 100);
  }
  switch (value.toLowerCase()) {
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
 * Calculate risk score (0–100) for a batch.
 *
 * Weights (from plan):
 *   - Storage duration vs shelf life: 40%
 *   - Temperature deviation:          25%
 *   - Humidity deviation:             15%
 *   - Gas detection level:            20%
 */
export const calculateRiskScore = (input: BatchRiskInput): number => {
  const now = new Date();
  const entry = new Date(input.entryDate);
  const elapsedDays = Math.max(
    0,
    (now.getTime() - entry.getTime()) / 86_400_000,
  );

  // ── 1. Storage duration / shelf life (40%) ──────────────────────────────
  const shelfPct = Math.min(100, (elapsedDays / input.shelfLife) * 100);
  const durationScore = shelfPct; // 0-100 directly

  // ── 2. Temperature deviation (25%) ──────────────────────────────────────
  const tempDev =
    input.temperature != null ? Math.abs(input.temperature - OPTIMAL_TEMP) : 5; // default ~5° assumed if no sensor
  const tempScore = Math.min(100, tempDev * 8);

  // ── 3. Humidity deviation (15%) ──────────────────────────────────────────
  const humDev =
    input.humidity != null ? Math.abs(input.humidity - OPTIMAL_HUMIDITY) : 10; // default 10% deviation assumed
  const humScore = Math.min(100, humDev * 4);

  // ── 4. Gas levels (20%) ──────────────────────────────────────────────────
  const ethScore = gasLevelScore(input.ethylene);
  const co2Score = gasLevelScore(input.co2);
  const nh3Score = gasLevelScore(input.ammonia);
  const gasScore = (ethScore + co2Score + nh3Score) / 3;

  const overall =
    durationScore * 0.4 + tempScore * 0.25 + humScore * 0.15 + gasScore * 0.2;

  return Math.round(Math.min(100, Math.max(0, overall)));
};

/** Returns days until expiry (negative = already expired) */
export const getDaysRemaining = (
  entryDate: string,
  shelfLife: number,
): number => {
  const entry = new Date(entryDate);
  const expiry = new Date(entry.getTime() + shelfLife * 86_400_000);
  return Math.round((expiry.getTime() - Date.now()) / 86_400_000);
};

/**
 * Generate recommendation based on risk score
 */
export const generateRecommendation = (
  score: number,
  level: RiskLevel,
): string => {
  switch (level) {
    case "fresh":
      return "Batch is in optimal condition. Suitable for retail and quick commerce channels.";
    case "moderate":
      return "Monitor closely. Prioritize for hotels, restaurants, or processing units.";
    case "high":
      return "High priority for immediate dispatch. Route to processing units or consider price adjustment.";
    default:
      return "Unable to generate recommendation.";
  }
};

/**
 * Calculate remaining shelf life percentage
 */
export const calculateShelfLifePercentage = (
  totalShelfLife: number,
  daysStored: number,
): number => {
  const percentage = (daysStored / totalShelfLife) * 100;
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Determine if batch requires early intervention
 */
export const requiresEarlyIntervention = (score: number): boolean => {
  return score >= 70;
};

/**
 * Calculate temperature deviation from optimal
 */
export const calculateTemperatureDeviation = (
  current: number,
  optimal: number,
  threshold: number = 5,
): number => {
  const deviation = Math.abs(current - optimal);
  return Math.max(0, deviation - threshold);
};

/**
 * Calculate humidity deviation from optimal
 */
export const calculateHumidityDeviation = (
  current: number,
  optimal: number,
  threshold: number = 10,
): number => {
  const deviation = Math.abs(current - optimal);
  return Math.max(0, deviation - threshold);
};
