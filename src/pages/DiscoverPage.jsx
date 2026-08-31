// DiscoverPage — the server's curated shelves plus people search, over a
// blurred, darkened version of the server hero image (the `background` baked
// into GET /discovery; Klein-blue fallback when a server has no hero).
// Featured content sits in translucent-black panels with white text — mirrors
// the mobile Discover screen. First stop after registration; also linked in nav.

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Search, Heart, X } from 'lucide-react'
import { useClient } from '../hooks/useClient'
import { toast } from '../app/toast'
import CircleIcon from '../components/ui/CircleIcon'
import CopyCircleMenu from '../components/circles/CopyCircleMenu'
import DiscoveryShelf from '../components/discover/DiscoveryShelf'
import EmptyState from '../components/ui/EmptyState'
import sizedUrl from '../lib/sizedUrl'

const BANNER_KEY = 'kowloon_discover_welcomed'
const KLEIN = '#002FA7'

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

// ── HeartButton ───────────────────────────────────────────────────────────────

function HeartButton({ circle, client }) {
  const [reacted, setReacted] = useState(circle.userReacted ?? false)
  const [count, setCount] = useState(circle.reactCount ?? 0)
  const [busy, setBusy] = useState(false)

  const handleReact = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy || reacted || !client) return
    setBusy(true)
    try {
      await client.activities.react({ postId: circle.id, emoji: '❤️', name: 'heart' })
      setReacted(true)
      setCount((n) => n + 1)
    } catch (err) {
      toast.error('Could not react', { detail: err.message })
    }
    setBusy(false)
  }

  return (
    <button
      onClick={handleReact}
      disabled={busy || reacted}
      title={reacted ? 'Liked' : 'Like this circle'}
      className={`flex items-center gap-1 font-ui text-xs transition-colors shrink-0 disabled:cursor-default ${
        reacted ? 'text-error' : 'text-white/40 hover:text-error'
      }`}
    >
      <Heart size={14} fill={reacted ? 'currentColor' : 'none'} />
      {count > 0 ? <span>{count}</span> : null}
    </button>
  )
}

// ── CircleCard (fallback shelf — always on the dark backdrop) ───────────────────

