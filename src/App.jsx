import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import About from './pages/About'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Preparedness from './pages/Preparedness'
import Protocols from './pages/Protocols'
import ReportAnalysis from './pages/ReportAnalysis'
import SafetyTips from './pages/SafetyTips'

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />
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
      <Header
        darkMode={darkMode}
        onLogout={handleLogout}
        toggleDarkMode={() => setDarkMode((current) => !current)}
        user={user}
      />

      <main className="relative mx-auto min-h-screen max-w-7xl px-4 pb-10 pt-28 sm:px-6 lg:px-8">
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
      </main>
    </div>
  )
}

export default App
