import React, { useState } from 'react';
import Satellite from './Satellite';
import PowerGrids from './PowerGrids';
import Aviation from './Aviation';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Satellite');

  const renderTab = () => {
    switch (activeTab) {
      case 'Satellite':
        return <Satellite />;
      case 'Power Grids':
        return <PowerGrids />;
      case 'Aviation':
        return <Aviation />;
      default:
        return <Satellite />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Insurance Premium Calculator</h1>
      </header>
      <div className="tab-nav">
        <button onClick={() => setActiveTab('Satellite')} className={activeTab === 'Satellite' ? 'active' : ''}>Satellite</button>
        <button onClick={() => setActiveTab('Power Grids')} className={activeTab === 'Power Grids' ? 'active' : ''}>Power Grids</button>
        <button onClick={() => setActiveTab('Aviation')} className={activeTab === 'Aviation' ? 'active' : ''}>Aviation</button>
      </div>
      <div className="tab-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default App;