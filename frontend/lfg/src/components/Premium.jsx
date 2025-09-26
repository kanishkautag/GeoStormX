import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  CreditCard, CheckCircle, DollarSign, IndianRupee, Activity, Award, ShieldHalf,
  BarChart2, Globe, Zap, Lock, Shield, ShieldAlert, ShieldCheck
} from 'lucide-react';
import './Premium.css';

// --- Stripe Public Key (Replace with your own) ---
const stripePromise = loadStripe('pk_test_YOUR_PUBLIC_KEY');

// --- Utility Functions ---

// Translates Kp-index to a dynamic risk factor for different assets
const mapKpToRiskFactor = (kp, assetType) => {
  const baseRisk = 0.005; // A baseline risk factor
  let multiplier = 1;

  switch (assetType) {
    case 'Satellite': // Satellites are highly sensitive
      multiplier = 5;
      break;
    case 'Power Grid': // Grids are very vulnerable
      multiplier = 4;
      break;
    case 'Aviation': // Aviation is affected, but has mitigation procedures
      multiplier = 2;
      break;
    default:
      multiplier = 1;
  }
  // Risk factor increases non-linearly with the Kp-index
  return baseRisk + (Math.pow(kp, 2) / 81) * multiplier * 0.1;
};

// Calculates the estimated premium based on cost and a dynamic risk factor
const calculatePremium = (cost, riskFactor) => {
    const pp = cost * riskFactor;
    const rm = pp * 0.2; // Simplified Risk Margin (20%)
    const el = 10000 + (pp + rm) * 0.05; // Simplified Expense Loading
    return (pp + rm + el).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// --- Child Components ---

// Displays the current Kp status with an appropriate icon and color
const KpStatus = ({ kp, loading }) => {
  if (loading) {
    return <div className="kp-status" style={{ color: '#8B949E' }}><span>Loading Live Data...</span></div>;
  }

  let status = { text: 'Calm', color: '#26D0CE', icon: <ShieldCheck size={20} /> };
  if (kp >= 7) status = { text: 'Extreme Storm', color: '#D73A7B', icon: <Zap size={20} /> };
  else if (kp >= 5) status = { text: 'Geomagnetic Storm', color: '#f0ad4e', icon: <ShieldAlert size={20} /> };
  else if (kp >= 4) status = { text: 'Active', color: '#f0ad4e', icon: <Shield size={20} /> };

  return (
    <div className="kp-status" style={{ color: status.color, borderColor: status.color }}>
      {status.icon}
      <span><strong>Live Status:</strong> {status.text} (Kp: {kp})</span>
    </div>
  );
};

// Informational content for each tab, now accepting a Kp-index prop
const AviationInfo = ({ activeKp }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="subsection">
            <h3>Airbus A320</h3>
            <p>The Airbus A320 family is a cornerstone of modern aviation, renowned for its operational efficiency and advanced fly-by-wire technology. Its resilience is tested during geomagnetic storms which can disrupt navigation and communication systems.</p>
            <p><strong>Average Cost of an A320:</strong> $100,000,000</p>
            <p><strong>Estimated Premium (at Kp {activeKp}):</strong> {calculatePremium(100000000, mapKpToRiskFactor(activeKp, 'Aviation'))}</p>
        </div>
        <InsuranceFormula />
    </motion.div>
);

const PowerGridsInfo = ({ activeKp }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="subsection">
            <h3>Centralised Grids</h3>
            <p>Centralised grids are the backbone of power delivery but are highly vulnerable to Geomagnetically Induced Currents (GICs) during solar storms, which can cause widespread outages and damage critical transformers.</p>
            <p><strong>Average Asset Value:</strong> $5,500,000,000</p>
            <p><strong>Estimated Premium (at Kp {activeKp}):</strong> {calculatePremium(5500000000, mapKpToRiskFactor(activeKp, 'Power Grid'))}</p>
        </div>
        <InsuranceFormula />
    </motion.div>
);

const SatelliteInfo = ({ activeKp }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="subsection">
            <h3>Low Earth Orbit (LEO)</h3>
            <p>LEO satellites are crucial for global communications but are the most exposed to space weather. Increased atmospheric drag and radiation from geomagnetic storms can shorten their lifespan and increase collision risk.</p>
            <p><strong>Average Cost to Build:</strong> $5,250,000</p>
            <p><strong>Estimated Premium (at Kp {activeKp}):</strong> {calculatePremium(5250000, mapKpToRiskFactor(activeKp, 'Satellite'))}</p>
        </div>
        <div className="subsection">
            <h3>Medium Earth Orbit (MEO)</h3>
            <p>MEO satellites operate at altitudes between 2,000 km and 35,786 km. This orbit offers a good compromise between the large coverage area of geostationary satellites and the low latency of LEO satellites. A constellation of MEO satellites can provide continuous global coverage with fewer satellites than a LEO constellation, and with better signal strength than geostationary satellites for many applications.</p>
            <p><strong>Average Cost to Build:</strong> $50,000,000 - $150,000,000</p>
            <p><strong>Estimated Premium (at Kp {activeKp}):</strong> {calculatePremium(100000000, mapKpToRiskFactor(activeKp, 'Satellite'))}</p>
        </div>
        <div className="subsection">
            <h3>Navigation Earth Orbit</h3>
            <p>These satellites, typically in MEO, are the backbone of global navigation satellite systems (GNSS). They provide autonomous geo-spatial positioning with global coverage, enabling a wide range of applications from personal navigation in our smartphones to precision agriculture, autonomous vehicles, and military operations. The high reliability and long lifespan required for these satellites make them a significant investment, with complex designs and redundant systems to ensure continuous operation.</p>
            <p><strong>Average Cost to Build:</strong> $100,000,000 - $200,000,000</p>
            <p><strong>Estimated Premium (at Kp {activeKp}):</strong> {calculatePremium(150000000, mapKpToRiskFactor(activeKp, 'Satellite'))}</p>
        </div>
        <div className="subsection">
            <h3>Weather Satellite</h3>
            <p>Weather satellites are crucial for monitoring the Earth's weather and climate. They can be in geostationary orbit (GEO), providing a constant view of one side of the Earth, or in polar orbit, scanning the entire planet several times a day. GEO weather satellites are invaluable for tracking large-scale weather patterns like hurricanes, while polar-orbiting satellites provide the detailed data needed for numerical weather prediction models.</p>
            <p><strong>Average Cost to Build:</strong> $200,000,000 - $400,000,000</p>
            <p><strong>Estimated Premium (at Kp {activeKp}):</strong> {calculatePremium(300000000, mapKpToRiskFactor(activeKp, 'Satellite'))}</p>
        </div>
        <InsuranceFormula />
    </motion.div>
    
);

const InsuranceFormula = () => (
    <div className="subsection advice">
        <h3>Dynamic Premium Calculation</h3>
        <p>The premium is calculated using the formula: <code>G = PP + RM + EL</code>. The <strong>Premium Part (PP)</strong> is dynamically adjusted based on the live or simulated Kp-index, which directly influences the probable loss from a geomagnetic event.</p>
    </div>
);

// Payment form component
const PaymentForm = ({ selectedPlan, currency, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);

    const planPriceUSD = selectedPlan.price;
    const exchangeRate = 83.33;
    const amountToCharge = currency === 'USD' ? planPriceUSD : Math.round(planPriceUSD * exchangeRate);
    const currencySymbol = currency === 'USD' ? '$' : '₹';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        if (!stripe || !elements) return;

        // --- Mock API Call for Demonstration ---
        setTimeout(() => {
            console.log('Simulating payment for:', { amount: amountToCharge * 100, currency: currency.toLowerCase(), planName: selectedPlan.name });
            setError(null);
            setProcessing(false);
            setSucceeded(true);
            onPaymentSuccess();
        }, 2000);
    };

    const cardElementOptions = {
        style: {
            base: { color: '#F0F6FF', fontFamily: "'Inter', sans-serif", fontSize: '16px', '::placeholder': { color: '#8B949E' } },
            invalid: { color: '#D73A7B', iconColor: '#D73A7B' },
        },
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <div className="card-element-container"><CardElement options={cardElementOptions} /></div>
            <button disabled={processing || succeeded} id="submit" className="pay-button">
                <span>{processing ? 'Processing…' : succeeded ? 'Payment Successful!' : `Pay ${currencySymbol}${amountToCharge.toLocaleString()}`}</span>
            </button>
            {error && <div className="card-error" role="alert">{error}</div>}
            {succeeded && <div className="payment-success"><CheckCircle size={20} /><p>Welcome to {selectedPlan.name}!</p></div>}
        </form>
    );
};

