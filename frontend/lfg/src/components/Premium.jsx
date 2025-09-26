import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  CreditCard,
  CheckCircle,
  DollarSign,
  IndianRupee,
  Star,
  Activity,
  Award,
  ShieldHalf,
  BarChart2,
  Globe,
  Zap,
  Lock
} from 'lucide-react';
import './Premium.css';

// --- IMPORTANT: Replace with your public Stripe key ---
const stripePromise = loadStripe('pk_test_YOUR_PUBLIC_KEY');

// --- Payment Form Component (Nested for Stripe Elements) ---
const PaymentForm = ({ selectedPlan, currency, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);

    const planPriceUSD = selectedPlan.price;
    const exchangeRate = 83.33; // Store this in a config or fetch dynamically
    const amountToCharge = currency === 'USD' ? planPriceUSD : Math.round(planPriceUSD * exchangeRate);
    const currencySymbol = currency === 'USD' ? '$' : '₹';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        if (!stripe || !elements) return;

        try {
            const response = await fetch('/your-backend-api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: amountToCharge * 100, // Convert to cents/paise
                    currency: currency.toLowerCase(),
                    planId: selectedPlan.id,
                    planName: selectedPlan.name
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create PaymentIntent');
            }
            const { clientSecret } = await response.json();

            const payload = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (payload.error) {
                setError(`Payment failed: ${payload.error.message}`);
                setProcessing(false);
            } else {
                setError(null);
                setProcessing(false);
                setSucceeded(true);
                onPaymentSuccess();
            }
        } catch (err) {
            setError(err.message);
            setProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                color: '#F0F6FF',
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                '::placeholder': {
                    color: '#8B949E',
                },
            },
            invalid: {
                color: '#D73A7B',
                iconColor: '#D73A7B',
            },
        },
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <div className="card-element-container">
                <CardElement options={cardElementOptions} />
            </div>
            <button disabled={processing || succeeded} id="submit" className="pay-button">
                <span>{processing ? 'Processing…' : succeeded ? 'Payment Successful!' : `Pay ${currencySymbol}${amountToCharge.toLocaleString()}`}</span>
            </button>
            {error && <div className="card-error" role="alert">{error}</div>}
            {succeeded && (
                <div className="payment-success">
                    <CheckCircle size={20} /><p>Welcome to {selectedPlan.name}!</p>
                </div>
            )}
        </form>
    );
};


// --- Main Premium Component ---
const Premium = () => {
  const [currency, setCurrency] = useState('USD');
  const [selectedPlanId, setSelectedPlanId] = useState('enterprise');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const plans = [
    { id: 'professional', name: 'Professional', price: 2000, period: '/ year', features: ['Unlimited Simulations', 'Real-time Anomaly Alerts'], icon: <Activity size={24} /> },
    { id: 'enterprise', name: 'Enterprise', price: 5000, period: '/ year', features: ['Advanced Risk Modeling', 'Portfolio Risk Aggregation', 'Priority Support'], icon: <Award size={24} /> },
    { id: 'corporate', name: 'Corporate', price: 10000, period: '/ year', features: ['Custom Integration', 'Dedicated Account Manager'], icon: <ShieldHalf size={24} /> },
    { id: 'large-scale', name: 'Large Scale', price: 1000000, period: '/ year', features: ['Multi-Region Deployment', 'Custom Data Ingestion'], icon: <BarChart2 size={24} /> },
    { id: 'global-ops', name: 'Global Operations', price: 10000000, period: '/ year', features: ['White-label Solution', '24/7 On-site Support'], icon: <Globe size={24} /> },
  ];

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const otherPlans = plans.filter(p => p.id !== selectedPlanId);
  
  const formatPrice = (priceUSD) => {
    if (currency === 'USD') {
      return `$${priceUSD.toLocaleString()}`;
    } else {
      const exchangeRate = 83.33;
      return `₹${(priceUSD * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }
  };

  return (
    <div className="premium-page-container">
      <div className="main-content">
        <motion.div className="header" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="header-left"><h1>Premium Upgrade</h1></div>
          <button className="currency-toggle-button" onClick={() => setCurrency(c => c === 'USD' ? 'INR' : 'USD')}>
            {currency === 'USD' ? <DollarSign size={20} /> : <IndianRupee size={20} />}
            <span>Switch to {currency === 'USD' ? 'INR' : 'USD'}</span>
          </button>
        </motion.div>

        <div className="premium-content-wrapper">
            <div className="hero-payment-section">
                <motion.div 
                    className="selected-plan-card"
                    key={selectedPlan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="plan-header-main">
                        <Zap className="premium-icon-main" />
                        <h3>{selectedPlan.name} Plan</h3>
                        <p className="price-main">{formatPrice(selectedPlan.price)} <span>{selectedPlan.period}</span></p>
                    </div>
                    <ul className="features-list-main">
                        {selectedPlan.features.map((feature, index) => (
                            <li key={index}><CheckCircle size={16} /> {feature}</li>
                        ))}
                    </ul>
                </motion.div>
                
                <motion.div 
                    className="payment-card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="card-title"><CreditCard size={18}/> Secure Payment for {selectedPlan.name}</h3>
                    
                    <div className="payment-info">
                        <div className="accepted-cards">
                            <span>We accept:</span>
                            <div className="card-logos">
                                <div className="card-logo">VISA</div>
                                <div className="card-logo">Mastercard</div>
                                <div className="card-logo">AMEX</div>
                            </div>
                        </div>
                        <p className="info-text">
                            Your card details are securely handled by Stripe.
                        </p>
                    </div>

                    <Elements stripe={stripePromise}>
                        <PaymentForm 
                            selectedPlan={selectedPlan} 
                            currency={currency} 
                            onPaymentSuccess={() => setPaymentSuccess(true)} 
                        />
                    </Elements>

                    <div className="trust-seals">
                        <div className="trust-seal-item">
                            <Lock size={16} />
                            <span>PCI Compliant & 256-bit SSL Encrypted</span>
                        </div>
                        <div className="trust-seal-item">
                            <span>Powered by <strong>Stripe</strong></span>
                        </div>
                        <div className="trust-seal-item">
                           <span>AURA Inc. | Est. 2024</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {!paymentSuccess && (
                <motion.div 
                    className="other-plans-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, staggerChildren: 0.05 }}
                >
                    <h3 className="grid-heading">Choose another plan:</h3>
                    {otherPlans.map(plan => (
                        <motion.div 
                            key={plan.id} 
                            className="plan-card-small"
                            onClick={() => setSelectedPlanId(plan.id)}
                            whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(96, 45, 163, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="plan-icon-small">{plan.icon}</div>
                            <h4>{plan.name}</h4>
                            <p className="price-small">{formatPrice(plan.price)} <span>{plan.period}</span></p>
                            <button className="select-plan-button">Select</button>
                        </motion.div>
                    ))}
                </motion.div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Premium;