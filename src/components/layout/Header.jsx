import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAsync } from '../../features/auth/authSlice'
import { useClient } from '../../hooks/useClient'

// Bell icon (inline SVG — no extra dep needed)
function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  )
}

// Hamburger icon for mobile menu
function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, serverUrl } = useSelector((state) => state.auth)
  const client = useClient()

  const handleLogout = async () => {
    await dispatch(logoutAsync())
    navigate('/login')
  }

  const avatarUrl = user?.icon
    ? client?.files?.serveUrl(user.icon, {})
    : null

  const userHandle = user?.id || user?.username

  return (
    <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      {/* Mobile: hamburger dropdown */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <MenuIcon />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><Link to="/">Feed</Link></li>
            <li><Link to="/groups">Groups</Link></li>
            <li><Link to="/bookmarks">Bookmarks</Link></li>
          </ul>
        </div>

        {/* Logo */}
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          Kowloon
        </Link>
      </div>

      {/* Desktop: nav links */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/">Feed</Link></li>
          <li><Link to="/groups">Groups</Link></li>
          <li><Link to="/bookmarks">Bookmarks</Link></li>
        </ul>
      </div>

      {/* Right side: notifications + user menu */}
      <div className="navbar-end gap-1">
        {/* Notifications */}
        <Link to="/notifications" className="btn btn-ghost btn-circle">
          <div className="indicator">
            <BellIcon />
            {/* Notification badge — wired up later when NotificationsClient is hooked in */}
          </div>
        </Link>

        {/* User dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            {avatarUrl ? (
              <div className="w-8 rounded-full">
                <img src={avatarUrl} alt={userHandle} />
              </div>
            ) : (
              <div className="avatar avatar-placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8">
                  <span className="text-xs">
                    {user?.username?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li className="menu-title text-xs opacity-60 truncate px-2">
              {userHandle}
            </li>
            <li>
              <Link to={`/u/${user?.username}`}>Profile</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Log out</button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