// --- Main Premium Component ---
const Premium = () => {
  // State for UI and Plans
  const [currency, setCurrency] = useState('USD');
  const [selectedPlanId, setSelectedPlanId] = useState('enterprise');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('Satellite');

  // State for Live Data and Simulation
  const [liveKp, setLiveKp] = useState(0);
  const [simulatedKp, setSimulatedKp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch live Kp-index data on component mount
  useEffect(() => {
    const fetchKpIndex = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', { cache: 'no-store' });
        const data = await response.json();
        const latestKp = parseInt(data[data.length - 1][1], 10);
        setLiveKp(latestKp);
      } catch (error) {
        console.error("Failed to fetch Kp-index:", error);
        setLiveKp(2); // Set a default value on error
      } finally {
        setLoading(false);
      }
    };
    fetchKpIndex();
  }, []);

  // Use the simulated Kp value if it exists, otherwise use the live data
  const activeKp = simulatedKp !== null ? simulatedKp : liveKp;

  const plans = [
    { id: 'professional', name: 'Professional', price: 2000, period: '/ year', features: ['Unlimited Simulations', 'Real-time Anomaly Alerts'], icon: <Activity size={24} /> },
    { id: 'enterprise', name: 'Enterprise', price: 5000, period: '/ year', features: ['Advanced Risk Modeling', 'Portfolio Risk Aggregation', 'Priority Support'], icon: <Award size={24} /> },
    { id: 'corporate', name: 'Corporate', price: 10000, period: '/ year', features: ['Custom Integration', 'Dedicated Account Manager'], icon: <ShieldHalf size={24} /> },
  ];

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  
  const formatPrice = (priceUSD) => {
    if (currency === 'USD') return `$${priceUSD.toLocaleString()}`;
    const exchangeRate = 83.33;
    return `₹${(priceUSD * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Aviation': return <AviationInfo activeKp={activeKp} />;
      case 'Power Grids': return <PowerGridsInfo activeKp={activeKp} />;
      case 'Satellite': return <SatelliteInfo activeKp={activeKp} />;
      default: return <SatelliteInfo activeKp={activeKp} />;
    }
  };

  return (
    <div className="premium-page-container">
      <div className="main-content">
        {/* --- Header --- */}
        <motion.div className="header" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="header-title">
              <h1>Advanced Risk Modelling</h1>
              <p>Advanced risk modeling and real-time alerts.</p>
            </div>
            <KpStatus kp={liveKp} loading={loading} />
        </motion.div>
        
        {/* --- Payment & Plan Selection --- */}
        {/* <div className="premium-content-wrapper">
          <div className="hero-payment-section">
            <motion.div className="selected-plan-card" key={selectedPlan.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="plan-header-main">
                  <Zap className="premium-icon-main" />
                  <h3>{selectedPlan.name} Plan</h3>
                  <p className="price-main">{formatPrice(selectedPlan.price)} <span>{selectedPlan.period}</span></p>
              </div>
              <ul className="features-list-main">{selectedPlan.features.map((feature, index) => (<li key={index}><CheckCircle size={16} /> {feature}</li>))}</ul>
            </motion.div>
            
            <motion.div className="payment-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="card-title"><CreditCard size={18}/> Secure Payment for {selectedPlan.name}</h3>
                <div className="payment-info">
                    <div className="accepted-cards"><span>We accept:</span><div className="card-logos"><div className="card-logo">VISA</div><div className="card-logo">Mastercard</div><div className="card-logo">AMEX</div></div></div>
                    <p className="info-text">Your card details are securely handled by Stripe.</p>
                </div>
                <Elements stripe={stripePromise}><PaymentForm selectedPlan={selectedPlan} currency={currency} onPaymentSuccess={() => setPaymentSuccess(true)} /></Elements>
                <div className="trust-seals">
                    <div className="trust-seal-item"><Lock size={16} /><span>PCI Compliant & 256-bit SSL Encrypted</span></div>
                    <div className="trust-seal-item"><span>Powered by <strong>Stripe</strong></span></div>
                </div>
            </motion.div>
          </div>
        </div> */}
        
        {/* --- Dynamic Risk Simulation Section --- */}
        <motion.div className="info-section-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h2>Dynamic Risk Calculator</h2>
            <div className="slider-container">
              <label htmlFor="kpSlider">Simulate Geomagnetic Storm Level (Kp-Index)</label>
              <div className="slider-wrapper">
                <input
                  type="range"
                  id="kpSlider"
                  min="0"
                  max="9"
                  step="1"
                  value={activeKp}
                  onChange={(e) => setSimulatedKp(Number(e.target.value))}
                />
                <span className="slider-value">{activeKp}</span>
              </div>
              {simulatedKp !== null && (
                <button className="reset-button" onClick={() => setSimulatedKp(null)}>
                  Use Live Data ({liveKp})
                </button>
              )}
            </div>
            
            <div className="tab-nav">
                <button onClick={() => setActiveTab('Satellite')} className={activeTab === 'Satellite' ? 'active' : ''}>Satellite</button>
                <button onClick={() => setActiveTab('Power Grids')} className={activeTab === 'Power Grids' ? 'active' : ''}>Power Grids</button>
                <button onClick={() => setActiveTab('Aviation')} className={activeTab === 'Aviation' ? 'active' : ''}>Aviation</button>
            </div>
            
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Premium;