import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
  info: ErrorInfo | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, info: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error, info })
    // eslint-disable-next-line no-console
    console.error('Winter Arc crashed:', error, info)
  }

  render() {
    const { error, info } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <div
          className="max-w-xl w-full rounded-[14px] border p-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-bad)' }}
        >
          <h1 className="text-lg font-bold mb-1" style={{ color: 'var(--color-bad)' }}>
            Winter Arc hit an error
          </h1>
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Your data is safe in IndexedDB. Copy the details below so it can be fixed, then try reloading.
          </p>
          <pre
            className="text-xs p-3 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            {error.message}
            {info?.componentStack ?? ''}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-accent)', color: '#0b0d10' }}
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
