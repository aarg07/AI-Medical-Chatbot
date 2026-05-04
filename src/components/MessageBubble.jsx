import React, { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Copy, Check, Volume2 } from 'lucide-react'
import StepList from './StepList'
import SeverityBadge from './SeverityBadge'

export default function MessageBubble({ message }) {
  const { role, content = '', image } = message
  const isUser = role === 'user'
  
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)

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
        const utterance = new SpeechSynthesisUtterance(content.replace(/\[.*?\]/g, ''))
        utterance.rate = 1.05
        utterance.onend = () => setSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setSpeaking(true)
      }
    } else {
      alert('Text-to-speech not supported.')
    }
  }

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-6 py-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10 ${
        isUser 
          ? 'bg-gradient-to-br from-red-600 via-rose-500 to-pink-600 text-white rounded-tr-md backdrop-blur-sm' 
          : 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-md'
      }`}>
        
        {!isUser && <SeverityBadge content={content} />}
        
        {image?.previewUrl && (
          <img
            src={image.previewUrl}
            alt="Uploaded medical symptom"
            className="mb-3 max-h-64 w-full rounded-2xl object-cover shadow-sm"
          />
        )}

        {content && <StepList content={content} isUser={isUser} />}

        {!isUser && (
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100/30 dark:border-slate-700/50">
            <Motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Motion.button>
            <Motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTTS}
              className={`p-1.5 transition-colors rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ${speaking ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 animate-pulse border-red-300 dark:border-red-800' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-900'}`}
              title="Listen"
            >
              <Volume2 className="w-4 h-4" />
            </Motion.button>
          </div>
        )}
      </div>
    </Motion.div>
  )
}
