import {React, useState, useEffect } from 'react';
// ReferenceLine is used to mark the peak forecast time
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { 
  Settings, 
  Bell, 
  Search, 
  TrendingUp, 
  Package, 
  DollarSign, 
  CheckCircle,
  Home,
  Map,
  Users,
  List,
  Type,
  Maximize,
  HelpCircle,
  Zap,
  Sigma, // Using Sigma icon for the forecast
  Plane,
  Satellite,
  Signal // Icon for Power Grid
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('Accounts');
  
  // --- MOCK DATA GENERATORS (These remain for other charts) ---
  const generatePerformanceData = () => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months.map(month => ({
      month,
      value: Math.floor(Math.random() * 50) + 60
    }));
  };
   const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // --- NEW: PREMIUM CALCULATION LOGIC FOR ASSET CHARTS ---
  const calculateAssetPremium = (cost, assetType, kp) => {
    const baseRisk = 0.005;
    let multiplier = 1;
    switch (assetType) {
        case 'Satellite': multiplier = 5; break;
        case 'Power Grid': multiplier = 4; break;
        case 'Aviation': multiplier = 2; break;
        default: multiplier = 1;
    }
    const riskFactor = baseRisk + (Math.pow(kp, 2) / 81) * multiplier * 0.1;
    
    const pp = cost * riskFactor;
    const rm = pp * 0.2;
    const el = 10000 + (pp + rm) * 0.05;
    return pp + rm + el;
  };

  const generatePremiumTrend = (cost, assetType) => {
      return Array.from({ length: 10 }, (_, kp) => ({
          kp: kp,
          premium: calculateAssetPremium(cost, assetType, kp)
      }));
  };
  
  // --- STATE FOR LIVE KP FORECAST & LIVE KP INDEX ---
  const [kpForecast, setKpForecast] = useState({ data: [], peakTime: null });
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [liveKp, setLiveKp] = useState(2); // Default to 2, then fetch real value

  // --- FETCH REAL FORECAST AND LIVE KP DATA FROM NOAA ---
  useEffect(() => {
    const fetchForecastData = async () => {
      setIsLoadingForecast(true);
      try {
        const response = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json');
        const rawData = await response.json();
        
        const dataPoints = rawData.slice(1);
        const forecastStartIndex = dataPoints.findIndex(p => p[2] !== 'observed');
        if (forecastStartIndex === -1) {
          throw new Error("No forecast data available.");
        }
        const forecast48h = dataPoints.slice(forecastStartIndex, forecastStartIndex + 16);
        let peakValue = 0;
        
        const formattedData = forecast48h.map(point => {
          const timeUTC = new Date(point[0] + 'Z');
          const kp = parseFloat(point[1]);
          if (kp > peakValue) {
            peakValue = kp;
          }
          return {
            time: `${timeUTC.getUTCDate()} ${timeUTC.toLocaleString('default', { month: 'short' })} ${String(timeUTC.getUTCHours()).padStart(2, '0')}:00`,
            kpIndex: kp,
            type: point[2]
          };
        });

        const peakDataPoint = formattedData.find(d => d.kpIndex === peakValue);
        const peakTime = peakDataPoint ? peakDataPoint.time : null;

        setKpForecast({ data: formattedData, peakTime });
      } catch (error) {
        console.error("Failed to fetch Kp forecast:", error);
        setKpForecast({ data: [], peakTime: null });
      } finally {
        setIsLoadingForecast(false);
      }
    };

    const fetchLiveKp = async () => {
        try {
            const response = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
            const data = await response.json();
            const latestKp = parseInt(data[data.length - 1][1], 10);
            setLiveKp(latestKp);
        } catch (error) {
            console.error("Failed to fetch live Kp-index:", error);
            setLiveKp(2); // Fallback on error
        }
    };

    fetchForecastData();
    fetchLiveKp();
  }, []);

  const [performanceData] = useState(generatePerformanceData());
  
  // --- NEW: Data for asset premium charts ---
  const [satelliteData] = useState(generatePremiumTrend(5250000, 'Satellite'));
  const [aviationData] = useState(generatePremiumTrend(100000000, 'Aviation'));
  const [powerGridData] = useState(generatePremiumTrend(5500000000, 'Power Grid'));
  
  const currentSatellitePremium = calculateAssetPremium(5250000, 'Satellite', liveKp);
  const currentAviationPremium = calculateAssetPremium(100000000, 'Aviation', liveKp);
  const currentPowerGridPremium = calculateAssetPremium(5500000000, 'Power Grid', liveKp);

  const formatPremium = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };


  const sidebarItems = [
    { icon: Home, label: 'DASHBOARD', path: '/dashboard', active: true },
    { icon: Map, label: 'MAP', path: '/dashboard/map' },
    { icon: HelpCircle, label: 'SIMULATION', path: '/dashboard/simulation' },
    { icon: Bell, label: 'NOTIFICATIONS', path: '/dashboard/notifications' },
    { icon: List, label: 'ANALYSIS', path: '/dashboard/analysis' },
    { icon: Type, label: 'ALERTS', path: '/dashboard/alerts' },
    { icon: Zap, label: 'INSURANCE', path: '/dashboard/premium' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
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
        {sidebarItems.map((item, index) => (
          <Link to={item.path} key={item.label} style={{ textDecoration: 'none', color: 'inherit' }}>
            <motion.div
              className={`sidebar-item ${item.active ? 'active' : ''}`}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <item.icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <motion.div 
          className="header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="header-left">
            <h1>DASHBOARD</h1>
          </div>
          <div className="header-right">
            <Search className="header-icon" />
            
            <button className="fullscreen-button" onClick={toggleFullScreen}>
              <Maximize className="header-icon" />
            </button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="tab-navigation"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {['Accounts', 'Purchases', 'Sessions'].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
          <Settings className="settings-icon" />
        </motion.div>

        {/* Performance Chart */}
        <motion.div 
          className="performance-section"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <div className="section-header">
            <div>
              <span className="section-subtitle">Traffic on this dataset</span>
              <h2 className="section-title">User Activity</h2>
            </div>
            <div className="chart-tooltip">
              <span className="tooltip-month">JUL</span>
              <span className="tooltip-dataset">My First dataset: 75</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8B949E', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    background: '#21262D',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F0F6FF'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#602da3"
                  strokeWidth={3}
                  dot={{ fill: '#000', stroke: '#602da3', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#602da3' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Kp Index Forecast Chart */}
        <motion.div
          className="forecast-section"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <div className="section-header">
            <div>
              <span className="section-subtitle">48-Hour Outlook</span>
              <h2 className="section-title">Kp Index Forecast</h2>
            </div>
            <div className="card-icon shipments">
              <Sigma />
            </div>
          </div>
          <div className="chart-container">
            {isLoadingForecast ? (
              <div style={{ textAlign: 'center', color: '#8B949E' }}>Loading Forecast Data...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={kpForecast.data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#602da3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#602da3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B949E', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide={true} domain={[0, 9]} />
                  <Tooltip
                    cursor={{ stroke: '#602da3', strokeWidth: 1, strokeDasharray: '5 5' }}
                    contentStyle={{
                      background: 'rgba(33, 38, 45, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(48, 54, 61, 0.5)',
                      borderRadius: '8px',
                      color: '#F0F6FF'
                    }}
                    formatter={(value) => [value.toFixed(2), 'Kp Index']}
                    labelFormatter={(label) => `Time: ${label} UTC`}
                  />
                  <Area type="monotone" dataKey="kpIndex" stroke="#602da3" strokeWidth={3} fillOpacity={1} fill="url(#forecastGradient)" />
                  {kpForecast.peakTime && (
                    <ReferenceLine x={kpForecast.peakTime} stroke="#D73A7B" strokeWidth={2} strokeDasharray="3 3" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* MODIFIED: Bottom Charts now show asset premiums */}
        <motion.div 
          className="bottom-charts"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Satellite Premium */}
          <motion.div className="chart-card" variants={itemVariants}>
            <div className="card-header">
              <div className="card-icon tasks">
                <Satellite />
              </div>
              <div>
                <h3>{formatPremium(currentSatellitePremium)}</h3>
                <p>Satellite Premium (Kp: {liveKp})</p>
              </div>
            </div>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height={60}>
                <AreaChart data={satelliteData}>
                  <Tooltip contentStyle={{ display: 'none' }} cursor={false} />
                  <Area type="monotone" dataKey="premium" stroke="#26D0CE" fill="#26D0CE" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Aviation Premium */}
          <motion.div className="chart-card" variants={itemVariants}>
            <div className="card-header">
              <div className="card-icon sales">
                <Plane />
              </div>
              <div>
                <h3>{formatPremium(currentAviationPremium)}</h3>
                <p>Aviation Premium (Kp: {liveKp})</p>
              </div>
            </div>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height={60}>
                 <AreaChart data={aviationData}>
                    <Tooltip contentStyle={{ display: 'none' }} cursor={false} />
                    <Area type="monotone" dataKey="premium" stroke="#D73A7B" fill="#D73A7B" fillOpacity={0.2} strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Power Grid Premium */}
          <motion.div className="chart-card" variants={itemVariants}>
            <div className="card-header">
              <div className="card-icon shipments">
                <Signal />
              </div>
              <div>
                <h3>{formatPremium(currentPowerGridPremium)}</h3>
                <p>Power Grid Premium (Kp: {liveKp})</p>
              </div>
            </div>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height={60}>
                <AreaChart data={powerGridData}>
                    <Tooltip contentStyle={{ display: 'none' }} cursor={false} />
                    <Area type="monotone" dataKey="premium" stroke="#602da3" fill="#602da3" fillOpacity={0.2} strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;