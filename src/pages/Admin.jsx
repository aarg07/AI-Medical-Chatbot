import { useCallback, useEffect, useState } from 'react'
import { Activity, CalendarClock, FileText, Loader2, MessageSquareText, Users } from 'lucide-react'
import { apiClient } from '../utils/apiClient'

function StatCard({ label, value, icon }) {
  const IconComponent = icon
  return (
    <article className="metric-card">
      <div className="metric-card__icon">
        <IconComponent className="h-5 w-5" />
      </div>
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
    </article>
  )
}

export default function Admin() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSummary(await apiClient.getAdminSummary())
    } catch (err) {
      setError(err.message || 'Could not load admin summary.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadSummary, 0)
    return () => clearTimeout(timer)
  }, [loadSummary])

  const counts = summary?.counts || {}

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="panel-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="hero-kicker">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">System Overview</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">Monitor users, chats, report analyses, and doctor appointment requests.</p>
          </div>
          <button className="secondary-button" onClick={loadSummary} type="button">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            <span>Refresh</span>
          </button>
        </div>
        {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={counts.users || 0} icon={Users} />
        <StatCard label="Chats" value={counts.chats || 0} icon={MessageSquareText} />
        <StatCard label="Reports" value={counts.reports || 0} icon={FileText} />
        <StatCard label="Appointments" value={counts.appointments || 0} icon={CalendarClock} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel-surface p-5">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white">Recent Users</h2>
          <div className="space-y-3">
            {(summary?.recentUsers || []).map((user) => (
              <div key={user._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                <p className="text-sm font-black text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs font-semibold text-slate-500">{user.email}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-surface p-5">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white">Recent Reports</h2>
          <div className="space-y-3">
            {(summary?.recentReports || []).map((report) => (
              <div key={report._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                <p className="line-clamp-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                  {report.analysis?.analysis?.summary || 'Report analysis'}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-surface p-5">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white">Appointments</h2>
          <div className="space-y-3">
            {(summary?.recentAppointments || []).map((appointment) => (
              <div key={appointment._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                <p className="text-sm font-black text-slate-900 dark:text-white">{appointment.patientName}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{appointment.concern}</p>
                <p className="mt-2 text-xs font-bold text-red-500">{appointment.preferredDate} at {appointment.preferredTime}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
