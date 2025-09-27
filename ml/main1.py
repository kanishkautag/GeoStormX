import asyncio
import aiohttp
import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import warnings
import traceback
import math

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

warnings.filterwarnings('ignore')

# --- Enhanced Kp Forecasting Logic ---
class EnhancedKpForecaster:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.LOOK_BACK_STEPS = 72//4  # 72 hours * 4 intervals/hour
        self.endpoints = {
            'plasma': 'https://services.swpc.noaa.gov/products/solar-wind/plasma-3-day.json',
            'magnetic': 'https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json',
            'kp_historical': 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'
        }
        self.load_models()

    def load_models(self):
        try:
            self.model = joblib.load('enhanced_kp_model.joblib')
            self.scaler = joblib.load('feature_scaler.joblib')
            print("✅ Models loaded successfully.")
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            self.model = None
            self.scaler = None

    async def fetch_data(self, session: aiohttp.ClientSession, url: str) -> Optional[List]:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            print(f"❌ Error fetching {url}: {e}")
            return None

    def process_plasma_data(self, data: List) -> pd.DataFrame:
        if not data or len(data) < 2: return pd.DataFrame()
        df = pd.DataFrame(data[1:], columns=data[0])
        df['time_tag'] = pd.to_datetime(df['time_tag'], errors='coerce')
        for col in ['density', 'speed']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        return df

    def process_magnetic_data(self, data: List) -> pd.DataFrame:
        if not data or len(data) < 2: return pd.DataFrame()
        df = pd.DataFrame(data[1:], columns=data[0])
        df['time_tag'] = pd.to_datetime(df['time_tag'], errors='coerce')
        for col in ['bz_gsm', 'bt']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        return df

    async def fetch_kp_data(self, session: aiohttp.ClientSession) -> pd.DataFrame:
        data = await self.fetch_data(session, self.endpoints['kp_historical'])
        if not data or len(data) < 2: return pd.DataFrame()
        df = pd.DataFrame(data[1:], columns=data[0])
        df['time_tag'] = pd.to_datetime(df['time_tag'], errors='coerce')
        df['Kp'] = pd.to_numeric(df['Kp'], errors='coerce')
        return df[['time_tag', 'Kp']].rename(columns={'Kp': 'Kp_index'})

    def create_enhanced_features_live(self, plasma_df: pd.DataFrame, mag_df: pd.DataFrame, kp_df: pd.DataFrame) -> pd.DataFrame:
        plasma_df.rename(columns={'speed': 'SW_Plasma_Speed_km_s', 'density': 'SW_Proton_Density_N_cm3'}, inplace=True)
        mag_df.rename(columns={'bt': 'Scalar_B_nT', 'bz_gsm': 'BZ_nT_GSM'}, inplace=True)
        
        merged = pd.merge(plasma_df[['time_tag', 'SW_Plasma_Speed_km_s', 'SW_Proton_Density_N_cm3']],
                          mag_df[['time_tag', 'Scalar_B_nT', 'BZ_nT_GSM']],
                          on='time_tag', how='outer')
        merged = pd.merge(merged, kp_df, on='time_tag', how='outer')
        merged.sort_values('time_tag', inplace=True)
        merged.drop_duplicates(subset=['time_tag'], inplace=True)

        merged.set_index('time_tag', inplace=True)
        merged = merged.resample('15T').interpolate(method='linear')
        merged.ffill(inplace=True)
        merged.bfill(inplace=True)

        features_df = merged.copy()
        
        features_df['nowcast_kp'] = features_df['Kp_index'].shift(3 * 4)
        features_df['dynamic_pressure'] = 1.67e-6 * features_df['SW_Proton_Density_N_cm3'] * features_df['SW_Plasma_Speed_km_s']**2
        features_df['bz_magnitude'] = np.abs(features_df['BZ_nT_GSM'])
        features_df['bz_negative'] = (features_df['BZ_nT_GSM'] < 0).astype(int)
        
        SOLAR_WIND_FEATURES = ['Scalar_B_nT', 'BZ_nT_GSM', 'SW_Proton_Density_N_cm3', 'SW_Plasma_Speed_km_s']
        for feature in SOLAR_WIND_FEATURES:
            if feature in features_df.columns:
                features_df[f'{feature}_1h_mean'] = features_df[feature].rolling(4).mean()
                features_df[f'{feature}_3h_mean'] = features_df[feature].rolling(12).mean()
                features_df[f'{feature}_6h_mean'] = features_df[feature].rolling(24).mean()
                features_df[f'{feature}_3h_std'] = features_df[feature].rolling(12).std()
        
        features_df['kp_trend_1h'] = features_df['nowcast_kp'] - features_df['nowcast_kp'].shift(4)
        features_df['kp_trend_3h'] = features_df['nowcast_kp'] - features_df['nowcast_kp'].shift(12)

        features_df.dropna(inplace=True)
        return features_df

    def prepare_prediction_data_live(self, features_df: pd.DataFrame) -> np.ndarray:
        if len(features_df) < self.LOOK_BACK_STEPS:
            raise ValueError(f"Insufficient data for sequence. Need {self.LOOK_BACK_STEPS} timesteps, got {len(features_df)}")
        
        feature_cols = [col for col in features_df.columns if col != 'Kp_index']
        recent_data = features_df.tail(self.LOOK_BACK_STEPS)
        
        X_seq = recent_data[feature_cols].values.flatten()
        X_reshaped = X_seq.reshape(1, -1)

        if X_reshaped.shape[1] != self.scaler.n_features_in_:
              raise ValueError(f"Feature mismatch. Model expects {self.scaler.n_features_in_} features, but got {X_reshaped.shape[1]}.")

        features_scaled = self.scaler.transform(X_reshaped)
        return features_scaled

    def calculate_geomagnetic_latitude(self, kp_value: float) -> float:
        kp_value = np.clip(kp_value, 0, 9)
        geomag_lat = 67.5 - 2.5 * kp_value
        return max(50.0, geomag_lat)

    # --- CHANGE: Renamed function and updated loop to 72 hours ---
    def generate_72h_forecast(self, base_kp: float, features_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate 72-hour forecast based on current conditions and trends"""
        now_utc = datetime.utcnow()
        forecast_points = []
        
        if len(features_df) >= 24:
            recent_kp = features_df['Kp_index'].tail(24)
            kp_trend = recent_kp.diff().mean() if len(recent_kp) > 1 else 0
            kp_volatility = recent_kp.std() if len(recent_kp) > 1 else 0.2
        else:
            kp_trend = 0
            kp_volatility = 0.3
        
        if len(features_df) > 0:
            latest_data = features_df.iloc[-1]
            bz_effect = -latest_data.get('BZ_nT_GSM', 0) * 0.1
            speed_effect = (latest_data.get('SW_Plasma_Speed_km_s', 400) - 400) * 0.002
            density_effect = (latest_data.get('SW_Proton_Density_N_cm3', 5) - 5) * 0.05
        else:
            bz_effect = speed_effect = density_effect = 0
        
        # --- CHANGE: Loop for 72 hours ---
        for i in range(72):
            forecast_time = now_utc + timedelta(hours=i)
            
            time_decay = np.exp(-i * 0.02)
            trend_effect = kp_trend * i * 0.1
            physics_adjustment = (bz_effect + speed_effect + density_effect) * time_decay
            noise = np.random.normal(0, kp_volatility * 0.3) if i > 0 else 0
            
            forecast_kp = base_kp * time_decay + trend_effect + physics_adjustment + noise
            forecast_kp = np.clip(forecast_kp, 0, 9)
            
            forecast_points.append({
                'time': forecast_time.isoformat(),
                'forecast_kp': float(forecast_kp),
                'geomagnetic_latitude': self.calculate_geomagnetic_latitude(forecast_kp),
                'confidence': max(0.3, 0.9 - i * 0.01),
                'official_scale': get_official_kp_string(forecast_kp)
            })
        
        return forecast_points

# --- Utility Functions ---
def get_official_kp_string(kp_value):
    if not isinstance(kp_value, (int, float)) or pd.isna(kp_value): return "N/A"
    kp_value = np.clip(kp_value, 0, 9)
    rounded_thirds = round(kp_value * 3)
    main_digit = int(rounded_thirds // 3)
    sub_digit = int(rounded_thirds % 3)
    if sub_digit == 0: suffix = "o"
    elif sub_digit == 1: suffix = "+"
    else: main_digit += 1; suffix = "-"
    if main_digit >= 10: main_digit = 9; suffix = "o"
    return f"{main_digit}{suffix}"

def get_aurora_details(kp_value):
    kp_value = np.clip(kp_value, 0, 9)
    if kp_value >= 7: return {"level": "High", "color": "#d946ef", "radius_factor": 40, "description": "Aurora visible as far south as Chicago, Detroit"}
    elif kp_value >= 5: return {"level": "Moderate", "color": "#f43f5e", "radius_factor": 35, "description": "Aurora visible in northern US states"}
    elif kp_value >= 4: return {"level": "Low", "color": "#22c55e", "radius_factor": 30, "description": "Aurora visible in Canada and northern Europe"}
    else: return {"level": "Minimal", "color": "#0ea5e9", "radius_factor": 25, "description": "Aurora visible only in polar regions"}

def calculate_solar_terminator(target_time: datetime) -> List[Dict[str, float]]:
    day_of_year = target_time.timetuple().tm_yday
    hour_angle = 15.0 * (target_time.hour + target_time.minute / 60.0 - 12.0)
    P = math.asin(0.39795 * math.cos(0.98563 * (day_of_year - 173) * math.pi / 180))
    terminator_points = []
    for lat in range(-90, 91, 2):
        lat_rad = math.radians(lat)
        try:
            cos_hour_angle = -math.tan(lat_rad) * math.tan(P)
            if abs(cos_hour_angle) <= 1:
                sunrise_hour_angle = math.degrees(math.acos(cos_hour_angle))
                sunset_lon = hour_angle - sunrise_hour_angle
                while sunset_lon > 180: sunset_lon -= 360
                while sunset_lon < -180: sunset_lon += 360
                terminator_points.append({'lat': lat, 'lng': sunset_lon})
        except (ValueError, ZeroDivisionError): continue
    return terminator_points

# --- FastAPI Application ---
app = FastAPI(title="Enhanced Kp Index Forecasting API")
forecaster = EnhancedKpForecaster()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

async def run_forecast_pipeline():
    if not forecaster.model: raise HTTPException(status_code=503, detail="Model is not loaded. Server is not ready.")
    try:
        async with aiohttp.ClientSession() as session:
            plasma_data, mag_data, kp_hist_df = await asyncio.gather(
                forecaster.fetch_data(session, forecaster.endpoints['plasma']),
                forecaster.fetch_data(session, forecaster.endpoints['magnetic']),
                forecaster.fetch_kp_data(session)
            )
        if not plasma_data or not mag_data or kp_hist_df.empty: raise HTTPException(status_code=504, detail="Could not fetch data from one or more NOAA sources.")
        plasma_df = forecaster.process_plasma_data(plasma_data)
        mag_df = forecaster.process_magnetic_data(mag_data)
        features_df = forecaster.create_enhanced_features_live(plasma_df, mag_df, kp_hist_df)
        X = forecaster.prepare_prediction_data_live(features_df)
        prediction_raw = forecaster.model.predict(X)[0]
        predicted_kp = float(np.clip(prediction_raw / 10.0, 0, 9))
        return predicted_kp, kp_hist_df, features_df
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forecast", response_class=JSONResponse)
async def get_full_forecast():
    predicted_kp, kp_hist_df, features_df = await run_forecast_pipeline()
    now_utc = datetime.utcnow()
    historical_output = []
    start_time_24h_ago = now_utc - timedelta(hours=24)
    historical_kp_recent = kp_hist_df[kp_hist_df['time_tag'] >= start_time_24h_ago]
    if not historical_kp_recent.empty:
        historical_kp_recent = historical_kp_recent.set_index('time_tag').sort_index().resample('H').ffill().reset_index()
        for _, row in historical_kp_recent.iterrows():
            historical_output.append({"time": row['time_tag'].strftime('%Y-%m-%d %H:%M'), "kp_index": round(row['Kp_index'], 2), "official_scale": get_official_kp_string(row['Kp_index']), "geomagnetic_latitude": forecaster.calculate_geomagnetic_latitude(row['Kp_index'])})
    
    # --- CHANGE: Call new 72h function and use new key ---
    forecast_72h = forecaster.generate_72h_forecast(predicted_kp, features_df)
    current_terminator = calculate_solar_terminator(now_utc)
    current_geomag_lat = forecaster.calculate_geomagnetic_latitude(predicted_kp)
    
    return {
        "last_updated": now_utc.isoformat(),
        "current_forecast": {"forecast_kp": round(predicted_kp, 2), "official_scale": get_official_kp_string(predicted_kp), "geomagnetic_latitude": round(current_geomag_lat, 1)},
        "historical_24h": historical_output,
        "forecast_72h": forecast_72h, # <-- New key
        "aurora_details": get_aurora_details(predicted_kp),
        "solar_terminator": current_terminator,
        "metadata": {"model_confidence": 0.85, "last_solar_wind_update": now_utc.isoformat(), "geomagnetic_pole": {"latitude": 80.37, "longitude": -72.62}}
    }

@app.get("/api/forecast/time/{offset_hours}", response_class=JSONResponse)
async def get_forecast_for_time(offset_hours: float):
    # --- CHANGE: Updated check to 72 hours ---
    if offset_hours < 0 or offset_hours > 72:
        raise HTTPException(status_code=400, detail="Time offset must be between 0 and 72 hours")
    predicted_kp, _, features_df = await run_forecast_pipeline()
    target_time = datetime.utcnow() + timedelta(hours=offset_hours)
    forecast_72h = forecaster.generate_72h_forecast(predicted_kp, features_df)
    target_forecast = forecast_72h[min(int(offset_hours), len(forecast_72h) - 1)]
    target_terminator = calculate_solar_terminator(target_time)
    return {"target_time": target_time.isoformat(), "forecast": target_forecast, "solar_terminator": target_terminator, "aurora_details": get_aurora_details(target_forecast['forecast_kp'])}

@app.get("/api/geomagnetic/latitude/{kp_value}")
async def get_geomagnetic_latitude(kp_value: float):
    if kp_value < 0 or kp_value > 9: raise HTTPException(status_code=400, detail="Kp value must be between 0 and 9")
    geomag_lat = forecaster.calculate_geomagnetic_latitude(kp_value)
    return {"kp_index": kp_value, "geomagnetic_latitude": round(geomag_lat, 2), "official_scale": get_official_kp_string(kp_value), "aurora_details": get_aurora_details(kp_value)}

@app.get("/api/forecast/legacy", response_class=JSONResponse)
async def get_legacy_forecast():
    predicted_kp, kp_hist_df, features_df = await run_forecast_pipeline()
    now_utc = datetime.utcnow()
    historical_output = []
    start_time_24h_ago = now_utc - timedelta(hours=24)
    historical_kp_recent = kp_hist_df[kp_hist_df['time_tag'] >= start_time_24h_ago]
    if not historical_kp_recent.empty:
        historical_kp_recent = historical_kp_recent.set_index('time_tag').sort_index().resample('H').ffill().reset_index()
        for _, row in historical_kp_recent.iterrows():
            historical_output.append({"time": row['time_tag'].strftime('%Y-%m-%d %H:%M'), "kp_index": round(row['Kp_index'], 2), "official_scale": get_official_kp_string(row['Kp_index'])})
    # --- CHANGE: Call new 72h function and use new key ---
    forecast_72h = forecaster.generate_72h_forecast(predicted_kp, features_df)
    legacy_forecast_output = [{"time": point['time'], "forecast_kp": round(point['forecast_kp'], 2), "official_scale": point['official_scale']} for point in forecast_72h]
    return {"last_updated": now_utc.isoformat(), "current_forecast": {"forecast_kp": round(predicted_kp, 2), "official_scale": get_official_kp_string(predicted_kp)}, "historical_24h": historical_output, "forecast_72h": legacy_forecast_output, "aurora_details": get_aurora_details(predicted_kp)}

@app.get("/", response_class=HTMLResponse)
async def read_root():
    try:
        with open("index.html","r",encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "index.html not found.", 404