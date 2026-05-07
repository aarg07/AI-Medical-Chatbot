import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { existsSync } from 'node:fs'
import { mkdir, readFile, unlink } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import tesseract from 'tesseract.js'
import { PDFParse } from 'pdf-parse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const uploadDir = join(__dirname, 'uploads')
const DEFAULT_ADMIN_EMAIL = 'amangupta786083@gmail.com'

async function loadEnv() {
  try {
    const envText = await readFile(join(rootDir, '.env'), 'utf8')
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const [key, ...valueParts] = trimmed.split('=')
      process.env[key] = valueParts.join('=')
    }
  } catch {
    // .env is optional.
  }
}

await loadEnv()
await mkdir(uploadDir, { recursive: true })

const app = express()
const { recognize } = tesseract
const PORT = Number(process.env.PORT || 5000)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medical_chatbot'
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN || '*'
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL)
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '12mb' }))

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB')
    const results = await Promise.allSettled([
      Chat.syncIndexes(),
      Report.syncIndexes(),
      Appointment.syncIndexes(),
    ])
    results.forEach((result) => {
      if (result.status === 'rejected') console.error('MongoDB index sync failed:', result.reason)
    })
    console.log('MongoDB indexes ready: chats/reports are retained until manually deleted')
  })
  .catch(err => console.error('MongoDB connection error:', err))

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  blocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
})
chatSchema.index({ userId: 1, createdAt: -1 })

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysis: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
})
reportSchema.index({ userId: 1, createdAt: -1 })

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  phone: { type: String, required: true },
  concern: { type: String, required: true },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const emergencyAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true },
  severity: { type: String, default: 'high' },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
})

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  sentAt: { type: Date, default: Date.now },
})

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  targetId: { type: String },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now },
})

const User = mongoose.model('User', userSchema)
const Chat = mongoose.model('Chat', chatSchema)
const Report = mongoose.model('Report', reportSchema)
const Appointment = mongoose.model('Appointment', appointmentSchema)
const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema)
const Notification = mongoose.model('Notification', notificationSchema)
const AdminLog = mongoose.model('AdminLog', adminLogSchema)

const geminiApiKey = process.env.GEMINI_API_KEY || ''
const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const grokApiKey = process.env.XAI_API_KEY || ''
const grokModel = process.env.XAI_MODEL || 'grok-3-mini'
const grokUrl = 'https://api.x.ai/v1/chat/completions'
const geminiFallbackModels = [
  geminiModel,
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-lite-latest',
].filter((model, index, models) => model && models.indexOf(model) === index)

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'application/pdf',
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeExt = extname(file.originalname).toLowerCase() || mimeToExt(file.mimetype)
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error('Only image or PDF report files are allowed.'))
      return
    }
    cb(null, true)
  },
})

function mimeToExt(mimeType) {
  if (mimeType === 'image/jpeg') return '.jpg'
  if (mimeType === 'image/png') return '.png'
  if (mimeType === 'image/webp') return '.webp'
  if (mimeType === 'application/pdf') return '.pdf'
  return '.upload'
}

function hasUsableOcrText(text) {
  const readableCharacters = (text.match(/[a-zA-Z0-9]/g) || []).length
  return readableCharacters >= 5
}

function isAdminEmail(email) {
  if (!email) return false
  return ADMIN_EMAILS.includes(String(email).toLowerCase())
}

async function logAdminAction(adminId, action, targetId = null, metadata = {}) {
  try {
    await new AdminLog({ adminId, action, targetId, metadata }).save()
  } catch (error) {
    console.error('[ADMIN LOG] Failed to save log:', error.message)
  }
}

function publicUser(user) {
  return {
    email: user.email,
    name: user.name,
    isAdmin: isAdminEmail(user.email),
  }
}

function createReportAnalysisFallback(summary, emergency = false) {
  return {
    summary,
    lacking: [],
    possible_diseases: [],
    deficiencies: [],
    nutrients_needed: [],
    minerals_needed: [],
    vitamins_needed: [],
    symptoms: [],
    foods_to_eat: [],
    remedies: [
      'Upload a clearer report image or consult a doctor with the original report.',
    ],
    basic_medicines: [
      'Do not start supplements or medicines without a doctor recommendation.',
    ],
    warning: 'See a doctor if symptoms worsen or report values are abnormal.',
    emergency,
  }
}

