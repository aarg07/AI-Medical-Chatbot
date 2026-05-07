import { useCallback, useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Ban, 
  Trash2, 
  User as UserIcon,
  MessageSquare,
  FileText,
  Calendar,
  Loader2,
  X
} from 'lucide-react'
import { apiClient } from '../../utils/apiClient'
import { motion as Motion, AnimatePresence } from 'framer-motion'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.searchAdminUsers(search, page)
      setUsers(data.users)
      setTotalPages(data.pages)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300)
    return () => clearTimeout(timer)
  }, [loadUsers])

  const handleBlock = async (userId, currentlyBlocked) => {
    if (!confirm(`Are you sure you want to ${currentlyBlocked ? 'unblock' : 'block'} this user?`)) return
    try {
      await apiClient.updateAdminUser(userId, { blocked: !currentlyBlocked })
      loadUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return
    try {
      await apiClient.deleteAdminUser(userId)
      loadUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm font-semibold text-slate-500">View and manage all registered platform users.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="field-input w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
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
                <th>User</th>
                <th>Status</th>
                <th>Activity</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="group">
                  <td>
                    <button onClick={() => setSelectedUser(user)} className="flex items-center gap-3 text-left">
                      <div className="h-10 w-10 rounded-full bg-slate-100 p-2 text-slate-500 dark:bg-slate-800">
                        <UserIcon className="h-full w-full" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                          {user.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">{user.email}</p>
                      </div>
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${user.blocked ? 'badge--red' : 'badge--green'}`}>
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span className="text-xs font-bold">{user.chatCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        <span className="text-xs font-bold">{user.reportCount || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-xs font-bold text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleBlock(user._id, user.blocked)}
                        className={`icon-button ${user.blocked ? 'text-green-600' : 'text-orange-600'}`}
                      >
                        <Ban size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="icon-button text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

        {!loading && users.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center text-slate-400">
            <UserIcon size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-bold">No users found</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="secondary-button px-4 py-2 text-xs"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="secondary-button px-4 py-2 text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="panel-surface relative w-full max-w-2xl overflow-hidden p-0"
            >
              <div className="relative h-32 bg-gradient-to-r from-red-500 to-orange-500">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute right-4 top-4 rounded-full bg-black/20 p-2 text-white hover:bg-black/40"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="px-8 pb-8">
                <div className="relative -mt-12 flex items-end justify-between">
                  <div className="h-24 w-24 rounded-3xl border-4 border-white bg-slate-100 p-4 text-slate-400 dark:border-slate-900 dark:bg-slate-800">
                    <UserIcon className="h-full w-full" />
                  </div>
                  <div className="flex gap-2 pb-2">
                    <button className="primary-button py-2 text-xs">View Full Activity</button>
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedUser.name}</h2>
                  <p className="font-bold text-slate-500">{selectedUser.email}</p>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Chats</p>
                    <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{selectedUser.chatCount || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reports</p>
                    <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{selectedUser.reportCount || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</p>
                    <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Account Security</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-bold">Email Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${selectedUser.blocked ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="text-sm font-bold">{selectedUser.blocked ? 'Account Restricted' : 'No Restrictions'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
