import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- COUNTRY BOUNDARIES DATA ---
const COUNTRIES = [
  { name: "Canada", bounds: { north: 83.11, south: 41.68, west: -141.00, east: -52.64 }},
  { name: "United States", bounds: { north: 71.41, south: 18.91, west: -179.78, east: -66.95 }},
  { name: "Greenland", bounds: { north: 83.63, south: 59.78, west: -73.04, east: -12.21 }},
  { name: "Iceland", bounds: { north: 66.54, south: 63.40, west: -24.54, east: -13.50 }},
  { name: "Norway", bounds: { north: 71.18, south: 57.98, west: 4.65, east: 31.29 }},
  { name: "Sweden", bounds: { north: 69.06, south: 55.34, west: 11.11, east: 24.17 }},
  { name: "Finland", bounds: { north: 70.09, south: 59.81, west: 20.55, east: 31.59 }},
  { name: "Russia", bounds: { north: 81.86, south: 41.19, west: 19.64, east: -169.05 }},
  { name: "Alaska (USA)", bounds: { north: 71.41, south: 54.78, west: -179.78, east: -129.99 }},
  { name: "Northern Scotland", bounds: { north: 60.86, south: 54.63, west: -8.65, east: -0.73 }},
  { name: "Northern Ireland", bounds: { north: 58.50, south: 54.00, west: -8.50, east: -5.40 }},
  { name: "Denmark", bounds: { north: 57.75, south: 54.56, west: 8.08, east: 15.16 }},
  { name: "Estonia", bounds: { north: 59.68, south: 57.52, west: 21.84, east: 28.21 }},
  { name: "Latvia", bounds: { north: 58.09, south: 55.67, west: 21.01, east: 28.24 }},
  { name: "Lithuania", bounds: { north: 56.45, south: 53.90, west: 21.06, east: 26.84 }},
  { name: "Mongolia", bounds: { north: 52.15, south: 41.58, west: 87.75, east: 119.92 }},
  { name: "Kazakhstan", bounds: { north: 55.45, south: 40.93, west: 46.49, east: 87.31 }},
  { name: "Siberia (Russia)", bounds: { north: 77.00, south: 50.00, west: 60.00, east: 180.00 }},
];

// Function to check if point is inside country bounds
const isPointInCountry = (lat, lng, country) => {
  const { bounds } = country;
  // Handle longitude wrap-around for Russia
  if (bounds.west > bounds.east) {
    return lat >= bounds.south && lat <= bounds.north && 
           (lng >= bounds.west || lng <= bounds.east);
  }
  return lat >= bounds.south && lat <= bounds.north && 
         lng >= bounds.west && lng <= bounds.east;
};

