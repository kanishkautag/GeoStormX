import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './components/Landing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import Sim from './components/Sim';
import Premium from './components/Premium';
import About from './components/About';
import Alerts from './components/Alerts';

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/analysis" element={<Analysis />} />
        <Route path="/dashboard/alerts" element={<Alerts />} />
        <Route path="/dashboard/simulation" element={<Sim />} />
        <Route path="/dashboard/premium" element={<Premium />} />
      </Routes>
      
      {/* Hide footer on all dashboard routes */}
      {!location.pathname.startsWith('/dashboard') && <Footer />}
    </div>
  );
}

export default App;