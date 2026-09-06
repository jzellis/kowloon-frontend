// AdminLayout — shell for all /admin/* routes.
// Redirects to /login if unauthenticated. Each page handles its own 403 check.

import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, Users2, Circle,
  Mail, Flag, Settings, ArrowLeft, Palette, BookOpen, Bookmark,
  Menu, X, ScrollText, Compass,
} from 'lucide-react'

const NAV = [
  { to: '/admin',            label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/users',      label: 'Users',        icon: Users },
  { to: '/admin/posts',      label: 'Posts',        icon: FileText },
  { to: '/admin/groups',     label: 'Groups',       icon: Users2 },
  { to: '/admin/circles',    label: 'Circles',      icon: Circle },
  { to: '/admin/pages',      label: 'Pages',        icon: BookOpen },
  { to: '/admin/bookmarks',  label: 'Bookmarks',    icon: Bookmark },
  { to: '/admin/invites',    label: 'Invites',      icon: Mail },
  { to: '/admin/discovery',  label: 'Discover',     icon: Compass },
  { to: '/admin/moderation', label: 'Moderation',   icon: Flag },
  { to: '/admin/themes',     label: 'Themes',       icon: Palette },
  { to: '/admin/settings',   label: 'Settings',     icon: Settings },
  { to: '/admin/logs',       label: 'Logs',         icon: ScrollText },
]

function SidebarContent() {
  return (
    <>
      <div className="px-5 pt-6 pb-4 border-b border-secondary-content/20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-secondary-content/50 hover:text-secondary-content transition-colors mb-3"
        >
          <ArrowLeft size={12} />
          Back to Site
        </Link>
        <p className="font-display text-3xl tracking-widest leading-none">ADMIN</p>
        <p className="font-ui text-xs uppercase tracking-widest opacity-50 mt-1">Control Panel</p>
      </div>

      <nav className="flex flex-col py-4 flex-1" aria-label="Admin navigation">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 font-ui text-xs uppercase tracking-widest transition-colors ${
                isActive
                  ? 'bg-secondary-content/15 border-l-2 border-primary text-secondary-content'
                  : 'text-secondary-content/60 hover:text-secondary-content hover:bg-secondary-content/10 border-l-2 border-transparent'
              }`
            }
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-secondary-content/20">
        <Link
          to="/"
          className="flex items-center gap-2 font-ui text-xs uppercase tracking-widest text-secondary-content/50 hover:text-secondary-content transition-colors"
        >
          <ArrowLeft size={12} />
          Back to Site
        </Link>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { user, sessionChecked } = useSelector((s) => s.auth)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Lock body scroll + close on Escape while drawer is open.
  useEffect(() => {
    if (!drawerOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen])

  if (!sessionChecked) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-52 shrink-0 bg-secondary text-secondary-content flex-col overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile drawer backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-200 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Mobile drawer panel — slides from the left */}
      <aside
        id="admin-mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        onClick={(e) => { if (e.target.closest('a')) setDrawerOpen(false) }}
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-secondary text-secondary-content z-[70] flex flex-col overflow-y-auto lg:hidden transition-transform duration-200 ease-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close sidebar"
          className="absolute top-4 right-4 p-1 text-secondary-content/60 hover:text-secondary-content transition-colors"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-base-100">
        {/* Mobile top bar — hamburger + label */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 h-14 bg-secondary text-secondary-content px-4 border-b border-secondary-content/20">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open sidebar"
            aria-expanded={drawerOpen}
            aria-controls="admin-mobile-sidebar"
            className="p-2 -ml-2 text-secondary-content/70 hover:text-secondary-content transition-colors"
          >
            <Menu size={20} />
          </button>
          <p className="font-display text-xl tracking-widest leading-none">ADMIN</p>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-secondary-content/60 hover:text-secondary-content transition-colors"
          >
            <ArrowLeft size={12} />
            Site
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
