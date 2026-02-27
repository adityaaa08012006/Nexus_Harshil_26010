import { RiskScore, RiskFactors, RiskClassification, RiskLevel } from '../types/Risk';

/**
 * Calculate the overall risk score for a batch based on environmental and temporal factors
 * @param factors - Environmental and storage factors
 * @returns Risk score between 0-100
 */
export const calculateRiskScore = (factors: RiskFactors): number => {
  const weights = {
    temperature: 0.25,
    humidity: 0.15,
    shelfLife: 0.35,
    gas: 0.15,
    duration: 0.10,
  };

  // Temperature deviation score (0-100)
  const tempScore = Math.min(100, factors.temperatureDeviation * 10);

  // Humidity deviation score (0-100)
  const humidityScore = Math.min(100, factors.humidityDeviation * 10);

  // Shelf life score (higher percentage consumed = higher risk)
  const shelfLifeScore = factors.shelfLifePercentage;

  // Gas levels score
  const gasScore = calculateGasScore(factors.gasLevels);

  // Storage duration score
  const durationScore = Math.min(100, factors.storageDuration * 2);

  // Weighted average
  const overallScore =
    tempScore * weights.temperature +
    humidityScore * weights.humidity +
    shelfLifeScore * weights.shelfLife +
    gasScore * weights.gas +
    durationScore * weights.duration;

  return Math.round(Math.min(100, Math.max(0, overallScore)));
};

/**
 * Calculate gas level contribution to risk score
 */
const calculateGasScore = (gasLevels: RiskFactors['gasLevels']): number => {
  const levelValues = {
    low: 20,
    normal: 50,
    high: 90,
  };

  const ethyleneScore = levelValues[gasLevels.ethylene];
  const co2Score = levelValues[gasLevels.co2];
  const ammoniaScore = gasLevels.ammonia ? levelValues[gasLevels.ammonia] : 50;

  return (ethyleneScore + co2Score + ammoniaScore) / 3;
};

/**
 * Get risk classification based on score
 */
export const getRiskClassification = (score: number): RiskClassification => {
  if (score < 40) return 'fresh';
  if (score < 70) return 'moderate';
  return 'advanced';
};

/**
 * Get risk level category
 */
export const getRiskLevel = (score: number): RiskLevel => {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
};

/**
 * Generate recommendation based on risk score and classification
 */
export const generateRecommendation = (
  score: number,
  classification: RiskClassification
): string => {
  switch (classification) {
    case 'fresh':
      return 'Batch is in optimal condition. Suitable for retail and quick commerce channels.';
    case 'moderate':
      return 'Monitor closely. Prioritize for hotels, restaurants, or processing units.';
    case 'advanced':
      return 'High priority for immediate dispatch. Route to processing units or consider price adjustment.';
    default:
      return 'Unable to generate recommendation.';
  }
};

/**
 * Calculate remaining shelf life percentage
 */
export const calculateShelfLifePercentage = (
  totalShelfLife: number,
  daysStored: number
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
  threshold: number = 5
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
  threshold: number = 10
): number => {
  const deviation = Math.abs(current - optimal);
  return Math.max(0, deviation - threshold);
};
