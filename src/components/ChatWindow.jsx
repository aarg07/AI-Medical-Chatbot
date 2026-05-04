import React from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({ messages, isLoading, chatBottomRef, chatExportRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/20" ref={chatExportRef}>
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} message={msg} />
      ))}
      
      {isLoading && <TypingIndicator />}
      
      <div ref={chatBottomRef} />
    </div>
  )
}
