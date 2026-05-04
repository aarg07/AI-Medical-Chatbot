import { medicalDataset } from '../data/medicalDataset.js'

const STOP_WORDS = new Set([
  'a', 'am', 'an', 'and', 'are', 'at', 'be', 'been', 'but', 'by', 'did', 'do', 'for', 'from',
  'get', 'got', 'had', 'has', 'have', 'he', 'help', 'her', 'here', 'him', 'his', 'how', 'i',
  'if', 'in', 'into', 'is', 'it', 'its', 'just', 'me', 'my', 'of', 'on', 'or', 'our', 'she',
  'so', 'some', 'someone', 'that', 'the', 'their', 'them', 'there', 'they', 'this', 'to',
  'too', 'very', 'was', 'we', 'were', 'what', 'when', 'with', 'you', 'your',
])

const NON_MEDICAL_KEYWORDS = [
  'weather', 'movie', 'cricket', 'football', 'politics', 'code', 'programming', 'javascript',
  'react', 'css', 'math', 'joke', 'song', 'recipe', 'travel', 'bitcoin', 'stock market',
]

const MEDICAL_KEYWORDS = [
  'pain', 'fever', 'vomit', 'vomiting', 'nausea', 'breathing', 'breath', 'blood', 'bleeding',
  'burn', 'burning', 'cut', 'wound', 'injury', 'fracture', 'broken', 'sprain', 'choking',
  'unconscious', 'fainted', 'passed out', 'seizure', 'stroke', 'heart', 'chest pain', 'allergy',
  'swelling', 'asthma', 'diabetes', 'sugar', 'headache', 'dizziness', 'diarrhea', 'dehydration',
  'heatstroke', 'heat exhaustion', 'hypothermia', 'poison', 'overdose', 'snake bite', 'dog bite',
  'eye', 'rash', 'infection', 'symptom', 'disease', 'medical', 'doctor', 'hospital', 'pcos',
  'pcod', 'period', 'irregular periods', 'migraine', 'uti', 'urine infection', 'thyroid', 'anemia',
]

const CLARIFYING_RULES = [
  {
    keywords: ['fainted', 'passed out', 'collapsed'],
    question: 'Is the person breathing normally right now? Yes or no?',
  },
  {
    keywords: ['chest pain', 'chest pressure'],
    question: 'Is there shortness of breath, sweating, or pain spreading to the arm, jaw, or back?',
  },
  {
    keywords: ['breathing trouble', 'breathlessness', 'shortness of breath'],
    question: 'Is the person able to speak full sentences, or are they too breathless to speak?',
  },
  {
    keywords: ['rash', 'allergy', 'swelling'],
    question: 'Is there any lip swelling, tongue swelling, or trouble breathing?',
  },
  {
    keywords: ['burn', 'burned', 'scald'],
    question: 'Is the burn large, blistered, chemical, electrical, or on the face, hands, feet, genitals, or joints?',
  },
]

const SYMPTOM_SYNONYMS = {
  unconscious: ['passed out', 'not responding', 'unresponsive'],
  breathlessness: ['shortness of breath', 'cannot breathe', 'breathing trouble'],
  seizure: ['fits', 'convulsions', 'jerking movements'],
  hypoglycemia: ['low sugar', 'sugar low'],
  heatstroke: ['heat stroke', 'collapsed in heat'],
  myocardial: ['heart attack', 'chest pressure', 'pain in left arm', 'jaw pain'],
  stroke: ['face drooping', 'slurred speech', 'arm weakness'],
  anaphylaxis: ['severe allergy', 'throat closing', 'epipen'],
  pcos: ['pcod', 'irregular periods', 'facial hair', 'missed periods'],
  uti: ['urine infection', 'burning urine', 'burning urination'],
}

const SEVERITY_BADGE = {
  critical: '[CRITICAL]',
  high: '[CRITICAL]',
  medium: '[MODERATE]',
  urgent: '[MODERATE]',
  low: '[MINOR]',
  basic: '[MINOR]',
}

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const tokenize = (value = '') => normalize(value)
  .split(' ')
  .filter((token) => token && token.length > 1 && !STOP_WORDS.has(token))

const unique = (items) => [...new Set(items.filter(Boolean))]
const containsPhrase = (text, phrase) => {
  const normalizedText = ` ${normalize(text)} `
  const normalizedPhrase = normalize(phrase)

  return normalizedText.includes(` ${normalizedPhrase} `)
}

const expandSynonyms = (query) => {
  const normalized = normalize(query)
  const extraPhrases = []

  Object.entries(SYMPTOM_SYNONYMS).forEach(([root, variants]) => {
    if (normalized.includes(root) || variants.some((variant) => normalized.includes(normalize(variant)))) {
      extraPhrases.push(root, ...variants)
    }
  })

  return unique([normalized, ...extraPhrases]).join(' ')
}

const allKeywordsForEntry = (entry) => unique([
  entry.condition,
  ...entry.symptoms,
  ...entry.keywords,
])

const querySignals = (query) => {
  const expandedQuery = expandSynonyms(query)
  const normalizedQuery = normalize(expandedQuery)
  const queryTokens = tokenize(expandedQuery)

  return {
    expandedQuery,
    normalizedQuery,
    queryTokens,
  }
}