function createImagingFallbackAnalysis(file) {
  const name = file?.originalname ? ` (${file.originalname})` : ''
  return {
    summary: `The uploaded image${name} appears to be a medical image, but the AI vision service is currently unavailable. For a suspected broken leg or X-ray injury, treat this as a possible fracture until a doctor or radiologist confirms the result.`,
    lacking: [
      'A radiologist report is needed to confirm the exact bone and fracture pattern.',
      'The image-only check cannot safely measure alignment, displacement, or joint involvement while AI vision is offline.',
    ],
    possible_diseases: [
      'Bone fracture',
      'Joint dislocation',
      'Ligament or soft tissue injury',
      'Severe sprain or contusion',
    ],
    deficiencies: [],
    nutrients_needed: [
      'Protein for tissue repair',
      'Calcium and vitamin D if advised by a doctor',
    ],
    minerals_needed: [
      'Calcium',
    ],
    vitamins_needed: [
      'Vitamin D',
    ],
    symptoms: [
      'Severe pain',
      'Swelling',
      'Unable to bear weight',
      'Visible deformity or abnormal movement',
    ],
    foods_to_eat: [
      'Milk, curd, paneer, or other calcium-rich foods if suitable',
      'Dal, eggs, fish, chicken, soy, or paneer for protein',
      'Fruits and vegetables for healing support',
    ],
    remedies: [
      'Do not walk on the injured leg.',
      'Immobilize the leg with a splint or firm support until medical care is available.',
      'Apply an ice pack wrapped in cloth for 15-20 minutes at a time.',
      'Keep the leg elevated if it does not increase pain.',
    ],
    basic_medicines: [
      'Paracetamol may help pain if suitable for you; ask a doctor or pharmacist for dose.',
      'Avoid strong painkillers or anti-inflammatory medicines if there is bleeding, kidney disease, stomach ulcer, or doctor restriction.',
    ],
    warning: 'Go to emergency care or call 102 immediately for severe pain, deformity, numbness, blue/cold toes, open wound, heavy swelling, or inability to move/feel the foot.',
    emergency: true,
  }
}

function extractJsonObject(text) {
  if (!text) return null

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fencedMatch?.[1] || text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null

  try {
    return JSON.parse(candidate.slice(start, end + 1))
  } catch (error) {
    console.error('[REPORT] Failed to parse AI JSON:', error.message)
    return null
  }
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return []
  return value
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 6)
}

function normalizeReportAnalysis(value, fallbackSummary) {
  const parsed = typeof value === 'string' ? extractJsonObject(value) : value
  if (!parsed || typeof parsed !== 'object') {
    return createReportAnalysisFallback(fallbackSummary)
  }

  return {
    summary: String(parsed.summary || fallbackSummary || 'Report analyzed. Please review these simple next steps with a doctor.').trim(),
    lacking: normalizeStringArray(parsed.lacking),
    possible_diseases: normalizeStringArray(parsed.possible_diseases),
    deficiencies: normalizeStringArray(parsed.deficiencies),
    nutrients_needed: normalizeStringArray(parsed.nutrients_needed),
    minerals_needed: normalizeStringArray(parsed.minerals_needed),
    vitamins_needed: normalizeStringArray(parsed.vitamins_needed),
    symptoms: normalizeStringArray(parsed.symptoms),
    foods_to_eat: normalizeStringArray(parsed.foods_to_eat),
    remedies: normalizeStringArray(parsed.remedies),
    basic_medicines: normalizeStringArray(parsed.basic_medicines),
    warning: String(parsed.warning || 'See doctor if symptoms worsen.').trim(),
    emergency: Boolean(parsed.emergency),
  }
}

