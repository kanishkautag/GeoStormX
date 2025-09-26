import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
          <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Add more routes here as needed */}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;