const scoreEntry = (query, entry) => {
  const { normalizedQuery, queryTokens } = querySignals(query)
  const keywordPhrases = allKeywordsForEntry(entry)
  let score = 0

  for (const phrase of keywordPhrases) {
    const normalizedPhrase = normalize(phrase)
    if (!normalizedPhrase) continue

    if (normalizedQuery.includes(normalizedPhrase)) {
      score += Math.max(8, normalizedPhrase.split(' ').length * 4)
    }

    const phraseTokens = tokenize(normalizedPhrase)
    const overlap = phraseTokens.filter((token) => queryTokens.includes(token)).length
    score += overlap * 2
  }

  const normalizedCondition = normalize(entry.condition)
  if (normalizedQuery.includes(normalizedCondition)) {
    score += 12
  }

  if (entry.emergencyLevel.toLowerCase() === 'emergency' && /(cant breathe|cannot breathe|not breathing|unresponsive|choking|stroke|heart attack|seizure|severe bleeding)/.test(normalizedQuery)) {
    score += 6
  }

  if (normalizedCondition.includes('stroke') && /(one arm|one side|arm weakness|speech trouble|slurred speech|face drooping|sudden weakness)/.test(normalizedQuery)) {
    score += 14
  }

  if (normalizedCondition.includes('heart attack') && /(left arm|jaw pain|sweating|pressure in chest|chest pain)/.test(normalizedQuery)) {
    score += 10
  }

  if (normalizedCondition.includes('uti') && /(urination|pee|peeing|urine|burning urine|burning urination)/.test(normalizedQuery)) {
    score += 10
  }

  return score
}

export const isMedicalQuery = (query = '') => {
  const normalized = normalize(query)
  if (!normalized) return true

  const hasMedicalSignal = MEDICAL_KEYWORDS.some((keyword) => normalized.includes(normalize(keyword)))
  const hasNonMedicalSignal = NON_MEDICAL_KEYWORDS.some((keyword) => normalized.includes(normalize(keyword)))

  return hasMedicalSignal || !hasNonMedicalSignal
}

export const getClarifyingQuestion = (query = '') => {
  const normalized = normalize(query)
  const shortQuery = tokenize(normalized).length <= 5

  if (!shortQuery) return null

  const matchedRule = CLARIFYING_RULES.find(({ keywords }) => (
    keywords.some((keyword) => containsPhrase(normalized, keyword))
  ))

  return matchedRule?.question || null
}

export const searchMedicalDataset = (query, limit = 3) => {
  if (!query?.trim()) return []

  return medicalDataset
    .map((entry) => ({ ...entry, score: scoreEntry(query, entry) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
}

const fallbackStepsFor = (entry) => {
  const generalSteps = []
  const level = normalize(entry.emergencyLevel)

  if (level.includes('emergency')) {
    generalSteps.push('Call 112 immediately or ask someone nearby to call.')
    generalSteps.push('Watch breathing and consciousness continuously while waiting for help.')
  } else if (level.includes('urgent')) {
    generalSteps.push('Arrange urgent medical review as soon as possible.')
  } else {
    generalSteps.push('Stop normal activity and reassess if symptoms get worse.')
  }

  generalSteps.push('Keep the person calm and as still as possible.')

  return generalSteps
}

export const buildDatasetResponse = (query) => {
  const matches = searchMedicalDataset(query, 3)
  const bestMatch = matches[0]

  if (!bestMatch) return null

  const severity = SEVERITY_BADGE[normalize(bestMatch.severity)] || '[MODERATE]'
  const orderedSteps = unique([
    ...bestMatch.steps,
    ...fallbackStepsFor(bestMatch),
  ]).slice(0, 6)

  const isEmergency = normalize(bestMatch.emergencyLevel).includes('emergency')
  const heading = isEmergency ? 'Emergency detected' : 'Medical concern'

  const lines = [
    `${heading}: ${bestMatch.condition}`,
    severity,
    ...orderedSteps.map((step, index) => `${index + 1}. ${step}`),
  ]

  if (bestMatch.whenToSeekHelp.length > 0) {
    lines.push('')
    lines.push(`Get medical help urgently if: ${bestMatch.whenToSeekHelp.join(', ')}.`)
  }

  lines.push('')
  lines.push(
    isEmergency
      ? 'WARNING: If symptoms are severe or worsening, call emergency services immediately: 112 (India)'
      : 'WARNING: Seek urgent medical care if red-flag symptoms appear or the condition is getting worse.',
  )

  return {
    bestMatch,
    matches,
    response: lines.join('\n'),
  }
}

export const formatDatasetContext = (matches) => {
  if (!matches.length) return 'No close local medical dataset matches were found.'

  return matches.map((entry, index) => [
    `Match ${index + 1}: ${entry.condition}`,
    `Emergency level: ${entry.emergencyLevel}`,
    `Severity: ${entry.severity}`,
    `Symptoms: ${entry.symptoms.join(', ')}`,
    `Immediate steps: ${entry.steps.join('; ')}`,
    `Seek help when: ${entry.whenToSeekHelp.join('; ')}`,
    `Dataset source: ${entry.source}`,
  ].join('\n')).join('\n\n')
}
