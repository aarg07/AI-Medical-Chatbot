const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export const getAIResponse = async (conversationHistory) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: conversationHistory }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch from backend')
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error('Error fetching AI response from medical backend:', error)
    return `Error: Could not connect to the medical AI backend. Please ensure the Node API is running. (${error.message})`
  }
}

export const analyzeMedicalReport = async (messages) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch from backend')
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error('Error analyzing medical report:', error)
    throw error
  }
}
