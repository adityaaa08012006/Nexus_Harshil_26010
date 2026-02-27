import { useState, useEffect } from 'react';

interface Batch {
  batchId: string;
  farmerId: string;
  crop: string;
  quantity: number;
  shelfLife: number;
  riskScore: number;
  zone: string;
}

interface UseInventoryReturn {
  inventory: Batch[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useInventory = (warehouseId?: string): UseInventoryReturn => {
  const [inventory, setInventory] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API endpoint
      const endpoint = warehouseId
        ? `/api/inventory?warehouseId=${warehouseId}`
        : '/api/inventory';

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const result = await response.json();
      setInventory(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [warehouseId]);

  return {
    inventory,
    isLoading,
    error,
    refetch: fetchInventory,
  };
};
