class SafetyLayer:
    """
    Runs before the LLM to catch critical emergencies instantly.
    This is a fast keyword-based check - no AI delay.
    """

    IMMEDIATE_EMERGENCY_PHRASES = [
        "heart attack", "chest pain", "chest pressure",
        "chest tightness", "cardiac arrest",
        "can't breathe", "cannot breathe", "not breathing",
        "stopped breathing", "choking", "airway blocked",
        "face drooping", "arm weakness", "sudden numbness",
        "stroke", "slurred speech",
        "unconscious", "unresponsive", "passed out",
        "collapsed", "not waking up",
        "severe bleeding", "bleeding heavily", "blood everywhere",
        "won't stop bleeding",
        "want to die", "kill myself", "suicide",
        "end my life", "self harm",
        "overdose", "poisoning", "anaphylaxis",
        "seizure", "convulsion", "drowning",
    ]

    EMERGENCY_MESSAGE = """
⚠️ CALL 112 IMMEDIATELY ⚠️

This sounds like a medical emergency.

📞 **Emergency Numbers (India):**
- 112 — National Emergency
- 102 — Ambulance
- 104 — Medical Helpline

**While waiting for help:**
- Stay with the person / Stay calm
- Do NOT give food, water, or medication unless instructed
- Unlock the front door for paramedics
- Stay on the line with emergency services

I am an AI and cannot replace emergency medical services.
Please call 112 now.
""".strip()

    def check(self, user_message):
        text_lower = user_message.lower()

        for phrase in self.IMMEDIATE_EMERGENCY_PHRASES:
            if phrase in text_lower:
                return {
                    "force_emergency": True,
                    "emergency_message": self.EMERGENCY_MESSAGE,
                    "trigger": phrase
                }

        return {"force_emergency": False}
