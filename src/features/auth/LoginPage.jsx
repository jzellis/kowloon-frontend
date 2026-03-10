import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginAsync, clearError } from './authSlice'

// If VITE_SERVER_URL is set at build time, this frontend is locked to that instance.
// Otherwise the user can type any server URL (multi-instance mode).
const FIXED_SERVER = import.meta.env.VITE_SERVER_URL || ''

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, sessionChecked, status, error } = useSelector((state) => state.auth)

  const [serverUrl, setServerUrl] = useState(FIXED_SERVER || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Clear any stale auth errors when we arrive at this page
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Redirect once logged in
  useEffect(() => {
    if (sessionChecked && user) navigate('/', { replace: true })
  }, [sessionChecked, user, navigate])

  const isLoading = status === 'loading'

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginAsync({ serverUrl: serverUrl.trim(), username: username.trim(), password }))
  }

  // While we're still checking a stored session, show a spinner instead of the form
  // so the user doesn't see a flash of the login page.
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="text-3xl font-bold text-center">Kowloon</h1>
          <p className="text-center text-base-content/60 text-sm">
            Sign in to your account
          </p>

          {error && (
            <div role="alert" className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!FIXED_SERVER && (
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Server URL</span>
                </div>
                <input
                  type="url"
                  className="input input-bordered"
                  placeholder="https://kwln.org"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  required
                  autoComplete="url"
                />
              </label>
            )}

            <label className="form-control">
              <div className="label">
                <span className="label-text">Username</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus={!!FIXED_SERVER}
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                type="password"
                className="input input-bordered"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner" /> : 'Log in'}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="link link-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
