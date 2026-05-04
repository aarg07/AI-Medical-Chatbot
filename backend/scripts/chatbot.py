import json
import os
import urllib.request
from .safety_layer import SafetyLayer
from dotenv import load_dotenv

load_dotenv()


class MedicalEmergencyChatbot:
    def __init__(self, db_path="data/vector_db"):
        self.db_path = db_path
        self.api_key = os.getenv("OPENAI_API_KEY") or "YOUR_OPENAI_API_KEY_HERE"
        self.model = os.getenv("OPENAI_MODEL", "gpt-5.2")
        self.api_url = "https://api.openai.com/v1/responses"
        self.safety = SafetyLayer()
        print("OpenAI MedBot initialized. Ready.")

    def build_system_prompt(self):
        return """
You are a medical assistance chatbot for educational symptom triage and first aid.
Always say: "This is not medical advice".
Do not diagnose. Do not prescribe. Give possible causes only.
Give safe general OTC medicine information only when relevant.
Always include: "Consult a doctor or pharmacist before taking any medication".
If chest pain, breathing difficulty, severe bleeding, unconsciousness, or stroke signs appear, say:
⚠️ This may be a medical emergency. Seek immediate medical help or call emergency services.
Use sections:
1. Symptoms Summary
2. Possible Causes (2-3)
3. What You Can Do
4. Medicines Info (if relevant)
5. When to See Doctor
6. Emergency Warning (if needed)
"""

    def chat(self, user_message, conversation_history=None):
        safety_result = self.safety.check(user_message)
        if safety_result["force_emergency"]:
            return {
                "response": safety_result["emergency_message"],
                "urgency": "CRITICAL",
                "forced": True,
            }

        if not self.api_key or self.api_key == "YOUR_OPENAI_API_KEY_HERE":
            return {
                "response": "OpenAI API key is not configured. Use the Node backend local fallback or set OPENAI_API_KEY.",
                "urgency": "ROUTINE",
                "forced": False,
            }

        transcript = []
        for msg in (conversation_history or [])[-6:]:
            transcript.append(f"{msg.get('role', 'user')}: {msg.get('content', '')}")
        transcript.append(f"user: {user_message}")

        payload = {
            "model": self.model,
            "instructions": self.build_system_prompt(),
            "input": "\n".join(transcript),
            "max_output_tokens": 900,
        }

        try:
            req = urllib.request.Request(
                self.api_url,
                data=json.dumps(payload).encode("utf-8"),
                method="POST",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}",
                },
            )
            with urllib.request.urlopen(req, timeout=45) as response:
                data = json.loads(response.read().decode("utf-8"))
            response_text = data.get("output_text", "No response text returned.")
        except Exception as error:
            print(f"OpenAI error: {error}")
            response_text = "Error: Could not connect to OpenAI. Please check OPENAI_API_KEY."

        urgency = "CRITICAL" if "medical emergency" in response_text.lower() else "ROUTINE"
        return {
            "response": response_text,
            "urgency": urgency,
            "forced": False,
        }
