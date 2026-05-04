import { AlertCircle, Flame, Heart, Phone, ShieldAlert } from 'lucide-react'

const contacts = [
  { name: 'National Emergency', number: '112', icon: ShieldAlert, color: 'text-red-500' },
  { name: 'Ambulance', number: '102', icon: Heart, color: 'text-pink-500' },
  { name: 'Fire Department', number: '101', icon: Flame, color: 'text-orange-500' },
  { name: 'Police', number: '100', icon: AlertCircle, color: 'text-sky-500' },
]

export default function EmergencyContacts() {
  return (
    <div className="panel-surface overflow-hidden p-0">
      <div className="flex items-center justify-between bg-[linear-gradient(135deg,#ef4444,#f97316)] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Emergency contacts</h3>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]">
          India
        </span>
      </div>

      <div className="space-y-3 p-4">
        {contacts.map((contact) => {
          const IconComponent = contact.icon

          return (
          <a
            key={contact.number}
            className="feature-link"
            href={`tel:${contact.number}`}
          >
            <div className="flex items-center gap-3">
              <div className={`soft-icon ${contact.color}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{contact.name}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tap to call</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              {contact.number}
            </span>
          </a>
        )})}
      </div>
    </div>
  )
}
