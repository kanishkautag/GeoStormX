import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    ResponsiveContainer, 
    RadialBarChart, 
    RadialBar, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip,
    AreaChart,
    Area,
    CartesianGrid,
    Legend 
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Home,
  Map,
  Bell,
  ChevronDown,
  ShieldCheck,
  Clock,
  DollarSign,
  SlidersHorizontal,
  List,
  Type,
  HelpCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';

// --- STYLES ---
// All necessary styles are embedded here to avoid file resolution errors.
const analysisStyles = `
/* Note: Assumes dashboard-container, sidebar, main-content, and header styles are in a shared or global CSS file. */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.analysis-card {
  background: rgba(33, 38, 45, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(48, 54, 61, 0.5);
  transition: all 0.3s ease;
}

.analysis-card.full-width {
  grid-column: 1 / -1; /* Makes the card span the full width */
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #8B949E;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Radial Chart Card */
.radial-chart-card {
  grid-row: span 2; /* Makes this card taller */
  display: flex;
  flex-direction: column;
}
.radial-chart-container {
  flex-grow: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.radial-chart-label {
  position: absolute;
  text-align: center;
}
.radial-value {
  font-size: 3rem;
  font-weight: 700;
  color: #F0F6FF;
  display: block;
}
.radial-subtitle {
  font-size: 14px;
  color: #8B949E;
}

/* Key Metrics Card */
.metric-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.metric-item:last-child {
  margin-bottom: 0;
}
.metric-icon {
  width: 24px;
  height: 24px;
}
.metric-item div {
  display: flex;
  flex-direction: column;
}
.metric-item span {
  font-size: 14px;
  color: #8B949E;
}
.metric-item strong {
  font-size: 20px;
  font-weight: 600;
  color: #F0F6FF;
}
.metric-item strong small {
  font-size: 14px;
  color: #8B949E;
}

/* Live Data Card */
.live-data-list p {
  font-size: 14px;
  color: #F0F6FF;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.live-data-list p strong {
  color: #8B949E;
  display: inline-block;
  width: 120px;
}
.live-data-list p span {
    opacity: 0.7;
}


/* "What-If" Sliders */
.sliders-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.slider-group {
  display: flex;
  flex-direction: column;
}
.slider-group label {
  margin-bottom: 16px;
  color: #8B949E;
}
.what-if-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}
.what-if-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #602da3;
  cursor: pointer;
  border-radius: 50%;
  border: 3px solid #0D1117;
}
.what-if-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #602da3;
  cursor: pointer;
  border-radius: 50%;
  border: 3px solid #0D1117;
}

/* Responsive Grid */
@media (max-width: 1200px) {
  .analysis-grid {
    grid-template-columns: 1fr 1fr;
  }
  .radial-chart-card {
    grid-column: 1 / -1; /* Full width on medium screens */
    grid-row: auto;
    min-height: 350px;
  }
}
@media (max-width: 768px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  .sliders-container {
    grid-template-columns: 1fr;
  }
}
`;


// Base mock data
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
      kpIndex: 5.6, // This will be replaced by fetched data
      solarWind: '620 km/s',
      protonFlux: 'High'
    }
  }
};

