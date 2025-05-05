import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const RETRY_DELAY = 60 * 1000; // 1 minute

const useSearchCoins = (searchTerm) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef({ data: null, timestamp: 0 });

  useEffect(() => {
    const fetchCoins = async () => {
      if (!searchTerm) {
        setCoins([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let allSymbols;
        const now = Date.now();

        if (cacheRef.current.data && now - cacheRef.current.timestamp < CACHE_TIME) {
          allSymbols = cacheRef.current.data;
        } else {
          const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo', {
            timeout: 10000, // 10 seconds timeout
          });
          allSymbols = response.data.symbols
            .filter(symbol => symbol.quoteAsset === 'USDT')
            .map(symbol => ({
              symbol: symbol.baseAsset,
              pair: symbol.symbol
            }));
          cacheRef.current = { data: allSymbols, timestamp: now };
        }

        const filteredCoins = allSymbols.filter(coin =>
          coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);

        setCoins(filteredCoins);
      } catch (err) {
        if (err.response && err.response.status === 429) {
          setError(new Error('Rate limit exceeded. Please try again in a few minutes.'));
          setTimeout(() => fetchCoins(), RETRY_DELAY); // Retry after delay
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [searchTerm]);

  return { coins, loading, error };
};

export default useSearchCoins;