export interface Batch {
  batchId: string;
  farmerId: string;
  farmerName?: string;
  farmerContact?: string;
  crop: string;
  variety?: string;
  quantity: number;
  unit: string;
  entryDate: string;
  shelfLife: number;
  remainingShelfLife?: number;
  riskScore: number;
  zone: string;
  warehouseId?: string;
  status: 'active' | 'dispatched' | 'expired';
  temperature?: number;
  humidity?: number;
  ethylene?: string;
  co2?: string;
  destination?: string;
  dispatchDate?: string;
}

export interface BatchCreate {
  farmerId: string;
  crop: string;
  variety?: string;
  quantity: number;
  unit: string;
  shelfLife: number;
  zone: string;
  warehouseId: string;
}

export interface BatchUpdate {
  quantity?: number;
  zone?: string;
  status?: 'active' | 'dispatched' | 'expired';
  destination?: string;
  dispatchDate?: string;
}
