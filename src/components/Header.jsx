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
  Shield,
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
  { to: '/admin', label: 'Admin', icon: Shield },
  { to: '/preparedness', label: 'Preparedness', icon: HeartPulse },
  { to: '/about', label: 'About', icon: Info },
]

const ADMIN_EMAIL = 'amangupta786083@gmail.com'

export default function Header({ darkMode, toggleDarkMode, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isLoggedIn = Boolean(user)
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL
  const visibleNavItems = navItems.filter((item) => item.to !== '/admin' || isAdmin)

  const closeMenu = () => setMobileOpen(false)

  return (
    <Motion.header
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-2 sm:px-5"
      initial={{ y: -32, opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[1600px] rounded-2xl border border-white/55 bg-white/82 px-3 py-2 shadow-[0_14px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/82 sm:px-4">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <Link className="flex min-w-0 items-center gap-2.5" onClick={closeMenu} to={isLoggedIn ? '/dashboard' : '/login'}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#ef4444,#f97316)] text-white shadow-[0_10px_26px_rgba(239,68,68,0.28)]">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-red-500">Emergency Guide</p>
              <p className="truncate text-sm font-black text-slate-900 dark:text-white sm:text-base">AI Response Console</p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1.5 xl:flex">
            {isLoggedIn && visibleNavItems.map((item) => (
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

          <div className="flex flex-shrink-0 items-center gap-1.5">
            {isLoggedIn && (
              <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 md:flex">
                <UserRound className="h-4 w-4 text-red-500" />
                <span className="max-w-28 truncate font-bold">{user?.name}</span>
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
                className="icon-button xl:hidden"
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
              className="overflow-hidden xl:hidden"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <div className="mt-2 grid gap-1.5 border-t border-slate-200/70 pt-2 dark:border-slate-800 sm:grid-cols-2">
                {visibleNavItems.map((item) => (
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