function CircleCard({ circle, isLoggedIn, client }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-start gap-4 py-5 border-b border-white/10 group">
      <Link to={`/circles/${encodeURIComponent(circle.id)}`} className="shrink-0 mt-1">
        {circle.icon ? (
          <img
            loading="lazy"
            src={sizedUrl(circle.icon, 200)}
            alt={circle.name}
            className="w-14 h-14 object-cover"
            style={hexMask}
          />
        ) : (
          <div className="w-14 h-14 bg-secondary flex items-center justify-center" style={hexMask}>
            <CircleIcon type="circle" size="lg" className="opacity-70 text-secondary-content" />
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <Link
              to={`/circles/${encodeURIComponent(circle.id)}`}
              className="font-display text-2xl tracking-wide leading-none text-white hover:text-primary transition-colors"
            >
              {circle.name}
            </Link>
            <div className="flex items-center gap-2 font-ui text-xs uppercase tracking-widest text-white/60">
              {(circle.actor?.name ?? circle.actor?.displayName) && (
                <>
                  <Link
                    to={`/users/${encodeURIComponent(circle.actorId)}`}
                    className="font-bold hover:text-primary transition-colors"
                  >
                    {circle.actor.name ?? circle.actor.displayName ?? circle.actorId}
                  </Link>
                  <span>·</span>
                </>
              )}
              <span>{circle.memberCount ?? 0} {t('circle.members', { defaultValue: 'members' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn && client && <HeartButton circle={circle} client={client} />}
            {isLoggedIn && (
              <CopyCircleMenu circle={circle} className="opacity-0 group-hover:opacity-100 focus-within:opacity-100" />
            )}
          </div>
        </div>

        {circle.summary && (
          <p className="font-reading text-base text-white/75 leading-relaxed line-clamp-2">
            {circle.summary}
          </p>
        )}
      </div>
    </div>
  )
}

// ── UserRow ───────────────────────────────────────────────────────────────────

function UserRow({ user }) {
  const displayName = user.profile?.name ?? user.username ?? user.id
  const icon = user.profile?.icon

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/10 last:border-b-0">
      {icon ? (
        <img
          src={sizedUrl(icon, 100)}
          alt={displayName}
          className="w-9 h-9 object-cover rounded-full shrink-0"
        />
      ) : (
        <div className="w-9 h-9 bg-white/20 rounded-full shrink-0" />
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <Link
          to={`/users/${encodeURIComponent(user.id)}`}
          className="font-ui text-sm font-semibold text-white hover:text-primary transition-colors"
        >
          {displayName}
        </Link>
        <span className="font-ui text-xs text-white/50 truncate">{user.id}</span>
      </div>
      <Link
        to={`/users/${encodeURIComponent(user.id)}`}
        className="font-ui text-xs uppercase tracking-widest text-white/60 hover:text-primary transition-colors shrink-0"
      >
        View
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { t } = useTranslation()
  const client = useClient()
  const authUser = useSelector((state) => state.auth.user)
  const isLoggedIn = !!authUser
  const baseUrl = client?.http?.baseUrl

  const [banner, setBanner] = useState(false)
  const [query, setQuery] = useState('')
  const [sections, setSections] = useState([])
  const [background, setBackground] = useState(null)
  const [recsLoading, setRecsLoading] = useState(true)
  const [circles, setCircles] = useState([])
  const [circlesLoading, setCirclesLoading] = useState(true)
  const [circlesError, setCirclesError] = useState(null)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)

  const debounceRef = useRef(null)

  // Check banner flag on mount
  useEffect(() => {
    if (localStorage.getItem(BANNER_KEY) === '1') setBanner(true)
  }, [])

  const dismissBanner = () => {
    setBanner(false)
    localStorage.setItem(BANNER_KEY, '0')
  }

  // Load the server's curated Discover shelves + blurred-hero background.
  useEffect(() => {
    if (!client) return
    setRecsLoading(true)
    client.feeds
      .getDiscovery()
      .then((res) => {
        setSections(res?.sections ?? [])
        setBackground(res?.background ?? null)
      })
      .catch(() => setSections([]))
      .finally(() => setRecsLoading(false))
  }, [client])

  // Load popular circles — fallback content when a server has no curated shelves.
  useEffect(() => {
    if (!client) return
    setCirclesLoading(true)
    setCirclesError(null)
    client.feeds
      .getCircles({ sort: 'reacts', limit: 20 })
      .then((res) => setCircles(res?.orderedItems ?? []))
      .catch((e) => setCirclesError(e?.message || 'Could not load circles.'))
      .finally(() => setCirclesLoading(false))
  }, [client])

  // Debounced user search
  useEffect(() => {
    clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 2) {
      setUsers([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      if (!client) return
      setUsersLoading(true)
      try {
        const res = await client.search.searchUsers({ query: q, limit: 10 })
        setUsers(res?.orderedItems ?? res?.items ?? [])
      } catch {
        setUsers([])
      }
      setUsersLoading(false)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query, client])

  const showUserResults = query.trim().length >= 2

  return (
    <div className="relative min-h-full">
      {/* Blurred, darkened hero background (baked server-side), bleeding to the
          content-column edges. Klein-blue fallback when there's no hero. */}
      <div
        className="absolute -top-6 -bottom-6 left-0 right-0 lg:-left-8 lg:-right-8"
        style={{ backgroundColor: KLEIN }}
        aria-hidden="true"
      >
        {background && (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Foreground */}
      <div className="relative z-10 flex flex-col gap-8">

        {/* Welcome banner */}
        {banner && (
          <div className="relative bg-black/50 px-6 py-5">
            <button
              onClick={dismissBanner}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
            <p className="font-display text-3xl text-white mb-1">Welcome to Kowloon.</p>
            <p className="font-reading text-base text-white/80 leading-relaxed">
              Explore what the server recommends below, or search for people to add to your circles.
            </p>
          </div>
        )}

        {/* Header — slim screen title like the app (which shows "Discover" in the
            top bar, then goes straight to search + shelves). No oversized hero. */}
        <h1 className="font-display text-3xl tracking-wide leading-none text-white">Discover</h1>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', { defaultValue: 'Search for people...' })}
            className="w-full bg-black/30 border border-white/15 pl-9 pr-4 py-2.5 font-ui text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
          />
        </div>

        {/* User results */}
        {showUserResults && (
          <div className="bg-black/50 px-4 py-3 flex flex-col gap-1">
            <p className="font-ui text-[10px] uppercase tracking-widest text-white/50 mb-1">People</p>
            {usersLoading ? (
              <div className="py-6 flex justify-center"><span className="loading loading-spinner text-white/70" /></div>
            ) : users.length > 0 ? (
              <div className="flex flex-col">
                {users.map((u) => <UserRow key={u.id} user={u} />)}
              </div>
            ) : (
              <p className="font-ui text-sm text-white/50 py-3">No people found for "{query.trim()}".</p>
            )}
          </div>
        )}

        {/* Curated shelves (server Discover items); fall back to popular circles. */}
        {!showUserResults && (
          recsLoading ? (
            <div className="py-16 flex justify-center"><span className="loading loading-spinner loading-lg text-white/70" /></div>
          ) : sections.length > 0 ? (
            <div className="flex flex-col">
              {sections.map((s) => <DiscoveryShelf key={s.id} section={s} baseUrl={baseUrl} onDark />)}
            </div>
          ) : (
            <div className="bg-black/45 px-4 py-4">
              <p className="font-ui text-[10px] uppercase tracking-widest text-white/50 mb-1">Popular Circles</p>
              {circlesLoading ? (
                <div className="py-8 flex justify-center"><span className="loading loading-spinner text-white/70" /></div>
              ) : circlesError ? (
                <p className="font-ui text-sm text-error">{circlesError}</p>
              ) : circles.length === 0 ? (
                <EmptyState message="No public circles yet. Be the first to create one." />
              ) : (
                <div className="flex flex-col">
                  {circles.map((circle) => (
                    <CircleCard key={circle.id} circle={circle} isLoggedIn={isLoggedIn} client={client} />
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
