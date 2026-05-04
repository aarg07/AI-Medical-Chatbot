import React, { useState } from 'react'
import { Server, Layout, Cpu, Globe, X } from 'lucide-react'

const architectureData = {
  layers: [
    {
      id: 'ui',
      title: 'User interface layer',
      subtitle: 'React frontend running in the browser',
      color: 'bg-teal-900 border-teal-800',
      textColor: 'text-teal-100',
      icon: Layout,
      nodes: [
        { id: 'chat', title: 'Chat interface', desc: 'Messages\nMarkdown answers', fullDesc: 'The primary user interface for symptom input, response display, image previews, and friendly step-by-step medical guidance.' },
        { id: 'quick', title: 'Quick actions', desc: 'Emergency chips\nFast prompts', fullDesc: 'Quick prompt buttons help users ask about common urgent cases without typing long descriptions.' },
        { id: 'contacts', title: 'Contacts panel', desc: 'Emergency support\nLocal reminders', fullDesc: 'Displays emergency support reminders and encourages urgent professional help when severe symptoms appear.' },
        { id: 'extras', title: 'Extras', desc: 'Voice\nPDF export', fullDesc: 'Browser speech input, text-to-speech, and PDF export improve accessibility and make the session easier to share.' },
      ],
    },
    {
      id: 'logic',
      title: 'Application logic layer',
      subtitle: 'React state, message handling, and API client',
      color: 'bg-indigo-900 border-indigo-800',
      textColor: 'text-indigo-100',
      icon: Cpu,
      nodes: [
        { id: 'state', title: 'Conversation state', desc: 'Chat history\nLoading state', fullDesc: 'The useChat hook stores messages, sends requests, and keeps the conversation scrolled to the latest response.' },
        { id: 'upload', title: 'Image upload', desc: 'Base64 image\nMedical context', fullDesc: 'Uploaded symptom or injury images are previewed in the chat and sent to the backend for multimodal AI analysis.' },
        { id: 'client', title: 'API client', desc: 'POST /api/chat\nGET /health', fullDesc: 'The frontend calls the local Node backend, keeping OpenAI and OpenFDA keys out of browser code.' },
        { id: 'render', title: 'Response renderer', desc: 'Markdown\nSeverity UI', fullDesc: 'AI responses are rendered with markdown and optional severity badges for critical, moderate, or minor guidance.' },
      ],
    },
    {
      id: 'services',
      title: 'Backend and services layer',
      subtitle: 'Node medical API with OpenAI and optional OpenFDA',
      color: 'bg-amber-900 border-amber-800',
      textColor: 'text-amber-100',
      icon: Server,
      nodes: [
        { id: 'node', title: 'Node backend', desc: 'Port 5000\nSafety module', fullDesc: 'The backend performs emergency detection, builds medical safety instructions, adds local dataset context, and returns the required response format.' },
        { id: 'openai', title: 'OpenAI GPT API', desc: 'Responses API\ngpt-5.2', fullDesc: 'OpenAI is the primary model provider for natural-language symptom triage, medicine explanations, and image-aware medical assistance.' },
        { id: 'openfda', title: 'OpenFDA API', desc: 'Drug labels\nWarnings', fullDesc: 'OpenFDA is an optional medicine data source for label-based usage, side-effect, and warning context.' },
        { id: 'fallback', title: 'Local fallback', desc: 'medical_data.json\nDemo safe mode', fullDesc: 'If APIs are unavailable or no key is configured, the backend still returns structured first-aid and medicine-safety guidance from local data.' },
      ],
    },
  ],
}

export default function ArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-4xl w-full flex flex-col gap-6 items-center">
        {architectureData.layers.map((layer, idx) => (
          <div key={layer.id} className="w-full flex flex-col items-center">
            {idx > 0 && (
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 mb-2 relative">
                <div className="absolute top-1/2 left-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap -translate-y-1/2">
                  {idx === 1 ? 'user input' : 'HTTPS API calls'}
                </div>
              </div>
            )}

            <div className={`w-full rounded-2xl p-6 ${layer.color} shadow-lg relative overflow-hidden`}>
              <div className={`text-center space-y-1 mb-6 relative z-10 ${layer.textColor}`}>
                <h3 className="text-xl font-bold flex justify-center items-center gap-2">
                  <layer.icon className="w-5 h-5" />
                  {layer.title}
                </h3>
                <p className="text-sm opacity-80">{layer.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10 justify-items-center">
                {layer.nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600 hover:border-slate-400 transition-all cursor-pointer rounded-xl p-4 w-full text-center shadow flex flex-col items-center justify-center min-h-[100px] hover:-translate-y-1 group"
                  >
                    <h4 className="font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">{node.title}</h4>
                    <p className="text-xs text-slate-300 whitespace-pre-line">{node.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 mb-2"></div>
        <div
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-center shadow-lg hover:bg-slate-700 transition-colors cursor-pointer"
          onClick={() => setSelectedNode({ title: 'Deployment', fullDesc: 'Deploy the React frontend as a static build and host the Node API as a backend service. Keep OPENAI_API_KEY only on the server, never in browser code.' })}
        >
          <h3 className="font-bold text-white flex justify-center items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Deployment
          </h3>
          <p className="text-sm text-slate-400 mt-1">React frontend plus Node medical API backend</p>
        </div>

        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNode(null)}>
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 relative animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedNode.title}</h3>
              <div className="w-12 h-1 bg-red-500 rounded-full mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{selectedNode.fullDesc}</p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
