import { useEffect, useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../utils/apiClient'

const trustPoints = [
  'Secure MongoDB storage for your chat history',
  'Fast emergency assistant with India-specific (100) protocols',
  'AI-powered medical report analysis and guidance',
]

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('emergencyGuideUser')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name.')
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
    }

    try {
      if (isRegister) {
        await apiClient.register({ name, email, password })
        setIsRegister(false)
        setError('Registration successful! Please login.')
      } else {
        const data = await apiClient.login({ email, password })
        onLogin({
          token: data.token,
          email: data.user.email,
          name: data.user.name,
          isAdmin: data.user.isAdmin,
        })
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden rounded-[36px] border border-white/20 bg-[radial-gradient(ellipse_at_top_left,rgba(251,113,133,0.15),transparent_50%),linear-gradient(135deg,#0f172a,#020617_60%,#450a0a)] p-8 text-white shadow-2xl shadow-red-900/20 sm:p-12 backdrop-blur-3xl">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_58%)] lg:block" />
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-200">Emergency companion</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-white to-red-200 bg-clip-text text-transparent drop-shadow-sm">
            Authenticated AI Medical Assistant.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-200 sm:text-lg">
            Access your secure workspace with saved chat history and persistent medical report analysis.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="glass-stat">
              <span className="glass-stat__value">DB</span>
              <span className="glass-stat__label">Persistent</span>
            </div>
            <div className="glass-stat">
              <span className="glass-stat__value">100</span>
              <span className="glass-stat__label">India Ready</span>
            </div>
            <div className="glass-stat">
              <span className="glass-stat__value">AI</span>
              <span className="glass-stat__label">Dual Model</span>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/15 bg-white/8 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                <ShieldCheck className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <p className="font-semibold">Designed for rapid emergency guidance in India</p>
                <p className="text-sm text-slate-300">Call 100 for immediate help. Our AI provides simple remedies and safety steps while you wait.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-200">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel-surface p-6 sm:p-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <LockKeyhole className="h-3.5 w-3.5" />
            {isRegister ? 'Create an account' : 'Secure user login'}
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white">
            {isRegister ? 'Start your journey' : 'Enter the response console'}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {isRegister 
              ? 'Join the medical companion platform for persistent data access.' 
              : 'Log in to access your saved reports and chat history.'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${error.includes('successful') ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}

          {isRegister && (
            <label className="field-block">
              <span className="field-label">Full name</span>
              <span className="field-input">
                <UserIcon className="h-4 w-4 text-slate-400" />
                <input
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  value={name}
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                />
              </span>
            </label>
          )}

          <label className="field-block">
            <span className="field-label">Email</span>
            <span className="field-input">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                type="email"
                value={email}
                className="w-full bg-transparent outline-none placeholder:text-slate-500"
              />
            </span>
          </label>

          <label className="field-block">
            <span className="field-label">Password</span>
            <span className="field-input">
              <LockKeyhole className="h-4 w-4 text-slate-400" />
              <input
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                value={password}
                className="w-full bg-transparent outline-none placeholder:text-slate-500"
              />
            </span>
          </label>

          {isRegister && (
            <label className="field-block">
              <span className="field-label">Confirm Password</span>
              <span className="field-input">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  type="password"
                  value={confirmPassword}
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                />
              </span>
            </label>
          )}

          <button 
            className="primary-button w-full justify-center disabled:opacity-50" 
            type="submit"
            disabled={loading}
          >
            <span>{loading ? 'Processing...' : (isRegister ? 'Register' : 'Launch dashboard')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="font-semibold text-red-600 hover:underline dark:text-red-400"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Login here' : 'Register here'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
