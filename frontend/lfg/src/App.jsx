import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
          <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Add more routes here as needed */}
      </Routes>
    </div>
  );
}

export default App;