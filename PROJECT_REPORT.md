# Medical Chatbot Project Report

## 1. Project Title

**Emergency Guide AI: OpenAI-Based Medical Chatbot for Symptom Triage, First Aid, and General Medicine Information**

## 2. Abstract

Emergency Guide AI is a healthcare assistance chatbot built to help users understand symptoms, identify possible causes, receive first-aid steps, learn safe general over-the-counter medicine information, and detect emergency warning signs. The system uses a React frontend and a Node.js backend. The backend integrates with the OpenAI GPT Responses API and optionally enriches medicine answers using the OpenFDA Drug Label API.

The chatbot is designed for educational and assistance purposes only. It does not diagnose, prescribe, or replace medical professionals. It always includes a medical disclaimer and encourages users to consult a doctor or pharmacist before taking medication.

## 3. Problem Statement

People often search online when they experience symptoms such as fever, headache, stomach pain, rashes, or injuries. Search results can be confusing, delayed, or unsafe during urgent situations. The goal of this project is to provide a single user-friendly chatbot that gives structured, safe, and easy-to-understand health guidance.

The project also detects emergency symptoms such as chest pain, breathing difficulty, severe bleeding, unconsciousness, and stroke signs, then immediately advises urgent medical help.

## 4. Objectives

- Accept symptoms in natural language.
- Provide possible causes, not a final diagnosis.
- Suggest next steps such as rest, hydration, doctor visit, or emergency care.
- Provide general OTC medicine information only.
- Include typical adult dosage ranges as general education, not personalized dosing.
- Show common side effects and safety warnings.
- Detect emergency symptoms and respond urgently.
- Support symptom or injury image upload.
- Use OpenAI GPT API for intelligent medical responses.
- Optionally use OpenFDA for drug label information.
- Provide local fallback responses if the API key is missing or unavailable.

## 5. Scope

The chatbot supports:

- General symptom triage
- First-aid guidance
- Emergency warning detection
- General medicine education
- Basic OTC guidance
- Image-based visible symptom context
- PDF export of chat session
- Voice input and text-to-speech

The chatbot does not:

- Diagnose disease
- Prescribe medicines
- Provide personalized dosage
- Recommend restricted drugs
- Replace doctors, pharmacists, hospitals, or emergency services

## 6. Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons
- React Markdown
- html2canvas
- jsPDF
- Browser Web Speech API

### Backend

- Node.js HTTP server
- OpenAI Responses API
- Optional OpenFDA Drug Label API
- Local JSON medical dataset fallback

### AI Model

- Default model: `gpt-5.2`
- Configurable through `.env` using `OPENAI_MODEL`

## 7. System Architecture

The system has three layers:

### 7.1 User Interface Layer

The frontend provides:

- Chat window
- Message bubbles
- Text input
- Image upload
- Voice input
- Quick action chips
- Emergency contact panel
- PDF export

### 7.2 Backend API Layer

The backend runs locally on:

```text
http://127.0.0.1:5000
```

Main endpoints:

```text
GET /health
POST /api/chat
```

The backend protects API keys, detects emergencies, prepares medical safety instructions, adds medicine context, calls OpenAI, and returns a structured response.

### 7.3 Knowledge and AI Layer

The AI layer includes:

- OpenAI GPT Responses API
- Optional OpenAI web search tool
- Optional OpenFDA Drug Label API
- Local `medical_data.json` first-aid dataset
- Built-in medicine catalog for common OTC guidance

## 8. Data Flow

1. User enters symptoms or uploads an image.
2. React frontend sends the chat history to `POST /api/chat`.
3. Backend reads the latest user message.
4. Backend checks for emergency symptoms.
5. Backend matches symptoms with the local medical dataset.
6. Backend selects relevant OTC medicine information if needed.
7. Backend optionally fetches OpenFDA label context.
8. If `OPENAI_API_KEY` is configured, backend calls OpenAI Responses API.
9. If OpenAI is unavailable or missing, backend returns a local fallback answer.
10. Frontend renders the response in the required medical format.

## 9. Emergency Detection

The backend has deterministic checks for:

- Chest pain
- Breathing difficulty
- Severe bleeding
- Unconsciousness
- Stroke signs

If detected, the chatbot includes:

```text
⚠️ This may be a medical emergency. Seek immediate medical help or call emergency services.
```

This rule is handled before AI generation so emergency behavior does not depend only on the model.

## 10. Medicine Module

The medicine module provides general educational information only.

For medicine-related questions it can include:

- Common medicines used for symptoms
- General purpose
- Typical adult dosage range
- Common side effects
- Safety warnings

Example OTC medicines:

- Paracetamol / Acetaminophen for fever or mild pain
- Ibuprofen for pain, fever, or inflammation
- Cetirizine or Loratadine for mild allergies
- ORS for dehydration from vomiting or diarrhea
- Antacid for mild acidity
- Saline nasal spray for nasal congestion

