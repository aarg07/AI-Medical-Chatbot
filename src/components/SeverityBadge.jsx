import React from 'react'
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

// Uses Regex or substring to find severity tags required by SYSTEM_PROMPT
export default function SeverityBadge({ content }) {
  if (content.includes('[CRITICAL]')) {
    return (
      <span className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-max mb-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
        <AlertTriangle className="w-3 h-3" /> CRITICAL SEVERITY
      </span>
    )
  }
  if (content.includes('[MODERATE]')) {
    return (
      <span className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-max mb-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="w-3 h-3" /> MODERATE SEVERITY
      </span>
    )
  }
  if (content.includes('[MINOR]')) {
    return (
      <span className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-max mb-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
        <CheckCircle2 className="w-3 h-3" /> MINOR SEVERITY
      </span>
    )
  }
  return null;
}
