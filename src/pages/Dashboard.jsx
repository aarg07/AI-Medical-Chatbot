import { ArrowRight, BellRing, Clock3, HeartPulse, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const highlights = [
  {
    title: 'AI Assistant',
    description: 'Describe symptoms, attach an image, or use voice input for guided first-response steps.',
    link: '/assistant',
  },
  {
    title: 'Safety Tips',
    description: 'Quick scanning cards for burns, bleeding, recovery position, heat issues, and escalation signs.',
    link: '/tips',
  },
  {
    title: 'Preparedness',
    description: 'Build a better emergency routine with go-bag items, team roles, and response drills.',
    link: '/preparedness',
  },
]

const metrics = [
  { label: 'Emergency line', value: '112', icon: PhoneCall },
  { label: 'Response mode', value: 'Guided', icon: BellRing },
  { label: 'Session status', value: 'Ready', icon: Sparkles },
]

const checklist = [
  'Check scene safety before touching the injured person.',
  'Call professional emergency services early when symptoms are severe.',
  'Use the AI assistant for calm step-by-step support, not final diagnosis.',
]

export default function Dashboard({ user }) {
  return (
    <div className="space-y-8">
      <section className="hero-panel overflow-hidden p-8 sm:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative z-10">
            <p className="hero-kicker">Response dashboard</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              Welcome back, {user?.name?.split(' ')[0] || 'Responder'}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg">
              Your project now has a more complete frontend flow: login, navigation, an upgraded assistant workspace, and extra pages that make the app feel production-minded.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="primary-button" to="/assistant">
                <span>Open assistant</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="secondary-button" to="/protocols">
                <ShieldCheck className="h-4 w-4" />
                <span>View response protocols</span>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {metrics.map((metric) => {
              const IconComponent = metric.icon

              return (
              <article key={metric.label} className="metric-card">
                <div className="metric-card__icon">
                  <IconComponent className="h-5 w-5" />
                </div>
                <p className="metric-card__label">{metric.label}</p>
                <p className="metric-card__value">{metric.value}</p>
              </article>
            )})}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="soft-icon">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Fast action checklist</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Keep this sequence in mind before using any tool.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {checklist.map((item, index) => (
              <div key={item} className="list-card">
                <span className="list-card__index">0{index + 1}</span>
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="soft-icon">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">What changed in the UI</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">A quick project review from the frontend side.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {highlights.map((item) => (
              <Link key={item.title} className="feature-link" to={item.link}>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-red-500" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