const Analysis = () => {
  const [selectedAsset] = useState('SAT-A01');
  const [baseData] = useState(analysisData[selectedAsset]);
  
  // State for fetched and live data
  const [liveInputs, setLiveInputs] = useState(baseData.liveInputs);
  const [kpForecast, setKpForecast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for "What-If" sliders
  const [shielding, setShielding] = useState(80);
  const [orbit, setOrbit] = useState(550);

  // Sidebar items (can be moved to a shared component if needed)
  const sidebarItems = [
    { icon: Home, label: 'DASHBOARD', path: '/dashboard' },
    { icon: Map, label: 'MAP', path: '/dashboard/map' },
    { icon: SlidersHorizontal, label: 'SIMULATION', path: '/dashboard/simulation' },
    { icon: Bell, label: 'NOTIFICATIONS', path: '/dashboard/alerts' },
    { icon: List, label: 'ANALYSIS', path: '/dashboard/analysis' },
    { icon: Type, label: 'TYPOGRAPHY', path: '/dashboard/typography' },
    { icon: HelpCircle, label: 'RTL SUPPORT', path: '/dashboard/rtl' },
    { icon: Zap, label: 'PREMIUM', path: '/dashboard/premium' }
  ];

  useEffect(() => {
    const fetchKpData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const jsonData = await response.json();
        
        // Process the data
        const header = jsonData[0];
        const dataRows = jsonData.slice(1);
        const formattedData = dataRows.map(row => {
          const entry = {};
          header.forEach((key, index) => {
            entry[key] = row[index];
          });
          entry.kp = parseFloat(entry.kp);
          return entry;
        });

        // Find the most recent "observed" Kp value
        const latestObserved = [...formattedData].reverse().find(d => d.observed === 'observed' && d.kp);
        
        setKpForecast(formattedData);
        if (latestObserved) {
          setLiveInputs(prevInputs => ({ ...prevInputs, kpIndex: latestObserved.kp }));
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <style>{analysisStyles}</style>
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
              <motion.div whileHover={{ x: 5 }} style={{display: 'flex', alignItems: 'center'}}>
                <item.icon className="sidebar-icon" />
                <span className="sidebar-label">{item.label}</span>
              </motion.div>
            </NavLink>
          ))}
        </motion.div>

        {/* Main Analysis Content */}
        <div className="main-content">
          <motion.div 
            className="header"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1>Risk Analysis</h1>
            <div className="asset-selector">
              <span>Analyzing Asset:</span>
              <strong>{selectedAsset}</strong>
              <ChevronDown size={20} />
            </div>
          </motion.div>

          <motion.div 
            className="analysis-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="analysis-card radial-chart-card" variants={itemVariants}>
              <h3 className="card-title">Anomaly Probability</h3>
              <div className="radial-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    innerRadius="70%" 
                    outerRadius="85%" 
                    data={[{ value: baseData.anomalyProbability }]}
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
                  <span className="radial-value">{baseData.anomalyProbability}%</span>
                  <span className="radial-subtitle">High Confidence</span>
                </div>
              </div>
            </motion.div>

            <motion.div className="analysis-card" variants={itemVariants}>
              <h3 className="card-title">Key Metrics</h3>
              <div className="metric-item">
                <ShieldCheck className="metric-icon" color="#D73A7B"/>
                <div>
                  <span>Risk Level</span>
                  <strong>{baseData.riskLevel}</strong>
                </div>
              </div>
              <div className="metric-item">
                <Clock className="metric-icon" color="#26D0CE"/>
                <div>
                  <span>Expected Downtime</span>
                  <strong>{baseData.expectedDowntime}</strong>
                </div>
              </div>
              <div className="metric-item">
                <DollarSign className="metric-icon" color="#602da3"/>
                <div>
                  <span>Suggested Premium</span>
                  <strong>${baseData.suggestedPremium.toLocaleString()}<small>/mo</small></strong>
                </div>
              </div>
            </motion.div>
            
            <motion.div className="analysis-card" variants={itemVariants}>
              <h3 className="card-title">Live Data Inputs</h3>
              <div className="live-data-list">
                <p>
                  <strong>Kp Index:</strong>
                  {isLoading ? (
                    <span>Fetching...</span>
                  ) : error ? (
                    <span style={{ color: '#D73A7B' }}>Error</span>
                  ) : (
                    <>
                      {liveInputs.kpIndex}
                      <CheckCircle2 size={16} color="#238636" style={{ marginLeft: '8px' }}/>
                    </>
                  )}
                </p>
                <p><strong>Solar Wind:</strong> {liveInputs.solarWind}</p>
                <p><strong>Proton Flux:</strong> {liveInputs.protonFlux}</p>
              </div>
            </motion.div>

            <motion.div className="analysis-card full-width" variants={itemVariants}>
              <h3 className="card-title">Planetary K-index Forecast</h3>
              {isLoading ? (
                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B949E' }}>Loading Forecast...</div>
              ) : error ? (
                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D73A7B' }}>Could not load data: {error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={kpForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="kpGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D73A7B" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#D73A7B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                            dataKey="time_tag" 
                            tickFormatter={(time) => new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            tick={{ fill: '#8B949E' }} 
                            axisLine={false} 
                            tickLine={false}
                        />
                        <YAxis domain={[0, 9]} allowDecimals={false} tick={{ fill: '#8B949E' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ background: '#1a1f29', border: '1px solid #30363d', borderRadius: '8px' }}
                            labelStyle={{color: '#c9d1d9'}}
                            itemStyle={{color: '#D73A7B'}}
                        />
                        <Legend wrapperStyle={{color: '#8B949E', paddingTop: '10px'}}/>
                        <Area type="monotone" dataKey="kp" name="Kp Index" stroke="#D73A7B" fill="url(#kpGradient)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div className="analysis-card full-width" variants={itemVariants}>
              <h3 className="card-title">Probabilistic Loss Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={baseData.lossDistribution} margin={{top: 20}}>
                  <XAxis dataKey="loss" tick={{ fill: '#8B949E' }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} tick={{ fill: '#8B949E' }} axisLine={false} tickLine={false}/>
                  <Tooltip 
                    cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #602da3' }}
                  />
                  <Bar dataKey="probability" fill="#602da3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            
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
    </>
  );
};

export default Analysis;