function buildChatFallbackReply(message) {
  const topic = String(message || 'your symptoms').trim()
  return `### Quick Summary
I could not reach the AI service right now, but I can still give basic safety guidance for: ${topic}.
Use this as general first aid only, not a diagnosis.

### Do Now
- Rest in a safe and comfortable place.
- Drink water unless a doctor has told you to restrict fluids.
- Watch whether symptoms are improving, staying the same, or getting worse.

### Home Care
- Avoid heavy activity until you feel better.
- Eat light food if you can tolerate it.
- Ask a family member or nearby adult to stay aware of your condition.

### Basic Medicines
- Do not start new medicine or supplements without asking a doctor or pharmacist.
- If you already use prescribed medicines, take them only as directed.

### Warning Signs
- Call 102 or visit emergency care for chest pain, breathing trouble, fainting, severe bleeding, seizures, confusion, stroke signs, or rapidly worsening symptoms.`
}

function buildReportInstructions() {
  return `You are a specialized Medical Report and Medical Image Analyst for India.

Use the uploaded medical image and/or OCR text from a user-uploaded report.
Write for non-medical users: short, simple, and practical.
Do not diagnose with certainty. Do not give exact medicine doses.
For X-rays, CT scans, MRI images, or injury photos, describe visible possibilities cautiously and say a radiologist/doctor must confirm.

Return ONLY valid JSON. Do not use markdown. Do not wrap in code fences.

Required JSON shape:
{
  "summary": "Short 3-4 line explanation",
  "lacking": ["Hemoglobin is low", "Vitamin D is below normal"],
  "possible_diseases": ["Anemia", "Vitamin D deficiency"],
  "deficiencies": ["Iron", "Vitamin D"],
  "nutrients_needed": ["Iron", "Vitamin B12"],
  "minerals_needed": ["Iron", "Calcium", "Magnesium"],
  "vitamins_needed": ["Vitamin D", "Vitamin B12", "Folate"],
  "symptoms": ["Fatigue", "Weakness"],
  "foods_to_eat": [
    "Spinach, beetroot, dates, jaggery",
    "Eggs, milk, paneer, fish if suitable",
    "Citrus fruits to help iron absorption"
  ],
  "remedies": [
    "Eat spinach, dates, jaggery",
    "Get sunlight 15-20 min daily"
  ],
  "basic_medicines": [
    "Consult doctor for iron supplements",
    "Vitamin D supplements if prescribed"
  ],
  "warning": "See doctor if symptoms worsen",
  "emergency": false
}

Rules:
- Keep arrays short: 0-5 items each.
- Use plain English.
- If the report has no clear deficiency, use empty arrays.
- For lacking, explain what is low/high in simple words, not only the nutrient name.
- For X-rays or injury scans, use lacking for visible concerns such as possible fracture line, swelling, deformity, displacement, or limited image quality.
- For possible_diseases, say likely possibilities only, never final diagnosis. For leg X-rays consider fracture, dislocation, soft tissue injury, sprain, or contusion when relevant.
- For foods_to_eat, give practical Indian food options when relevant.
- Set emergency true only for dangerous values or urgent symptoms.
- For broken bone or suspected fracture: advise immobilization, no weight-bearing, ice, elevation, urgent orthopedic/radiology review, and emergency care for numb/cold/blue toes, open wound, severe deformity, or uncontrolled pain.
- Mention doctor consultation in basic_medicines or warning.`
}

function buildInstructions() {
  return `You are a medical assistant for India. Respond ONLY to medical queries.

Keep every answer short and easy for non-medical users.

Use this exact structure:
### Quick Summary
2-3 short lines.

### Do Now
- 2-4 clear steps.

### Home Care
- 2-4 safe remedies.

### Basic Medicines
- 1-3 general options, always say to consult a doctor/pharmacist for dose.

### Warning Signs
- When to see a doctor or call emergency services.

EMERGENCY CONTACTS (INDIA):
- Police: 100
- Fire: 101
- Ambulance: 102

If not medical, say: "I can only assist with medical-related questions."`
}

