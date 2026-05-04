import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, Volume2, Printer, AlertTriangle } from 'lucide-react'

export default function ChatMessage({ message }) {
  const { role, content } = message
  const isUser = role === 'user'
  
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  let severity = null
  const contentLower = content.toLowerCase()
  if (!isUser) {
    if (contentLower.includes('[critical]')) {
      severity = { text: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800' }
    } else if (contentLower.includes('[moderate]')) {
      severity = { text: 'Moderate', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800' }
    } else if (contentLower.includes('[minor]')) {
      severity = { text: 'Minor', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTTS = () => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel()
        setSpeaking(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(content)
        utterance.rate = 1.05
        utterance.pitch = 1
        utterance.onend = () => setSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setSpeaking(true)
      }
    } else {
      alert('Text-to-speech not supported in this browser.')
    }
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
        isUser 
          ? 'bg-red-600 text-white rounded-tr-sm' 
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
      }`}>
        
        {/* Severity Badge for AI */}
        {!isUser && severity && (
          <div className="flex items-center gap-1 mb-3">
            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${severity.color}`}>
              {severity.text === 'Critical' && <AlertTriangle className="w-3 h-3" />}
              {severity.text} Severity
            </span>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-p:leading-relaxed prose-li:my-1 text-inherit">
          <ReactMarkdown
            components={{
              h1: ({...props}) => <h1 className={isUser ? "text-white" : "text-slate-900 dark:text-white font-bold"} {...props} />,
              h2: ({...props}) => <h2 className={isUser ? "text-white" : "text-slate-900 dark:text-white font-bold"} {...props} />,
              h3: ({...props}) => <h3 className={isUser ? "text-white" : "text-slate-900 dark:text-white font-bold"} {...props} />,
              strong: ({...props}) => <strong className={isUser ? "text-white font-bold" : "text-slate-900 dark:text-white font-bold"} {...props} />,
              a: ({...props}) => <a className={isUser ? "text-white underline" : "text-red-600 dark:text-red-400 underline"} {...props} />,
              ul: ({...props}) => <ul className="list-disc pl-4" {...props} />,
              ol: ({...props}) => <ol className="list-decimal pl-4 font-semibold marker:text-red-600 dark:marker:text-red-500" {...props} />,
              li: ({...props}) => <li className="pl-1" {...props} />
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Action Buttons for AI Responses */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button 
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-900 rounded-md"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleTTS}
              className={`p-1.5 transition-colors rounded-md ${speaking ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 animate-pulse' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-900'}`}
              title="Read aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
