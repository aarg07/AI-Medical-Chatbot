import React from 'react'
import { Loader2 } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex w-full mb-6 justify-start">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
        <span className="font-medium text-slate-500 dark:text-slate-400">AI is thinking...</span>
      </div>
    </div>
  )
}
