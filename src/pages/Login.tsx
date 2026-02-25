import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { apiRemoteService } from '../services/APIRequest'

interface LoginResponse {
  token: string
}

interface ErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string | null
  validationErrors: any
}

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { login, user } = useAuthStore()


  useEffect(() => {

    if (user) {
      navigate('/welcome')
    }

  }, [user])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await apiRemoteService.post<LoginResponse>('/users/login', {
        username,
        password,
      })

      const data = response.data

      // Decode token and store in Zustand auth store
      if (data.token) {
        login(data.token)
      }

      // Navigate to welcome page on success
      navigate('/welcome')
    } catch (err: any) {
      // Extract error message from API response
      const errorData: ErrorResponse | null = err.response?.data
      const errorMessage = errorData?.message || err.message || 'Login failed. Please try again.'

      setError(errorMessage)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 py-3">
      <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold text-dark">Welcome Back</h1>
            <p className="text-muted small">Sign in to your account</p>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error:</strong> {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">Username</label>
              <input
                id="username"
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            {/* <div className="mb-3 form-check">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id="rememberMe"
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div> */}
            <button
              type="submit"
              className="btn btn-primary w-100 mb-3 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div className="text-center">
            <small className="text-muted">
              Don't have an account? <a href="#" className="text-decoration-none">Contact Admin to create your account</a>
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
