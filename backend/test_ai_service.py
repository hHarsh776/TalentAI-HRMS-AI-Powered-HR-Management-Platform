import os
from backend.app.ai import get_ai_service
from backend.app.config import settings

print(f"Loaded API Key: {settings.GEMINI_API_KEY[:5]}... (length: {len(settings.GEMINI_API_KEY)})")

ai = get_ai_service()
print(f"Is Gemini Enabled? {ai.gemini_enabled}")

print("Testing chatbot...")
try:
    response = ai.chat("Hello, what is your name?")
    print(f"Chatbot response: {response}")
except Exception as e:
    print(f"Chatbot CRASH: {e}")

print("Testing resume parser...")
try:
    resume_data = ai.parse_resume("My name is Harsh Singh Tanwar. I have a B.Tech in CSE and 2 years of experience in Python and FastAPI.")
    print(f"Parser response: {resume_data}")
except Exception as e:
    print(f"Parser CRASH: {e}")