function buildGeminiContents(messages) {
  return messages.slice(-6).map((msg) => {
    const parts = []
    if (msg.content) parts.push({ text: msg.content })
    if (msg.image?.data && msg.image?.mimeType?.startsWith('image/')) {
      parts.push({
        inlineData: {
          mimeType: msg.image.mimeType,
          data: msg.image.data,
        },
      })
    }
    return {
      role: (msg.role === 'assistant' || msg.role === 'ai') ? 'model' : 'user',
      parts,
    }
  }).filter(item => item.parts.length > 0)
}

async function buildImagePayload(file) {
  if (!file?.mimetype?.startsWith('image/') || !file.path || !existsSync(file.path)) return null
  const buffer = await readFile(file.path)
  return {
    data: buffer.toString('base64'),
    mimeType: file.mimetype,
  }
}

function getGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`
}

async function callGemini({ messages, instructions, model = geminiModel }) {
  console.log('[AI] Calling Gemini:', { model, messages: messages.length })

  const response = await fetch(getGeminiUrl(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        role: 'system',
        parts: [{ text: instructions }],
      },
      contents: buildGeminiContents(messages),
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.2,
      },
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('[AI] Gemini API error payload:', payload)
    throw new Error(payload.error?.message || `Gemini failed with status ${response.status}`)
  }

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  console.log('[AI] Gemini response:', text ? text.slice(0, 300) : '[empty]')

  return {
    text: text || 'I could not generate a response. Please try again.',
    sources: payload.candidates?.[0]?.citationMetadata || [],
    mode: `gemini:${model}`,
  }
}

async function callGrok({ messages, instructions }) {
  console.log('[AI] Falling back to Grok:', { model: grokModel, messages: messages.length })

  const response = await fetch(grokUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${grokApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: grokModel,
      messages: [
        { role: 'system', content: instructions },
        ...messages.map(m => ({
          role: (m.role === 'assistant' || m.role === 'ai') ? 'assistant' : 'user',
          content: m.content || '',
        })),
      ],
      temperature: 0.7,
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('[AI] Grok API error payload:', payload)
    throw new Error(payload.error?.message || `Grok failed with status ${response.status}`)
  }

  const text = payload.choices?.[0]?.message?.content?.trim()
  console.log('[AI] Grok response:', text ? text.slice(0, 300) : '[empty]')

  return {
    text: text || 'I could not generate a response. Please try again.',
    sources: [],
    mode: 'grok',
  }
}

async function callAIWithFallback({ messages, instructions }) {
  let lastError = null

  if (geminiApiKey) {
    for (const model of geminiFallbackModels) {
      try {
        return await callGemini({ messages, instructions, model })
      } catch (error) {
        lastError = error
        console.error(`[AI] Gemini failed (${model}):`, error.message)
      }
    }
  } else {
    lastError = new Error('Gemini API key missing')
  }

  if (grokApiKey && grokApiKey !== 'YOUR_XAI_API_KEY_HERE') {
    try {
      return await callGrok({ messages, instructions })
    } catch (error) {
      lastError = error
      console.error('[AI] Grok failed:', error.message)
    }
  }

  throw lastError || new Error('No AI provider available')
}

async function extractTextFromUpload(file) {
  console.log('[UPLOAD] req.file:', file)
  if (!file) return ''

  if (file.mimetype === 'application/pdf') {
    try {
      const buffer = await readFile(file.path)
      const parser = new PDFParse({ data: buffer })
      const result = await parser.getText()
      await parser.destroy()
      const extracted = result.text?.trim() || ''
      console.log('[PDF OCR] Extracted text:', extracted ? extracted.slice(0, 1000) : '[empty]')
      return extracted
    } catch (error) {
      console.error('[PDF OCR] PDF text extraction failed:', error)
      return ''
    }
  }

  if (!existsSync(file.path)) {
    console.error('[OCR] Uploaded file path does not exist:', file.path)
    return ''
  }

  try {
    const result = await recognize(file.path, 'eng')
    const extracted = result.data?.text?.trim() || ''
    console.log('[OCR] Extracted text:', extracted ? extracted.slice(0, 1000) : '[empty]')
    return extracted
  } catch (error) {
    console.error('[OCR] Tesseract failed:', error)
    return ''
  }
}

function verifyToken(req) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

function getRequestUser(req) {
  return verifyToken(req)
}

function requireUser(req, res) {
  const user = getRequestUser(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return user
}

function requireAdmin(req, res) {
  const user = requireUser(req, res)
  if (!user) return null
  if (!isAdminEmail(user.email)) {
    res.status(403).json({ error: 'Admin access required' })
    return null
  }
  return user
}

app.use((req, _res, next) => {
  console.log('[API] Request:', req.method, req.originalUrl)
  next()
})

app.post('/api/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body || {}
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' })
  const normalizedEmail = String(email).trim().toLowerCase()

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) return res.status(400).json({ error: 'User already exists' })

  const hashedPassword = await bcrypt.hash(password, 10)
  await new User({ email: normalizedEmail, password: hashedPassword, name }).save()
  console.log('[API] Register response: success')
  res.status(201).json({ message: 'User registered successfully' })
}))

app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET)
  console.log('[API] Login response: success')
  res.json({ token, user: publicUser(user) })
}))

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    providers: {
      gemini: { status: !!geminiApiKey, model: geminiModel },
      grok: { status: !!grokApiKey && grokApiKey !== 'YOUR_XAI_API_KEY_HERE', model: grokModel },
    },
  })
})

app.get('/api/history', asyncHandler(async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return

  const chats = await Chat.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(10)
  const reports = await Report.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(10)
  res.json({ chats, reports })
}))

app.get('/api/appointments', asyncHandler(async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return

  const appointments = await Appointment.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(20)
  res.json({ appointments })
}))

app.post('/api/appointments', asyncHandler(async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return

  const { patientName, phone, concern, preferredDate, preferredTime } = req.body || {}
  if (!patientName || !phone || !concern || !preferredDate || !preferredTime) {
    return res.status(400).json({ error: 'Please fill all appointment fields.' })
  }

  const appointment = await new Appointment({
    userId: user.userId,
    patientName,
    phone,
    concern,
    preferredDate,
    preferredTime,
  }).save()

  console.log('[APPOINTMENT] Created:', { appointmentId: appointment._id, userId: user.userId })
  res.status(201).json({ appointment })
}))

app.get('/api/admin/summary', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const [users, chats, reports, appointments, emergencies, recentUsersRaw, recentChats, recentReports, recentAppointments] = await Promise.all([
    User.countDocuments(),
    Chat.countDocuments(),
    Report.countDocuments(),
    Appointment.countDocuments(),
    EmergencyAlert.countDocuments(),
    User.find().sort({ _id: -1 }).limit(8).select('name email _id createdAt'),
    Chat.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(8),
    Report.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(8).select('analysis createdAt userId'),
    Appointment.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(8),
  ])

  const recentUsers = await Promise.all(recentUsersRaw.map(async (u) => {
    const [chatCount, reportCount, appointmentCount] = await Promise.all([
      Chat.countDocuments({ userId: u._id }),
      Report.countDocuments({ userId: u._id }),
      Appointment.countDocuments({ userId: u._id }),
    ])
    return { ...u.toObject(), chatCount, reportCount, appointmentCount }
  }))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activeUserIds = new Set()
  const [todayChats, todayReports] = await Promise.all([
    Chat.distinct('userId', { createdAt: { $gte: today } }),
    Report.distinct('userId', { createdAt: { $gte: today } }),
  ])
  todayChats.concat(todayReports).forEach(id => activeUserIds.add(String(id)))

  res.json({
    counts: { 
      users, 
      chats, 
      reports, 
      appointments, 
      emergencies,
      activeUsersToday: activeUserIds.size,
    },
    recentUsers,
    recentChats,
    recentReports,
    recentAppointments,
  })
}))

app.get('/api/admin/users', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const { q, page = 1, limit = 10 } = req.query
  const query = q ? {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  } : {}

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password'),
    User.countDocuments(query)
  ])

  // Augment users with chat/report counts
  const augmentedUsers = await Promise.all(users.map(async (u) => {
    const [chatCount, reportCount] = await Promise.all([
      Chat.countDocuments({ userId: u._id }),
      Report.countDocuments({ userId: u._id })
    ])
    return { ...u.toObject(), chatCount, reportCount }
  }))

  res.json({ users: augmentedUsers, total, pages: Math.ceil(total / limit) })
}))

app.patch('/api/admin/users/:id', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const { blocked } = req.body
  const user = await User.findByIdAndUpdate(req.params.id, { blocked }, { new: true })
  
  await logAdminAction(admin.userId, blocked ? 'BLOCK_USER' : 'UNBLOCK_USER', user._id, { email: user.email })
  
  res.json({ message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`, user })
}))

