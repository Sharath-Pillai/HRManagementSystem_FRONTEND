import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Spinner while checking auth
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <div className="spinner w-10 h-10"></div>
  </div>
)

// Redirect to login if not authenticated
export const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

// Redirect to dashboard if already authenticated
export const PublicRoute = () => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />
}

// Role-based guard
export const RoleRoute = ({ roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
