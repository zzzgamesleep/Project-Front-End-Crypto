import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';

const useTop10CoinsByVolume = () => {
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopCoins = useCallback(
    debounce(async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/top-10-volume');

        console.log(response.data); // Log the entire response to inspect its structure

        // Ensure all numeric values are properly parsed
        const processedCoins = response.data.map(coin => ({
          ...coin,
          current_price: parseFloat(coin.current_price) || 0,
          high_24h: parseFloat(coin.high_24h) || 0,
          low_24h: parseFloat(coin.low_24h) || 0,
          total_volume: parseFloat(coin.total_volume) || 0
        }));

        setTopCoins(processedCoins);
        setError(null);
      } catch (err) {
        if (err.response && err.response.status === 429) {
          setError(new Error('Rate limit exceeded. Please try again in a few minutes.'));
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    setTopCoins([]);
    setLoading(true);
    setError(null);
    fetchTopCoins();
  }, [fetchTopCoins]);

  return { topCoins, loading, error };
};

export default useTop10CoinsByVolume;