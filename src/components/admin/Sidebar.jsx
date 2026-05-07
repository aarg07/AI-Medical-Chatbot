import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  PieChart, 
  Settings, 
  Bell, 
  ShieldAlert, 
  LogOut,
  Stethoscope
} from 'lucide-react'

const MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/chats', icon: MessageSquare, label: 'AI Chats' },
  { path: '/admin/reports', icon: FileText, label: 'Medical Reports' },
  { path: '/admin/emergencies', icon: AlertCircle, label: 'Emergency Alerts' },
  { path: '/admin/analytics', icon: PieChart, label: 'Analytics' },
  { path: '/admin/settings', icon: Settings, label: 'AI Settings' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { path: '/admin/logs', icon: ShieldAlert, label: 'Security Logs' },
]

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white px-3 py-5 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="mb-8 flex items-center gap-3 px-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-black tracking-tight">MEDCORE</p>
          <p className="text-xs font-semibold text-slate-500">Admin Panel</p>
        </div>
      </div>

      <nav className="space-y-1">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => 
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-5 left-0 right-0 px-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-red-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-red-300"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
