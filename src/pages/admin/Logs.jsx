import { useCallback, useState, useEffect } from 'react'
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  User as UserIcon, 
  Server,
  Lock,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { apiClient } from '../../utils/apiClient'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getAdminLogs()
      setLogs(data.logs)
    } catch (err) {
      console.error('Failed to load logs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadLogs, 0)
    return () => clearTimeout(timer)
  }, [loadLogs])

  const getLogIcon = (action) => {
    if (action.includes('USER')) return <UserIcon size={16} className="text-blue-500" />
    if (action.includes('LOGIN')) return <Lock size={16} className="text-purple-500" />
    if (action.includes('DATASET')) return <Server size={16} className="text-orange-500" />
    if (action.includes('DELETE')) return <Trash2 size={16} className="text-red-500" />
    return <AlertTriangle size={16} className="text-slate-500" />
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Security Logs</h1>
          <p className="text-sm font-semibold text-slate-500">Audit trail of all administrative actions and security events.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="field-input w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="icon-button"><Filter size={18} /></button>
        </div>
      </header>

      <div className="panel-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Administrator</th>
                <th>Target ID</th>
                <th>Timestamp</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                        {getLogIcon(log.action)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] font-bold text-slate-500">IP: {log.metadata?.ip || '127.0.0.1'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.adminId?.name || 'System'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-[10px] font-bold text-slate-400">{log.targetId || 'N/A'}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Clock size={12} />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${log.action.includes('DELETE') ? 'badge--red' : 'badge--blue'}`}>
                      {log.action.includes('DELETE') ? 'Medium' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center text-slate-400">
            <ShieldAlert size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-bold">No logs available</p>
          </div>
        )}
      </div>
    </div>
  )
}
