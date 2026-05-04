# Emergency Guide AI

Emergency Guide AI is a React + Node.js medical assistance chatbot for educational symptom triage, first-aid guidance, emergency detection, and general OTC medicine information.

It uses:

- OpenAI Responses API for natural-language medical assistance
- Optional OpenAI web search tool for current supporting information
- Optional OpenFDA Drug Label API for medicine label context
- Local `backend/medical_data.json` fallback data for demos when no API key is configured
- Image upload for visible medical symptoms or injuries

## Safety Position

The chatbot is for educational and assistance purposes only.

- This is not medical advice.
- It does not diagnose.
- It does not prescribe.
- It gives only general OTC medicine information.
- It encourages doctor/pharmacist consultation.
- It urgently flags chest pain, breathing difficulty, severe bleeding, unconsciousness, and stroke signs.

## Setup

Install dependencies:

```bash
npm install
```

Create or update `.env`:

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-5.2
OPENAI_ENABLE_WEB_SEARCH=true
OPENFDA_API_KEY=
```

`OPENFDA_API_KEY` is optional. OpenFDA can be used without a key for low-volume testing, but a key improves rate limits.

Run frontend and backend together:

```bash
npm run dev:all
```

Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://127.0.0.1:5000/health
```

## API

### `GET /health`

Returns backend status, provider, model, and fallback mode.

### `POST /api/chat`

Request:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "I have fever and headache"
    }
  ]
}
```

Response format:

```text
This is not medical advice.

1. Symptoms Summary
2. Possible Causes (2-3)
3. What You Can Do
4. Medicines Info (if relevant)
5. When to See Doctor
6. Emergency Warning (if needed)
```

## Sample Output

User:

```text
I have fever and headache
```

Bot:

```text
This is not medical advice.

1. Symptoms Summary
You reported fever and headache.

2. Possible Causes (2-3)
- Possible viral infection or flu-like illness
- Possible dehydration or fatigue
- Possible tension headache or common cold

3. What You Can Do
- Rest and avoid heavy activity.
- Drink fluids.
- Monitor temperature and symptom duration.

4. Medicines Info (if relevant)
- Paracetamol / Acetaminophen: fever reduction and mild to moderate pain relief.
  Typical adult dosage range: 500-1000 mg every 4-6 hours as needed; do not exceed the label maximum.
  Common side effects: nausea, rash, rare liver injury.
  Safety warnings: avoid overdose and avoid if unsafe for liver disease.
Consult a doctor or pharmacist before taking any medication.

5. When to See Doctor
See a doctor if symptoms last more than 2-3 days, worsen, or include red flags.

6. Emergency Warning (if needed)
Seek urgent care for chest pain, breathing difficulty, severe bleeding, unconsciousness, stroke signs, or rapidly worsening symptoms.
```

## Emergency Detection

The backend has deterministic emergency detection for:

- Chest pain
- Breathing difficulty
- Severe bleeding
- Unconsciousness
- Stroke signs

If detected, the response includes:

```text
⚠️ This may be a medical emergency. Seek immediate medical help or call emergency services.
```
