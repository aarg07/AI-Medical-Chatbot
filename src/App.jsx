import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import About from './pages/About'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Preparedness from './pages/Preparedness'
import Protocols from './pages/Protocols'
import ReportAnalysis from './pages/ReportAnalysis'
import SafetyTips from './pages/SafetyTips'

// Admin Components
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminChats from './pages/admin/Chats'
import AdminReports from './pages/admin/Reports'
import AdminEmergencies from './pages/admin/Emergencies'
import AdminAnalytics from './pages/admin/Analytics'
import AdminSettings from './pages/admin/Settings'
import AdminLogs from './pages/admin/Logs'
import AdminNotifications from './pages/admin/Notifications'

const ADMIN_EMAIL = 'amangupta786083@gmail.com'

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('emergencyGuideUser')
    return storedUser ? JSON.parse(storedUser) : null
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (user) {
      localStorage.setItem('emergencyGuideUser', JSON.stringify(user))
      return
    }

    localStorage.removeItem('emergencyGuideUser')
  }, [user])

  const handleLogin = (profile) => setUser(profile)
  const handleLogout = () => setUser(null)

  return (
    <div className="app-shell min-h-screen">
      <div className="app-shell__glow app-shell__glow--one" />
      <div className="app-shell__glow app-shell__glow--two" />
      
      <Routes>
        {/* Admin Routes (Uses separate layout without standard header) */}
        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminLayout onLogout={handleLogout} />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="chats" element={<AdminChats />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="emergencies" element={<AdminEmergencies />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Standard Routes with Header */}
        <Route
          path="*"
          element={
            <>
              <Header
                darkMode={darkMode}
                onLogout={handleLogout}
                toggleDarkMode={() => setDarkMode((current) => !current)}
                user={user}
              />
              <main className="relative mx-auto min-h-screen w-full max-w-[1600px] px-3 pb-6 pt-20 sm:px-5 lg:px-8">
                <ErrorBoundary>
                  <Routes>
                    <Route
                      path="/login"
                      element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
                    />
                    <Route
                      path="/dashboard"
                      element={(
                        <ProtectedRoute user={user}>
                          <Dashboard user={user} />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/assistant"
                      element={(
                        <ProtectedRoute user={user}>
                          <Chat user={user} />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/tips"
                      element={(
                        <ProtectedRoute user={user}>
                          <SafetyTips />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/protocols"
                      element={(
                        <ProtectedRoute user={user}>
                          <Protocols />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/preparedness"
                      element={(
                        <ProtectedRoute user={user}>
                          <Preparedness />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/report-analysis"
                      element={(
                        <ProtectedRoute user={user}>
                          <ReportAnalysis />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/about"
                      element={(
                        <ProtectedRoute user={user}>
                          <About />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/"
                      element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
                    />
                  </Routes>
                </ErrorBoundary>
              </main>
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default App
