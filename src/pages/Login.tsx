import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { AuthError } from '@supabase/supabase-js'
import { useAuth } from '../auth/AuthProvider'
import { Logo } from '../components/icons'

const GENERIC_ERROR = 'Não foi possível entrar. Tente novamente.'

function messageFor(error: AuthError): string {
  if (error.code === 'invalid_credentials' || error.message === 'Invalid login credentials') {
    return 'E-mail ou senha incorretos.'
  }
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
    return 'Sem conexão. Tente novamente.'
  }
  return GENERIC_ERROR
}

export function Login() {
  const { session, loading, signIn } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return null

  if (session) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
    return <Navigate to={from ?? '/'} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const authError = await signIn(email, password)
      // Em caso de sucesso a sessão muda e o redirecionamento acima acontece.
      if (authError) setError(messageFor(authError))
    } catch {
      setError(GENERIC_ERROR)
    }
    setSubmitting(false)
  }

  return (
    <main className="login">
      <div className="card login-card">
        <div className="login-brand">
          <Logo size={40} />
          <h1>Mast</h1>
        </div>
        <p className="login-tagline">Disciplina é escolher antes.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
