import { AlertTriangle, Droplet, Flame, HeartPulse, ShieldAlert, ThermometerSun } from 'lucide-react'
import { motion as Motion } from 'framer-motion'

const tips = [
  {
    title: 'Control severe bleeding',
    description: 'Apply direct pressure with a clean cloth or dressing. Add more layers if blood soaks through and escalate quickly.',
    icon: Droplet,
    accent: 'from-red-500 to-rose-500',
  },
  {
    title: 'Cool burns correctly',
    description: 'Run cool water over the burn for about 20 minutes. Do not use ice, butter, or thick ointments on fresh burns.',
    icon: Flame,
    accent: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Spot a heart emergency',
    description: 'Chest pressure, sweating, shortness of breath, and pain spreading to the arm or jaw all need urgent attention.',
    icon: HeartPulse,
    accent: 'from-fuchsia-500 to-rose-500',
  },
  {
    title: 'Respond to heat stroke',
    description: 'Move the person to shade, loosen clothing, cool the body, and get urgent medical help if confusion or collapse appears.',
    icon: ThermometerSun,
    accent: 'from-amber-500 to-yellow-500',
  },
  {
    title: 'Use the recovery position',
    description: 'If someone is unconscious but breathing, roll them onto their side and keep the airway open while monitoring closely.',
    icon: ShieldAlert,
    accent: 'from-sky-500 to-cyan-500',
  },
]

const escalationSigns = [
  'Heavy bleeding that does not slow down',
  'Breathing trouble or blue lips',
  'Chest pain, seizure, or fainting',
  'Confusion, unresponsiveness, or severe burns',
]

export default function SafetyTips() {
  return (
    <div className="space-y-8">
      <section className="hero-panel p-8 sm:p-10">
        <p className="hero-kicker">Safety references</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Quick first-aid tips you can scan fast
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">
          These cards support the chat assistant with quick, readable reminders for common emergencies and escalation cues.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tips.map((tip, index) => (
          <Motion.article
            key={tip.title}
            animate={{ opacity: 1, y: 0 }}
            className="panel-surface p-6"
            initial={{ opacity: 0, y: 18 }}
            transition={{ delay: index * 0.07 }}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br ${tip.accent} text-white shadow-lg`}>
              <tip.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{tip.title}</h2>
            <p className="mt-3 text-sm leading-8 text-slate-600 dark:text-slate-300">{tip.description}</p>
          </Motion.article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="panel-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Call emergency help when you notice</h2>
          </div>
          <div className="mt-6 space-y-3">
            {escalationSigns.map((sign) => (
              <div key={sign} className="feature-row">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span>{sign}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-surface p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Keep these habits in mind</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="mini-card">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stay calm</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Simple words and one action at a time help everyone think more clearly.</p>
            </div>
            <div className="mini-card">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Check the scene</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Traffic, fire, or electricity can make the situation worse if you rush in too early.</p>
            </div>
            <div className="mini-card">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Give clear updates</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Tell helpers what happened, when it started, and whether symptoms are improving or worsening.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
