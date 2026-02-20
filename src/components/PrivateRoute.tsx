import { Navigate } from 'react-router-dom'

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // Check if token exists in cookies
  const token = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith('token='))

  // If token exists, render the component, otherwise redirect to login
  return token ? <>{children}</> : <Navigate to="/" replace />
}

export default PrivateRoute
