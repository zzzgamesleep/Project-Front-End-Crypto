import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Need auth context for token

// Create the context
const FavoriteContext = createContext(null);

// API base URL (should ideally be in .env)
// Assuming these endpoints exist and require authentication
const API_URL = 'http://localhost:4000/api/favorites';

// Create the provider component
export const FavoriteProvider = ({ children }) => {
  const [favoriteCoins, setFavoriteCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth(); // Get token and auth status

  // Function to create authenticated axios instance
  const createAxiosInstance = useCallback(() => {
    if (!token) return null;
    return axios.create({
      baseURL: 'http://localhost:4000', // Base URL for API calls
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }, [token]);

  // Fetch favorite coins for the logged-in user
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setFavoriteCoins([]); // Clear favorites if not authenticated
      return;
    }
    setLoading(true);
    setError(null);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return; // Should not happen if authenticated

    try {
      // Simulate GET /api/favorites
      console.log('Simulating GET /api/favorites');
      // In a real app, replace this with:
      // const response = await axiosInstance.get('/api/favorites');
      // setFavoriteCoins(response.data.favorites || []);

      // --- Simulation Start ---
      // Retrieve from localStorage for simulation purposes
      const storedFavorites = localStorage.getItem('simulatedFavorites');
      setFavoriteCoins(storedFavorites ? JSON.parse(storedFavorites) : []);
      // --- Simulation End ---

    } catch (err) {
      console.error("Error fetching favorites:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to fetch favorite coins.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, createAxiosInstance]);

  // Add a coin to favorites
  const addFavorite = useCallback(async (symbol) => {
    if (!isAuthenticated || !token) return;
    if (favoriteCoins.includes(symbol)) return; // Already favorited

    setLoading(true);
    setError(null);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      // Simulate POST /api/favorites { symbol }
      console.log(`Simulating POST /api/favorites with symbol: ${symbol}`);
      // In a real app, replace this with:
      // await axiosInstance.post('/api/favorites', { symbol });

      // --- Simulation Start ---
      const updatedFavorites = [...favoriteCoins, symbol];
      localStorage.setItem('simulatedFavorites', JSON.stringify(updatedFavorites));
      setFavoriteCoins(updatedFavorites);
      // --- Simulation End ---

    } catch (err) {
      console.error("Error adding favorite:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to add favorite coin.');
      // Optionally revert state change on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, favoriteCoins, createAxiosInstance]);

  // Remove a coin from favorites
  const removeFavorite = useCallback(async (symbol) => {
    if (!isAuthenticated || !token) return;
    if (!favoriteCoins.includes(symbol)) return; // Not in favorites

    setLoading(true);
    setError(null);
    const axiosInstance = createAxiosInstance();
    if (!axiosInstance) return;

    try {
      // Simulate DELETE /api/favorites/:symbol
      console.log(`Simulating DELETE /api/favorites/${symbol}`);
      // In a real app, replace this with:
      // await axiosInstance.delete(`/api/favorites/${symbol}`);

      // --- Simulation Start ---
      const updatedFavorites = favoriteCoins.filter(fav => fav !== symbol);
      localStorage.setItem('simulatedFavorites', JSON.stringify(updatedFavorites));
      setFavoriteCoins(updatedFavorites);
      // --- Simulation End ---

    } catch (err) {
      console.error("Error removing favorite:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to remove favorite coin.');
      // Optionally revert state change on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, favoriteCoins, createAxiosInstance]);

  // Fetch favorites when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavoriteCoins([]); // Clear favorites when logged out
      localStorage.removeItem('simulatedFavorites'); // Clear simulation storage on logout
    }
  }, [isAuthenticated, fetchFavorites]);

  // Value provided by the context
  const value = {
    favoriteCoins,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite: (symbol) => favoriteCoins.includes(symbol)
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};

// Custom hook to use the FavoriteContext
export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};

