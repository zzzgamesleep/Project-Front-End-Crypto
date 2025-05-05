import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';

const useRealtimeCoinPrice = (symbol = 'BTC', interval = 5000) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queueRef = useRef([]);
  const processingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return;

    processingRef.current = true;
    const task = queueRef.current.shift();

    try {
      const result = await task();
      setPriceData(result);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error(`Error fetching price for ${symbol}:`, err);
        if (err.response && err.response.status === 429) {
          setError(new Error('Rate limit exceeded. Please try again in a few minutes.'));
        } else {
          setError(err);
        }
      }
    } finally {
      setLoading(false);
      processingRef.current = false;
      timeoutRef.current = setTimeout(processQueue, 1000); // Wait 1 second before processing next task
    }
  }, [symbol]);

  const fetchPrice = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    try {
      const response = await axios.get(`http://localhost:4000/api/coins/prices?symbols=${symbol}`, {
        signal: abortControllerRef.current.signal
      });
      if (response.data && response.data.length > 0) {
        const coinData = response.data[0];
        return {
          price: coinData.price,
          percent_change_24h: coinData.percent_change_24h,
          last_updated: new Date(coinData.last_updated).toISOString()
        };
      } else {
        throw new Error(`No data found for ${symbol}`);
      }
    } catch (err) {
      if (err.response && err.response.status === 429) {
        // Rate limit exceeded, wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchPrice();
      } else {
        throw err;
      }
    }
  }, [symbol]);

  const debouncedFetchPrice = useCallback(
    debounce(() => {
      queueRef.current.push(fetchPrice);
      processQueue();
    }, 500),
    [fetchPrice, processQueue]
  );

  useEffect(() => {
    setPriceData(null);
    setLoading(true);
    setError(null);

    debouncedFetchPrice();

    const intervalId = setInterval(debouncedFetchPrice, interval);

    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      debouncedFetchPrice.cancel();
    };
  }, [debouncedFetchPrice, interval, symbol]);

  return { priceData, loading, error };
};

export default useRealtimeCoinPrice;
