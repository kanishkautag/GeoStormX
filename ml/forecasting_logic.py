import asyncio
import aiohttp
import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import warnings
import math
import traceback

warnings.filterwarnings('ignore')

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

    def generate_72h_forecast(self, base_kp: float, features_df: pd.DataFrame) -> List[Dict[str, Any]]:
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

    async def run_forecast_pipeline(self):
        if not self.model:
            raise Exception("Model is not loaded. Server is not ready.")
        try:
            async with aiohttp.ClientSession() as session:
                plasma_data, mag_data, kp_hist_df = await asyncio.gather(
                    self.fetch_data(session, self.endpoints['plasma']),
                    self.fetch_data(session, self.endpoints['magnetic']),
                    self.fetch_kp_data(session)
                )
            if not plasma_data or not mag_data or kp_hist_df.empty:
                raise Exception("Could not fetch data from one or more NOAA sources.")
            plasma_df = self.process_plasma_data(plasma_data)
            mag_df = self.process_magnetic_data(mag_data)
            features_df = self.create_enhanced_features_live(plasma_df, mag_df, kp_hist_df)
            X = self.prepare_prediction_data_live(features_df)
            prediction_raw = self.model.predict(X)[0]
            predicted_kp = float(np.clip(prediction_raw / 10.0, 0, 9))
            return predicted_kp, kp_hist_df, features_df
        except Exception as e:
            traceback.print_exc()
            raise e

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
