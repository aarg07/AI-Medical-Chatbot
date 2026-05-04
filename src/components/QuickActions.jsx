import { Flame, Droplet, HeartCrack, Zap, Skull, ShieldAlert, Wind, ThermometerSun } from 'lucide-react'

export default function QuickActions({ onActionSelect }) {
  const actions = [
    { label: 'Burn', icon: Flame, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { label: 'Bleeding', icon: Droplet, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { label: 'Choking', icon: Wind, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Heart Attack', icon: HeartCrack, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
    { label: 'Unconscious', icon: ShieldAlert, color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
    { label: 'Electric Shock', icon: Zap, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: 'Poisoning', icon: Skull, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Heat Stroke', icon: ThermometerSun, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' }
  ]

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide py-2">
      <div className="flex gap-2 min-w-max px-1">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onActionSelect(`Emergency: ${action.label}`)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-transform hover:scale-105 active:scale-95 border border-transparent hover:border-current shadow-sm ${action.color}`}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
