const isDev = import.meta.env.DEV
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDev ? 'http://127.0.0.1:5000' : '')
console.log(`[API Client] Mode: ${isDev ? 'Development' : 'Production'}`)
console.log('[API Client] Using base URL:', API_BASE_URL || '(current origin)')

const fetchWithLog = async (path, options) => {
  const url = `${API_BASE_URL}${path}`
  console.log(`[API Client] Fetching: ${options?.method || 'GET'} ${url}`)
  return fetch(url, options)
}

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('emergencyGuideUser') || '{}')
  return user.token ? { 'Authorization': `Bearer ${user.token}` } : {}
}

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const payload = await res.json()
    if (!res.ok) {
      throw new Error(payload.error || `Server Error (${res.status})`)
    }
    return payload
  }
  
  // Handle non-JSON responses (usually HTML error pages)
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`API Endpoint not found (404). Please check your VITE_API_BASE_URL. Current: ${API_BASE_URL || '(current origin)'}`)
    }
    throw new Error(`Server returned non-JSON response (${res.status}). Check server logs.`)
  }
  
  throw new Error('Expected JSON response but received something else.')
}

export const apiClient = {
  async register(data) {
    console.log('Registering user:', data.email)
    const res = await fetchWithLog('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(res)
  },

  async login(data) {
    console.log('Logging in user:', data.email)
    const res = await fetchWithLog('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(res)
  },

  async chat(messages) {
    console.log('Sending chat messages:', messages.length)
    const res = await fetchWithLog('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ messages })
    })
    
    const payload = await handleResponse(res)
    console.log('Chat API response:', {
      hasReply: Boolean(payload.reply),
      mode: payload.mode
    })
    return payload
  },

  async analyzeReport(file) {
    console.log('Analyzing report upload:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    })
    const formData = new FormData()
    formData.append('report', file)

    const res = await fetchWithLog('/api/analyze-report', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    })
    
    const payload = await handleResponse(res)
    console.log('Report Analysis API response:', {
      hasAnalysis: Boolean(payload.analysis),
      ocrLength: payload.ocrText?.length || 0,
      mode: payload.mode
    })
    return payload
  },

  async getHistory() {
    const res = await fetchWithLog('/api/history', {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async getAdminSummary() {
    const res = await fetchWithLog('/api/admin/summary', {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async searchAdminUsers(query = '') {
    const res = await fetchWithLog(`/api/admin/users?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async updateAdminUser(userId, data) {
    const res = await fetchWithLog(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    })
    return handleResponse(res)
  },

  async deleteAdminUser(userId) {
    const res = await fetchWithLog(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async getAdminChats(query = '', page = 1) {
    const res = await fetchWithLog(`/api/admin/chats?q=${encodeURIComponent(query)}&page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async getAdminReports(page = 1) {
    const res = await fetchWithLog(`/api/admin/reports?page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async getAdminEmergencies() {
    const res = await fetchWithLog('/api/admin/emergencies', {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async getAdminAnalytics() {
    const res = await fetchWithLog('/api/admin/analytics', {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async getAdminLogs() {
    const res = await fetchWithLog('/api/admin/logs', {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(res)
  },

  async sendAdminNotification(data) {
    const res = await fetchWithLog('/api/admin/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    })
    return handleResponse(res)
  }
}

export async function getAIResponse(messages) {
  const payload = await apiClient.chat(messages)
  return payload.reply || payload.response || 'No response returned from server.'
}
