import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Chart from './pages/Chart';
import Top10Volume from './pages/Top10Volume';
import News from './pages/News';
import LoginRegister from './pages/LoginRegister';

const Header = () => {
  return (
    <header className="bg-gray-100 text-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-serif tracking-wider">THE ART OF CRYPTO</h1>
          <nav>
            <ul className="flex space-x-6 text-sm uppercase tracking-wider">
              <li><Link to="/" className="hover:text-gray-600 transition-colors">Chart</Link></li>
              <li><Link to="/top-10-volume" className="hover:text-gray-600 transition-colors">Top 10 Volume</Link></li>
              <li><Link to="/favorite-coins" className="hover:text-gray-600 transition-colors">News</Link></li>
              <li><Link to="/login-register" className="hover:text-gray-600 transition-colors">Login</Link></li>
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
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Chart />} />
          <Route path="/top-10-volume" element={<Top10Volume />} />
          <Route path="/favorite-coins" element={<News />} />
          <Route path="/login-register" element={<LoginRegister />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;