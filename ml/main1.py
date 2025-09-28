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
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import os
import google.generativeai as genai
from serpapi import GoogleSearch

# --- Load Environment Variables ---
load_dotenv()
warnings.filterwarnings('ignore')

# --- Configure APIs ---
try:
    # Gemini Config
    gemini_api_key = os.getenv("GOOGLE_API_KEY")
    if not gemini_api_key: raise ValueError("GOOGLE_API_KEY not found.")
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
    print("✅ Gemini API configured.")
    
    # SerpAPI Config Check
    serpapi_api_key = os.getenv("SERPAPI_API_KEY")
    if not serpapi_api_key: raise ValueError("SERPAPI_API_KEY not found.")
    print("✅ SerpAPI key loaded.")

except Exception as e:
    print(f"❌ API Key Error: {e}. Please ensure keys are set in your .env file.")
    gemini_model = None

# --- Enhanced Kp Forecasting Logic ---
class EnhancedKpForecaster:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.LOOK_BACK_STEPS = 72//4
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
        merged = pd.merge(plasma_df[['time_tag', 'SW_Plasma_Speed_km_s', 'SW_Proton_Density_N_cm3']], mag_df[['time_tag', 'Scalar_B_nT', 'BZ_nT_GSM']], on='time_tag', how='outer')
        merged = pd.merge(merged, kp_df, on='time_tag', how='outer')
        merged.sort_values('time_tag', inplace=True)
        merged.drop_duplicates(subset=['time_tag'], inplace=True)
        merged.set_index('time_tag', inplace=True)
        merged = merged.resample('15T').interpolate(method='linear')
        merged.ffill(inplace=True); merged.bfill(inplace=True)
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
        if len(features_df) < self.LOOK_BACK_STEPS: raise ValueError(f"Insufficient data. Need {self.LOOK_BACK_STEPS} timesteps, got {len(features_df)}")
        feature_cols = [col for col in features_df.columns if col != 'Kp_index']
        recent_data = features_df.tail(self.LOOK_BACK_STEPS)
        X_seq = recent_data[feature_cols].values.flatten()
        X_reshaped = X_seq.reshape(1, -1)
        if X_reshaped.shape[1] != self.scaler.n_features_in_: raise ValueError(f"Feature mismatch. Model expects {self.scaler.n_features_in_}, got {X_reshaped.shape[1]}.")
        return self.scaler.transform(X_reshaped)

    def calculate_geomagnetic_latitude(self, kp_value: float) -> float:
        return max(50.0, 67.5 - 2.5 * np.clip(kp_value, 0, 9))

    def generate_72h_forecast(self, base_kp: float, features_df: pd.DataFrame) -> List[Dict[str, Any]]:
        now_utc = datetime.utcnow()
        forecast_points = []
        if len(features_df) >= 24:
            recent_kp = features_df['Kp_index'].tail(24)
            kp_trend = recent_kp.diff().mean() if len(recent_kp) > 1 else 0
            kp_volatility = recent_kp.std() if len(recent_kp) > 1 else 0.2
        else:
            kp_trend = 0; kp_volatility = 0.3
        if len(features_df) > 0:
            latest_data = features_df.iloc[-1]
            bz_effect = -latest_data.get('BZ_nT_GSM', 0) * 0.1
            speed_effect = (latest_data.get('SW_Plasma_Speed_km_s', 400) - 400) * 0.002
            density_effect = (latest_data.get('SW_Proton_Density_N_cm3', 5) - 5) * 0.05
        else:
            bz_effect = speed_effect = density_effect = 0
        for i in range(72):
            forecast_time = now_utc + timedelta(hours=i)
            time_decay = np.exp(-i * 0.02)
            trend_effect = kp_trend * i * 0.1
            physics_adjustment = (bz_effect + speed_effect + density_effect) * time_decay
            noise = np.random.normal(0, kp_volatility * 0.3) if i > 0 else 0
            forecast_kp = np.clip(base_kp * time_decay + trend_effect + physics_adjustment + noise, 0, 9)
            forecast_points.append({'time': forecast_time.isoformat(), 'forecast_kp': float(forecast_kp), 'geomagnetic_latitude': self.calculate_geomagnetic_latitude(forecast_kp), 'confidence': max(0.3, 0.9 - i * 0.01), 'official_scale': get_official_kp_string(forecast_kp)})
        return forecast_points

