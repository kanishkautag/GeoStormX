# --- main.py ---
# This is the fully integrated backend for the Cosmic Weather Insurance platform.
# It combines Kp forecasting, the AURA-Agent chatbot, Twilio communications,
# and the AI-powered Aviation Impact agent.

import os
import json
import traceback
import math
import warnings
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

# Third-party libraries
import uvicorn
import asyncio
import aiohttp
import pandas as pd
import numpy as np
import joblib
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather

# --- 1. SETUP & CONFIGURATION ---
load_dotenv()
warnings.filterwarnings('ignore')

# Crucial Check for all required Environment Variables
required_env_vars = [
    "GEMINI_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER", "PUBLIC_URL"
]
for var in required_env_vars:
    if not os.getenv(var):
        raise RuntimeError(f"FATAL ERROR: Environment variable '{var}' is not set in your .env file.")

# Initialize API Keys and Clients
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
PUBLIC_URL = os.getenv("PUBLIC_URL")

try:
    genai.configure(api_key=GEMINI_API_KEY)
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
except Exception as e:
    print(f"FATAL ERROR during API client initialization: {e}")
    exit(1)

app = FastAPI(title="Cosmic Weather Insurance - Unified API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. KP FORECASTING ENGINE ---
class EnhancedKpForecaster:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.LOOK_BACK_STEPS = 18 # As per model training
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
            print("✅ Kp forecasting models loaded successfully.")
        except Exception as e:
            print(f"❌ WARNING: Error loading forecasting models: {e}. Forecast endpoints will fail if called.")
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

    def process_dataframe(self, data: List, date_col: str, num_cols: List[str]) -> pd.DataFrame:
        if not data or len(data) < 2: return pd.DataFrame()
        df = pd.DataFrame(data[1:], columns=data[0])
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        for col in num_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        return df

    async def get_all_data(self, session: aiohttp.ClientSession):
        plasma_data, mag_data, kp_data = await asyncio.gather(
            self.fetch_data(session, self.endpoints['plasma']),
            self.fetch_data(session, self.endpoints['magnetic']),
            self.fetch_data(session, self.endpoints['kp_historical'])
        )
        plasma_df = self.process_dataframe(plasma_data, 'time_tag', ['density', 'speed'])
        mag_df = self.process_dataframe(mag_data, 'time_tag', ['bz_gsm', 'bt'])
        kp_df = self.process_dataframe(kp_data, 'time_tag', ['Kp']).rename(columns={'Kp': 'Kp_index'})
        return plasma_df, mag_df, kp_df

    def create_enhanced_features_live(self, plasma_df: pd.DataFrame, mag_df: pd.DataFrame, kp_df: pd.DataFrame) -> pd.DataFrame:
        plasma_df.rename(columns={'speed': 'SW_Plasma_Speed_km_s', 'density': 'SW_Proton_Density_N_cm3'}, inplace=True)
        mag_df.rename(columns={'bt': 'Scalar_B_nT', 'bz_gsm': 'BZ_nT_GSM'}, inplace=True)
        merged = pd.merge(plasma_df, mag_df, on='time_tag', how='outer')
        merged = pd.merge(merged, kp_df, on='time_tag', how='outer').sort_values('time_tag').drop_duplicates(subset=['time_tag']).set_index('time_tag')
        merged = merged.resample('15T').interpolate(method='linear').ffill().bfill()
        
        features_df = merged.copy()
        features_df['dynamic_pressure'] = 1.67e-6 * features_df['SW_Proton_Density_N_cm3'] * features_df['SW_Plasma_Speed_km_s']**2
        
        for feature in ['Scalar_B_nT', 'BZ_nT_GSM', 'SW_Proton_Density_N_cm3', 'SW_Plasma_Speed_km_s', 'Kp_index']:
            features_df[f'{feature}_3h_mean'] = features_df[feature].rolling(12).mean()
            features_df[f'{feature}_6h_mean'] = features_df[feature].rolling(24).mean()
        return features_df.dropna()

    def prepare_prediction_data_live(self, features_df: pd.DataFrame) -> np.ndarray:
        if len(features_df) < self.LOOK_BACK_STEPS:
            raise ValueError(f"Insufficient data for sequence. Need {self.LOOK_BACK_STEPS} steps, have {len(features_df)}.")
        
        feature_cols = [col for col in self.scaler.feature_names_in_ if col in features_df.columns]
        recent_data = features_df.tail(self.LOOK_BACK_STEPS)
        return self.scaler.transform(recent_data[feature_cols])

    def calculate_geomagnetic_latitude(self, kp_value: float) -> float:
        return max(50.0, 67.5 - 2.5 * np.clip(kp_value, 0, 9))

    def generate_72h_forecast(self, base_kp: float, features_df: pd.DataFrame) -> List[Dict[str, Any]]:
        now_utc = datetime.utcnow()
        forecast_points = []
        if features_df.empty: return []

        latest_data = features_df.iloc[-1]
        bz_effect = -latest_data.get('BZ_nT_GSM', 0) * 0.1
        speed_effect = (latest_data.get('SW_Plasma_Speed_km_s', 400) - 400) * 0.002
        
        for i in range(72):
            forecast_time = now_utc + timedelta(hours=i)
            time_decay = np.exp(-i * 0.02)
            physics_adjustment = (bz_effect + speed_effect) * time_decay
            forecast_kp = np.clip(base_kp * time_decay + physics_adjustment, 0, 9)
            
            forecast_points.append({
                'time': forecast_time.isoformat(),
                'forecast_kp': float(forecast_kp),
                'geomagnetic_latitude': self.calculate_geomagnetic_latitude(forecast_kp),
                'official_scale': self.get_official_kp_string(forecast_kp)
            })
        return forecast_points

    def get_official_kp_string(self, kp_value):
        if pd.isna(kp_value): return "N/A"
        kp_value = np.clip(kp_value, 0, 9)
        rounded_thirds = round(kp_value * 3)
        main_digit = int(rounded_thirds // 3)
        sub_digit = int(rounded_thirds % 3)
        if sub_digit == 0: suffix = "o"
        elif sub_digit == 1: suffix = "+"
        else: main_digit += 1; suffix = "-"
        return f"{min(main_digit, 9)}{suffix}"

forecaster = EnhancedKpForecaster()

# --- 3. UTILITY FUNCTIONS, DATA & PROMPTS ---

# Geographic Data for Aviation Agent
COUNTRIES = [
    {"name": "Canada", "bounds": {"north": 83.11, "south": 41.68, "west": -141.00, "east": -52.64}},
    {"name": "United States (Alaska)", "bounds": {"north": 71.41, "south": 54.78, "west": -179.78, "east": -129.99}},
    {"name": "Greenland", "bounds": {"north": 83.63, "south": 59.78, "west": -73.04, "east": -12.21}},
    {"name": "Iceland", "bounds": {"north": 66.54, "south": 63.40, "west": -24.54, "east": -13.50}},
    {"name": "Norway", "bounds": {"north": 71.18, "south": 57.98, "west": 4.65, "east": 31.29}},
    {"name": "Sweden", "bounds": {"north": 69.06, "south": 55.34, "west": 11.11, "east": 24.17}},
    {"name": "Finland", "bounds": {"north": 70.09, "south": 59.81, "west": 20.55, "east": 31.59}},
    {"name": "Russia (Siberia & Arctic)", "bounds": {"north": 81.86, "south": 49.00, "west": 60.00, "east": -169.05}},
]

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
        except (ValueError, ZeroDivisionError):
            continue
    return terminator_points

def load_alerts():
    try:
        with open("alerts.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("WARNING: alerts.json not found. Chatbot will lack alert context.")
        return []
    except json.JSONDecodeError:
        print("ERROR: Could not decode alerts.json.")
        return []

alerts_data = load_alerts()

def calculate_aurora_oval_points(geomagnetic_latitude: float) -> List[Dict[str, float]]:
    """
    Returns a list of latitude/longitude points representing the auroral oval
    for a given geomagnetic latitude. The oval is approximated as a circle at the specified latitude.
    """
    points = []
    for lng in range(-180, 181, 10):
        points.append({'lat': geomagnetic_latitude, 'lng': lng})
    return points

def is_point_in_country(lat: float, lng: float, country: dict) -> bool:
    bounds = country['bounds']
    return (
        bounds['south'] <= lat <= bounds['north'] and
        bounds['west'] <= lng <= bounds['east']
    )

def is_on_night_side(lat: float, lng: float, target_time: datetime) -> bool:
    """
    Returns True if the given latitude/longitude is on the night side of Earth at the specified UTC time.
    Uses a simple solar zenith angle calculation.
    """
    # Calculate the solar declination
    day_of_year = target_time.timetuple().tm_yday
    decl = 23.44 * math.cos(math.radians(360 / 365 * (day_of_year + 10)))
    # Calculate the hour angle
    solar_time = (lng / 15.0) + target_time.hour + target_time.minute / 60.0
    hour_angle = 15 * (solar_time - 12)
    # Calculate the solar elevation angle
    lat_rad = math.radians(lat)
    decl_rad = math.radians(decl)
    elevation = math.degrees(
        math.asin(
            math.sin(lat_rad) * math.sin(decl_rad) +
            math.cos(lat_rad) * math.cos(decl_rad) * math.cos(math.radians(hour_angle))
        )
    )
    return elevation < 0  # Night side if sun is below horizon

# Agent Prompts
MASTER_PROMPT_TEMPLATE = """
# ROLE AND PERSONA
You are AURA-Agent, a specialized AI risk analyst for the "Cosmic Weather Insurance" platform. Your persona is data-driven, precise, and expert. Your function is to answer questions based *exclusively* on the project's Problem Statement and live alert data.

# KNOWLEDGE BASE
- **Core Function:** A predictive model that ingests satellite/weather data to price an "insurance product" for space weather events.
- **Methodology:** 1. Data Ingestion (IMF Bz, Kp Index). 2. Forecasting (24-72 hours). 3. Risk Modeling (maps forecasts to asset impacts). 4. Insurance Pricing (translates loss to premiums).
- **Features:** Dashboard, forecasts, premium calculations, real-time alerts, "what-if" sliders.

# LIVE ALERT DATA
You have access to the most recent alerts. Use this for contextually relevant answers.
Here are the latest alerts:
{latest_alerts}

# USER'S QUESTION:
{user_message}
"""

AVIATION_IMPACT_PROMPT_TEMPLATE = """
# ROLE & GOAL
You are a senior Aviation Logistics Analyst and space weather expert for a global airline consortium. Your mission is to provide a clear, actionable daily briefing on the impact of geomagnetic storms on flight operations for the next 24 hours.

# CONTEXT
A geomagnetic storm is forecast. Below are the specific 3-hour time blocks where the Kp-index is predicted to be 4 or higher, along with the specific northern hemisphere regions that will be under the aurora during their local night time.

# FORECAST DATA
{analysis_blocks}

# YOUR TASK
Synthesize the provided data into a professional aviation impact report. Address the following points:
1.  **Executive Summary:** Start with a brief, high-level overview of the 24-hour threat.
2.  **High-Risk Routes Analysis:** For each time block, explicitly name the major international flight corridors at risk. Be specific (e.g., "North American routes to East Asia over the Arctic," "Trans-Atlantic routes from Northern Europe to the US East Coast").
3.  **Operational Impact Assessment:** Detail the expected consequences, focusing on High-Frequency (HF) radio communication blackouts and potential degradation of GPS/GNSS accuracy.
4.  **Actionable Recommendations:** State the likely operational responses, such as recommending flight dispatchers to plan for rerouting aircraft to lower-latitude tracks, potential flight delays, and adjusted fuel planning.

# RESPONSE FORMAT
Provide the output as a single, clean JSON object with one key: "aviation_impact_report". The value should be a string containing your full, human-readable analysis formatted with markdown (e.g., using headings and bullet points).
"""

# --- 4. PYDANTIC MODELS ---
class ChatRequest(BaseModel): message: str
class StormAlertRequest(BaseModel): region: str; severity: str; kp_index: int
class CallRequest(BaseModel): to: str
class SmsRequest(BaseModel): to: str; body: str

# --- 5. API ENDPOINTS ---

@app.get("/")
def read_root(): return {"message": "Cosmic Weather Insurance API is running"}

# --- Agentic Endpoint for Aviation Impact ---
@app.get("/api/aviation-forecast")
async def get_aviation_forecast():
    """Agentic endpoint to analyze aviation risks for the next 24 hours."""
    try:
        # Step 1: Fetch live Kp forecast data directly from NOAA
        url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=15) as response:
                response.raise_for_status()
                data = await response.json()
                if not data or len(data) < 2:
                    raise HTTPException(status_code=503, detail="NOAA data is currently unavailable or in an invalid format.")
                
                df = pd.DataFrame(data[1:], columns=data[0])
                df['kp'] = pd.to_numeric(df['kp'], errors='coerce')
                df['time_tag'] = pd.to_datetime(df['time_tag'], errors='coerce')
                forecast_df = df.dropna(subset=['kp', 'time_tag'])

        # Step 2: Analyze the next 24 hours (8 blocks of 3 hours)
        analysis_blocks = []
        for _, row in forecast_df.head(8).iterrows():
            kp_value = row['kp']
            if kp_value >= 4:  # Only analyze significant events
                geomag_lat = forecaster.calculate_geomagnetic_latitude(kp_value)
                aurora_points = calculate_aurora_oval_points(geomag_lat)
                forecast_time = row['time_tag']
                
                affected_countries = {
                    country['name'] for point in aurora_points
                    if is_on_night_side(point['lat'], point['lng'], forecast_time)
                    for country in COUNTRIES
                    if is_point_in_country(point['lat'], point['lng'], country)
                }
                
                if affected_countries:
                    block = (
                        f"- **Time Block:** {forecast_time.strftime('%H:%M')} - {(forecast_time + timedelta(hours=3)).strftime('%H:%M')} UTC\n"
                        f"  - **Predicted Kp-Index:** {kp_value:.1f}\n"
                        f"  - **Affected Night-Side Regions:** {', '.join(sorted(list(affected_countries)))}"
                    )
                    analysis_blocks.append(block)

        # Step 3: If no significant activity, return a calm report
        if not analysis_blocks:
            return {"aviation_impact_report": "### No Significant Impact Expected\n* **Forecast:** Geomagnetic activity is predicted to remain below Kp 4 for the next 24 hours.\n* **Recommendation:** Standard flight operations, including polar routes, are cleared. No space weather-related rerouting is anticipated."}

        # Step 4: Use Gemini to generate the expert analysis
        model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        prompt = AVIATION_IMPACT_PROMPT_TEMPLATE.format(analysis_blocks="\n".join(analysis_blocks))
        response = await model.generate_content_async(prompt)
        
        cleaned_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate aviation forecast: {str(e)}")


# --- Kp Forecasting Map Endpoints ---
async def run_forecast_pipeline():
    if not forecaster.model:
        raise HTTPException(status_code=503, detail="Forecasting model is not loaded.")
    try:
        async with aiohttp.ClientSession() as session:
            plasma_df, mag_df, kp_df = await forecaster.get_all_data(session)
            if any(df.empty for df in [plasma_df, mag_df, kp_df]):
                raise HTTPException(status_code=504, detail="Could not fetch data from one or more NOAA sources.")
            
            features_df = forecaster.create_enhanced_features_live(plasma_df, mag_df, kp_df)
            X = forecaster.prepare_prediction_data_live(features_df)
            prediction_raw = forecaster.model.predict(X)
            predicted_kp = float(np.clip(prediction_raw.mean(), 0, 9))
            return predicted_kp, kp_df, features_df
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forecast", response_class=JSONResponse)
async def get_full_forecast():
    predicted_kp, kp_hist_df, features_df = await run_forecast_pipeline()
    now_utc = datetime.utcnow()
    
    historical_output = []
    historical_kp_recent = kp_hist_df[kp_hist_df['time_tag'] >= now_utc - timedelta(hours=24)]
    for _, row in historical_kp_recent.iterrows():
        historical_output.append({
            "time": row['time_tag'].strftime('%Y-%m-%d %H:%M'), 
            "kp_index": round(row['Kp_index'], 2), 
            "official_scale": forecaster.get_official_kp_string(row['Kp_index'])
        })
    
    forecast_72h = forecaster.generate_72h_forecast(predicted_kp, features_df)
    
    return {
        "last_updated": now_utc.isoformat(),
        "current_forecast": {
            "forecast_kp": round(predicted_kp, 2),
            "official_scale": forecaster.get_official_kp_string(predicted_kp),
            "geomagnetic_latitude": round(forecaster.calculate_geomagnetic_latitude(predicted_kp), 1)
        },
        "historical_24h": historical_output,
        "forecast_72h": forecast_72h,
        "solar_terminator": calculate_solar_terminator(now_utc),
    }


# --- Chatbot & Twilio Communication Endpoints ---
@app.post("/chat")
async def chat_with_aura_agent(request: ChatRequest):
    try:
        model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        latest_alerts = alerts_data[:3]
        
        def format_alert(alert):
            title = "General Alert"
            lines = alert.get("message", "").split('\r\n')
            title_line = next((line for line in lines if line.startswith(('ALERT:', 'WARNING:', 'WATCH:'))), None)
            if title_line:
                title = title_line.replace('ALERT:', '').replace('WARNING:', '').replace('WATCH:', '').strip()
            timestamp = alert.get("issue_datetime", "No timestamp")
            return f"- {timestamp}: {title}"
            
        alerts_context = "\n".join([format_alert(a) for a in latest_alerts])
        final_prompt = MASTER_PROMPT_TEMPLATE.format(
            latest_alerts=alerts_context,
            user_message=request.message.strip()
        )
        response = await model.generate_content_async(final_prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chat endpoint: {str(e)}")

@app.post("/send-sms")
async def send_sms(sms_request: SmsRequest):
    try:
        message = twilio_client.messages.create(
            body=sms_request.body, from_=TWILIO_PHONE_NUMBER, to=sms_request.to
        )
        return {"status": "success", "sid": message.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/trigger-storm-alert")
async def trigger_storm_alert(alert_request: StormAlertRequest):
    dummy_customers = ["+919653371631", "+919372598061"] # Replace with real numbers
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = (
            f"You are an insurance emergency alert system. A {alert_request.severity} "
            f"geomagnetic storm (predicted Kp-index {alert_request.kp_index}) is expected to impact the "
            f"'{alert_request.region}' region. Generate a concise SMS alert (under 160 characters) for our clients. "
            "It must state the risk, mention their active insurance, and advise preventative measures (like safe-moding satellites)."
        )
        response_gen = await model.generate_content_async(prompt)
        curated_message = response_gen.text
        
        sent_count = 0
        for number in dummy_customers:
            try:
                twilio_client.messages.create(
                    body=curated_message, from_=TWILIO_PHONE_NUMBER, to=number
                )
                sent_count += 1
            except Exception as sms_error:
                print(f"Failed to send SMS to {number}: {sms_error}")
        
        return {
            "status": "success", "messages_sent": sent_count, "message_body": curated_message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process storm alert: {str(e)}")

@app.post("/make-call")
async def make_call(call_request: CallRequest):
    try:
        webhook_url = f"{PUBLIC_URL}/voice"
        call = twilio_client.calls.create(
            url=webhook_url, from_=TWILIO_PHONE_NUMBER, to=call_request.to
        )
        return {"status": "success", "sid": call.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice")
async def voice_webhook(request: Request):
    response = VoiceResponse()
    response.say("Hello! You are connected to the AURA risk assistant. How can I help you today?")
    gather = Gather(input='speech', action=f'{PUBLIC_URL}/gather', speechTimeout='auto')
    response.append(gather)
    response.redirect(f'{PUBLIC_URL}/voice') 
    return Response(content=str(response), media_type="application/xml")

@app.post("/gather")
async def gather_webhook(request: Request):
    response = VoiceResponse()
    form = await request.form()
    speech_result = form.get('SpeechResult')
    if speech_result:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            enhanced_prompt = (
                "You are a voice assistant. Answer in 2-3 short, conversational sentences. "
                f"The user said: '{speech_result}'"
            )
            gemini_response = await model.generate_content_async(enhanced_prompt)
            response.say(gemini_response.text)
        except Exception as e:
            print(f"--- ERROR in /gather ---\n{traceback.format_exc()}\n---")
            response.say("Sorry, I encountered an error. Please try again.")
    else:
        response.say("I didn't hear anything. Please say something.")
    
    gather = Gather(input='speech', action=f'{PUBLIC_URL}/gather', speechTimeout='auto')
    response.append(gather)
    return Response(content=str(response), media_type="application/xml")

