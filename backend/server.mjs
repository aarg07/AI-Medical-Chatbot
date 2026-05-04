import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

async function loadEnv() {
  try {
    const envText = await readFile(join(rootDir, '.env'), 'utf8')
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const [key, ...valueParts] = trimmed.split('=')
      process.env[key] ??= valueParts.join('=')
    }
  } catch {
    // .env is optional.
  }
}

await loadEnv()

const geminiApiKey = process.env.GEMINI_API_KEY || ''
const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  })
  res.end(JSON.stringify(payload))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 12 * 1024 * 1024) {
        reject(new Error('Request is too large.'))
        req.destroy()
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON request body.'))
      }
    })
    req.on('error', reject)
  })
}

function buildReportInstructions() {
  return `You are a world-class medical diagnostic specialist. 
  
Your task is to perform an EXTREMELY DETAILED analysis of the provided medical report image. 

DIAGNOSTIC REQUIREMENTS:
1. Data Extraction: Scan the entire image for laboratory values (e.g., Hemoglobin, Glucose, Vitamin levels, etc.). Note the result, the reference range, and any "H" (High) or "L" (Low) indicators.
2. Symptom & Finding Detection: Identify every clinical finding or observation mentioned.
3. Condition & Disease Identification: Diagnose the most likely conditions or diseases based on the extracted data. Categorize by type (e.g., Cardiovascular, Endocrine, etc.).
4. Nutritional & Elemental Analysis: Specifically identify any deficiencies in Vitamins (D, B12, etc.) or Minerals (Iron, Calcium, etc.).
5. Comprehensive Solutions: Provide lifestyle changes, dietary recommendations, and first-line home care.
6. Basic General Medicines: Suggest common over-the-counter medications or supplements that might address the findings.
7. Triage Recommendation: Provide a clear, binary "Consult Physician / Hospitalize" vs "Monitor at Home" recommendation with detailed reasoning.

RESPONSE FORMAT (Professional & Thorough):
# Detailed Medical Diagnostic Report

## 1. Laboratory Value Analysis
| Parameter | Result | Reference Range | Interpretation |
|-----------|--------|-----------------|----------------|
[Extract all possible table data here]

## 2. Clinical Findings & Observations
[Detailed bullet points]

## 3. Likely Diagnosis & Condition Type
- **Primary Condition:** [Name]
- **Category:** [e.g., Metabolic, Infectious, etc.]
- **Confidence Level:** [High/Medium/Low]

## 4. Nutritional & Vitamin Deficiency Report
[List specific deficiencies and potential impact]

## 5. Recommended Solutions & Home Care
[Detailed actionable plan]

## 6. General Medication & Supplements
[List items with generic names]

## 7. Hospitalization / Specialist Guidance
- **Recommendation:** [Urgent / Consult Soon / Monitor]
- **Reasoning:** [Why this decision was made]

MANDATORY SAFETY:
- Start with: "⚠️ AI-GENERATED DIAGNOSTIC SUMMARY. NOT A REPLACEMENT FOR PROFESSIONAL MEDICAL ADVICE."
- Always include: "This analysis is for educational purposes. You MUST present this report to a qualified doctor before making any medical decisions."
- Do not prescribe exact dosages.`
}

function buildInstructions() {
  return `You are a medical information assistant.

Only respond to queries that are strictly related to medical topics, including symptoms, diseases, medications, treatments, anatomy, or general health advice.

If the user input is not clearly medical in nature, respond with:
“I can only assist with medical-related questions.”

For medical queries:
- Provide SHORT but DETAILED and highly accurate information.
- Use simple, human-readable language (avoid excessive medical jargon).
- Focus on providing actionable home-care solutions and basic general medicine advice where safe.
- If the situation involves an emergency, prioritize immediate, accurate life-saving steps and advise seeking urgent medical attention.

Safety Protocols:
- Do not provide a definitive diagnosis.
- Do not prescribe specific medications or exact dosages.
- Always encourage consulting a qualified healthcare professional for serious concerns.`
}

function buildGeminiContents(messages) {
  return messages.slice(-6).map((msg) => {
    const parts = []
    if (msg.content) {
      parts.push({ text: msg.content })
    }
    if (msg.image?.data && msg.image?.mimeType?.startsWith('image/')) {
      parts.push({
        inlineData: {
          mimeType: msg.image.mimeType,
          data: msg.image.data
        }
      })
    }
    return {
      role: (msg.role === 'assistant' || msg.role === 'ai') ? 'model' : 'user',
      parts
    }
  })
}

async function callGemini({ messages, instructions }) {
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `INSTRUCTIONS:\n${instructions}\n\nPlease acknowledge these instructions.` }] },
        { role: 'model', parts: [{ text: 'Understood. I will follow these instructions and safety protocols strictly.' }] },
        ...buildGeminiContents(messages)
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      }
    }),
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error?.message || JSON.stringify(payload))
  }

  const responseText = payload.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.'

  return {
    response: responseText,
    sources: [],
    mode: 'gemini',
  }
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      provider: 'Gemini',
      model: geminiModel,
    })
    return
  }

  if (req.method !== 'POST' || (req.url !== '/api/chat' && req.url !== '/api/analyze-report')) {
    sendJson(res, 404, { error: 'Not found' })
    return
  }

  try {
    const body = await readJson(req)
    const messages = body.messages || []
    
    if (!geminiApiKey) {
      sendJson(res, 200, {
        response: 'API Key missing. Please set GEMINI_API_KEY in the .env file.',
        mode: 'error',
      })
      return
    }

    if (req.url === '/api/analyze-report') {
      const instructions = buildReportInstructions()
      const result = await callGemini({ messages, instructions })
      sendJson(res, 200, result)
      return
    }

    const instructions = buildInstructions()
    const result = await callGemini({ messages, instructions })
    sendJson(res, 200, result)
  } catch (error) {
    console.error('Medical chatbot backend error:', error.message)
    const status = error.message.includes('quota') ? 429 : 500
    sendJson(res, status, { error: error.message || 'An internal error occurred.' })
  }
})

server.listen(5000, '0.0.0.0', () => {
  console.log(`Gemini medical chatbot API running at http://0.0.0.0:5000`)
})
