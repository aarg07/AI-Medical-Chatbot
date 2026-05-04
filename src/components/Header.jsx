import { AnimatePresence, motion as Motion } from 'framer-motion'
import {
  Activity,
  ClipboardList,
  HeartPulse,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  X,
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assistant', label: 'Assistant', icon: MessageSquareText },
  { to: '/tips', label: 'Safety Tips', icon: ShieldCheck },
  { to: '/protocols', label: 'Protocols', icon: ClipboardList },
  { to: '/report-analysis', label: 'Report Analysis', icon: Activity },
  { to: '/preparedness', label: 'Preparedness', icon: HeartPulse },
  { to: '/about', label: 'About', icon: Info },
]

export default function Header({ darkMode, toggleDarkMode, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isLoggedIn = Boolean(user)

  const closeMenu = () => setMobileOpen(false)

  return (
    <Motion.header
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      initial={{ y: -32, opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl rounded-[28px] border border-white/60 bg-white/78 px-4 py-3 shadow-[0_18px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/72 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link className="flex items-center gap-3" onClick={closeMenu} to={isLoggedIn ? '/dashboard' : '/login'}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ef4444,#f97316)] text-white shadow-[0_14px_30px_rgba(239,68,68,0.35)]">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-500">Emergency Guide</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">AI Response Console</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {isLoggedIn && navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill--active' : ''}`}
                to={item.to}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 md:flex">
                <UserRound className="h-4 w-4 text-red-500" />
                <span className="max-w-36 truncate font-medium">{user?.name}</span>
              </div>
            )}

            <button
              aria-label="Toggle theme"
              className="icon-button"
              onClick={toggleDarkMode}
              type="button"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isLoggedIn ? (
              <button className="icon-button hidden md:inline-flex" onClick={onLogout} type="button">
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <Link className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950" to="/login">
                Sign in
              </Link>
            )}

            {isLoggedIn && (
              <button
                aria-label="Toggle navigation menu"
                className="icon-button lg:hidden"
                onClick={() => setMobileOpen((current) => !current)}
                type="button"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isLoggedIn && mobileOpen && (
            <Motion.div
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden lg:hidden"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <div className="mt-4 space-y-2 border-t border-slate-200/70 pt-4 dark:border-slate-800">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    className={`mobile-nav-link ${location.pathname === item.to ? 'mobile-nav-link--active' : ''}`}
                    onClick={closeMenu}
                    to={item.to}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                <button className="mobile-nav-link w-full" onClick={onLogout} type="button">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </Motion.header>
  )
}
