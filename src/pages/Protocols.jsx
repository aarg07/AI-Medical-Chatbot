import { AlertTriangle, HeartPulse, Shield, Siren, Waves, Zap } from 'lucide-react'

const protocols = [
  {
    title: 'Cardiac symptoms',
    icon: HeartPulse,
    color: 'from-rose-500/20 to-red-500/10',
    steps: ['Seat the person and keep them calm.', 'Call emergency help immediately.', 'Be ready to start CPR if breathing stops.'],
  },
  {
    title: 'Electric shock',
    icon: Zap,
    color: 'from-amber-500/20 to-yellow-500/10',
    steps: ['Do not touch the person until power is isolated.', 'Use a dry non-conductive object if needed.', 'Check breathing and begin CPR if required.'],
  },
  {
    title: 'Severe bleeding',
    icon: Siren,
    color: 'from-red-500/20 to-orange-500/10',
    steps: ['Apply firm direct pressure.', 'Add more dressing if soaked.', 'Escalate quickly if bleeding does not slow.'],
  },
  {
    title: 'Drowning response',
    icon: Waves,
    color: 'from-sky-500/20 to-cyan-500/10',
    steps: ['Move them to a safe area.', 'Check responsiveness and breathing.', 'Call help and begin rescue breaths or CPR if needed.'],
  },
]

export default function Protocols() {
  return (
    <div className="space-y-8">
      <section className="panel-surface p-8 sm:p-10">
        <p className="hero-kicker">Response protocols</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Quick protocols for high-stress moments
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
          These are not replacements for professional care. They are structured reminders that help a responder act in the right order while help is on the way.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {protocols.map((protocol) => {
          const IconComponent = protocol.icon

          return (
          <article key={protocol.title} className={`panel-surface bg-gradient-to-br ${protocol.color} p-6`}>
            <div className="flex items-center gap-3">
              <div className="soft-icon">
                <IconComponent className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{protocol.title}</h2>
            </div>

            <div className="mt-5 space-y-3">
              {protocol.steps.map((step, index) => (
                <div key={step} className="list-card">
                  <span className="list-card__index">0{index + 1}</span>
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </article>
        )})}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="panel-surface p-6">
          <Shield className="h-6 w-6 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Scene safety first</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Fire, traffic, current, chemicals, or crowd pressure can turn one casualty into two. Pause long enough to secure the area.
          </p>
        </article>
        <article className="panel-surface p-6">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Escalate early</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Difficulty breathing, chest pain, seizures, major trauma, heavy bleeding, or unconsciousness all justify early emergency contact.
          </p>
        </article>
        <article className="panel-surface p-6">
          <Siren className="h-6 w-6 text-sky-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Use calm language</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Short instructions, one action at a time, reduce panic and help the injured person cooperate.
          </p>
        </article>
      </section>
    </div>
  )
}
