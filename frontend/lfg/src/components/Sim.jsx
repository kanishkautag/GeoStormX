import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, ReferenceLine } from 'recharts';
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
  Inspect,
  SlidersHorizontal, // Icon for Simulation
  ChevronDown,
  ShieldCheck,
  Clock,
  DollarSign,
  Sigma,
  TrendingUp
} from 'lucide-react';
import './Sim.css';

// --- MOCK DATA & CALCULATION LOGIC (Replace with real-time backend calls) ---

// Initial data for the Portfolio Mitigation simulation
const initialPortfolio = [
    { id: 'SAT-A01', risk: 35, value: 50000000 },
    { id: 'SAT-B03', risk: 25, value: 75000000 },
    { id: 'GRID-US-E1', risk: 20, value: 250000000 },
    { id: 'SAT-C12', risk: 15, value: 30000000 },
    { id: 'OTHER', risk: 5, value: 10000000 },
];

const Sim = () => {
  const [activeSimTab, setActiveSimTab] = useState('Single Asset');

  // --- STATE FOR SIMULATION 1: SINGLE ASSET "WHAT-IF" ---
  const [shielding, setShielding] = useState(80);
  const [orbit, setOrbit] = useState(550);
  const [assetValue, setAssetValue] = useState(50); // in millions
  const [simulatedMetrics, setSimulatedMetrics] = useState({});

  // --- STATE FOR SIMULATION 2: STORM INTENSITY ---
  const [kpIndex, setKpIndex] = useState(5);
  const [duration, setDuration] = useState(12);
  const [stormForecastData, setStormForecastData] = useState([]);
  
  // --- STATE FOR SIMULATION 3: PORTFOLIO MITIGATION ---
  const [budget, setBudget] = useState(50000);
  const [mitigatedPortfolio, setMitigatedPortfolio] = useState(initialPortfolio);


  // --- REAL-TIME CALCULATION EFFECTS ---

  // Effect for Single Asset Simulation
  useEffect(() => {
    // Mock calculation: higher shielding & orbit = lower risk
    const baseProb = 80;
    const probability = Math.max(0, baseProb - (shielding * 0.5) - ((orbit - 300) / 10));
    const downtime = Math.round(probability * 0.8);
    const premium = 500 + Math.round(assetValue * 15 * (probability / 100));

    setSimulatedMetrics({
        anomalyProbability: parseFloat(probability.toFixed(1)),
        expectedDowntime: `${downtime} Minutes`,
        suggestedPremium: premium
    });
  }, [shielding, orbit, assetValue]);
  
  // Effect for Storm Intensity Simulation
  useEffect(() => {
    const generateStormData = () => {
        const data = [];
        const peakHour = duration / 2;
        const baseKp = 2;
        const spread = duration / 4;

        for (let hour = 0; hour <= duration; hour++) {
            const exponent = -Math.pow(hour - peakHour, 2) / (2 * Math.pow(spread, 2));
            const index = baseKp + (kpIndex - baseKp) * Math.exp(exponent);
            data.push({ hour: hour, kpIndex: index });
        }
        return data;
    };
    setStormForecastData(generateStormData());
  }, [kpIndex, duration]);

  // Effect for Portfolio Mitigation Simulation
  useEffect(() => {
      // Mock calculation: budget reduces risk proportionally
      const totalRisk = initialPortfolio.reduce((sum, asset) => sum + asset.risk, 0);
      const riskReductionFactor = (budget / 100000) * 0.5; // 50% risk reduction at max budget
      
      const newPortfolio = initialPortfolio.map(asset => ({
          ...asset,
          mitigatedRisk: Math.max(0, asset.risk - (asset.risk / totalRisk) * totalRisk * riskReductionFactor)
      }));
      setMitigatedPortfolio(newPortfolio);
  }, [budget]);

  const totalInitialRisk = useMemo(() => initialPortfolio.reduce((sum, p) => sum + p.risk, 0), []);
  const totalMitigatedRisk = useMemo(() => mitigatedPortfolio.reduce((sum, p) => sum + p.mitigatedRisk, 0), [mitigatedPortfolio]);


  const sidebarItems = [
    { icon: Home, label: 'DASHBOARD', path: '/dashboard', active: true },
    { icon: Map, label: 'MAP', path: '/dashboard/map' },
    { icon: HelpCircle, label: 'SIMULATION', path: '/dashboard/simulation' },
    { icon: List, label: 'ANALYSIS', path: '/dashboard/analysis' },
    { icon: Type, label: 'ALERTS', path: '/dashboard/alerts' },
    { icon: Zap, label: 'INSURANCE', path: '/dashboard/premium' }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <motion.div className="sidebar" initial={{ x: -250 }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        {sidebarItems.map((item) => (
          <NavLink to={item.path} key={item.label} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <motion.div whileHover={{ x: 5 }}>
              <item.icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </motion.div>
          </NavLink>
        ))}
      </motion.div>

      {/* Main Simulation Content */}
      <div className="main-content">
        {/* Header */}
        <motion.div className="header" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="header-left"><h1>Real-time Simulation</h1></div>
          <div className="asset-selector"><span>Model:</span> <strong>Global Portfolio v2.1</strong></div>
        </motion.div>

        {/* Simulation Tab Navigation */}
        <motion.div className="tab-navigation" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            {['Single Asset', 'Storm Intensity', 'Portfolio Mitigation'].map(tab => (
                <button key={tab} className={`tab-button ${activeSimTab === tab ? 'active' : ''}`} onClick={() => setActiveSimTab(tab)}>
                    {tab}
                </button>
            ))}
        </motion.div>

        {/* --- SIMULATION PANELS --- */}
        <div className="simulation-content">

            {/* SIMULATION 1: SINGLE ASSET "WHAT-IF" */}
            {activeSimTab === 'Single Asset' && (
                <motion.div className="simulation-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="sim-controls-card">
                        <h3 className="card-title">Asset Controls</h3>
                        <div className="slider-group">
                            <label>Shielding Hardness: {shielding} g/cm²</label>
                            <input type="range" min="0" max="100" value={shielding} onChange={(e) => setShielding(Number(e.target.value))} className="what-if-slider" />
                        </div>
                        <div className="slider-group">
                            <label>Orbital Altitude: {orbit} km</label>
                            <input type="range" min="300" max="800" value={orbit} onChange={(e) => setOrbit(Number(e.target.value))} className="what-if-slider" />
                        </div>
                        <div className="slider-group">
                            <label>Insured Asset Value: ${assetValue}M</label>
                            <input type="range" min="10" max="500" value={assetValue} onChange={(e) => setAssetValue(Number(e.target.value))} className="what-if-slider" />
                        </div>
                    </div>
                    <div className="sim-output-card radial-chart-card">
                        <h3 className="card-title">Anomaly Probability</h3>
                        <div className="radial-chart-container">
                             <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="70%" outerRadius="85%" data={[{ value: simulatedMetrics.anomalyProbability }]} startAngle={90} endAngle={-270}>
                                  <defs><linearGradient id="radialGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#602da3" /><stop offset="100%" stopColor="#D73A7B" /></linearGradient></defs>
                                  <RadialBar minAngle={15} background={{ fill: 'rgba(255, 255, 255, 0.1)' }} clockWise={true} dataKey="value" cornerRadius={10} fill="url(#radialGradient)" />
                                </RadialBarChart>
                             </ResponsiveContainer>
                             <div className="radial-chart-label">
                                <span className="radial-value">{simulatedMetrics.anomalyProbability}%</span>
                             </div>
                        </div>
                    </div>
                    <div className="sim-output-card">
                        <h3 className="card-title">Calculated Impact</h3>
                         <div className="metric-item">
                            <Clock className="metric-icon" color="#26D0CE"/>
                            <div><span>Expected Downtime</span><strong>{simulatedMetrics.expectedDowntime}</strong></div>
                         </div>
                         <div className="metric-item">
                            <DollarSign className="metric-icon" color="#602da3"/>
                            <div><span>Suggested Premium</span><strong>${simulatedMetrics.suggestedPremium?.toLocaleString()}<small>/mo</small></strong></div>
                         </div>
                    </div>
                </motion.div>
            )}

            {/* SIMULATION 2: STORM INTENSITY */}
            {activeSimTab === 'Storm Intensity' && (
                 <motion.div className="simulation-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <div className="sim-controls-card">
                        <h3 className="card-title">Storm Controls</h3>
                        <div className="slider-group">
                            <label>Peak Kp Index: {kpIndex}</label>
                            <input type="range" min="0" max="9" step="0.1" value={kpIndex} onChange={(e) => setKpIndex(Number(e.target.value))} className="what-if-slider" />
                        </div>
                        <div className="slider-group">
                            <label>Event Duration: {duration} Hours</label>
                            <input type="range" min="6" max="72" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="what-if-slider" />
                        </div>
                    </div>
                    <div className="sim-output-card full-width">
                        <h3 className="card-title">Portfolio Impact Forecast</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={stormForecastData}>
                               <defs><linearGradient id="stormGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D73A7B" stopOpacity={0.8}/><stop offset="95%" stopColor="#D73A7B" stopOpacity={0}/></linearGradient></defs>
                               <XAxis dataKey="hour" tick={{ fill: '#8B949E' }} tickFormatter={(val) => `${val}h`} />
                               <YAxis domain={[0, 9]} hide={true} />
                               <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #D73A7B' }}/>
                               <Area type="monotone" dataKey="kpIndex" stroke="#D73A7B" fill="url(#stormGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                 </motion.div>
            )}

            {/* SIMULATION 3: PORTFOLIO MITIGATION */}
            {activeSimTab === 'Portfolio Mitigation' && (
                <motion.div className="simulation-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="sim-controls-card">
                       <h3 className="card-title">Mitigation Controls</h3>
                       <div className="slider-group">
                           <label>Mitigation Budget: ${budget.toLocaleString()}</label>
                           <input type="range" min="0" max="100000" step="1000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="what-if-slider" />
                       </div>
                       <div className="metric-item">
                            <TrendingUp className="metric-icon" color="#26D0CE"/>
                            <div><span>Risk Reduction</span><strong>{((totalInitialRisk - totalMitigatedRisk) / totalInitialRisk * 100).toFixed(1)}%</strong></div>
                       </div>
                    </div>
                    <div className="sim-output-card full-width">
                       <h3 className="card-title">Portfolio Risk Distribution (Initial vs. Mitigated)</h3>
                       <ResponsiveContainer width="100%" height={250}>
                           <BarChart data={mitigatedPortfolio} layout="vertical" margin={{left: 30}}>
                               <XAxis type="number" hide />
                               <YAxis type="category" dataKey="id" tick={{ fill: '#8B949E' }} />
                               <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #602da3' }} formatter={(value, name) => [`${value.toFixed(1)}%`, name]}/>
                               <Bar dataKey="risk" name="Initial Risk" fill="rgba(255, 255, 255, 0.2)" radius={[4, 4, 4, 4]} />
                               <Bar dataKey="mitigatedRisk" name="Mitigated Risk" fill="#602da3" radius={[4, 4, 4, 4]} />
                           </BarChart>
                       </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Sim;