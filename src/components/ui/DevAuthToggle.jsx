// DevAuthToggle — dev-only floating button to toggle mock auth state.
// Renders nothing in production.

import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { devSetUser } from '../../features/auth/authSlice'

const MOCK_USER = {
  id: '@jzellis@kwln.org',
  username: 'jzellis',
  displayName: 'Joshua Ellis',
  summary: 'Writer, musician, technologist.',
  profile: { icon: 'https://picsum.photos/seed/jzellis/200/200' },
}

export default function DevAuthToggle() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { t } = useTranslation()

  if (!import.meta.env.DEV) return null

  return (
    <button
      onClick={() => dispatch(devSetUser(user ? null : MOCK_USER))}
      title={user ? t('dev.switchOut') : t('dev.switchIn')}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-base-300 border-2 border-base-content/20 font-ui text-xs uppercase tracking-widest text-base-content/70 hover:bg-base-content hover:text-base-100 transition-colors shadow-lg"
    >
      <span className={`w-2 h-2 rounded-full ${user ? 'bg-success' : 'bg-error'}`} />
      {user ? `${user.username}` : t('dev.loggedOut')}
    </button>
  )
}
