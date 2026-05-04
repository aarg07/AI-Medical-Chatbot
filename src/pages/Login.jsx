import { useEffect, useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const trustPoints = [
  'Private local session stored only in your browser',
  'Fast emergency assistant with image and voice support',
  'Built-in safety references, protocols, and preparedness pages',
]

export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Student responder')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('emergencyGuideUser')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!name.trim() || !email.trim()) {
      setError('Enter your name and email to continue.')
      return
    }

    onLogin({
      email: email.trim(),
      name: name.trim(),
      role,
    })

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden rounded-[36px] border border-white/20 bg-[radial-gradient(ellipse_at_top_left,rgba(251,113,133,0.15),transparent_50%),linear-gradient(135deg,#0f172a,#020617_60%,#450a0a)] p-8 text-white shadow-2xl shadow-red-900/20 sm:p-12 backdrop-blur-3xl">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_58%)] lg:block" />
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-200">Emergency companion</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-white to-red-200 bg-clip-text text-transparent drop-shadow-sm">
            A sharper front end for your AI first-aid project.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-200 sm:text-lg">
            Sign in to enter a calmer, cleaner response workspace with guided protocols, emergency tips, and a polished assistant experience.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="glass-stat">
              <span className="glass-stat__value">6+</span>
              <span className="glass-stat__label">Core pages</span>
            </div>
            <div className="glass-stat">
              <span className="glass-stat__value">24/7</span>
              <span className="glass-stat__label">Reference ready</span>
            </div>
            <div className="glass-stat">
              <span className="glass-stat__value">AI</span>
              <span className="glass-stat__label">Text, voice, image</span>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/15 bg-white/8 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                <ShieldCheck className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <p className="font-semibold">Designed for demos, students, and rapid emergency guidance</p>
                <p className="text-sm text-slate-300">Use the assistant for structured first-response instructions while keeping official services one tap away.</p>
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
            Secure local login
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white">Enter the response console</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            This login is lightweight by design. It personalizes the project and unlocks the full navigation flow.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <label className="field-block">
            <span className="field-label">Full name</span>
            <span className="field-input">
              <User className="h-4 w-4 text-slate-400" />
              <input
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                value={name}
                className="w-full bg-transparent outline-none placeholder:text-slate-500"
              />
            </span>
          </label>

          <label className="field-block">
            <span className="field-label">Email</span>
            <span className="field-input">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                type="email"
                value={email}
              />
            </span>
          </label>

          <label className="field-block">
            <span className="field-label">Use case</span>
            <select
              className="field-select"
              onChange={(event) => setRole(event.target.value)}
              value={role}
            >
              <option>Student responder</option>
              <option>College project reviewer</option>
              <option>Teacher or mentor</option>
              <option>General user</option>
            </select>
          </label>

          <button className="primary-button w-full justify-center" type="submit">
            <span>Launch dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  )
}
