import { useEffect, useRef, useState } from 'react'
import { getAIResponse } from '../utils/apiClient'

const openingMessage = {
  role: 'ai',
  content: 'Hello. I am your medical assistant for symptoms, first aid, and general medicine information. This is not medical advice. Tell me your symptoms, timing, age group, and red flags like chest pain, breathing difficulty, severe bleeding, unconsciousness, or stroke signs when possible.\n\nWARNING: If symptoms are severe or worsening, seek immediate medical help or call emergency services.',
}

export function useChat() {
  const [messages, setMessages] = useState([openingMessage])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatBottomRef = useRef(null)

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = async (textOverride = null, imageOverride = null) => {
    const textToSend = textOverride || input
    if (!textToSend.trim() && !imageOverride) return

    const newMessages = [
      ...messages,
      { role: 'user', content: textToSend, image: imageOverride },
    ]

    setMessages(newMessages)
    if (!textOverride) setInput('')
    setIsLoading(true)

    try {
      const responseText = await getAIResponse(newMessages)
      setMessages([...newMessages, { role: 'ai', content: responseText }])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'ai',
          content: 'Network failure. This is not medical advice. ⚠️ If symptoms are severe or worsening, seek immediate medical help or call emergency services.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    chatBottomRef,
  }
}
