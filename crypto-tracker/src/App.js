import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Chart from './pages/Chart';
import Top10Volume from './pages/Top10Volume';
import News from './pages/News'; // Keep News page for now, or create FavoriteCoins page
import LoginRegister from './pages/LoginRegister';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';

// Placeholder for FavoriteCoins page - create this file later
const FavoriteCoins = () => {
  const { user } = useAuth();
  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">Favorite Coins for {user?.username}</h2>
      {/* Fetch and display favorite coins here */}
      <p className='content-center'>Feature coming soon! This page will display your saved favorite coins.</p>
    </div>
  );
};

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header className="bg-gray-100 text-gray-800 p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-serif tracking-wider hover:text-blue-600 transition-colors">THE ART OF CRYPTO</Link>
          <nav>
            <ul className="flex space-x-6 text-sm uppercase tracking-wider items-center">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Chart</Link></li>
              <li><Link to="/top-10-volume" className="hover:text-blue-600 transition-colors">Top 10 Volume</Link></li>
              {/* Link to News page - can be changed later if needed */}
              <li><Link to="/news" className="hover:text-blue-600 transition-colors">News</Link></li> 
              {isAuthenticated && (
                <li><Link to="/favorite-coins" className="hover:text-blue-600 transition-colors">Favorites</Link></li>
              )}
              {isAuthenticated ? (
                <>
                  <li className="text-gray-600">Hi, {user?.username || 'User'}!</li>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs uppercase transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li><Link to="/login-register" className="hover:text-blue-600 transition-colors">Login</Link></li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-4 pb-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Chart />} />
            <Route path="/top-10-volume" element={<Top10Volume />} />
            <Route path="/news" element={<News />} /> 
            <Route path="/login-register" element={<LoginRegister />} />

            {/* Protected Routes */}
            <Route 
              path="/favorite-coins" 
              element={
                <ProtectedRoute>
                  <FavoriteCoins />
                </ProtectedRoute>
              }
            />
            
            {/* Add other protected routes here */}

            {/* Fallback Route (Optional) */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </main>
        {/* Optional Footer */}
        {/* <footer className="bg-gray-200 text-center p-4 mt-auto">
          © 2025 Crypto Tracker
        </footer> */}
      </div>
    </Router>
  );
};

export default App;

