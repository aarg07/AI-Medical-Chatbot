import { motion as Motion } from 'framer-motion'
import { Droplet, Flame, HeartCrack, MapPin, ShieldAlert, Skull, Wind, Pill } from 'lucide-react'

const actions = [
  { label: 'Burn', icon: Flame, color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-900/60' },
  { label: 'Bleeding', icon: Droplet, color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900/60' },
  { label: 'Choking', icon: Wind, color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-900/60' },
  { label: 'Heart attack', icon: HeartCrack, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-900/60' },
  { label: 'Unconscious', icon: ShieldAlert, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200 border-slate-200 dark:border-slate-800' },
  { label: 'Poisoning', icon: Skull, color: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-900/60' },
  { label: 'UTI', icon: Pill, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60' },
]

export default function QuickChips({ onSend }) {
  const findNearestHospital = () => {
    if (!('geolocation' in navigator)) {
      alert('Location services are not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        window.open(`https://www.google.com/maps/search/hospitals+near+me/@${latitude},${longitude},14z`, '_blank')
      },
      () => {
        alert('Unable to access location. Please allow location permissions and try again.')
      },
    )
  }

  return (
    <div className="overflow-x-auto border-t border-slate-200/70 bg-white/50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/35">
      <Motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex min-w-max gap-2"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Motion.button
          className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20"
          onClick={findNearestHospital}
          type="button"
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MapPin className="h-4 w-4" />
          <span>Find nearby hospital</span>
        </Motion.button>

        {actions.map((action) => {
          const IconComponent = action.icon

          return (
          <Motion.button
            key={action.label}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${action.color}`}
            onClick={() => onSend(action.label === 'UTI' ? `What is ${action.label} and what should I do?` : `Emergency: ${action.label}`)}
            type="button"
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <IconComponent className="h-4 w-4" />
            <span>{action.label}</span>
          </Motion.button>
        )})}
      </Motion.div>
    </div>
  )
}
