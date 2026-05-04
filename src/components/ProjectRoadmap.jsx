import React from 'react'
import { Rocket, MessageSquare, BrainCircuit, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'

const roadmapSteps = [
  {
    phase: '01',
    title: 'Project setup',
    duration: 'Day 1',
    icon: Rocket,
    color: 'bg-blue-600',
    tasks: [
      'Run: npx create-vite emergency-guide-chatbot',
      'Install Tailwind CSS: npm install -D tailwindcss postcss',
      'Create .env file — add your API key',
      'Create folder structure: /components, /services, /pages',
      'Set up system prompt configuration'
    ]
  },
  {
    phase: '02',
    title: 'Core chat UI',
    duration: 'Day 1–2',
    icon: MessageSquare,
    color: 'bg-green-600',
    tasks: [
      'Build Chat Page — scrollable message list container',
      'Build ChatMessage — user (right, red) and AI (left, white) bubbles',
      'Build Input form — text input + send button + disabled states',
      'Build TypingIndicator — animated loader while AI responds',
      'Wire up useState for messages array'
    ]
  },
  {
    phase: '03',
    title: 'AI integration',
    duration: 'Day 2–3',
    icon: BrainCircuit,
    color: 'bg-amber-600',
    tasks: [
      'Create services/aiHelper.js — manages AI pipeline',
      'Implement fetch() call using @google/generative-ai API',
      'Attach SYSTEM_PROMPT to every API request',
      'Pass full conversation history array for context memory',
      'Handle loading and gracefully degrade on API errors'
    ]
  },
  {
    phase: '04',
    title: 'Emergency features',
    duration: 'Day 3–4',
    icon: ShieldAlert,
    color: 'bg-red-600',
    tasks: [
      'Build QuickActions — scrollable buttons: Burn, Choking, etc.',
      'Build EmergencyContacts — card with 112, 102, 101, 100',
      'Add Severity extraction logic — Critical/Moderate/Minor badges',
      'Add Markdown rendering — render numbered first aid steps cleanly',
      'Build Header — red banner with app name, pulse icon'
    ]
  },
  {
    phase: '05',
    title: 'Extra features',
    duration: 'Day 4–5',
    icon: Sparkles,
    color: 'bg-purple-600',
    tasks: [
      'Add Text-to-Speech: window.speechSynthesis API on AI responses',
      'Add dark mode toggle using Tailwind dark: classes',
      'Add copy-to-clipboard button on each message',
      'Add print/save PDF button using html2canvas & jsPDF',
      'Add About page explaining project architecture & roadmap'
    ]
  },
  {
    phase: '06',
    title: 'Test + deploy',
    duration: 'Day 5–6',
    icon: CheckCircle2,
    color: 'bg-slate-800',
    tasks: [
      'Test all 15+ emergency types manually — verify steps',
      'Test out-of-scope inputs — confirm gracefully handling',
      'Test mobile responsiveness — 375px, 768px, 1280px',
      'Run: npm run build to create production bundle',
      'Deploy to Vercel/Netlify — set environment variables'
    ]
  }
]

export default function ProjectRoadmap() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="relative border-l-4 border-slate-200 dark:border-slate-700 ml-6 md:ml-12 pl-8 md:pl-16 space-y-12">
        {roadmapSteps.map((step, idx) => (
          <div key={idx} className="relative group">
            
            {/* Timeline Node */}
            <div className={`absolute -left-[54px] md:-left-[86px] top-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md transition-transform group-hover:scale-110 ${step.color}`}>
              <step.icon className="w-5 h-5 text-white" />
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold text-white px-2.5 py-1 rounded-md ${step.color}`}>Phase {step.phase}</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                </div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 sm:mt-0 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full w-max">
                  ⏱️ {step.duration}
                </span>
              </div>
              
              <ul className="space-y-2">
                {step.tasks.map((task, tidx) => (
                  <li key={tidx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-300 dark:bg-slate-500"></span>
                    <span className="leading-relaxed text-sm md:text-base">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}
