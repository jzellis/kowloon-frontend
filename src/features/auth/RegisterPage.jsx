import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerAsync, clearError } from './authSlice'

const FIXED_SERVER = import.meta.env.VITE_SERVER_URL || ''

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, sessionChecked, status, error } = useSelector((state) => state.auth)

  const [serverUrl, setServerUrl] = useState(FIXED_SERVER || '')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Invite code pre-filled from ?invite=<code> query param
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite') || '')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (sessionChecked && user) navigate('/', { replace: true })
  }, [sessionChecked, user, navigate])

  const isLoading = status === 'loading'
  const displayError = localError || error

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }

    dispatch(
      registerAsync({
        serverUrl: serverUrl.trim(),
        username: username.trim(),
        password,
        email: email.trim() || undefined,
        profile: displayName.trim() ? { name: displayName.trim() } : undefined,
        inviteCode: inviteCode.trim() || undefined,
      })
    )
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="text-3xl font-bold text-center">Kowloon</h1>
          <p className="text-center text-base-content/60 text-sm">
            Create your account
          </p>

          {displayError && (
            <div role="alert" className="alert alert-error">
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                <span className="label-text-alt text-base-content/50">required</span>
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
                pattern="[a-zA-Z0-9_-]+"
                title="Letters, numbers, underscores and hyphens only"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Display name</span>
                <span className="label-text-alt text-base-content/50">optional</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Email</span>
                <span className="label-text-alt text-base-content/50">optional</span>
              </div>
              <input
                type="email"
                className="input input-bordered"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                autoComplete="new-password"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Confirm password</span>
              </div>
              <input
                type="password"
                className="input input-bordered"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Invite code</span>
                <span className="label-text-alt text-base-content/50">if required</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                placeholder="xxxx-xxxx-xxxx"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                autoComplete="off"
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner" /> : 'Create account'}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
