export interface RiskScore {
  batchId: string;
  overallScore: number;
  factors: RiskFactors;
  classification: RiskClassification;
  recommendation: string;
  lastUpdated: string;
}

export interface RiskFactors {
  temperatureDeviation: number;
  humidityDeviation: number;
  shelfLifePercentage: number;
  gasLevels: {
    ethylene: 'low' | 'normal' | 'high';
    co2: 'low' | 'normal' | 'high';
    ammonia?: 'low' | 'normal' | 'high';
  };
  storageDuration: number;
  demandVelocity?: number;
}

export type RiskClassification = 'fresh' | 'moderate' | 'advanced';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskThresholds {
  temperature: {
    min: number;
    max: number;
    optimal: number;
  };
  humidity: {
    min: number;
    max: number;
    optimal: number;
  };
  shelfLifeWarning: number; // percentage
  shelfLifeCritical: number; // percentage
}

export interface RiskAlert {
  id: string;
  batchId: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  triggeredBy: keyof RiskFactors;
}
