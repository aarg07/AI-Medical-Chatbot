import { useCallback, useState, useEffect } from 'react'
import { 
  Users, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  CalendarClock,
  Loader2,
  RefreshCcw
} from 'lucide-react'
import { apiClient } from '../../utils/apiClient'
import StatCard from '../../components/admin/StatCard'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [summary, stats] = await Promise.all([
        apiClient.getAdminSummary(),
        apiClient.getAdminAnalytics()
      ])
      setData(summary)
      setAnalytics(stats)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError(err.message || 'Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadData, 0)
    return () => clearTimeout(timer)
  }, [loadData])

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    )
  }

  const counts = data?.counts || {}
  const usageData = analytics?.usageData || []
  const deficiencyStats = analytics?.deficiencyStats || []
  const recentUsers = data?.recentUsers || []
  const recentChats = data?.recentChats || []
  const recentReports = data?.recentReports || []
  const recentAppointments = data?.recentAppointments || []

  const getLastMessage = (chat) => {
    const message = chat?.messages?.at?.(-1) || chat?.messages?.[chat.messages.length - 1]
    return message?.content || 'No message content'
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Admin Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor users, chats, reports, and emergency activity.</p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}. Please log out and log in again with amangupta786083@gmail.com if this continues.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Users" value={counts.users} icon={Users} />
        <StatCard label="Chats" value={counts.chats} icon={MessageSquare} />
        <StatCard label="Reports" value={counts.reports} icon={FileText} />
        <StatCard label="Records" value={counts.appointments} icon={CalendarClock} />
        <StatCard label="Emergencies" value={counts.emergencies} icon={AlertCircle} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Users And Saved Records</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="py-3 font-semibold">User</th>
                <th className="py-3 font-semibold">Email</th>
                <th className="py-3 font-semibold">Chats</th>
                <th className="py-3 font-semibold">Reports</th>
                <th className="py-3 font-semibold">Records</th>
                <th className="py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentUsers.map((user) => (
                <tr key={user._id}>
                  <td className="py-3 font-medium text-slate-950 dark:text-white">{user.name}</td>
                  <td className="py-3 text-slate-500">{user.email}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{user.chatCount || 0}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{user.reportCount || 0}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{user.appointmentCount || 0}</td>
                  <td className="py-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!recentUsers.length && (
                <tr>
                  <td className="py-8 text-center text-slate-500" colSpan="6">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Recent Chat History</h2>
          <div className="mt-4 space-y-3">
            {recentChats.map((chat) => (
              <div key={chat._id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{chat.userId?.name || 'Unknown user'}</p>
                  <p className="shrink-0 text-xs text-slate-500">{new Date(chat.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{chat.userId?.email || 'No email'}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">{getLastMessage(chat)}</p>
              </div>
            ))}
            {!recentChats.length && (
              <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
                No chat history found.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Recent Reports</h2>
          <div className="mt-4 space-y-3">
            {recentReports.map((report) => (
              <div key={report._id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{report.userId?.name || 'Unknown user'}</p>
                  <p className="shrink-0 text-xs text-slate-500">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{report.userId?.email || 'No email'}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
                  {report.analysis?.analysis?.summary || 'No report summary'}
                </p>
              </div>
            ))}
            {!recentReports.length && (
              <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
                No reports found.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Appointment Records</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="py-3 font-semibold">Patient</th>
                <th className="py-3 font-semibold">User</th>
                <th className="py-3 font-semibold">Phone</th>
                <th className="py-3 font-semibold">Concern</th>
                <th className="py-3 font-semibold">Preferred Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAppointments.map((record) => (
                <tr key={record._id}>
                  <td className="py-3 font-medium text-slate-950 dark:text-white">{record.patientName}</td>
                  <td className="py-3 text-slate-500">{record.userId?.name || 'Unknown user'}</td>
                  <td className="py-3 text-slate-500">{record.phone}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{record.concern}</td>
                  <td className="py-3 text-slate-500">{record.preferredDate} {record.preferredTime}</td>
                </tr>
              ))}
              {!recentAppointments.length && (
                <tr>
                  <td className="py-8 text-center text-slate-500" colSpan="5">
                    No appointment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Activity Trends</h2>
          {usageData.length ? (
            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.25)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="chats" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                  <Area type="monotone" dataKey="reports" stroke="#dc2626" fill="#fee2e2" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-5 flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800">
              No activity data available.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Common Deficiencies</h2>
          {deficiencyStats.length ? (
            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deficiencyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.25)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-5 flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800">
              No deficiency data available.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
