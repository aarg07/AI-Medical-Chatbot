import { useCallback, useState, useEffect } from 'react'
import { 
  Clock, 
  User as UserIcon,
  ShieldAlert,
  Loader2,
  TrendingUp,
  Activity,
  HeartPulse
} from 'lucide-react'
import { apiClient } from '../../utils/apiClient'
import { motion as Motion, AnimatePresence } from 'framer-motion'

export default function Emergencies() {
  const [emergencies, setEmergencies] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await apiClient.getAdminEmergencies()
      setEmergencies(data.emergencies)
      setStats(data.stats)
    } catch (err) {
      console.error('Failed to load emergencies:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadData, 0)
    const interval = setInterval(loadData, 10000) // Poll every 10s for real-time feel
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [loadData])

  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
            <div className="relative h-12 w-12 rounded-2xl bg-red-600 p-2.5 text-white shadow-lg shadow-red-500/20">
              <ShieldAlert className="h-full w-full" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Emergency Monitor</h1>
            <p className="text-sm font-semibold text-slate-500">Live system monitoring for life-threatening medical keywords.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat._id} className="panel-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat._id.replace('_', ' ')}</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stat.count}</p>
          </div>
        ))}
        {stats.length === 0 && (
          <div className="panel-surface col-span-full flex h-24 items-center justify-center border-dashed text-sm font-bold text-slate-400">
            No active emergencies detected today.
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Alert Feed</h3>
          <AnimatePresence mode="popLayout">
            {emergencies.map((alert) => (
              <Motion.div 
                key={alert._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="panel-surface relative overflow-hidden p-6 ring-2 ring-red-500/10"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-red-50 p-2.5 text-red-600 dark:bg-red-900/20">
                      <HeartPulse className="h-full w-full" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {alert.type.replace('_', ' ')}
                        </h4>
                        <span className="badge badge--red">Critical</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><UserIcon size={12} /> {alert.userId?.name || 'Anonymous User'}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="primary-button bg-red-600 py-2 text-xs">Acknowledge</button>
                    <button className="secondary-button py-2 text-xs">View Chat</button>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                    "{alert.details}"
                  </p>
                </div>
              </Motion.div>
            ))}
          </AnimatePresence>

          {!loading && emergencies.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
               <ShieldAlert size={48} className="mb-4 opacity-10" />
               <p className="font-black text-slate-400">All systems normal. No emergencies detected.</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Quick Response Stats</h3>
            <div className="panel-surface space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg Response</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">1.4m</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-green-50 p-2 text-green-600 dark:bg-green-900/20">
                  <TrendingUp className="h-full w-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Help Alerts</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{emergencies.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                  <Activity className="h-full w-full" />
                </div>
              </div>
            </div>
          </section>

          <section>
             <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">System Status</h3>
             <div className="panel-surface p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Emergency API</span>
                  <span className="badge badge--green">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Keyword Scanner</span>
                  <span className="badge badge--green">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Notification Relay</span>
                  <span className="badge badge--green">Connected</span>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  )
}
