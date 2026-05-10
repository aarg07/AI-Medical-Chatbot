const isDev = import.meta.env.DEV
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDev ? 'http://127.0.0.1:5000' : '')
console.log(`[API Client] Mode: ${isDev ? 'Development' : 'Production'}`)
console.log('[API Client] Using base URL:', API_BASE_URL || '(current origin)')

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('emergencyGuideUser') || '{}')
  return user.token ? { 'Authorization': `Bearer ${user.token}` } : {}
}

export const apiClient = {
  async register(data) {
    console.log('Registering user:', data.email)
    const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const payload = await res.json()
    if (!res.ok) {
      console.error('Registration failed:', payload)
      throw new Error(payload.error || 'Registration failed')
    }
    return payload
  },

  async login(data) {
    console.log('Logging in user:', data.email)
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const payload = await res.json()
    if (!res.ok) {
      console.error('Login failed:', payload)
      throw new Error(payload.error || 'Login failed')
    }
    return payload
  },

  async chat(messages) {
    console.log('Sending chat messages:', messages.length)
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ messages })
    })
    
    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: 'Server error' }))
      console.error('Chat API error:', payload)
      throw new Error(payload.error || `Server error (${res.status})`)
    }
    
    const payload = await res.json()
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

    const res = await fetch(`${API_BASE_URL}/api/analyze-report`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    })
    
    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: 'Analysis failed' }))
      console.error('Report Analysis API error:', payload)
      throw new Error(payload.error || `Analysis failed (${res.status})`)
    }
    
    const payload = await res.json()
    console.log('Report Analysis API response:', {
      hasAnalysis: Boolean(payload.analysis),
      ocrLength: payload.ocrText?.length || 0,
      mode: payload.mode
    })
    return payload
  },

  async getHistory() {
    const res = await fetch(`${API_BASE_URL}/api/history`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch history')
    return payload
  },

  async getAdminSummary() {
    const res = await fetch(`${API_BASE_URL}/api/admin/summary`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch admin summary')
    return payload
  },

  async searchAdminUsers(query = '') {
    const res = await fetch(`${API_BASE_URL}/api/admin/users?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch users')
    return payload
  },

  async updateAdminUser(userId, data) {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to update user')
    return payload
  },

  async deleteAdminUser(userId) {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to delete user')
    return payload
  },

  async getAdminChats(query = '', page = 1) {
    const res = await fetch(`${API_BASE_URL}/api/admin/chats?q=${encodeURIComponent(query)}&page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch chats')
    return payload
  },

  async getAdminReports(page = 1) {
    const res = await fetch(`${API_BASE_URL}/api/admin/reports?page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch reports')
    return payload
  },

  async getAdminEmergencies() {
    const res = await fetch(`${API_BASE_URL}/api/admin/emergencies`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch emergencies')
    return payload
  },

  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch analytics')
    return payload
  },

  async getAdminLogs() {
    const res = await fetch(`${API_BASE_URL}/api/admin/logs`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch logs')
    return payload
  },

  async sendAdminNotification(data) {
    const res = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error || 'Failed to send notification')
    return payload
  }
}

export async function getAIResponse(messages) {
  const payload = await apiClient.chat(messages)
  return payload.reply || payload.response || 'No response returned from server.'
}