def get_official_kp_string(kp_value):
    if not isinstance(kp_value, (int, float)) or pd.isna(kp_value): return "N/A"
    kp_value = np.clip(kp_value, 0, 9)
    rounded_thirds = round(kp_value * 3)
    main_digit, sub_digit = int(rounded_thirds // 3), int(rounded_thirds % 3)
    if sub_digit == 0: suffix = "o"
    elif sub_digit == 1: suffix = "+"
    else: main_digit += 1; suffix = "-"
    if main_digit >= 10: main_digit = 9; suffix = "o"
    return f"{main_digit}{suffix}"

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

def generate_gemini_prompt(kp_value: float) -> str:
    geomag_lat = forecaster.calculate_geomagnetic_latitude(kp_value)
    kp_official = get_official_kp_string(kp_value)
    g_scale = int(kp_value) - 4 if kp_value >= 4 else 0
    prompt = f"""As a senior space weather advisor for a major international airline, generate a concise, actionable report for flight dispatchers and pilots based on the current space weather conditions.
    Current Geomagnetic Conditions:
    - Planetary K-index (Kp): {kp_value:.2f} ({kp_official})
    - Equivalent G-Scale (Geomagnetic Storm): G{g_scale}
    - Estimated Aurora visibility down to: {geomag_lat:.1f} degrees geomagnetic latitude.
    Structure your report with the following markdown sections. Be direct and use simple language.
    ### Overall Risk Assessment
    ### Key Impacts & Recommendations
    - **HF Communications:**
    - **Radiation Exposure:**
    - **Navigation Systems (GPS/GNSS):**
    """
    return prompt

app = FastAPI(title="Enhanced Kp Index Forecasting API")
forecaster = EnhancedKpForecaster()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

async def run_forecast_pipeline():
    if not forecaster.model: raise HTTPException(status_code=503, detail="Model is not loaded.")
    try:
        async with aiohttp.ClientSession() as session:
            plasma_data, mag_data, kp_hist_df = await asyncio.gather(
                forecaster.fetch_data(session, forecaster.endpoints['plasma']),
                forecaster.fetch_data(session, forecaster.endpoints['magnetic']),
                forecaster.fetch_kp_data(session)
            )
        if not plasma_data or not mag_data or kp_hist_df.empty: raise HTTPException(status_code=504, detail="Could not fetch data.")
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
    forecast_72h = forecaster.generate_72h_forecast(predicted_kp, features_df)
    return {
        "last_updated": now_utc.isoformat(),
        "current_forecast": {"forecast_kp": round(predicted_kp, 2), "official_scale": get_official_kp_string(predicted_kp), "geomagnetic_latitude": round(forecaster.calculate_geomagnetic_latitude(predicted_kp), 1)},
        "historical_24h": historical_output,
        "forecast_72h": forecast_72h,
        "solar_terminator": calculate_solar_terminator(now_utc),
    }

@app.get("/api/impact-analysis/{kp_value}", response_class=JSONResponse)
async def get_impact_analysis(kp_value: float):
    if not gemini_model: raise HTTPException(status_code=503, detail="Gemini API not configured.")
    if kp_value < 0 or kp_value > 9: raise HTTPException(status_code=400, detail="Kp value must be between 0 and 9.")
    try:
        prompt = generate_gemini_prompt(kp_value)
        response = await gemini_model.generate_content_async(prompt)
        return {"analysis_text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error with Gemini API: {e}")

@app.get("/api/location-from-coords")
async def get_location_from_coords(lat: float, lon: float):
    serpapi_key = os.getenv("SERPAPI_API_KEY")
    if not serpapi_key: raise HTTPException(status_code=503, detail="SerpAPI key not configured.")
    params = {"engine": "google_maps", "q": f"{lat}, {lon}", "ll": f"@{lat},{lon},15z", "api_key": serpapi_key}
    try:
        search = GoogleSearch(params)
        results = await asyncio.to_thread(search.get_dict)
        address = results.get("place_results", {}).get("address")
        if address: return {"location": address}
        else: return {"location": "Location not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error with SerpAPI: {e}")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    try:
        with open("index1.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="index.html not found")