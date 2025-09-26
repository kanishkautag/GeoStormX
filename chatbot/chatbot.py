# chatbot.py

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# --- SETUP ---
# 1. Make sure you have a .env file in the same directory with your API key:
#    GEMINI_API_KEY="your_api_key_here"
# 2. Place your 'alerts.json' file in the same directory.
# 3. Run the server with: uvicorn chatbot:app --reload

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Initialize Gemini Model ---
try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(model_name="gemini-2.5-flash")
except Exception as e:
    print(f"Error configuring Generative AI: {e}")
    model = None

# --- FastAPI App Setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change "*" to your frontend's domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Loading for Agentic Capability ---
def load_alerts():
    try:
        with open("alerts.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: alerts.json not found. The chatbot will not have live alert context.")
        return []
    except json.JSONDecodeError:
        print("Error: Could not decode alerts.json. Please check for syntax errors.")
        return []

alerts_data = load_alerts()

# --- Request Model ---
class ChatRequest(BaseModel):
    message: str

# --- Master Prompt ---
# This prompt defines the chatbot's entire personality, knowledge, and rules.
MASTER_PROMPT_TEMPLATE = """
# ROLE AND PERSONA
You are AURA-Agent, a specialized AI risk analyst and physicist with tons of space knowledge for the "Cosmic Weather Insurance" platform. Your persona is that of a data-driven, precise, and expert system. Your primary function is to answer questions based *exclusively* on the project's Problem Statement and live alert data.



# KNOWLEDGE BASE (FROM THE PROBLEM STATEMENT)
You must base your answers on the following project details:
- **Core Function:** To design a predictive model that ingests satellite and weather data to price an "insurance product" for space weather events.
- **Methodology:**
    1.  **Data Ingestion:** Takes in live space-weather data (IMF Bz, Kp Index, proton flux).
    2.  **Forecasting:** Models and forecasts geomagnetic storm intensity for the next 24-72 hours.
    3.  **Risk Modeling:** Maps forecasts to potential asset impacts (e.g., satellite downtime) and outputs a probabilistic loss distribution.
    4.  **Insurance Pricing:** Translates the expected loss into a suggested insurance premium with confidence intervals/uncertainty bounds.
- **Key Features:** The platform includes an easy-to-use dashboard, accurate short-term forecasts, clear premium calculations, real-time alerts, and "what-if" sliders for users.
- **Agentic AI:** The platform uses agentic AI to autonomously perform this entire pipeline, from data ingestion to providing real-time alerts on the dashboard.

# AGENTIC CAPABILITY: LIVE ALERT DATA
You have access to the most recent alerts from the AURA platform's '/dashboard/alerts' feed. You MUST use this information to provide contextually relevant answers.

Here are the latest alerts:
{latest_alerts}

# USER'S QUESTION:
{user_message}
"""

@app.post("/chat")
async def chat_with_gemini(request: ChatRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Gemini model is not configured. Please check API key.")

    user_msg = request.message.strip()

    # 1. Prepare the live alert context for the agent
    latest_alerts = alerts_data[:3] # Get the 3 most recent alerts
    
    # Helper to parse and format alerts for the prompt
    def format_alert(alert):
        title = "General Alert"
        lines = alert.get("message", "").split('\r\n')
        title_line = next((line for line in lines if line.startswith(('ALERT:', 'WARNING:', 'WATCH:'))), None)
        if title_line:
            title = title_line.replace('ALERT:', '').replace('WARNING:', '').replace('WATCH:', '').strip()
        
        timestamp = alert.get("issue_datetime", "No timestamp")
        return f"- {timestamp}: {title}"
        
    alerts_context = "\n".join([format_alert(a) for a in latest_alerts])

    # 2. Construct the final prompt
    final_prompt = MASTER_PROMPT_TEMPLATE.format(
        latest_alerts=alerts_context,
        user_message=user_msg
    )

    # 3. Generate response
    try:
        response = model.generate_content(final_prompt)
        return {"response": response.text}
    except Exception as e:
        return {"error": str(e)}