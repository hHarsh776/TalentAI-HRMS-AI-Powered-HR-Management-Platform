import os
import google.generativeai as genai
from backend.app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

models_to_test = [
    'gemini-2.5-pro',
    'gemini-3.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest'
]

for model_name in models_to_test:
    print(f"\nTesting {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        res = model.generate_content("Hello, reply with YES if you are working.")
        print(f"SUCCESS! Response: {res.text.strip()}")
    except Exception as e:
        print(f"FAILED: {e}")
