import React, { useState, useEffect } from 'react';
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
  Sigma // Using Sigma icon for the forecast
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('Accounts');
  
  // --- MOCK DATA GENERATORS (Replace with real API calls) ---
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

  const generateShipmentsData = () => {
    return Array.from({ length: 8 }, (_, i) => ({
      period: `P${i + 1}`,
      value: Math.floor(Math.random() * 60) + 70
    }));
  };

  const generateSalesData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      period: i + 1,
      value: Math.floor(Math.random() * 80) + 20
    }));
  };

  const generateTasksData = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      period: i + 1,
      value: Math.floor(Math.random() * 60) + 40
    }));
  };

  // Mock data generator for the Kp Index Forecast (Normal Distribution)
  const generateKpForecastData = (hours = 72) => {
    const data = [];
    const peakHour = 24; // The hour at which the storm is predicted to peak
    const peakKp = 7.5;   // The max predicted Kp index
    const baseKp = 2;     // The baseline Kp index
    const spread = 8;     // How wide the bell curve is (standard deviation)

    for (let hour = 0; hour <= hours; hour++) {
      // Gaussian function to create the bell curve shape
      const exponent = -Math.pow(hour - peakHour, 2) / (2 * Math.pow(spread, 2));
      const kpIndex = baseKp + (peakKp - baseKp) * Math.exp(exponent);
      data.push({
        hour: hour,
        kpIndex: kpIndex,
      });
    }
    return { data, peakHour };
  };

  const [performanceData] = useState(generatePerformanceData());
  const [shipmentsData] = useState(generateShipmentsData());
  const [salesData] = useState(generateSalesData());
  const [tasksData] = useState(generateTasksData());
  const [kpForecast] = useState(generateKpForecastData());

  /*
    ******************************************************************
    * HOW TO INTEGRATE YOUR BACKEND:
    * 1. Replace the useState line above with this:
    * const [kpForecast, setKpForecast] = useState({ data: [], peakHour: 0 });
    *
    * 2. Add a useEffect hook like this to fetch and set your data:
    *
    * useEffect(() => {
    * const fetchForecastData = async () => {
    * // const response = await fetch('your-backend-api/kp-forecast');
    * // const backendData = await response.json();
    * // setKpForecast(backendData); 
    * };
    * fetchForecastData();
    * }, []);
    *
    * 3. Ensure your backend returns data in this format:
    * {
    * data: [ { hour: 0, kpIndex: 2.1 }, { hour: 1, kpIndex: 2.2 }, ... ],
    * peakHour: 24 
    * }
    ******************************************************************
  */

  const sidebarItems = [
    { icon: Home, label: 'DASHBOARD', path: '/dashboard', active: true },
    { icon: Map, label: 'MAP', path: '/dashboard/map' },
    { icon: HelpCircle, label: 'SIMULATION', path: '/dashboard/simulation' },
    { icon: Bell, label: 'NOTIFICATIONS', path: '/dashboard/notifications' },
    { icon: List, label: 'ANALYSIS', path: '/dashboard/analysis' },
    { icon: Type, label: 'ALERTS', path: '/dashboard/alerts' },
    { icon: Zap, label: 'PREMIUM', path: '/dashboard/premium' }
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

            <div className="notification-badge">
              <Bell className="header-icon" />
              <span className="badge">5</span>
            </div>
            <div className="user-avatar">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format" alt="User" />
            </div>
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
              <span className="section-subtitle">Total Shipments</span>
              <h2 className="section-title">Performance</h2>
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
              <span className="section-subtitle">72-Hour Outlook</span>
              <h2 className="section-title">Kp Index Forecast</h2>
            </div>
            <div className="card-icon shipments">
              <Sigma />
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={kpForecast.data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#602da3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#602da3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8B949E', fontSize: 12 }}
                  tickFormatter={(value) => `${value}h`}
                />
                <YAxis 
                  hide={true} 
                  domain={[0, 9]}
                />
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
                  labelFormatter={(label) => `Hour: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="kpIndex" 
                  stroke="#602da3"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#forecastGradient)" 
                />
                <ReferenceLine x={kpForecast.peakHour} stroke="#D73A7B" strokeWidth={2} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bottom Charts */}
        <motion.div 
          className="bottom-charts"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total Shipments */}
          <motion.div className="chart-card" variants={itemVariants}>
            <div className="card-header">
              <div className="card-icon shipments">
                <Package />
              </div>
              <div>
                <h3>763,215</h3>
                <p>Total Shipments</p>
              </div>
            </div>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={shipmentsData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#602da3"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Daily Sales */}
          <motion.div className="chart-card" variants={itemVariants}>
            <div className="card-header">
              <div className="card-icon sales">
                <DollarSign />
              </div>
              <div>
                <h3>3,500€</h3>
                <p>Daily Sales</p>
              </div>
            </div>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={salesData}>
                  <Bar 
                    dataKey="value" 
                    fill="#D73A7B"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Completed Tasks */}
          <motion.div className="chart-card" variants={itemVariants}>
            <div className="card-header">
              <div className="card-icon tasks">
                <CheckCircle />
              </div>
              <div>
                <h3>12,100K</h3>
                <p>Completed Tasks</p>
              </div>
            </div>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={tasksData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#26D0CE"
                    strokeWidth={2}
                    dot={{ fill: '#0D1117', r: 3, stroke: '#26D0CE', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;