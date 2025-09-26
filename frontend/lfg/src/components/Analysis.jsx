import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import {
  Home,
  Map,
  Bell,
  Users,
  List,
  Type,
  HelpCircle,
  Zap,
  Inspect, // Icon for Analysis
  ChevronDown,
  ShieldCheck,
  Clock,
  DollarSign,
  SlidersHorizontal 
  // The unused 'Sigma' icon has been removed from this list
} from 'lucide-react';
import './Analysis.css';

// Mock data, to be replaced by backend API calls
const analysisData = {
  'SAT-A01': {
    riskLevel: 'Elevated',
    anomalyProbability: 72.5,
    expectedDowntime: '45 Minutes',
    suggestedPremium: 1250,
    lossDistribution: [
      { loss: '0', probability: 0.6 },
      { loss: '10k', probability: 0.25 },
      { loss: '50k', probability: 0.1 },
      { loss: '100k+', probability: 0.05 },
    ],
    liveInputs: {
      kpIndex: 5.6,
      solarWind: '620 km/s',
      protonFlux: 'High'
    }
  }
};

const Analysis = () => {
  const [selectedAsset] = useState('SAT-A01');
  const currentData = analysisData[selectedAsset];

  // State for "What-If" sliders
  const [shielding, setShielding] = useState(80);
  const [orbit, setOrbit] = useState(550);

  const sidebarItems = [
     { icon: Home, label: 'DASHBOARD', path: '/dashboard', active: true },
     { icon: Map, label: 'MAP', path: '/dashboard/map' },
     { icon: SlidersHorizontal , label: 'SIMULATION', path: '/dashboard/simulation' },
     { icon: Bell, label: 'NOTIFICATIONS', path: '/dashboard/notifications' },
     { icon: List, label: 'ANALYSIS', path: '/dashboard/analysis' },
     { icon: Type, label: 'TYPOGRAPHY', path: '/dashboard/typography' },
     { icon: HelpCircle, label: 'RTL SUPPORT', path: '/dashboard/rtl' },
     { icon: Zap, label: 'PREMIUM', path: '/dashboard/premium' }
   ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <motion.div 
        className="sidebar"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {sidebarItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.label}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <motion.div whileHover={{ x: 5 }}>
              <item.icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </motion.div>
          </NavLink>
        ))}
      </motion.div>

      {/* Main Analysis Content */}
      <div className="main-content">
        {/* Header */}
        <motion.div 
          className="header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="header-left">
            <h1>Risk Analysis</h1>
          </div>
          <div className="asset-selector">
            <span>Analyzing Asset:</span>
            <strong>{selectedAsset}</strong>
            <ChevronDown size={20} />
          </div>
        </motion.div>

        {/* Analysis Grid */}
        <motion.div 
          className="analysis-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Circular Graph */}
          <motion.div className="analysis-card radial-chart-card" variants={itemVariants}>
            <h3 className="card-title">Anomaly Probability</h3>
            <div className="radial-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="70%" 
                  outerRadius="85%" 
                  data={[{ value: currentData.anomalyProbability }]}
                  startAngle={90} 
                  endAngle={-270}
                >
                  <defs>
                    <linearGradient id="radialGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#602da3" />
                      <stop offset="100%" stopColor="#D73A7B" />
                    </linearGradient>
                  </defs>
                  <RadialBar
                    minAngle={15}
                    background={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    clockWise={true}
                    dataKey="value"
                    cornerRadius={10}
                    fill="url(#radialGradient)"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="radial-chart-label">
                <span className="radial-value">{currentData.anomalyProbability}%</span>
                <span className="radial-subtitle">High Confidence</span>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div className="analysis-card" variants={itemVariants}>
            <h3 className="card-title">Key Metrics</h3>
            <div className="metric-item">
              <ShieldCheck className="metric-icon" color="#D73A7B"/>
              <div>
                <span>Risk Level</span>
                <strong>{currentData.riskLevel}</strong>
              </div>
            </div>
            <div className="metric-item">
              <Clock className="metric-icon" color="#26D0CE"/>
              <div>
                <span>Expected Downtime</span>
                <strong>{currentData.expectedDowntime}</strong>
              </div>
            </div>
            <div className="metric-item">
              <DollarSign className="metric-icon" color="#602da3"/>
              <div>
                <span>Suggested Premium</span>
                <strong>${currentData.suggestedPremium.toLocaleString()}<small>/mo</small></strong>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="analysis-card" variants={itemVariants}>
            <h3 className="card-title">Live Data Inputs</h3>
            <div className="live-data-list">
              <p><strong>Kp Index:</strong> {currentData.liveInputs.kpIndex}</p>
              <p><strong>Solar Wind:</strong> {currentData.liveInputs.solarWind}</p>
              <p><strong>Proton Flux:</strong> {currentData.liveInputs.protonFlux}</p>
            </div>
          </motion.div>

          {/* Probabilistic Loss Distribution */}
          <motion.div className="analysis-card full-width" variants={itemVariants}>
            <h3 className="card-title">Probabilistic Loss Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentData.lossDistribution} margin={{top: 20}}>
                <XAxis dataKey="loss" tick={{ fill: '#8B949E' }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={(val) => `${val * 100}%`} tick={{ fill: '#8B949E' }} axisLine={false} tickLine={false}/>
                <Tooltip 
                  cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #602da3' }}
                />
                <Bar dataKey="probability" fill="#602da3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          
          {/* What-If Sliders */}
          <motion.div className="analysis-card full-width" variants={itemVariants}>
             <h3 className="card-title">"What-If" Simulation</h3>
             <div className="sliders-container">
                <div className="slider-group">
                    <label>Shielding Level: {shielding}%</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={shielding}
                        onChange={(e) => setShielding(e.target.value)}
                        className="what-if-slider"
                    />
                </div>
                <div className="slider-group">
                    <label>Orbit Altitude: {orbit}km</label>
                    <input 
                        type="range" 
                        min="300" 
                        max="800" 
                        value={orbit}
                        onChange={(e) => setOrbit(e.target.value)}
                        className="what-if-slider"
                    />
                </div>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Analysis;