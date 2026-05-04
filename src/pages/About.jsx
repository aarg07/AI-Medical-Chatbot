import { CheckCircle2, Layers3, Rocket, Shield, Stethoscope } from 'lucide-react'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import ProjectRoadmap from '../components/ProjectRoadmap'

const features = [
  'AI emergency chat with text, voice, and image context',
  'Dashboard, protocols, preparedness, and safety content pages',
  'PDF export for presentation-ready session summaries',
  'Responsive glassmorphism-inspired UI with dark mode support',
]

export default function About() {
  return (
    <div className="space-y-8">
      <section className="panel-surface p-8 sm:p-10">
        <p className="hero-kicker">About the project</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Emergency Guide AI as a stronger portfolio project
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
          This project demonstrates how an AI-assisted emergency guide can be packaged as a more complete product experience, not just a single chatbot screen.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="panel-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="soft-icon">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Project purpose</h2>
          </div>
          <p className="mt-5 text-sm leading-8 text-slate-600 dark:text-slate-300">
            In real emergencies, people need clarity faster than they need complexity. The project focuses on presenting the next best action in simple language while keeping emergency numbers highly visible.
          </p>
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            This app is a learning and demo project. It does not replace medical professionals, diagnosis, or emergency services.
          </div>
        </article>

        <article className="panel-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="soft-icon">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">What the review improved</h2>
          </div>
          <div className="mt-6 space-y-3">
            {features.map((feature) => (
              <div key={feature} className="feature-row">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-surface p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Layers3 className="h-5 w-5 text-red-500" />
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Architecture and flow</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Client-side UX, AI integration, and emergency guidance logic.</p>
          </div>
        </div>
        <ArchitectureDiagram />
      </section>

      <section className="panel-surface p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Rocket className="h-5 w-5 text-red-500" />
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Build roadmap</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">The staged path from setup to polished demo.</p>
          </div>
        </div>
        <ProjectRoadmap />
      </section>
    </div>
  )
}
