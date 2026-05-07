import ReactMarkdown from 'react-markdown'

export default function SafeMarkdown({ children, className = '' }) {
  const safeText = typeof children === 'string'
    ? children
    : children == null
      ? ''
      : String(children)

  return (
    <div className={className}>
      <ReactMarkdown>{safeText || 'No response available.'}</ReactMarkdown>
    </div>
  )
}
