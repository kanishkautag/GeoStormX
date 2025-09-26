import os
from fastapi import FastAPI, HTTPException, Request, Form, Response
import httpx
from fastapi.middleware.cors import CORSMiddleware
import traceback
from pydantic import BaseModel
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Allows the React app to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class SmsRequest(BaseModel):
    to: str
    body: str

class CallRequest(BaseModel):
    to: str

class AssistantRequest(BaseModel):
    query: str
    
class StormAlertRequest(BaseModel):
    region: str
    severity: str
    kp_index: int
# Pydantic Models for request bodies
class SmsRequest(BaseModel):
    to: str
    body: str

class CallRequest(BaseModel):
    to: str

class AssistantRequest(BaseModel):
    query: str

# API Keys and Client Initialization
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PUBLIC_URL = os.getenv("PUBLIC_URL")  # Your ngrok public URL

# --- Crucial Check for Environment Variables ---
# If any of these are missing, the app will fail. This helps in debugging.
if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, GEMINI_API_KEY]):
    raise RuntimeError("One or more required environment variables are missing. Check your .env file.")

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
genai.configure(api_key=GEMINI_API_KEY)

@app.get("/")
def read_root():
    return {"message": "FastAPI server is running"}

@app.post("/trigger-storm-alert")
async def trigger_storm_alert(alert_request: StormAlertRequest):
    """
    Uses DUMMY DATA to simulate an insurance alert and sends it via Twilio.
    """
    # In a real app, you would fetch these from a database
    dummy_customers = [
        "+919653371631","+919372598061", # <-- Replace with your phone number in E.164 format
    ]

    try:
        # 1. Initialize the Gemini model
        model = genai.GenerativeModel('gemini-2.5-flash')

        # 2. Create the detailed prompt using data from the frontend
        prompt = (
            f"You are an insurance company's emergency alert system. A {alert_request.severity} "
            f"geomagnetic storm (predicted Kp-index {alert_request.kp_index}) is expected to impact the "
            f"'{alert_request.region}' region shortly. Generate a concise SMS alert for satellite operator clients. "
            "The message must be under 160 characters. It must state the risk, mention their active insurance "
            "coverage, and strongly advise taking preventative measures (like safe-moding satellites)."
        )
        
        # 3. Call the AI model to generate the message LIVE
        response_gen = await model.generate_content_async(prompt)
        curated_message = response_gen.text
        
        # 4. Send the AI-generated message via Twilio
        sent_count = 0
        for number in dummy_customers:
            # *** BUG FIX HERE ***
            # The logic is corrected to ensure the number is valid and not the placeholder.
            if number and number != "+1234567890":
                try:
                    twilio_client.messages.create(
                        body=curated_message,
                        from_=TWILIO_PHONE_NUMBER,
                        to=number
                    )
                    sent_count += 1
                except Exception as e:
                    print(f"Failed to send SMS to {number}: {e}")
            else:
                print("Skipping invalid or placeholder phone number. Please replace '+1234567890' with your real number.")
        
        if sent_count == 0 and len(dummy_customers) > 0:
             print("Warning: No SMS sent. Did you replace the placeholder phone number in the code?")


        return {
            "status": "success",
            "messages_sent": sent_count,
            "message_body": curated_message
        }

    except Exception as e:
        print(f"--- ERROR in /trigger-storm-alert ---\n{traceback.format_exc()}\n--- END OF ERROR ---")
        raise HTTPException(status_code=500, detail=f"Failed to process storm alert: {str(e)}")


@app.post("/send-sms")
async def send_sms(sms_request: SmsRequest):
    try:
        message = twilio_client.messages.create(
            body=sms_request.body, from_=TWILIO_PHONE_NUMBER, to=sms_request.to
        )
        return {"status": "success", "sid": message.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/make-call")
async def make_call(call_request: CallRequest):
    if not PUBLIC_URL:
        raise HTTPException(status_code=500, detail="PUBLIC_URL not set in .env file. Please set it to your ngrok URL.")
    try:
        webhook_url = f"{PUBLIC_URL}/voice"
        call = twilio_client.calls.create(
            url=webhook_url, from_=TWILIO_PHONE_NUMBER, to=call_request.to
        )
        return {"status": "success", "sid": call.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-assistant")
async def ask_assistant(assistant_request: AssistantRequest):
    try:
        # Use the correct model name for Gemini API
        model = genai.GenerativeModel('gemini-pro')
        # Use the synchronous method for consistency
        response_gen = model.generate_content(assistant_request.query)
        return {"response": response_gen.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice")
async def voice_webhook(request: Request):
    """Handles incoming calls from Twilio and starts the conversation."""
    response = VoiceResponse()
    response.say("Hello! You are connected to Gemini. How can I help you today?")
    
    # Start the first gather
    gather = Gather(input='speech', action='/gather', speechTimeout='auto')
    response.append(gather)

    # Redirect to wait for more input if the user says nothing.
    response.redirect('/voice') 
    
    return Response(content=str(response), media_type="application/xml")

@app.post("/gather")
async def gather_webhook(request: Request):
    """Processes the speech input and continues the conversation."""
    response = VoiceResponse()
    
    # Twilio sends the speech result in the 'SpeechResult' form field
    form = await request.form()
    speech_result = form.get('SpeechResult')

    if speech_result:
        try:
            # Use the correct model name for Gemini API
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Add instructions for shorter, voice-friendly responses
            enhanced_prompt = f"Answer in 2-3 short sentences max for voice response. Keep it conversational and human-like and brief whenever required: {speech_result}"
            
            # Use synchronous method to avoid async issues
            gemini_response = model.generate_content(enhanced_prompt)
            
            # Truncate response if it's too long (optional safety measure)
            response_text = gemini_response.text
            if len(response_text) > 200:  # Limit to 200 characters
                response_text = response_text[:197] + "..."
            
            response.say(response_text)

        except Exception as e:
            print("--- ERROR CALLING GEMINI API ---")
            print(traceback.format_exc())
            print("--- END OF ERROR ---")
            response.say("Sorry, I encountered an error. Please try again.")
    else:
        response.say("I didn't hear anything. Please say something.")

    # *FIXED LOGIC*: Instead of redirecting to /voice (which restarts the conversation),
    # we simply gather more input to continue the current conversation.
    gather = Gather(input='speech', action='/gather', speechTimeout='auto')
    response.append(gather)
    
    # If the user is silent, we can hang up or prompt again. Here we just wait.
    response.say("I am listening.")
    response.pause(length=10) # Wait for 10 seconds before the gather times out

    return Response(content=str(response), media_type="application/xml")