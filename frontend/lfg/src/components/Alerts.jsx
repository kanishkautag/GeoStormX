import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Inspect,
  SlidersHorizontal,
  Zap,
  Bell,
  MessageSquare,
  Phone,
  Cpu,
  Siren // New icon for the Alerts page
} from 'lucide-react';
import './Alerts.css';

const Alerts = () => {
    // State management from your teammate's App.jsx
    const [smsTo, setSmsTo] = useState('');
    const [smsBody, setSmsBody] = useState('');
    const [callTo, setCallTo] = useState('');
    const [query, setQuery] = useState('');
    const [assistantResponse, setAssistantResponse] = useState('');
    const [lastAlert, setLastAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    // --- Configuration ---
    const API_BASE_URL = 'http://localhost:8000';

    // --- Helper Functions ---
    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    // --- API Handlers from App.jsx ---
    const handleTriggerStorm = async () => {
        setLoading(true);
        setLastAlert(null);
        try {
            const stormData = { region: "North America", severity: "severe", kp_index: 8 };
            const response = await fetch(`${API_BASE_URL}/trigger-storm-alert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stormData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to trigger alert');
            }
            const result = await response.json();
            showNotification(`Alert successfully sent to ${result.messages_sent} customer(s)!`, 'success');
            setLastAlert(result);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSendSms = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/send-sms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: smsTo, body: smsBody }),
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Failed to send SMS');
            const result = await response.json();
            showNotification(`SMS sent successfully! SID: ${result.sid}`, 'success');
            setSmsTo('');
            setSmsBody('');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleMakeCall = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/make-call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: callTo }),
            });
             if (!response.ok) throw new Error((await response.json()).detail || 'Failed to make call');
            const result = await response.json();
            showNotification(`Call initiated successfully! SID: ${result.sid}`, 'success');
            setCallTo('');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAskAssistant = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAssistantResponse('');
        try {
            const response = await fetch(`${API_BASE_URL}/ask-assistant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Failed to get response');
            const result = await response.json();
            setAssistantResponse(result.response);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Sidebar items to match the rest of your dashboard
    const sidebarItems = [
        { icon: Home, label: 'DASHBOARD', path: '/dashboard' },
        { icon: Inspect, label: 'ANALYSIS', path: '/dashboard/analysis' },
        { icon: SlidersHorizontal, label: 'SIMULATION', path: '/dashboard/simulation' },
        { icon: Siren, label: 'ALERTS', path: '/dashboard/alerts', active: true },
        { icon: Zap, label: 'PREMIUM', path: '/premium' },
    ];

    return (
        <div className="dashboard-container">
            {/* Notification Popup */}
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

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

            {/* Main Content */}
            <div className="main-content">
                <motion.div className="header" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <div className="header-left"><h1>Alerts & Communications</h1></div>
                </motion.div>

                <div className="alerts-grid">
                    {/* Storm Alert Panel */}
                    <motion.div className="alert-panel full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h2 className="panel-title"><Siren /> Emergency Alert System</h2>
                        <p className="panel-description">
                            Simulate a severe solar storm event to generate and dispatch AI-curated insurance alerts to affected clients via SMS.
                        </p>
                        <button onClick={handleTriggerStorm} disabled={loading} className="btn-alert">
                            {loading ? 'Dispatching Alerts...' : 'Trigger Severe Storm Alert'}
                        </button>
                        {lastAlert && (
                            <div className="response-box">
                                <h4>Last Alert Dispatched:</h4>
                                <p><strong>Message Sent:</strong> "{lastAlert.message_body}"</p>
                                <p><strong>Recipients:</strong> {lastAlert.messages_sent}</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Communications Panel */}
                    <motion.div className="alert-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h2 className="panel-title"><MessageSquare /> Manual Communications</h2>
                        <form onSubmit={handleSendSms} className="form-section">
                            <h3>Send an SMS</h3>
                            <input type="tel" value={smsTo} onChange={(e) => setSmsTo(e.target.value)} placeholder="To Phone Number (e.g., +14155552671)" className="input-field" />
                            <textarea value={smsBody} onChange={(e) => setSmsBody(e.target.value)} placeholder="Your message here..." rows="3" className="textarea-field"></textarea>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Sending...' : 'Send SMS'}
                            </button>
                        </form>
                        <form onSubmit={handleMakeCall} className="form-section">
                            <h3>Make a Call</h3>
                            <input type="tel" value={callTo} onChange={(e) => setCallTo(e.target.value)} placeholder="To Phone Number (e.g., +14155552671)" className="input-field" />
                            <button type="submit" disabled={loading} className="btn-secondary">
                                {loading ? 'Calling...' : 'Make Call'}
                            </button>
                        </form>
                    </motion.div>

                    {/* AI Assistant Panel */}
                    <motion.div className="alert-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <h2 className="panel-title"><Cpu /> AI Assistant</h2>
                        <form onSubmit={handleAskAssistant} className="form-section">
                            <h3>Ask Gemini</h3>
                            <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about storm impact, insurance clauses, etc..." rows="5" className="textarea-field"></textarea>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Thinking...' : 'Ask Assistant'}
                            </button>
                        </form>
                        {assistantResponse && (
                            <div className="response-box ai-response">
                                <h4>Gemini's Response:</h4>
                                <p>{assistantResponse}</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Alerts;