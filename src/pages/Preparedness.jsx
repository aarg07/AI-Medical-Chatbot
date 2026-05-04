import { Backpack, BatteryCharging, CheckCircle2, Cross, Radio, ShieldPlus } from 'lucide-react'

const kitItems = [
  'Sterile gauze, bandages, and adhesive tape',
  'Disposable gloves and a CPR face shield',
  'Antiseptic wipes, burn dressing, and scissors',
  'Flashlight, power bank, bottled water, and ID list',
]

const readinessBlocks = [
  {
    title: 'Home kit',
    icon: Backpack,
    copy: 'Keep the essentials in one visible place and replace expired items every few months.',
  },
  {
    title: 'Communication',
    icon: Radio,
    copy: 'Save emergency numbers, nearest hospital locations, and a backup contact on every device.',
  },
  {
    title: 'Skills practice',
    icon: ShieldPlus,
    copy: 'Run simple drills for choking, burns, and recovery position so actions feel familiar under stress.',
  },
]

export default function Preparedness() {
  return (
    <div className="space-y-8">
      <section className="hero-panel p-8 sm:p-10">
        <p className="hero-kicker">Preparedness</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Better preparation makes the assistant more useful.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">
          A polished emergency app should not only react to incidents. It should also help people prepare, organize contacts, and practice calm response habits.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="panel-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="soft-icon">
              <Cross className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Recommended kit items</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">A practical college, hostel, or home first-aid setup.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {kitItems.map((item) => (
              <div key={item} className="feature-row">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="soft-icon">
              <BatteryCharging className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Readiness habits</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Small routines that improve real-world response.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {readinessBlocks.map((block) => {
              const IconComponent = block.icon

              return (
              <div key={block.title} className="mini-card">
                <IconComponent className="h-5 w-5 text-red-500" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{block.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{block.copy}</p>
              </div>
            )})}
          </div>
        </article>
      </section>
    </div>
  )
}