app.delete('/api/admin/users/:id', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const user = await User.findByIdAndDelete(req.params.id)
  await logAdminAction(admin.userId, 'DELETE_USER', req.params.id, { email: user?.email })

  res.json({ message: 'User deleted successfully' })
}))

app.get('/api/admin/chats', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const { q, page = 1, limit = 10 } = req.query
  const query = q ? { 'messages.content': { $regex: q, $options: 'i' } } : {}

  const [chats, total] = await Promise.all([
    Chat.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Chat.countDocuments(query)
  ])

  res.json({ chats, total, pages: Math.ceil(total / limit) })
}))

app.get('/api/admin/reports', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const { page = 1, limit = 10 } = req.query
  const [reports, total] = await Promise.all([
    Report.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Report.countDocuments()
  ])

  res.json({ reports, total, pages: Math.ceil(total / limit) })
}))

app.get('/api/admin/emergencies', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const emergencies = await EmergencyAlert.find()
    .populate('userId', 'name email')
    .sort({ timestamp: -1 })
    .limit(50)

  const stats = await EmergencyAlert.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ])

  res.json({ emergencies, stats })
}))

app.get('/api/admin/analytics', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const [chatDays, reportDays, emergencyDays, deficiencyRows] = await Promise.all([
    Chat.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Report.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    EmergencyAlert.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Report.aggregate([
      { $project: { deficiencies: '$analysis.analysis.deficiencies' } },
      { $unwind: '$deficiencies' },
      { $group: { _id: '$deficiencies', value: { $sum: 1 } } },
      { $sort: { value: -1, _id: 1 } },
      { $limit: 8 },
    ]),
  ])

  const byDate = new Map()
  const addDailyCounts = (rows, key) => {
    rows.forEach((row) => {
      const current = byDate.get(row._id) || { date: row._id, chats: 0, reports: 0, emergencies: 0 }
      current[key] = row.count
      byDate.set(row._id, current)
    })
  }

  addDailyCounts(chatDays, 'chats')
  addDailyCounts(reportDays, 'reports')
  addDailyCounts(emergencyDays, 'emergencies')

  res.json({
    usageData: Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date)),
    deficiencyStats: deficiencyRows.map(row => ({ name: row._id, value: row.value })),
  })
}))

