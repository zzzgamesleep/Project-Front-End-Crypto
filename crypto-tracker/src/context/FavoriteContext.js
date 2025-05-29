import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Need auth context for token

// Create the context
const FavoriteContext = createContext(null);

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
      // Use relative URL or configure baseURL globally if preferred
      baseURL: 'http://localhost:4000', 
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
    if (!axiosInstance) {
        setLoading(false);
        setError("Authentication token not available.");
        return;
    }

    try {
      console.log('Fetching favorites from /api/favorites');
      const response = await axiosInstance.get('/api/favorites'); // Call the real backend endpoint
      setFavoriteCoins(response.data.favorites || []); // Assuming the backend returns { favorites: [...] }
    } catch (err) {
      console.error("Error fetching favorites:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to fetch favorite coins.');
      setFavoriteCoins([]); // Clear favorites on error
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
     if (!axiosInstance) {
        setLoading(false);
        setError("Authentication token not available.");
        return;
    }

    const originalFavorites = [...favoriteCoins]; // Store original state for potential rollback
    setFavoriteCoins(prev => [...prev, symbol]); // Optimistic update

    try {
      console.log(`Adding favorite: POST /api/favorites with symbol: ${symbol}`);
      await axiosInstance.post('/api/favorites', { symbol }); // Call the real backend endpoint
      // No need to update state here if backend confirms, already optimistically updated
    } catch (err) {
      console.error("Error adding favorite:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to add favorite coin.');
      setFavoriteCoins(originalFavorites); // Rollback optimistic update on error
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
     if (!axiosInstance) {
        setLoading(false);
        setError("Authentication token not available.");
        return;
    }

    const originalFavorites = [...favoriteCoins]; // Store original state for potential rollback
    setFavoriteCoins(prev => prev.filter(fav => fav !== symbol)); // Optimistic update

    try {
      console.log(`Removing favorite: DELETE /api/favorites/${symbol}`);
      await axiosInstance.delete(`/api/favorites/${symbol}`); // Call the real backend endpoint
      // No need to update state here if backend confirms, already optimistically updated
    } catch (err) {
      console.error("Error removing favorite:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to remove favorite coin.');
      setFavoriteCoins(originalFavorites); // Rollback optimistic update on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, favoriteCoins, createAxiosInstance]);

  // Fetch favorites when authentication status changes (e.g., on login)
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavoriteCoins([]); // Clear favorites when logged out
    }
  }, [isAuthenticated, fetchFavorites]);

  // Value provided by the context
  const value = {
    favoriteCoins,
    loading,
    error,
    fetchFavorites, // Expose fetchFavorites if needed elsewhere
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
  // Updated check to handle null as well
  if (context === null || context === undefined) { 
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};

