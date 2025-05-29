import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FavoriteCoins = () => {
  const { favoriteCoins, loading: favoritesLoading, error: favoritesError, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const [coinsData, setCoinsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch detailed information for favorite coins
  useEffect(() => {
    const fetchCoinsData = async () => {
      if (!favoriteCoins.length) {
        setCoinsData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Join all symbols with comma for the API call
        const symbols = favoriteCoins.join(',');
        const response = await axios.get(`http://localhost:4000/api/coins/prices?symbols=${symbols}`);
        
        if (response.data && response.data.length > 0) {
          setCoinsData(response.data);
        } else {
          setCoinsData([]);
        }
      } catch (err) {
        console.error('Error fetching coin details:', err);
        setError(err.response?.data?.message || 'Failed to fetch coin details');
      } finally {
        setLoading(false);
      }
    };

    fetchCoinsData();
  }, [favoriteCoins]);

  // Handle removing a coin from favorites
  const handleRemoveFavorite = (symbol) => {
    removeFavorite(symbol);
  };

  // Loading states
  if (favoritesLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Your Favorite Coins</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error states
  if (favoritesError || error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Your Favorite Coins</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{favoritesError || error}</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!favoriteCoins.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Your Favorite Coins</h2>
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-xl text-gray-600 mb-4">You haven't added any favorite coins yet.</p>
          <p className="text-gray-500 mb-6">Visit the Chart page and click the star icon to add coins to your favorites.</p>
          <Link to="/" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Explore Coins
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Favorite Coins</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-700 mb-4">
          Welcome to your personalized collection of favorite cryptocurrencies, {user?.username}. This dashboard provides you with a quick overview of all the coins you've marked as favorites while exploring our platform. You can easily monitor their current prices, 24-hour changes, and other key metrics all in one place.
        </p>
        <p className="text-gray-700">
          To add more coins to this list, simply visit the Chart page and click the star icon next to any cryptocurrency you're interested in. You can also remove coins from your favorites by clicking the "Remove" button below.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-3 px-4 font-semibold text-sm text-gray-600">Coin</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600">Price</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600">24h Change</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600">Last Updated</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coinsData.map((coin) => (
                <tr key={coin.symbol} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="font-medium">{coin.symbol}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">${parseFloat(coin.price).toFixed(6)}</td>
                  <td className={`py-4 px-4 ${parseFloat(coin.percent_change_24h) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(coin.percent_change_24h) >= 0 ? '+' : ''}{parseFloat(coin.percent_change_24h).toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {new Date(coin.last_updated).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Link 
                        to="/" 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        state={{ selectedCoin: coin.symbol }}
                      >
                        View Chart
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(coin.symbol)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Pro Tips for Crypto Enthusiasts</h3>
        <p className="text-gray-700 mb-3">
          Keeping track of your favorite cryptocurrencies is an essential practice for any serious investor. By maintaining this personalized watchlist, you can quickly spot trends, identify opportunities, and make more informed decisions about your portfolio.
        </p>
        <p className="text-gray-700">
          Consider diversifying your favorites across different types of cryptocurrencies - from established coins like Bitcoin and Ethereum to emerging altcoins and tokens with unique use cases. This approach will give you a broader perspective on the market's overall health and direction.
        </p>
      </div>
    </div>
  );
};

export default FavoriteCoins;
