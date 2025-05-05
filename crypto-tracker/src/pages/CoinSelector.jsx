import React, { useState, useEffect } from 'react';
import useSearchCoins from '../hooks/useSearchCoins';

// Simple debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CoinSelector = ({ selectedCoin, onCoinChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { coins, loading, error } = useSearchCoins(debouncedSearchTerm);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectCoin = (coin) => {
    onCoinChange(coin.symbol);
    setSearchTerm('');
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search for a coin..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-2 p-2 border rounded"
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <div className="flex flex-wrap gap-2">
        {coins.map((coin) => (
          <button
            key={coin.symbol}
            onClick={() => handleSelectCoin(coin)}
            className={`px-3 py-1 rounded ${selectedCoin === coin.symbol ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {coin.symbol}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CoinSelector;