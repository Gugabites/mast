import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '../components/icons'
import { useAuth } from './AuthProvider'

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="splash" role="status" aria-label="Carregando">
        <Logo size={56} />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
