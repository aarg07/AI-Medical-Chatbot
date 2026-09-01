# 🚑 Emergency Guide AI — Medical Assistance Chatbot

> A React + Node.js chatbot for educational symptom triage, first-aid guidance, emergency detection, and general OTC medicine information — powered by the OpenAI Responses API, with optional live web search and OpenFDA drug-label lookups.

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/) [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/) [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/) [![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://platform.openai.com/) [![OpenFDA](https://img.shields.io/badge/OpenFDA-005EA2?style=for-the-badge)](https://open.fda.gov/)

---

## 🧠 Tech Stack

| Layer            | Technology                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| Frontend         | ![React](https://img.shields.io/badge/React-flat?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-flat?logo=vite&logoColor=white) |
| Backend          | ![Node.js](https://img.shields.io/badge/Node.js-flat?logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-flat?logo=express&logoColor=white) |
| AI Reasoning     | OpenAI Responses API                                                       |
| Live Info        | OpenAI Web Search Tool *(optional)*                                        |
| Drug Label Data  | OpenFDA Drug Label API *(optional)*                                        |
| Offline Fallback | Local `backend/medical_data.json`                                          |
| Media Input      | Image upload for visible symptoms/injuries                                 |

---

## 📁 Folder Structure

```
AI-Medical-Chatbot/
├── backend/                  ← Express server, /health & /api/chat routes, emergency detection, medical_data.json fallback
├── public/                   ← Static assets served by Vite
├── src/                      ← React frontend (chat UI, components, image upload)
├── PROJECT_REPORT.md         ← Written project report
├── convert.cjs               ← Conversion/build helper script
├── eslint.config.js          ← Linting rules
├── index.html                ← Vite entry point
├── vite.config.js            ← Vite build/dev configuration
├── package.json               ← Scripts (dev:all) and dependencies
├── package-lock.json
├── .gitignore
└── README.md
```

---

## ⚙️ How It Works

1. Load a user's natural-language message (symptoms, questions, or an uploaded image of a visible injury/symptom).
2. Run deterministic emergency detection against known red-flag patterns — chest pain, breathing difficulty, severe bleeding, unconsciousness, stroke signs.
3. Route the message to the **OpenAI Responses API** for reasoning, optionally invoking the **web search tool** for current supporting information.
4. Optionally enrich medicine mentions with label context pulled from the **OpenFDA Drug Label API**.
5. Fall back to local `backend/medical_data.json` when no API key is configured, so the demo still works offline.
6. Assemble the response into a fixed **6-part structure** (Symptoms Summary, Possible Causes, What You Can Do, Medicines Info, When to See a Doctor, Emergency Warning).
7. Prepend an urgent emergency banner whenever a red-flag symptom is detected.
8. Serve the chat through the **React frontend** talking to the **Express backend** over `/api/chat`.

---

## ⚠️ Safety Position

The chatbot is for **educational and assistance purposes only**.

- This is not medical advice.
- It does not diagnose.
- It does not prescribe.
- It gives only general OTC medicine information.
- It encourages doctor/pharmacist consultation.
- It urgently flags chest pain, breathing difficulty, severe bleeding, unconsciousness, and stroke signs.

---

## 🛠️ Setup

### 1. Install dependencies

```
npm install
```

### 2. Configure environment

Create or update `.env`:

```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-5.2
OPENAI_ENABLE_WEB_SEARCH=true
OPENFDA_API_KEY=
```

`OPENFDA_API_KEY` is optional — OpenFDA works without a key for low-volume testing, but a key improves rate limits.

### 3. Run frontend and backend together

```
npm run dev:all
```

Open the app:

```
http://localhost:5173
```

Backend health check:

```
http://127.0.0.1:5000/health
```

---

## 📡 API

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

```
This is not medical advice.

1. Symptoms Summary
2. Possible Causes (2-3)
3. What You Can Do
4. Medicines Info (if relevant)
5. When to See Doctor
6. Emergency Warning (if needed)
```

---

## 📊 Sample Output

User:

```
I have fever and headache
```

Bot:

```
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

---

## 🚨 Emergency Detection

The backend has deterministic emergency detection for:

- Chest pain
- Breathing difficulty
- Severe bleeding
- Unconsciousness
- Stroke signs

If detected, the response includes:

```
⚠️ This may be a medical emergency. Seek immediate medical help or call emergency services.
```

---

## ✅ What It Gives You (Key Outcomes)

- A **structured, always-consistent 6-part response format** for every symptom query, whether the model runs on live OpenAI reasoning or the offline fallback data.
- **Deterministic, model-independent emergency detection** layered on top of the AI response — red flags are caught even if the language model misses them.
- Optional **real-time grounding** via the OpenAI web search tool for current health guidance, plus optional **OpenFDA lookups** for accurate OTC medicine label details.
- A **no-API-key demo mode** via `backend/medical_data.json`, so the project stays runnable and testable without live credentials.
- **Image upload support** for visible symptoms or injuries, extending triage beyond text-only input.

---

## 📦 Requirements

```
react
node.js
express
vite
openai
```

Install all with:

```
npm install
```

---

## 🌐 Live Demo

[ai-medical-chatbot-i4ii.onrender.com](https://ai-medical-chatbot-i4ii.onrender.com/)

---

## 📄 License

Add your preferred license (e.g. MIT) and a `LICENSE` file to the repo if you plan to distribute this publicly.

---

## 🙏 Thank You

Thank you for checking out this project!

If you found it helpful, consider giving it a ⭐ on GitHub. Your support is appreciated and encourages future improvements.

Stay safe, and remember: this is not medical advice. 🚑
