import React from 'react';
import useTop10CoinsByVolume from '../hooks/useTop10CoinsByVolume';

const Top10Volume = () => {
  const { topCoins, loading, error } = useTop10CoinsByVolume();

  // Loading and Error States
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) return <p className="text-center text-red-500">Error fetching data: {error.message}</p>;

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Top 10 Volume Meme Coins</h1>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-3 px-4 font-semibold text-sm text-gray-600">#</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Coin</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Pair</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Price</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-600">24h High</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-600">24h Low</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-600">Volume</th>
          </tr>
        </thead>
        <tbody>
          {topCoins.map((coin) => (
            <tr key={coin.symbol} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm">{coin.rank}</td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  {coin.image ? (
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-6 h-6 mr-2 rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/24';
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                  )}
                  <span className="font-medium">{coin.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-blue-600">{coin.symbol}/USDT</td>
              <td className="py-3 px-4 font-medium">${coin.current_price.toFixed(9)}</td>
              <td className="py-3 px-4">${coin.high_24h.toFixed(9)}</td>
              <td className="py-3 px-4">${coin.low_24h.toFixed(9)}</td>
              <td className="py-3 px-4">{coin.total_volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Top10Volume;