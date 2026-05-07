import { useCallback, useState, useEffect } from 'react'
import { 
  Search, 
  MessageSquare, 
  User as UserIcon,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Loader2,
  Calendar
} from 'lucide-react'
import { apiClient } from '../../utils/apiClient'
import { motion as Motion, AnimatePresence } from 'framer-motion'

export default function Chats() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedChat, setExpandedChat] = useState(null)

  const loadChats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getAdminChats(search, page)
      setChats(data.chats)
      setTotalPages(data.pages)
    } catch (err) {
      console.error('Failed to load chats:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(loadChats, 300)
    return () => clearTimeout(timer)
  }, [loadChats])

  const isDangerous = (messages) => {
    const keywords = ['heart attack', 'stroke', 'seizure', 'bleeding', 'unconscious', 'suicide', 'kill', 'die']
    return messages.some(m => 
      keywords.some(kw => m.content?.toLowerCase().includes(kw))
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">AI Chat Monitoring</h1>
          <p className="text-sm font-semibold text-slate-500">Review system conversations and detect critical medical alerts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="field-input w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search chat content..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {chats.map((chat) => {
          const dangerous = isDangerous(chat.messages)
          const isExpanded = expandedChat === chat._id
          
          return (
            <div 
              key={chat._id} 
              className={`panel-surface overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-red-500/20' : ''}`}
            >
              <div 
                className="flex cursor-pointer items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                onClick={() => setExpandedChat(isExpanded ? null : chat._id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${dangerous ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {dangerous ? <AlertTriangle size={24} /> : <MessageSquare size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white">{chat.userId?.name || 'Anonymous'}</p>
                      {dangerous && <span className="badge badge--red text-[10px]">Critical Alert</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(chat.createdAt).toLocaleTimeString()}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(chat.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">{chat.messages.length} Messages</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Last Message</p>
                    <p className="line-clamp-1 max-w-[200px] text-sm font-bold text-slate-600 dark:text-slate-300">
                      {chat.messages.at(-1)?.content}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <Motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/20"
                  >
                    <div className="mx-auto max-w-4xl space-y-6">
                      {chat.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-3xl p-4 shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-slate-900 text-white dark:bg-red-600' 
                              : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white'
                          }`}>
                            <div className="mb-1 flex items-center justify-between gap-4 border-b border-white/10 pb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                {msg.role === 'user' ? chat.userId?.name : 'AI ASSISTANT'}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {loading && (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center text-slate-400">
            <MessageSquare size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-bold">No chats found</p>
          </div>
        )}

        <div className="flex items-center justify-between p-4">
          <p className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="secondary-button px-4 py-2 text-xs"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="secondary-button px-4 py-2 text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