app.get('/api/admin/logs', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const logs = await AdminLog.find()
    .populate('adminId', 'name email')
    .sort({ timestamp: -1 })
    .limit(100)

  res.json({ logs })
}))

app.post('/api/admin/notifications', asyncHandler(async (req, res) => {
  const admin = requireAdmin(req, res)
  if (!admin) return

  const notification = await new Notification(req.body).save()
  await logAdminAction(admin.userId, 'SEND_NOTIFICATION', notification._id, { title: notification.title })
  res.status(201).json(notification)
}))

app.post('/api/chat', asyncHandler(async (req, res) => {
  const user = getRequestUser(req)
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : []
  const lastMessage = messages.at(-1)?.content?.trim()
  const lowerMessage = lastMessage?.toLowerCase() || ''
  console.log('[CHAT] Incoming messages:', messages.length)

  // Emergency keywords detection
  const emergencyKeywords = ['heart attack', 'stroke', 'seizure', 'severe bleeding', 'unconsciousness', 'cannot breathe', 'heavy bleeding']
  const matchedKeyword = emergencyKeywords.find(kw => lowerMessage.includes(kw))

  if (matchedKeyword && user) {
    console.log('[EMERGENCY] Detected keyword:', matchedKeyword)
    await new EmergencyAlert({
      userId: user.userId,
      type: matchedKeyword.replace(' ', '_'),
      details: lastMessage,
      severity: 'critical'
    }).save()
  }

  if (!lastMessage) {
    return res.status(400).json({ error: 'Message cannot be empty.' })
  }

  try {
    const result = await callAIWithFallback({ messages, instructions: buildInstructions() })
    const payload = { reply: result.text, sources: result.sources, mode: result.mode }
    console.log('[CHAT] Response payload:', { replyPreview: payload.reply.slice(0, 300), mode: payload.mode })

    if (user) {
      await new Chat({
        userId: user.userId,
        messages: [...messages, { role: 'assistant', content: result.text }],
      }).save()
    }

    res.json(payload)
  } catch (error) {
    console.error('[CHAT] AI failed:', error)
    res.json({
      reply: buildChatFallbackReply(lastMessage),
      mode: 'fallback',
      sources: [],
    })
  }
}))

