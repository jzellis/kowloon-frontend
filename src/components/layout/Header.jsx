import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAsync } from '../../features/auth/authSlice'
import { useClient } from '../../hooks/useClient'

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

const NAV_LINKS = [
  { to: '/',         label: 'Feed'    },
  { to: '/circles',  label: 'Circles' },
  { to: '/groups',   label: 'Groups'  },
  { to: '/search',   label: 'Search'  },
]

const navLinkClass = ({ isActive }) =>
  `flex items-center h-full px-5 font-ui text-xs uppercase tracking-widest transition-colors ${
    isActive
      ? 'text-base-100 border-b-4 border-primary -mb-[4px]'
      : 'text-base-300/70 hover:text-base-100 hover:bg-black/20'
  }`

export function Header() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector((state) => state.auth)
  const client    = useClient()

  const handleLogout = async () => {
    await dispatch(logoutAsync())
    navigate('/login')
  }

  const avatarUrl  = user?.icon ? client?.files?.serveUrl(user.icon, {}) : null
  const userHandle = user?.id || user?.username
  const userInitial = user?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="bg-secondary border-b-4 border-primary sticky top-0 z-50">
      <nav className="flex items-stretch h-16">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link to="/" className="flex items-stretch shrink-0 hover:opacity-90 transition-opacity">
          {/* Yellow box holding the server icon */}
          <div className="bg-primary flex items-center justify-center w-16">
            <img className="h-10 w-10 object-contain" src="/logo.png" alt="Kowloon" />
          </div>
          {/* Site name */}
          <div className="flex items-center px-5 bg-black/20">
            <span className="font-display text-3xl tracking-[0.15em] text-base-100">
              KOWLOON
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────── */}
        <ul className="hidden lg:flex items-stretch ml-2">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to} className="flex items-stretch">
              <NavLink to={to} end={to === '/'} className={navLinkClass}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Right side ───────────────────────────────────────── */}
        <div className="flex items-center gap-1 ml-auto px-3">

          {/* Notifications (auth'd only) */}
          {user && (
            <Link
              to="/notifications"
              className="flex items-center justify-center w-10 h-10 text-base-300/70 hover:text-primary transition-colors"
            >
              <div className="indicator">
                <BellIcon />
                {/* Badge wired up when notifications slice is ready */}
              </div>
            </Link>
          )}

          {/* User menu */}
          {user ? (
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="flex items-center gap-3 px-3 h-10 text-base-300/70 hover:text-primary hover:bg-black/20 transition-colors"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userHandle} className="w-7 h-7 object-cover" />
                ) : (
                  <div className="w-7 h-7 bg-primary flex items-center justify-center">
                    <span className="font-display text-sm text-primary-content">{userInitial}</span>
                  </div>
                )}
                <span className="font-ui text-xs uppercase tracking-widest hidden xl:block">
                  {user?.username}
                </span>
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content p-0 mt-0 bg-neutral w-48 border-t-4 border-primary z-[1]"
              >
                <li className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-300/40 border-b border-white/10 truncate">
                  {userHandle}
                </li>
                <li>
                  <Link to="/profile" className="block px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-300/70 hover:text-primary hover:bg-black/20 transition-colors">
                    Profile &amp; Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-300/70 hover:text-primary hover:bg-black/20 transition-colors"
                  >
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            /* Logged-out: sign in / register */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 font-ui text-xs uppercase tracking-widest text-base-300/70 hover:text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 font-ui text-xs uppercase tracking-widest bg-primary text-secondary hover:bg-base-100 transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <div className="dropdown dropdown-end lg:hidden">
            <button
              tabIndex={0}
              className="flex items-center justify-center w-10 h-10 text-base-300/70 hover:text-primary transition-colors"
            >
              <MenuIcon />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content p-0 mt-0 bg-neutral w-52 border-t-4 border-primary z-[1]"
            >
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="block px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-300/70 hover:text-primary hover:bg-black/20 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </nav>
    </header>
  )
}
