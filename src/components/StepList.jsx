import ReactMarkdown from 'react-markdown'

export default function StepList({ content, isUser }) {
  const cleanContent = content.replace(/\[(CRITICAL|MODERATE|MINOR|WARNING)\]/g, '')

  return (
    <div className="prose prose-sm max-w-none text-inherit prose-p:leading-relaxed prose-li:my-1 sm:prose-base dark:prose-invert">
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => <h1 className={isUser ? 'text-white' : 'font-bold text-slate-900 dark:text-white'} {...props} />,
          h2: ({ ...props }) => <h2 className={isUser ? 'text-white' : 'font-bold text-slate-900 dark:text-white'} {...props} />,
          h3: ({ ...props }) => <h3 className={isUser ? 'text-white' : 'font-bold text-slate-900 dark:text-white'} {...props} />,
          strong: ({ ...props }) => <strong className={isUser ? 'font-bold text-white' : 'font-bold text-slate-900 dark:text-white'} {...props} />,
          a: ({ ...props }) => <a className={isUser ? 'text-white underline' : 'text-red-600 underline dark:text-red-400'} {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-4" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-4 font-semibold marker:text-red-600 dark:marker:text-red-400" {...props} />,
          li: ({ ...props }) => <li className="pl-1" {...props} />,
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  )
}
