import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext(null);

// API base URL (should ideally be in .env)
const API_URL = 'http://localhost:4000/api/auth';

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // Check initial auth status
  const [error, setError] = useState(null);

  // Function to set token and user in state and localStorage
  const setAuthData = useCallback((userData, authToken) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    setError(null); // Clear previous errors on successful auth
  }, []);

  // Function to clear token and user
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  }, []);

  // Check for existing token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      try {
        // Basic validation: Check if token looks like a JWT (optional)
        // More robust validation would involve checking token expiry or making a verify request
        if (storedToken.split('.').length === 3) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Invalid token format, clear storage
          clearAuthData();
        }
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        clearAuthData();
      }
    }
    setLoading(false); // Finished checking initial auth status
  }, [clearAuthData]);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (response.data && response.data.token && response.data.user) {
        setAuthData(response.data.user, response.data.token);
      } else {
        throw new Error('Login failed: Invalid response from server.');
      }
    } catch (err) {
      console.error("Login error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      clearAuthData(); // Ensure inconsistent state is cleared
      throw err; // Re-throw error for component handling
    } finally {
      setLoading(false);
    }
  }, [setAuthData, clearAuthData]);

  // Register function
  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, { username, email, password });
      // Optionally automatically log in after successful registration
      // Or just show a success message
      console.log("Registration successful:", response.data);
      // You might want to call login() here or redirect to login page
    } catch (err) {
      console.error("Registration error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err; // Re-throw error for component handling
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    // Optionally redirect to login page or home page
    // window.location.href = '/login-register'; // Simple redirect, better use react-router navigate
  }, [clearAuthData]);

  // Value provided by the context
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    logout,
    register,
    setError // Allow components to clear errors if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
