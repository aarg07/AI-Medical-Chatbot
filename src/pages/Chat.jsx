import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, User, Bot, AlertTriangle, History, Phone, MapPin, X, PlusCircle, Heart } from 'lucide-react'
import { apiClient } from '../utils/apiClient'
import SafeMarkdown from '../components/SafeMarkdown'

function splitReplySections(content) {
  const text = typeof content === 'string' ? content : String(content || '')
  const sections = []
  const regex = /^###\s+(.+)$/gm
  const matches = [...text.matchAll(regex)]

  if (!matches.length) return null

  matches.forEach((match, index) => {
    const start = match.index + match[0].length
    const end = matches[index + 1]?.index ?? text.length
    const body = text.slice(start, end).trim()
    sections.push({ title: match[1].trim(), body })
  })

  return sections.filter(section => section.body)
}

function AssistantReply({ content }) {
  const sections = splitReplySections(content)

  if (!sections) {
    return (
      <SafeMarkdown className="markdown-content">
        {content || '...'}
      </SafeMarkdown>
    )
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            {section.title}
          </p>
          <SafeMarkdown className="markdown-content text-sm">
            {section.body}
          </SafeMarkdown>
        </div>
      ))}
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadHistory = async () => {
    try {
      const data = await apiClient.getHistory()
      setHistory(data.chats || [])
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const data = await apiClient.chat(newMessages)
      const reply = data.reply || data.response || data.error || 'No response returned from server.'
      const assistantMessage = { role: 'assistant', content: reply, mode: data.mode }
      setMessages(prev => [...prev, assistantMessage])
      loadHistory()
    } catch (error) {
      console.error('Chat request failed:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message || 'Could not reach the backend. Please try again.'}`,
        isError: true 
      }])
    } finally {
      setLoading(false)
    }
  }

  const findNearestHospital = () => {
    window.open('https://www.google.com/maps/search/nearest+hospital', '_blank')
  }

  const quickAction = (text) => {
    setInput(text)
  }

  return (
    <div className="chat-shell flex w-full gap-4 overflow-hidden">
      {/* Left Sidebar - History & Emergencies */}
      <div className={`chat-card flex flex-col transition-all duration-300 ${showHistory ? 'w-80 max-lg:absolute max-lg:inset-y-0 max-lg:left-3 max-lg:z-30 max-lg:w-[calc(100vw-1.5rem)] sm:max-lg:w-80' : 'w-0 opacity-0 pointer-events-none overflow-hidden'}`}>
        <div className="flex items-center justify-between border-b border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <span className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-slate-900 dark:text-white">
            <History className="h-4 w-4 text-red-600" />
            History
          </span>
          <button onClick={() => setShowHistory(false)} className="rounded-xl p-2 transition-colors hover:bg-white dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {/* Emergency Contacts Section */}
          <div className="space-y-4">
            <h3 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Emergency Contacts</h3>
            <div className="grid gap-2">
              <a href="tel:100" className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-3 transition-transform hover:scale-[1.01] dark:border-red-900/50 dark:bg-red-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">Police</span>
                </div>
                <span className="text-lg font-black text-red-600">100</span>
              </a>
              <a href="tel:101" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-3 transition-transform hover:scale-[1.01] dark:border-orange-900/50 dark:bg-orange-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">Fire</span>
                </div>
                <span className="text-lg font-black text-orange-600">101</span>
              </a>
              <a href="tel:102" className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 p-3 transition-transform hover:scale-[1.01] dark:border-blue-900/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">Ambulance</span>
                </div>
                <span className="text-lg font-black text-blue-600">102</span>
              </a>
            </div>
          </div>

          {/* Recent History Section */}
          <div className="space-y-4">
            <h3 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Past Chats</h3>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-5 text-center text-xs italic text-slate-500 dark:bg-slate-900/40">No previous sessions.</p>
              ) : (
                history.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => setMessages(chat.messages)}
                    className="group w-full rounded-2xl border border-transparent p-3 text-left transition-all hover:border-slate-100 hover:bg-white hover:shadow-md dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <p className="text-xs font-black truncate text-slate-800 dark:text-white group-hover:text-red-600">
                      {chat.messages[0]?.content || 'New Chat'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-card relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/76 p-4 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/74 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-xl shadow-red-100 dark:shadow-none">
              <Heart className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">Medical AI Assistant</h2>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Online India Region</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-shrink-0 gap-2">
            <button 
              onClick={findNearestHospital}
              className="hidden items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 dark:bg-white dark:text-slate-900 dark:shadow-none sm:flex"
            >
              <MapPin className="h-4 w-4" />
              <span>Find Nearest Hospital</span>
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`rounded-2xl p-2.5 shadow-sm transition-all ${showHistory ? 'bg-red-600 text-white shadow-red-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
              title="Toggle History"
            >
              <History className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,rgba(251,113,133,0.05),transparent_32%)] p-4 scroll-smooth sm:p-6"
        >
          {messages.length === 0 && (
            <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center py-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <Bot className="h-9 w-9 text-red-500" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">Welcome to Emergency Hub</p>
                <p className="mx-auto max-w-xl text-sm font-semibold leading-7 text-slate-500 sm:text-base">
                  Describe your symptoms for instant remedies and emergency steps. 
                  India: Call 102 for ambulance support.
                </p>
              </div>
              <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                <button onClick={() => quickAction('Stomach pain remedies')} className="rounded-2xl border border-slate-200 bg-white p-3 text-xs font-black text-slate-700 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-red-950/20">Stomach Pain</button>
                <button onClick={() => quickAction('First aid for burns')} className="rounded-2xl border border-slate-200 bg-white p-3 text-xs font-black text-slate-700 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-red-950/20">Burn First Aid</button>
                <button onClick={findNearestHospital} className="rounded-2xl bg-red-600 p-3 text-xs font-black text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 dark:shadow-none">Nearest Hospital</button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-300`}
            >
              <div className={`flex max-w-[95%] gap-3 sm:max-w-[82%] xl:max-w-[72%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl shadow-lg ${
                  msg.role === 'user' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-red-600 text-white'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <div className={`rounded-3xl p-4 text-sm font-medium leading-relaxed shadow-sm sm:p-5 ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-md' 
                    : msg.isError 
                      ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-md shadow-md'
                }`}>
                  {msg.role === 'user' ? (
                    <SafeMarkdown className="markdown-content">
                      {msg.content || '...'}
                    </SafeMarkdown>
                  ) : (
                    <AssistantReply content={msg.content} />
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-800">
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">AI is analyzing symptoms...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="sticky bottom-0 border-t border-slate-100 bg-white/82 p-4 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/82 sm:p-5">
          <div className="group relative mx-auto max-w-5xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What medical issue are you facing?"
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-5 pr-16 text-sm font-bold shadow-inner shadow-slate-200/40 transition-all placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none dark:focus:bg-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95 disabled:bg-slate-400 disabled:opacity-60 dark:shadow-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center opacity-70">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              India Emergency: 100 (Police) | 102 (Ambulance)
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
