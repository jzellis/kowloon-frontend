import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { logoutAsync } from '../../features/auth/authSlice'
import { useClient } from '../../hooks/useClient'

// TODO: pull from server info API / Redux slice
const SERVER_NAME = 'My Kowloon Server'
const SERVER_PAGES = [
  { label: 'About',    slug: 'about',    children: [
    { label: 'Rules & Guidelines', slug: 'rules' },
    { label: 'Privacy Policy',     slug: 'privacy' },
  ]},
  { label: 'Projects', slug: 'projects', children: [
    { label: 'Kowloon',       slug: 'kowloon' },
    { label: 'Music Archive', slug: 'music-archive' },
  ]},
  { label: 'Contact',  slug: 'contact',  children: [] },
]

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

const navLinkClass = ({ isActive }) =>
  `flex items-center h-full px-5 font-ui text-xs uppercase tracking-widest transition-colors ${
    isActive
      ? 'text-secondary-content border-b-4 border-primary -mb-[4px]'
      : 'text-base-300/70 hover:text-secondary-content hover:bg-black/20'
  }`

export function Header() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector((state) => state.auth)
  const client    = useClient()
  const { t }     = useTranslation()

  const NAV_LINKS = [
    { to: '/',         label: t('nav.feed')    },
    { to: '/circles',  label: t('nav.circles') },
    { to: '/groups',   label: t('nav.groups')  },
    { to: '/search',   label: t('nav.search')  },
  ]

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

        {/* ── Logo — always a plain home link ── */}
        <Link to="/" className="flex items-stretch shrink-0 hover:opacity-90 transition-opacity">
          <div className="bg-primary flex items-center justify-center w-16">
            <img className="h-10 w-10 object-contain" src="/logo.png" alt="Kowloon" />
          </div>
          <div className="flex items-center px-4 lg:px-5 bg-black/20">
            <span className="font-display text-2xl lg:text-3xl tracking-[0.15em] text-secondary-content whitespace-nowrap">
              {SERVER_NAME}
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
                className="dropdown-content p-0 mt-0 bg-base-100 dark:bg-neutral w-48 border-t-4 border-primary z-[1]"
              >
                <li className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-content/40 dark:text-white/60 border-b border-base-300 dark:border-white/10 truncate">
                  {userHandle}
                </li>
                <li>
                  <Link to="/profile" className="block px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-content/70 dark:text-white/95 hover:text-primary hover:bg-base-200 dark:hover:bg-black/20 transition-colors">
                    {t('nav.profile')}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-content/70 dark:text-white/95 hover:text-primary hover:bg-base-200 dark:hover:bg-black/20 transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            /* Logged-out: sign in / register — desktop only, mobile uses hamburger */
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 font-ui text-xs uppercase tracking-widest text-base-300/70 hover:text-primary transition-colors"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 font-ui text-xs uppercase tracking-widest bg-primary text-secondary hover:bg-base-100 transition-colors"
              >
                {t('nav.register')}
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
              className="dropdown-content p-0 mt-0 bg-base-100 dark:bg-neutral w-72 border-t-4 border-primary z-[1]"
            >
              {/* Nav links */}
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="block px-4 py-3 font-ui text-sm uppercase tracking-widest text-base-content/70 dark:text-white/95 hover:text-primary hover:bg-base-200 dark:hover:bg-black/20 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}

              {/* Server info */}
              <li className="px-4 py-4 border-t border-base-300 dark:border-white/10">
                <p className="font-reading text-sm text-base-content/75 dark:text-white/95 leading-relaxed">
                  A small, friendly server for writers, musicians, and people who think too much.
                </p>
              </li>

              {/* Pages */}
              <li className="px-4 pt-1 pb-1 font-ui text-xs uppercase tracking-widest text-base-content/40 dark:text-white/60 border-t border-base-300 dark:border-white/10">
                {t('nav.pages')}
              </li>
              {SERVER_PAGES.map((page) => (
                <li key={page.slug}>
                  <Link
                    to={`/pages/${page.slug}`}
                    className="block px-4 py-2 font-ui text-sm uppercase tracking-widest text-base-content/70 dark:text-white/95 hover:text-primary hover:bg-base-200 dark:hover:bg-black/20 transition-colors"
                  >
                    {page.label}
                  </Link>
                  {page.children?.map((child) => (
                    <Link
                      key={child.slug}
                      to={`/pages/${child.slug}`}
                      className="block pl-8 pr-4 py-1.5 font-ui text-xs uppercase tracking-widest text-base-content/50 dark:text-white/80 hover:text-primary hover:bg-base-200 dark:hover:bg-black/20 transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </li>
              ))}

              {/* Sign in / Register — logged-out only */}
              {!user && (
                <>
                  <li className="border-t border-base-300 dark:border-white/10">
                    <Link
                      to="/login"
                      className="block px-4 py-3 font-ui text-sm uppercase tracking-widest text-base-content/70 dark:text-white/95 hover:text-primary hover:bg-base-200 dark:hover:bg-black/20 transition-colors"
                    >
                      {t('nav.signIn')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="block px-4 py-3 font-ui text-sm uppercase tracking-widest bg-primary text-primary-content hover:opacity-90 transition-colors"
                    >
                      {t('nav.register')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

        </div>
      </nav>
    </header>
  )
}
