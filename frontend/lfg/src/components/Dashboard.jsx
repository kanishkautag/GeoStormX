import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Search, 
  TrendingUp, 
  Package, 
  DollarSign, 
  CheckCircle,
  Home,
  Grid,
  Map,
  Users,
  List,
  Type,
  HelpCircle,
  Zap
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('Accounts');
  
  // Mock data generators (replace with real API calls)
  const generatePerformanceData = () => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months.map(month => ({
      month,
      value: Math.floor(Math.random() * 50) + 60
    }));
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

  const [performanceData] = useState(generatePerformanceData());
  const [shipmentsData] = useState(generateShipmentsData());
  const [salesData] = useState(generateSalesData());
  const [tasksData] = useState(generateTasksData());

  const sidebarItems = [
    { icon: Home, label: 'CREATIVE TIM', isLogo: true },
    { icon: Home, label: 'DASHBOARD', active: true },
    { icon: Grid, label: 'ICONS' },
    { icon: Map, label: 'MAP' },
    { icon: Bell, label: 'NOTIFICATIONS' },
    { icon: Users, label: 'USER PROFILE' },
    { icon: List, label: 'TABLE LIST' },
    { icon: Type, label: 'TYPOGRAPHY' },
    { icon: HelpCircle, label: 'RTL SUPPORT' },
    { icon: Zap, label: 'UPGRADE TO PRO' }
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
          <motion.div
            key={item.label}
            className={`sidebar-item ${item.active ? 'active' : ''} ${item.isLogo ? 'logo' : ''}`}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <item.icon className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
          </motion.div>
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
            <div className="notification-badge">
              <TrendingUp className="header-icon" />
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
                  stroke="#1f6feb"
                  strokeWidth={3}
                  dot={{ fill: '#1f6feb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#1f6feb' }}
                />
              </LineChart>
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
                    stroke="#1f6feb"
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
                    dot={{ fill: '#26D0CE', r: 3 }}
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