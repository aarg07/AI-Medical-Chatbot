import { useState } from 'react'
import { 
  Bell, 
  Send, 
  Trash2, 
  MessageSquare, 
  AlertCircle, 
  Info,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { apiClient } from '../../utils/apiClient'

const RECENT_NOTIFICATIONS = [
  { _id: '1', title: 'New System Update', message: 'Version 2.4 is now live with improved report analysis.', type: 'announcement', sentAt: '2026-05-07T09:00:00.000Z' },
  { _id: '2', title: 'Critical Alert', message: 'High volume of emergency cases detected in Northern region.', type: 'emergency', sentAt: '2026-05-07T08:00:00.000Z' },
]

export default function Notifications() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.sendAdminNotification(formData)
      alert('Notification sent successfully!')
      setFormData({ title: '', message: '', type: 'announcement' })
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Notification System</h1>
        <p className="text-sm font-semibold text-slate-500">Send health alerts, announcements, and push notifications to all users.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="panel-surface p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-900/20">
              <Send size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Compose Broadcast</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="field-block">
              <label className="field-label">Notification Title</label>
              <div className="field-input">
                <input 
                  required
                  placeholder="e.g. Health Alert: New Flu Outbreak" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="field-block">
              <label className="field-label">Message Content</label>
              <div className="field-input min-h-[120px] items-start">
                <textarea 
                  required
                  className="w-full border-0 bg-transparent text-sm font-medium outline-none"
                  rows={4}
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
            </div>

            <div className="field-block">
              <label className="field-label">Target Type</label>
              <div className="grid grid-cols-3 gap-3">
                {['announcement', 'emergency', 'info'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, type})}
                    className={`rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                      formData.type === type 
                        ? 'bg-slate-900 text-white dark:bg-red-600 shadow-lg' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="primary-button w-full justify-center py-4 text-sm"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
              <span>Send Broadcast Now</span>
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Recently Sent</h3>
          <div className="space-y-4">
            {RECENT_NOTIFICATIONS.map((notif) => (
              <div key={notif._id} className="panel-surface relative overflow-hidden p-6">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  notif.type === 'emergency' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      notif.type === 'emergency' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {notif.type === 'emergency' ? <AlertCircle size={16} /> : <Info size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{notif.title}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <Clock size={10} />
                        <span>{new Date(notif.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-4 text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-400">
                  {notif.message}
                </p>
                <div className="mt-4 flex items-center gap-2">
                   <CheckCircle2 size={12} className="text-green-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivered to 1,240 users</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