The chatbot always includes:

```text
Consult a doctor or pharmacist before taking any medication.
```

The system avoids:

- Antibiotics
- Steroids
- Opioids
- Prescription-only drugs
- Personalized dosage instructions

## 11. OpenAI Integration

The backend uses the OpenAI Responses API:

```http
POST https://api.openai.com/v1/responses
```

The backend sends:

- Model name
- Medical safety instructions
- User symptoms
- Conversation context
- Optional uploaded image
- Local dataset context
- Medicine module context
- Optional OpenFDA context

The API key is stored only in `.env`:

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-5.2
OPENAI_ENABLE_WEB_SEARCH=true
OPENFDA_API_KEY=
```

## 12. OpenFDA Integration

OpenFDA is optional. It is used for extra medicine label context such as:

- Purpose
- Warnings
- Adverse reactions
- Drug label information

Endpoint used:

```text
https://api.fda.gov/drug/label.json
```

OpenFDA can work without a key for low-volume testing. An API key can be added for better rate limits.

## 13. Image Upload

The frontend allows users to upload an image of visible symptoms or injuries. The image is converted to Base64 and sent to the backend.

The backend forwards it to OpenAI as image input when `OPENAI_API_KEY` is available.

Use cases:

- Rash image
- Minor wound image
- Burn image
- Swelling image
- Visible injury image

Safety limitation:

Image review is only supportive and cannot replace an in-person medical examination.

## 14. Response Format

Every response follows this structure:

```text
This is not medical advice.

1. Symptoms Summary
2. Possible Causes (2-3)
3. What You Can Do
4. Medicines Info (if relevant)
5. When to See Doctor
6. Emergency Warning (if needed)
```

## 15. API Details

### Health Check

```http
GET /health
```

Example:

```json
{
  "status": "ok",
  "provider": "OpenAI",
  "model": "gpt-5.2",
  "fallback": true,
  "optionalApis": ["OpenFDA Drug Label API"]
}
```

### Chat Endpoint

```http
POST /api/chat
```

Example request:

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

Example response:

```json
{
  "response": "This is not medical advice.\n\n1. Symptoms Summary\n...",
  "sources": [],
  "mode": "local-fallback"
}
```

## 16. Sample Output

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
- Possible tension headache

3. What You Can Do
- Rest and avoid heavy activity.
- Drink fluids.
- Monitor temperature and symptom duration.

4. Medicines Info (if relevant)
- Paracetamol / Acetaminophen: Fever reduction and mild to moderate pain relief.
  Typical adult dosage range: 500-1000 mg every 4-6 hours as needed; do not exceed the label maximum.
  Common side effects: nausea, rash, rare liver injury.
  Safety warnings: avoid overdose and avoid if unsafe with liver disease.
Consult a doctor or pharmacist before taking any medication.

5. When to See Doctor
See a doctor if symptoms last more than 2-3 days, worsen, or include red flags.

6. Emergency Warning (if needed)
Seek urgent care for chest pain, breathing difficulty, severe bleeding, unconsciousness, stroke signs, or rapidly worsening symptoms.
```

## 17. Setup Instructions

Install dependencies:

```bash
npm install
```

Configure `.env`:

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-5.2
OPENAI_ENABLE_WEB_SEARCH=true
OPENFDA_API_KEY=
```

Run frontend and backend:

```bash
npm run dev:all
```

Open the app:

```text
http://localhost:5173
```

Check backend:

```text
http://127.0.0.1:5000/health
```

## 18. Current Status

Verified:

- Frontend production build passes.
- Backend syntax check passes.
- API runs on port 5000.
- Health endpoint works.
- Chat endpoint works.
- Emergency detection works.
- Local fallback works without OpenAI key.
- Medicine module provides general OTC information and warnings.

## 19. Limitations

- The chatbot is not a doctor.
- It cannot confirm diagnosis.
- It cannot safely personalize medicine dosing.
- It cannot replace emergency services.
- OpenAI live responses require a valid API key.
- Image analysis can miss clinically important details.
- OpenFDA data may be incomplete or unavailable for some medicines.

## 20. Future Enhancements

- Add Infermedica symptom checker integration.
- Add RxNorm medicine normalization.
- Add source citations UI.
- Add multilingual responses.
- Add user location-based hospital lookup.
- Add account login and secure chat history.
- Add stronger clinical rule engine for red flags.
- Add deployment on cloud backend with HTTPS.
- Add audit logs and monitoring for production safety.

## 21. Conclusion

Emergency Guide AI demonstrates how a healthcare chatbot can be built responsibly using OpenAI GPT, a Node.js backend, optional drug data APIs, and strict safety rules. The project focuses on education, first aid, symptom triage, and emergency awareness while avoiding diagnosis and prescription. It is suitable for academic demonstration, healthcare software learning, and safe AI-assisted first-response guidance.
