import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useRealtimeCandlestick = (symbol, interval = '5m') => {
  const [candlestickData, setCandlestickData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandlestickData = useCallback(async () => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      
      const response = await axios.get(`http://localhost:4000/api/coin/candlestick`, {
        params: {
          symbol,
          start: start.toISOString(),
          end: new Date().toISOString(),
          interval,
        }
      });
      
      setCandlestickData(response.data.candlestick);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    fetchCandlestickData();
    
    const intervalId = setInterval(fetchCandlestickData, 5000);
    
    return () => clearInterval(intervalId);
  }, [fetchCandlestickData]);

  return { candlestickData, loading, error };
};

export default useRealtimeCandlestick;