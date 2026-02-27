import { useState, useEffect } from 'react';

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  ethylene: number;
  co2: number;
  timestamp: string;
}

interface UseEnvironmentalDataReturn {
  data: EnvironmentalData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useEnvironmentalData = (
  warehouseId?: string,
  zone?: string
): UseEnvironmentalDataReturn => {
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API endpoint
      const endpoint = warehouseId && zone
        ? `/api/sensors?warehouseId=${warehouseId}&zone=${zone}`
        : '/api/sensors';

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch environmental data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Polling every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [warehouseId, zone]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
