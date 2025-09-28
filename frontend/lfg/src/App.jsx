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
import Chatbot from './components/Chatbot';
import KpDashboard from './components/Map';
import Learning from './components/Learning';
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
        <Route path="/dashboard/map" element={<KpDashboard />} />
        <Route path="/learn" element={<Learning />} />
        {/* REMOVED: The Route for the chatbot is no longer needed here */}
        {/* <Route path="/chat" element={<Chatbot />} /> */}
      </Routes>
      
      {/* Hide footer on all dashboard routes */}
      {!location.pathname.startsWith('/dashboard') && <Footer />}

      {/* ADDED: The Chatbot is now here, so it will always be rendered */}
      <Chatbot />
    </div>
  );
}

export default App;