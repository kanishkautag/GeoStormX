import { motion } from 'framer-motion';
import { Bell, Bot, Send, AlertTriangle, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';

// Make sure the path to your alerts.json file is correct
import alertsData from './alerts.json';
import './Alerts.css';

// Helper function to parse a concise title from the full alert message
const parseAlertTitle = (message) => {
    const lines = message.split('\r\n');
    const titleLine = lines.find(line =>
        line.startsWith('ALERT:') ||
        line.startsWith('WARNING:') ||
        line.startsWith('WATCH:') ||
        line.startsWith('SUMMARY:')
    );
    return titleLine ? titleLine.replace(/ALERT:|WARNING:|WATCH:|SUMMARY:/, '').trim() : 'General Alert';
};


const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [customMessage, setCustomMessage] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // --- Configuration ---
    const API_BASE_URL = 'http://localhost:8000';

    useEffect(() => {
        setAlerts(alertsData);
        if (alertsData.length > 0) {
            setSelectedAlert(alertsData[0]);
        }
    }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 4000);
    };

    const handleAnalyze = (e) => {
        e.preventDefault();
        if (!selectedAlert) return;

        setIsAnalyzing(true);
        setAiResponse('');

        setTimeout(() => {
            const impacts = selectedAlert.message.split('Potential Impacts:')[1] || 'No specific impacts listed.';
            const serialMatch = selectedAlert.message.match(/Serial Number: (\d+)/);
            const serialNumber = serialMatch ? serialMatch[1] : 'N/A';
            const draft = `**AI Impact Analysis & Notification Draft:**\n\nBased on NOAA Alert (Serial: ${serialNumber}), the primary concern is **${parseAlertTitle(selectedAlert.message)}**. \n\n**Potential Impacts:**\n${impacts.trim()}\n\n**Recommendation:**\nMonitor affected systems. A detailed notification has been drafted below for stakeholder communication.`;

            setAiResponse(draft);
            setIsAnalyzing(false);

            const initialDraft = `To All Stakeholders,\n\nPlease be advised of the following space weather event:\n\n**Event:** ${parseAlertTitle(selectedAlert.message)}\n**Details:** A space weather event is currently active, with potential impacts including: ${impacts.trim()}\n\nOur teams are actively monitoring the situation. Further updates will be provided as necessary.\n\nRegards,\nOperations Team`;
            setCustomMessage(initialDraft);
        }, 2000);
    };

    const handleSend = async () => {
        if (!customMessage) {
            showNotification('Cannot send an empty notification.', 'error');
            return;
        }
        if (!phoneNumber) {
            showNotification('Please enter a recipient phone number.', 'error');
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/send-sms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: phoneNumber, body: customMessage }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send SMS');
            }

            const result = await response.json();
            showNotification(`SMS sent successfully! SID: ${result.sid}`, 'success');
            setCustomMessage('');
            setAiResponse('');
            setPhoneNumber('');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="page-container">
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <div className="header">
                <div className="header-title">
                    <h1>Real-Time Notifications</h1>
                    <p>Monitor and respond to live space weather alerts from NOAA.</p>
                </div>
            </div>

            <motion.div
                className="alerts-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Panel 1: Recent Alerts Feed */}
                <div className="alert-panel">
                    <h2 className="panel-title"><Bell /> Recent NOAA Alerts</h2>
                    <div className="alerts-feed">
                        {alerts.slice(0, 10).map((alert, index) => (
                            <div
                                key={index}
                                className={`alert-item ${selectedAlert && selectedAlert.message === alert.message ? 'selected' : ''}`}
                                onClick={() => setSelectedAlert(alert)}
                            >
                                <div className="alert-icon"><AlertTriangle size={20} /></div>
                                <div className="alert-content">
                                    <p className="alert-title">{parseAlertTitle(alert.message)}</p>
                                    <p className="alert-timestamp">{new Date(alert.issue_datetime).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel 2: AI Analysis & Notification Composer */}
                <div className="alert-panel">
                    <h2 className="panel-title"><Send /> Notification Composer</h2>

                    <div className="form-section">
                        <h3>Selected Alert Details</h3>
                        <div className="response-box">
                            {selectedAlert ? (
                                <>
                                    <h4>{parseAlertTitle(selectedAlert.message)}</h4>
                                    <p>{selectedAlert.message}</p>
                                </>
                            ) : (
                                <p>Select an alert from the feed to begin.</p>
                            )}
                        </div>
                    </div>

                    {aiResponse && (
                        <div className="form-section">
                            <div className="response-box ai-response">
                                <h4><Bot size={16} /> AI Analysis</h4>
                                <p>{aiResponse}</p>
                            </div>
                        </div>
                    )}

                    <div className="form-section">
                        <h3>Draft Notification</h3>
                        <textarea
                            className="textarea-field"
                            rows="8"
                            placeholder="Add your message or let the AI draft one for you..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Recipient</h3>
                         <div className="phone-input-wrapper">
                             <Phone className="phone-icon" size={20} />
                             <input
                                 type="tel"
                                 className="input-field"
                                 placeholder="Enter phone number (e.g., +14155552671)"
                                 value={phoneNumber}
                                 onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn-primary" onClick={handleAnalyze} disabled={!selectedAlert || isAnalyzing}>
                            {isAnalyzing ? 'Analyzing...' : 'Analyze & Draft Notification'}
                        </button>
                        <button className="btn-alert" onClick={handleSend} disabled={!customMessage || isSending}>
                            {isSending ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Alerts;