import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { registerAsync, clearError } from './authSlice'

const FIXED_SERVER = import.meta.env.VITE_SERVER_URL || ''

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, sessionChecked, status, error } = useSelector((state) => state.auth)

  const { t } = useTranslation()
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
      setLocalError(t('auth.passwordMismatch'))
      return
    }
    if (password.length < 8) {
      setLocalError(t('auth.passwordTooShort'))
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
            {t('auth.registerTitle')}
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
                  <span className="label-text">{t('auth.serverUrl')}</span>
                </div>
                <input
                  type="url"
                  className="input input-bordered"
                  placeholder={t('auth.serverUrlPlaceholder')}
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  required
                  autoComplete="url"
                />
              </label>
            )}

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t('auth.username')}</span>
                <span className="label-text-alt text-base-content/50">required</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                placeholder={t('auth.usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus={!!FIXED_SERVER}
                pattern="[a-zA-Z0-9_-]+"
                title={t('auth.usernamePattern')}
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t('auth.displayName')}</span>
                <span className="label-text-alt text-base-content/50">{t('common.optional')}</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                placeholder={t('auth.displayNamePlaceholder')}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t('auth.email')}</span>
                <span className="label-text-alt text-base-content/50">{t('common.optional')}</span>
              </div>
              <input
                type="email"
                className="input input-bordered"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t('auth.password')}</span>
              </div>
              <input
                type="password"
                className="input input-bordered"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t('auth.confirmPassword')}</span>
              </div>
              <input
                type="password"
                className="input input-bordered"
                placeholder={t('auth.passwordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">{t('auth.inviteCode')}</span>
                <span className="label-text-alt text-base-content/50">{t('auth.inviteCodeNote')}</span>
              </div>
              <input
                type="text"
                className="input input-bordered"
                placeholder={t('auth.inviteCodePlaceholder')}
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
              {isLoading ? <span className="loading loading-spinner" /> : t('auth.createAccount')}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="link link-primary">
              {t('auth.logIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
