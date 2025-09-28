# AURA Chatbot Backend

This is the backend service for the AURA Risk Advisor chatbot.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd chatbot
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure API Key**
   - Edit the `.env` file
   - Replace `your_gemini_api_key_here` with your actual Gemini API key
   - Get your API key from: https://makersuite.google.com/app/apikey

3. **Run the Server**
   ```bash
   python run_server.py
   ```
   
   Or alternatively:
   ```bash
   uvicorn chatbot:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Test the Chatbot**
   - Open http://localhost:8000/docs for API documentation
   - The chat endpoint is at: http://localhost:8000/chat

## API Endpoints

- `POST /chat` - Chat with the AURA Risk Advisor
- `GET /docs` - API documentation (Swagger UI)

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

## Troubleshooting

- Make sure the `.env` file exists and contains a valid API key
- Ensure all dependencies are installed
- Check that port 8000 is not already in use
- Verify the `alerts.json` file is present in the chatbot directory
