import React from 'react';
// 1. Import useLocation
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './components/Landing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import Sim from './components/Sim';
import Premium from './components/Premium';

function App() {
  // 2. Get the current location object
  const location = useLocation();

  return (
    <div className="App">
        <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="dashboard/analysis" element={<Analysis />} />
        <Route path="dashboard/simulation" element={<Sim />} />
        <Route path="dashboard/premium" element={<Premium />} />
        {/* Add more routes here as needed */}
      </Routes>
      
      {/* 3. Conditionally render the Footer */}
      {location.pathname !== '/dashboard' && <Footer />}
    </div>
  );
}

export default App;