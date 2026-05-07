import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Frontend render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="panel-surface mx-auto max-w-2xl p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Something went wrong</h1>
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-300">
            The page hit a rendering error, but the app is still running. Please refresh and try again.
          </p>
          <pre className="mt-5 overflow-auto rounded-2xl bg-slate-950 p-4 text-left text-xs text-red-100">
            {this.state.error?.message || 'Unknown frontend error'}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}
