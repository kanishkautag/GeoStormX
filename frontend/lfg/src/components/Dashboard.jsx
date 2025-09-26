import React, { useState } from 'react';
import { 
  createTheme, 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Tabs, 
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { SatelliteAlt, Warning, BarChart, TravelExplore } from '@mui/icons-material';
import './Dashboard.css';

// 1. DEFINE THE CUSTOM THEME TO MATCH YOUR LANDING PAGE
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#602da3', // Your core purple
    },
    background: {
      default: '#000000', // Black background
      paper: '#1a1a1a',   // Dark grey for cards and surfaces
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: "'Space Mono', monospace",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.75rem'
    },
    body1: {
      fontSize: '1rem',
    }
  },
});

// 2. PLACEHOLDER DATA (TO BE REPLACED BY API CALLS)
const initialSummaryData = {
  threatLevel: 'Elevated',
  activeAlerts: 3,
  portfolioRisk: '1.25%',
  nextForecast: '24h 15m'
};

const initialLiveFeed = [
  { metric: 'Solar Wind Speed', value: '520.4 km/s', status: 'normal' },
  { metric: 'Proton Flux (>10 MeV)', value: '15 pfu', status: 'warning' },
  { metric: 'Kp Index (Geomagnetic)', value: '4 (Unsettled)', status: 'normal' },
  { metric: 'IMF Bz', value: '-3.2 nT', status: 'normal' },
];

const initialPortfolioAssets = [
  { id: 'SAT-A01', type: 'LEO Comms', status: 'Nominal', risk: '0.8%', premium: '$1,200/mo' },
  { id: 'SAT-B03', type: 'GEO Imaging', status: 'High Risk', risk: '3.1%', premium: '$4,500/mo' },
  { id: 'GRID-US-E1', type: 'Power Grid', status: 'Alert', risk: '2.5%', premium: '$15,000/mo' },
  { id: 'SAT-C12', type: 'LEO Weather', status: 'Nominal', risk: '0.5%', premium: '$950/mo' },
];

// Helper component for Tab Panels
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // State for all dynamic data
  const [summaryData] = useState(initialSummaryData);
  const [liveFeed] = useState(initialLiveFeed);
  const [portfolioAssets] = useState(initialPortfolioAssets);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box className="dashboard-container">
        <Container maxWidth="xl">
          <Typography variant="h4" gutterBottom sx={{ mb: 4, letterSpacing: '1px' }}>
            ◆ Operator Dashboard
          </Typography>

          {/* === SUMMARY CARDS === */}
          <Grid container spacing={4} sx={{ mb: 5 }}>
            <Grid item lg={3} sm={6} xs={12}>
              <Paper className="stat-card">
                <Warning className="stat-icon" />
                <Typography variant="h6" color="textSecondary">Threat Level</Typography>
                <Typography variant="h5">{summaryData.threatLevel}</Typography>
              </Paper>
            </Grid>
            <Grid item lg={3} sm={6} xs={12}>
              <Paper className="stat-card">
                <SatelliteAlt className="stat-icon" />
                <Typography variant="h6" color="textSecondary">Active Alerts</Typography>
                <Typography variant="h5">{summaryData.activeAlerts}</Typography>
              </Paper>
            </Grid>
            <Grid item lg={3} sm={6} xs={12}>
              <Paper className="stat-card">
                <BarChart className="stat-icon" />
                <Typography variant="h6" color="textSecondary">Portfolio Risk</Typography>
                <Typography variant="h5">{summaryData.portfolioRisk}</Typography>
              </Paper>
            </Grid>
            <Grid item lg={3} sm={6} xs={12}>
              <Paper className="stat-card">
                <TravelExplore className="stat-icon" />
                <Typography variant="h6" color="textSecondary">Next Forecast</Typography>
                <Typography variant="h5">{summaryData.nextForecast}</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* === TABS & PANELS === */}
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="dashboard data tabs"
                variant="fullWidth"
              >
                <Tab label="Live Space Weather" />
                <Tab label="Risk Analysis & Graphs" />
                <Tab label="Portfolio Management" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" sx={{mb: 2}}>Live Data Feed</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Current Value</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liveFeed.map((row) => (
                      <TableRow key={row.metric}>
                        <TableCell>{row.metric}</TableCell>
                        <TableCell>{row.value}</TableCell>
                        <TableCell>
                          <span className={`status-pill status-${row.status}`}>{row.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">
                  Graphs, probability distributions, and forecast models will be displayed here in real-time.
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" sx={{mb: 2}}>Insured Asset Portfolio</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Asset ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Calculated Risk</TableCell>
                        <TableCell>Insurance Premium</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {portfolioAssets.map((asset) => (
                        <TableRow key={asset.id} hover>
                          <TableCell>{asset.id}</TableCell>
                          <TableCell>{asset.type}</TableCell>
                          <TableCell>
                            <span className={`status-pill status-${asset.status.toLowerCase().replace(' ', '-')}`}>{asset.status}</span>
                          </TableCell>
                          <TableCell>{asset.risk}</TableCell>
                          <TableCell>{asset.premium}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </TableContainer>
            </TabPanel>
          </Paper>

        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;