app.post('/api/analyze-report', upload.single('report'), asyncHandler(async (req, res) => {
  const user = getRequestUser(req)
  let uploadedPath = req.file?.path
  console.log('[REPORT] Upload received:', {
    filename: req.file?.originalname,
    mimetype: req.file?.mimetype,
    size: req.file?.size,
  })

  try {
    let ocrText = await extractTextFromUpload(req.file)
    const imagePayload = await buildImagePayload(req.file)

    if (!ocrText && req.body?.ocrText) {
      ocrText = String(req.body.ocrText).trim()
    }

    if (!hasUsableOcrText(ocrText) && !imagePayload) {
      const fallback = req.file?.mimetype === 'application/pdf'
        ? 'Could not extract readable text from this PDF. If it is a scanned PDF, upload a clear image of the report page or paste the report text.'
        : 'OCR could not extract readable text from this report. Please upload a clearer image or type the report values.'
      console.warn('[REPORT] OCR fallback:', fallback)
      return res.json({
        analysis: createReportAnalysisFallback(fallback),
        ocrText: '',
        mode: 'ocr-fallback',
      })
    }

    const messages = [{
      role: 'user',
      content: imagePayload
        ? `Analyze this uploaded medical image or X-ray. OCR text, if any:\n\n${ocrText || '[No readable OCR text extracted]'}`
        : `Analyze this medical report OCR text:\n\n${ocrText}`,
      image: imagePayload,
    }]

    try {
      const result = await callAIWithFallback({ messages, instructions: buildReportInstructions() })
      const analysis = normalizeReportAnalysis(
        result.text,
        'Your report was read. Review the possible findings below and confirm them with a doctor.'
      )
      const payload = {
        analysis,
        ocrText,
        sources: result.sources,
        mode: result.mode,
      }
      console.log('[REPORT] Analysis response:', { analysis, mode: payload.mode })

      if (user) {
        await new Report({ userId: user.userId, analysis: payload }).save()
      }

      res.json(payload)
    } catch (error) {
      console.error('[REPORT] AI analysis failed:', error)
      const analysis = imagePayload
        ? createImagingFallbackAnalysis(req.file)
        : createReportAnalysisFallback('OCR text was extracted, but AI analysis is temporarily unavailable. Please show the report to a doctor.')
      const payload = {
        analysis,
        ocrText,
        mode: imagePayload ? 'image-safety-fallback' : 'ai-fallback',
      }

      if (user) {
        await new Report({ userId: user.userId, analysis: payload }).save()
      }

      res.json({
        ...payload,
      })
    }
  } finally {
    if (uploadedPath) {
      unlink(uploadedPath).catch(error => console.error('[UPLOAD] Cleanup failed:', error))
      uploadedPath = null
    }
  }
}))

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((error, _req, res, _next) => {
  console.error('[API] Unhandled route error:', error)
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Max size is 10MB.' : error.message
    return res.status(400).json({ error: message })
  }
  res.status(500).json({ error: error.message || 'Something went wrong' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Medical chatbot backend running at http://0.0.0.0:${PORT}`)
  console.log(`Primary: Gemini (${geminiModel})`)
  console.log(`Fallback: Grok (${grokModel})`)
})