// --- COMPACT DASHBOARD STYLES ---
const DashboardStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        :root {
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
            
            --primary: #7C3AED;
            --primary-light: #A855F7;
            --primary-dark: #5B21B6;
            --accent: #F59E0B;
            --success: #10B981;
            --danger: #EF4444;
            --warning: #F59E0B;
            
            --bg-primary: #0F172A;
            --bg-secondary: #1E293B;
            --bg-tertiary: #334155;
            --border-primary: rgba(255, 255, 255, 0.1);
            --border-secondary: rgba(255, 255, 255, 0.05);
            
            --text-primary: #F8FAFC;
            --text-secondary: #CBD5E1;
            --text-tertiary: #94A3B8;
            --text-quaternary: #64748B;
        }

        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body {
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            font-family: var(--font-sans);
            color: var(--text-primary);
            min-height: 100vh;
        }
        
        #root {
            width: 100%;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        
        .dashboard-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 1.5rem;
        }
        
        .glass-panel { 
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.05) 0%, 
                rgba(255, 255, 255, 0.02) 100%);
            border: 1px solid var(--border-primary);
            border-radius: 12px;
            backdrop-filter: blur(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .glass-panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.1) 50%, 
                transparent 100%);
            pointer-events: none;
        }
        
        .glass-panel:hover {
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        #map { 
            height: 400px;
            border-radius: 8px; 
            width: 100%;
            border: 1px solid var(--border-secondary);
            overflow: hidden;
        }

        .table-container { 
            height: 300px;
            overflow-y: auto;
            border-radius: 8px;
            border: 1px solid var(--border-secondary);
        }

        .table-container::-webkit-scrollbar { 
            width: 6px; 
        }
        .table-container::-webkit-scrollbar-track { 
            background: transparent; 
        }
        .table-container::-webkit-scrollbar-thumb { 
            background: linear-gradient(180deg, var(--primary), var(--primary-dark));
            border-radius: 3px;
            transition: background 0.2s;
        }
        .table-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, var(--primary-light), var(--primary));
        }
        
        .time-slider { 
            width: 100%; 
            height: 6px; 
            border-radius: 3px; 
            background: linear-gradient(90deg, 
                rgba(255,255,255,0.1) 0%, 
                rgba(124, 58, 237, 0.3) 50%, 
                rgba(255,255,255,0.1) 100%);
            -webkit-appearance: none; 
            appearance: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .time-slider:hover {
            height: 8px;
            background: linear-gradient(90deg, 
                rgba(255,255,255,0.15) 0%, 
                rgba(124, 58, 237, 0.4) 50%, 
                rgba(255,255,255,0.15) 100%);
        }
        
        .time-slider::-webkit-slider-thumb { 
            -webkit-appearance: none; 
            appearance: none; 
            width: 18px; 
            height: 18px; 
            border-radius: 50%; 
            background: linear-gradient(135deg, var(--primary-light), var(--primary));
            cursor: grab;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
            transition: all 0.2s ease;
        }
        
        .time-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }
        
        .time-slider::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.05);
        }
        
        .time-slider::-moz-range-thumb { 
            width: 18px; 
            height: 18px; 
            border-radius: 50%; 
            background: linear-gradient(135deg, var(--primary-light), var(--primary));
            cursor: grab;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .kp-value {
            font-size: 4rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, #60A5FA, #3B82F6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 0.9;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s;
        }
        
        .btn-primary:hover::before {
            left: 100%;
        }
        
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-primary);
            color: var(--text-primary);
            backdrop-filter: blur(10px);
            transition: all 0.2s ease;
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--border-primary);
            transform: translateY(-1px);
        }

        .status-indicator {
            position: relative;
            overflow: hidden;
        }
        
        .status-indicator::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, var(--success) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            animation: pulse-glow 2s ease-in-out infinite;
            pointer-events: none;
        }
        
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }

        .country-item {
            transition: all 0.2s ease;
        }
        
        .country-item:hover {
            background: rgba(124, 58, 237, 0.1);
            transform: translateX(4px);
        }

        @media (max-width: 768px) {
            .dashboard-container {
                padding: 1rem;
            }
            
            #map {
                height: 300px;
            }
            
            .table-container {
                height: 200px;
            }
        }

        button:focus-visible,
        input:focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
        }
    `}</style>
);

const KpDashboard = () => {
    // --- State Management ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiData, setApiData] = useState(null);
    const [sliderValue, setSliderValue] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationIntervalMs, setAnimationIntervalMs] = useState(150);
    const [affectedCountries, setAffectedCountries] = useState([]);

    // --- Refs ---
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const auroraOval = useRef(null);
    const terminatorLine = useRef(null);

    // --- Constants ---
    const API_URL = 'http://127.0.0.1:8001/api/forecast';
    const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY';

    // --- Utility Functions ---
    const updateAffectedCountries = useCallback((auroraPoints) => {
        const countries = new Set();
        
        auroraPoints.forEach(point => {
            COUNTRIES.forEach(country => {
                if (isPointInCountry(point.lat, point.lng, country)) {
                    countries.add(country.name);
                }
            });
        });
        
        setAffectedCountries(Array.from(countries).sort());
    }, []);

    // --- Map and Data Functions ---
    const initMap = useCallback(() => {
        if (mapRef.current && !mapInstance.current) {
            try {
                const mapStyles = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}];
                
                mapInstance.current = new window.google.maps.Map(mapRef.current, { 
                    center: { lat: 50, lng: -95 }, 
                    zoom: 3, 
                    disableDefaultUI: true, 
                    zoomControl: true, 
                    styles: mapStyles,
                    minZoom: 3,
                    maxZoom: 10,
                    restriction: {
                        latLngBounds: {
                            north: 85,
                            south: -85,
                            west: -180,
                            east: 180
                        },
                        strictBounds: true
                    }
                });
                
                window.google.maps.event.addListener(mapInstance.current, 'error', (error) => {
                    console.error('Google Maps error:', error);
                    if (error.message && error.message.includes('Billing')) {
                        setError('Google Maps API billing not enabled. Please enable billing in Google Cloud Console.');
                    }
                });
                
            } catch (error) {
                console.error('Error initializing Google Maps:', error);
                setError('Failed to initialize Google Maps. Please check your API key and billing settings.');
            }
        }
    }, []);

    const updateMap = useCallback((forecastPoint) => {
        if (!mapInstance.current || !apiData) return;
        if (auroraOval.current) auroraOval.current.setMap(null);
        if (terminatorLine.current) terminatorLine.current.setMap(null);
        const geomagLat = forecastPoint.geomagnetic_latitude;
        const targetTime = new Date(forecastPoint.time);
        const isOnNightSide = (point) => {
            const sunLon = (targetTime.getUTCHours() + targetTime.getUTCMinutes() / 60 - 12) * 15;
            let pointLon = point.lng;
            while (pointLon > 180) pointLon -= 360;
            while (pointLon < -180) pointLon += 360;
            let diff = pointLon - sunLon;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            return Math.abs(diff) > 90;
        };
        const auroraPoints = [];
        const poleLatRad = (80.37 * Math.PI) / 180;
        const poleLonRad = (-72.62 * Math.PI) / 180;
        const geomagLatRad = (geomagLat * Math.PI) / 180;
        for (let i = -180; i <= 180; i += 5) {
            const geomagLonRad = (i * Math.PI) / 180;
            const latRad = Math.asin(Math.sin(poleLatRad) * Math.sin(geomagLatRad) + Math.cos(poleLatRad) * Math.cos(geomagLatRad) * Math.cos(geomagLonRad));
            let lonRad = poleLonRad + Math.atan2(Math.cos(geomagLatRad) * Math.sin(geomagLonRad), Math.cos(poleLatRad) * Math.sin(geomagLatRad) - Math.sin(poleLatRad) * Math.cos(geomagLatRad) * Math.cos(geomagLonRad));
            auroraPoints.push({ lat: (latRad * 180) / Math.PI, lng: (lonRad * 180) / Math.PI });
        }
        const nightSideAuroraPoints = auroraPoints.filter(p => isOnNightSide(p));
        let auroraColor = '#7C3AED';
        if (forecastPoint.forecast_kp >= 7) auroraColor = '#ef4444';
        else if (forecastPoint.forecast_kp >= 5) auroraColor = '#f59e0b';
        if (nightSideAuroraPoints.length > 1) {
             auroraOval.current = new window.google.maps.Polygon({ paths: nightSideAuroraPoints, strokeColor: auroraColor, strokeOpacity: 0.8, strokeWeight: 2, fillColor: auroraColor, fillOpacity: 0.3, map: mapInstance.current });
        }
        terminatorLine.current = new window.google.maps.Polyline({ path: apiData.solar_terminator, strokeColor: '#fbbf24', strokeOpacity: 0.5, strokeWeight: 2, map: mapInstance.current });
        
        updateAffectedCountries(nightSideAuroraPoints);
    }, [apiData, updateAffectedCountries]);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(API_URL, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
                
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        errorDetail = errorData.detail || errorData.message || errorDetail;
                    } else {
                        const textError = await response.text();
                        if (textError && !textError.trim().toLowerCase().startsWith('<!doctype html>')) {
                            errorDetail = textError;
                        }
                    }
                } catch (parseError) {
                    console.warn('Could not parse error response:', parseError);
                }
                
                if (response.status === 500) {
                    errorDetail = "Backend server error. The NOAA data sources may be temporarily unavailable.";
                } else if (response.status === 504) {
                    errorDetail = "Gateway timeout. NOAA servers are not responding. Please try again later.";
                } else if (response.status === 503) {
                    errorDetail = "Service temporarily unavailable. Please try again in a few minutes.";
                } else if (response.status === 0 || response.status >= 400) {
                    errorDetail = "Could not connect to the backend server. Please ensure it is running and accessible.";
                }
                
                throw new Error(errorDetail);
            }
            
            const data = await response.json();
            
            if (!data || !data.forecast_72h || !Array.isArray(data.forecast_72h)) {
                throw new Error("Invalid data format received from server");
            }
            
            setApiData(data);
            setError(null);
            console.log('Data fetched successfully:', new Date().toISOString());
            
        } catch (err) {
            console.error("Fetch error:", err);
            
            if (err.name === 'AbortError') {
                setError("Request timeout. The server is taking too long to respond.");
            } else if (err.message.includes('Failed to fetch')) {
                setError("Network error. Please check your internet connection and ensure the backend server is running.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // --- Side Effects ---
    useEffect(() => {
        const scriptId = 'google-maps-script';
        const existingScript = document.getElementById(scriptId);
        
        const init = () => {
            if (window.google && window.google.maps && !mapInstance.current) {
                try {
                    initMap();
                } catch (error) {
                    console.error('Error initializing Google Maps:', error);
                    if (error.message && error.message.includes('BillingNotEnabledMapError')) {
                        setError('Google Maps API billing is not enabled. Please enable billing in your Google Cloud Console to use the map feature.');
                    } else {
                        setError('Failed to initialize map. Please check your internet connection and API configuration.');
                    }
                }
            }
        };
        
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = init;
            script.onerror = () => {
                console.error('Failed to load Google Maps API');
                setError('Failed to load Google Maps API. Please check your API key, internet connection, and ensure billing is enabled.');
            };
            document.head.appendChild(script);
        } else {
            init();
        }
    }, [initMap, GOOGLE_MAPS_API_KEY]);

    useEffect(() => {
        fetchData();
        
        let retryCount = 0;
        const maxRetries = 3;
        const baseInterval = 5 * 60 * 1000;
        
        const createInterval = () => {
            const interval = setInterval(async () => {
                try {
                    await fetchData();
                    retryCount = 0;
                } catch (error) {
                    retryCount = Math.min(retryCount + 1, maxRetries);
                    console.warn(`Fetch failed, retry ${retryCount}/${maxRetries}`);
                    
                    if (retryCount >= maxRetries) {
                        clearInterval(interval);
                        setTimeout(() => createInterval(), baseInterval * Math.pow(2, retryCount - 1));
                    }
                }
            }, baseInterval);
            return interval;
        };
        
        const intervalId = createInterval();
        return () => clearInterval(intervalId);
    }, [fetchData]);

    useEffect(() => {
        let animationTimer;
        if (isPlaying) {
            animationTimer = setInterval(() => {
                setSliderValue(prevValue => (prevValue >= 71 ? 0 : prevValue + 1));
            }, animationIntervalMs);
        }
        return () => clearInterval(animationTimer);
    }, [isPlaying, animationIntervalMs]);
    
    useEffect(() => {
        if (apiData) {
            const forecastPoint = apiData.forecast_72h[sliderValue];
            if (forecastPoint) {
                updateMap(forecastPoint);
            }
        }
    }, [sliderValue, apiData, updateMap]);

    // --- Event Handlers ---
    const handleSliderChange = (e) => setSliderValue(parseInt(e.target.value, 10));
    const toggleAnimation = () => setIsPlaying(prev => !prev);
    const toggleSpeed = () => setAnimationIntervalMs(prev => (prev === 150 ? 500 : 150));
    const resetToNow = () => {
        if (isPlaying) setIsPlaying(false);
        setSliderValue(0);
    };

    // --- Loading State ---
    if (loading) {
        return (
            <>
                <DashboardStyles />
                <div className="flex flex-col items-center justify-center h-screen">
                    <div className="relative">
                        <svg className="animate-spin h-12 w-12 text-[var(--primary)] mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-20 animate-ping"></div>
                    </div>
                    <p className="text-xl font-medium text-[var(--text-secondary)] mb-2">Fetching Live Solar Data</p>
                    <p className="text-sm text-[var(--text-quaternary)]">Connecting to geomagnetic monitoring systems...</p>
                </div>
            </>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <>
                <DashboardStyles />
                <div className="flex flex-col items-center justify-center h-screen p-4">
                    <div className="glass-panel p-8 max-w-lg text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                            Connection Issue
                        </h2>
                        <p className="text-[var(--text-tertiary)] leading-relaxed mb-6">
                            {error.toString()}
                        </p>
                        
                        <button 
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                fetchData();
                            }}
                            className="btn-primary px-6 py-3 rounded-lg font-medium"
                        >
                            Try Again
                        </button>
                        
                        <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg text-left">
                            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Troubleshooting:</h3>
                            <ul className="text-sm text-[var(--text-tertiary)] space-y-1">
                                <li>• Ensure the backend server is running on port 8000</li>
                                <li>• Check your internet connection</li>
                                <li>• NOAA servers may be temporarily unavailable</li>
                                <li>• Wait a few minutes and try again</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    
    const currentForecastPoint = apiData?.forecast_72h[sliderValue];
    const displayTime = currentForecastPoint ? new Date(currentForecastPoint.time).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '--';
    const displayKp = currentForecastPoint ? currentForecastPoint.forecast_kp.toFixed(2) : '--';

    return (
        <>
            <DashboardStyles />
            <div className="dashboard-container">
                {/* Header */}
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        Aurora Visibility & Geomagnetic Activity
                    </h1>
                </header>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Left Panel - Map */}
                    <div className="lg:col-span-2 glass-panel p-4">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                                Time Control (72 Hours)
                            </h2>
                            
                            {/* Time Display */}
                            <div className="mb-3 text-right">
                                <span className="text-sm text-[var(--text-primary)] font-mono bg-[var(--bg-secondary)] px-3 py-1 rounded">
                                    {displayTime}
                                </span>
                            </div>

                            {/* Slider */}
                            <div className="mb-3">
                                <input 
                                    type="range" 
                                    className="time-slider" 
                                    min="0" 
                                    max="71" 
                                    step="1" 
                                    value={sliderValue} 
                                    onInput={handleSliderChange}
                                    aria-label="Timeline control"
                                />
                                <div className="flex justify-between text-xs text-[var(--text-quaternary)] mt-1">
                                    <span>Now</span>
                                    <span>+24h</span>
                                    <span>+48h</span>
                                    <span>+72h</span>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={toggleAnimation} 
                                        className="btn-primary px-4 py-2 rounded text-sm font-medium flex items-center gap-1"
                                    >
                                        <span>{isPlaying ? '▶' : '▶'}</span>
                                        {isPlaying ? 'Play' : 'Play'}
                                    </button>
                                    <button 
                                        onClick={toggleSpeed} 
                                        className="btn-secondary px-3 py-2 rounded text-sm"
                                    >
                                        {animationIntervalMs === 150 ? 'Slow' : 'Fast'}
                                    </button>
                                    <button 
                                        onClick={resetToNow} 
                                        className="btn-secondary px-3 py-2 rounded text-sm"
                                    >
                                        Reset
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--text-tertiary)]">Kp: {displayKp}</span>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div id="map" ref={mapRef}></div>
                    </div>

                    {/* Right Panel - Current Forecast */}
                    <div className="glass-panel p-4 text-center">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                            Current Forecast
                        </h3>
                        {apiData && (
                            <>
                                <div className="mb-4">
                                    <div className="kp-value mb-2">
                                        {apiData.current_forecast.official_scale}
                                    </div>
                                    <div className="text-xl font-bold text-[var(--text-primary)]">
                                        {apiData.current_forecast.forecast_kp.toFixed(2)} <span className="text-sm font-normal text-[var(--text-tertiary)]">Kp</span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center py-1 px-2 bg-[var(--bg-secondary)] rounded">
                                        <span className="text-[var(--text-tertiary)]">Geomagnetic Latitude:</span>
                                        <span className="font-mono text-[var(--primary)]">
                                            {apiData.current_forecast.geomagnetic_latitude.toFixed(1)}°
                                        </span>
                                    </div>
                                    <button className="w-full btn-primary py-2 rounded text-sm font-medium">
                                        Generate Aviation Report
                                    </button>
                                    <p className="text-xs text-[var(--text-quaternary)] mt-2">
                                        Last updated: {new Date(apiData.last_updated).toLocaleString()}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom Grid - Tables and Affected Regions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Potentially Affected Regions */}
                    <div className="glass-panel p-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                            Potentially Affected Regions
                        </h3>
                        <div className="space-y-2">
                            {affectedCountries.length > 0 ? (
                                affectedCountries.map(country => (
                                    <div key={country} className="country-item flex items-center gap-2 p-2 bg-[var(--bg-secondary)] rounded text-sm">
                                        <div className="w-2 h-2 bg-[var(--success)] rounded-full flex-shrink-0"></div>
                                        <span className="text-[var(--text-primary)]">{country}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-[var(--text-tertiary)] text-sm">
                                        No regions currently affected
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 72-Hour Forecast Table */}
                    <div className="glass-panel p-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                            72-Hour Forecast
                        </h3>
                        {apiData && (
                            <div className="table-container">
                                <table className="w-full text-left text-xs">
                                    <thead className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border-secondary)]">
                                        <tr>
                                            <th className="px-2 py-2 font-medium text-[var(--text-secondary)]">Time</th>
                                            <th className="px-2 py-2 text-center font-medium text-[var(--text-secondary)]">Kp</th>
                                            <th className="px-2 py-2 text-center font-medium text-[var(--text-secondary)]">Lat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-secondary)]">
                                        {apiData.forecast_72h.map((row, index) => (
                                            <tr 
                                                key={row.time} 
                                                className={`hover:bg-[var(--bg-secondary)] transition-colors ${
                                                    index === sliderValue ? 'bg-[var(--primary)]/10' : ''
                                                }`}
                                            >
                                                <td className="px-2 py-2 text-[var(--text-secondary)]">
                                                    {new Date(row.time).toISOString().slice(5, 16).replace('T', ' ')}
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`font-medium ${
                                                        row.forecast_kp >= 7 ? 'text-red-400' : 
                                                        row.forecast_kp >= 5 ? 'text-amber-400' : 
                                                        'text-[var(--text-primary)]'
                                                    }`}>
                                                        {row.forecast_kp.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center font-mono text-[var(--primary)] text-xs">
                                                    {row.geomagnetic_latitude.toFixed(1)}°
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    {/* 24-Hour Observed Table */}
                    <div className="glass-panel p-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                            24-Hour Observed
                        </h3>
                        {apiData && (
                            <div className="table-container">
                                <table className="w-full text-left text-xs">
                                    <thead className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border-secondary)]">
                                        <tr>
                                            <th className="px-2 py-2 font-medium text-[var(--text-secondary)]">Time</th>
                                            <th className="px-2 py-2 text-center font-medium text-[var(--text-secondary)]">Kp</th>
                                            <th className="px-2 py-2 text-center font-medium text-[var(--text-secondary)]">Scale</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-secondary)]">
                                        {apiData.historical_24h.map(row => (
                                            <tr key={row.time} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                                <td className="px-2 py-2 text-[var(--text-secondary)]">{row.time}</td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`font-medium ${
                                                        row.kp_index >= 7 ? 'text-red-400' : 
                                                        row.kp_index >= 5 ? 'text-amber-400' : 
                                                        'text-[var(--text-primary)]'
                                                    }`}>
                                                        {row.kp_index.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`font-medium px-1 py-0.5 rounded text-xs ${
                                                        row.official_scale === 'G4' || row.official_scale === 'G5' ? 'bg-red-500/20 text-red-400' :
                                                        row.official_scale === 'G2' || row.official_scale === 'G3' ? 'bg-amber-500/20 text-amber-400' :
                                                        row.official_scale === 'G1' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-[var(--primary)]/20 text-[var(--primary)]'
                                                    }`}>
                                                        {row.official_scale}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default KpDashboard;
