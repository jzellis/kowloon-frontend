// ServerPage — /server/:domain
// Profile for a remote Kowloon server. The identity + cached Circles/Groups/Pages
// come from the local cache (client.feeds.getServer). Public Posts and Discover
// are fetched live from the remote server's own public endpoints. Web counterpart
// of the mobile server/[domain].js.

import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Globe, ExternalLink, Users, MapPin, PlusCircle, ChevronRight, Loader } from 'lucide-react'
import { useClient } from '../hooks/useClient'
import { toast } from '../app/toast'
import CircleIcon from '../components/ui/CircleIcon'
import Spinner from '../components/ui/Spinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PostCard from '../components/posts/PostCard'
import DiscoveryShelf from '../components/discover/DiscoveryShelf'
import DiscoverMediaTile from '../components/discover/DiscoverMediaTile'
import ServerMoreMenu from '../components/servers/ServerMoreMenu'
import sizedUrl from '../lib/sizedUrl'

const KLEIN = '#002FA7'
const POSTS_PER_PAGE = 20

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

const TABS = [
  { key: 'posts',    label: 'Public Posts' },
  { key: 'circles',  label: 'Circles'      },
  { key: 'groups',   label: 'Groups'       },
  { key: 'pages',    label: 'Pages'        },
  { key: 'discover', label: 'Discover'     },
]

function stripHtml(s) {
  return typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : ''
}

function resolveUrl(url, baseUrl) {
  if (!url) return url
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url
  if (!baseUrl) return url
  return `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}

// ── Add-to-Circle modal — adds `@<domain>` to one of the viewer's circles. ──────

function AddServerToCircleModal({ domain, authUser, client, onClose }) {
  const [circles, setCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(null)

  useEffect(() => {
    client.feeds.getUserCircles({ userId: authUser.id })
      .then((res) => setCircles(res?.orderedItems ?? res?.items ?? []))
      .catch(() => setCircles([]))
      .finally(() => setLoading(false))
  }, [authUser.id, client])

  const handleAdd = async (circle) => {
    setAdding(circle.id)
    try {
      await client.activities.addToCircle({ circleId: circle.id, memberId: `@${domain}` })
      toast.success(`${domain} added to ${circle.name}`)
      onClose()
    } catch (err) {
      toast.error('Failed to add to circle', { detail: err.message })
      setAdding(null)
    }
  }

  return (
    <Modal open title={`Add ${domain} to Circle`} onClose={onClose}>
      {loading ? (
        <Spinner centered />
      ) : circles.length === 0 ? (
        <p className="font-ui text-sm text-base-content/50 py-2">
          No circles yet. <Link to="/circles/new" className="underline" onClick={onClose}>Create one first.</Link>
        </p>
      ) : (
        <div className="flex flex-col -mx-6">
          {circles.map((circle) => (
            <button
              key={circle.id}
              onClick={() => handleAdd(circle)}
              disabled={!!adding}
              className="flex items-center gap-3 px-6 py-3 text-left hover:bg-base-200 transition-colors border-b border-base-300 last:border-b-0 disabled:opacity-50"
            >
              {adding === circle.id
                ? <Loader size={14} className="animate-spin shrink-0 text-base-content/40" />
                : <CircleIcon type="circle" size="sm" className="shrink-0 opacity-50" />}
              <span className="font-ui text-sm">{circle.name}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

// ── Cached entity row (Circles / Groups) ────────────────────────────────────────

function EntityRow({ item, to, type }) {
  const blurb = stripHtml(item.summary || item.description)
  const inner = (
    <>
      {item.icon
        ? <img loading="lazy" src={item.icon} alt="" className="w-10 h-10 object-cover shrink-0" style={hexMask} />
        : <div className="w-10 h-10 bg-secondary flex items-center justify-center shrink-0" style={hexMask}>
            <CircleIcon type={type} size="md" className="opacity-70 text-secondary-content" />
          </div>}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-ui text-sm font-bold text-base-content truncate">{item.name}</span>
        {typeof item.memberCount === 'number' && item.memberCount > 0 && (
          <span className="font-ui text-xs uppercase tracking-widest text-base-content/50">
            {item.memberCount.toLocaleString()} members
          </span>
        )}
        {blurb && <p className="font-reading text-sm text-base-content/70 leading-snug line-clamp-2">{blurb}</p>}
      </div>
    </>
  )
  return to
    ? <Link to={to} className="flex items-start gap-3 py-3 border-b border-base-300 hover:bg-base-200 px-2 -mx-2 transition-colors">{inner}</Link>
    : <div className="flex items-start gap-3 py-3 border-b border-base-300">{inner}</div>
}

// ── Popular Media strip ─────────────────────────────────────────────────────────

function MediaStrip({ items, baseUrl, onDiscoverMore }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-col gap-2">
      <p className="font-ui text-[11px] uppercase tracking-widest text-base-content/55">Popular Media</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {items.map((item, i) => (
          <DiscoverMediaTile key={`${item.id}:${i}`} item={item} size={140} baseUrl={baseUrl} showAuthor />
        ))}
        {onDiscoverMore && (
          <button
            type="button"
            onClick={onDiscoverMore}
            style={{ width: 140, height: 140 }}
            className="shrink-0 bg-secondary flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity"
          >
            <ChevronRight size={22} className="text-secondary-content" />
            <span className="font-ui uppercase tracking-widest text-[9px] text-secondary-content">Discover More</span>
          </button>
        )}
      </div>
    </div>
  )
}

function StatPill({ label, value }) {
  if (value == null) return null
  return (
    <div className="flex flex-col">
      <span className="font-display text-2xl leading-none text-base-content">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className="font-ui text-[11px] uppercase tracking-widest text-base-content/50 mt-1">{label}</span>
    </div>
  )
}

function TabBar({ tab, onSelect }) {
  return (
    <div className="flex gap-0 overflow-x-auto border-b-2 border-base-300">
      {TABS.map((tItem) => (
        <button
          key={tItem.key}
          onClick={() => onSelect(tItem.key)}
          className={`px-4 py-3 font-ui uppercase tracking-widest text-[11px] whitespace-nowrap transition-colors border-b-2 -mb-0.5 ${
            tab === tItem.key
              ? 'text-base-content border-primary font-bold'
              : 'text-base-content/50 border-transparent hover:text-base-content'
          }`}
        >
          {tItem.label}
        </button>
      ))}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function ServerPage() {
  const { domain } = useParams()
  const client = useClient()
  const { t } = useTranslation()
  const authUser = useSelector((state) => state.auth.user)
  const remoteBase = `https://${domain}`

  const [server, setServer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('posts')
  const [pickerOpen, setPickerOpen] = useState(false)

  // Live remote posts
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsError, setPostsError] = useState(null)
  const [postsPage, setPostsPage] = useState(1)
  const [postsTotal, setPostsTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  // Live remote Discover
  const [recSections, setRecSections] = useState(null)
  const [recBg, setRecBg] = useState(null)
  const [recLoading, setRecLoading] = useState(false)
  const [recError, setRecError] = useState(null)

  const load = useCallback(async () => {
    if (!client || !domain) return
    setLoading(true)
    setError(null)
    try {
      const res = await client.feeds.getServer({ domain })
      setServer(res?.server ?? res?.item ?? res ?? null)
    } catch (err) {
      setError(err?.message || 'Could not load this server.')
    } finally {
      setLoading(false)
    }
  }, [client, domain])

  const loadPosts = useCallback(async ({ page = 1, append = false } = {}) => {
    if (!domain) return
    if (append) setLoadingMore(true)
    else setPostsLoading(true)
    setPostsError(null)
    try {
      const qs = `limit=${POSTS_PER_PAGE}${page > 1 ? `&page=${page}` : ''}`
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(`${remoteBase}/posts?${qs}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }).finally(() => clearTimeout(timer))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // Anonymous, direct fetch to the REMOTE server (previewing any server's
      // live public firehose, even ones you have no account on) — that server
      // has no idea it's you asking, so it can't apply your blocks/mutes.
      // Filter client-side using your own list instead.
      const raw = data.orderedItems ?? data.items ?? []
      await client?.moderation?.load()
      const items = client?.moderation?.filterItems(raw) ?? raw
      if (append) {
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id))
          return [...prev, ...items.filter((p) => !seen.has(p.id))]
        })
      } else {
        setPosts(items)
      }
      setPostsTotal(data.totalItems ?? items.length)
      setPostsPage(page)
    } catch (e) {
      setPostsError(e?.name === 'AbortError' ? 'Request timed out.' : (e?.message || 'Could not load posts.'))
    } finally {
      setPostsLoading(false)
      setLoadingMore(false)
    }
  }, [domain, remoteBase, client])

  const loadDiscover = useCallback(async () => {
    if (!domain) return
    setRecLoading(true)
    setRecError(null)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(`${remoteBase}/discovery`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }).finally(() => clearTimeout(timer))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // Same anonymous-fetch gap as loadPosts above — filter client-side.
      await client?.moderation?.load()
      const sections = (data.sections ?? []).map((s) => ({
        ...s,
        items: client?.moderation?.filterItems(s.items) ?? s.items,
      }))
      setRecSections(sections)
      setRecBg(data.background ? resolveUrl(data.background, remoteBase) : null)
    } catch (e) {
      setRecError(e?.name === 'AbortError' ? 'Request timed out.' : (e?.message || "Could not load this server's Discover."))
      setRecSections([])
    } finally {
      setRecLoading(false)
    }
  }, [domain, remoteBase, client])

  useEffect(() => { load() }, [load])

  // Posts on the default tab; Discover feeds both the media strip and its tab.
  useEffect(() => {
    if (tab === 'posts' && posts.length === 0 && !postsLoading && !postsError) loadPosts({ page: 1 })
  }, [tab, loadPosts]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (domain && recSections === null && !recLoading) loadDiscover()
  }, [domain, loadDiscover]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !server) return <Spinner centered />
  if (error && !server) return <ErrorState message={error} onRetry={load} />
  if (!server) return null

  const name = server.name || domain
  const externalUrl = server.url || remoteBase
  const heroSrc = resolveUrl(server.image, remoteBase)
  const iconSrc = server.icon
  const circles = server.cachedCircles ?? []
  const groups = server.cachedGroups ?? []
  const pages = server.cachedPages ?? []
  const mediaItems = recSections?.find((s) => s.contentType === 'media')?.items?.slice(0, 20) ?? []
  const hasMore = posts.length < postsTotal

  return (
    <div className="flex flex-col gap-6">
      {/* Hero — 16:9 banner */}
      {heroSrc ? (
        <img src={heroSrc} alt="" className="w-full aspect-video object-cover bg-base-200" />
      ) : (
        <div className="w-full aspect-video bg-secondary flex items-center justify-center">
          {iconSrc
            ? <img src={sizedUrl(iconSrc, 200)} alt="" className="w-20 h-20 object-contain" />
            : <Globe size={48} className="text-secondary-content opacity-50" />}
        </div>
      )}

      {/* Masthead */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-4">
          {iconSrc
            ? <img src={sizedUrl(iconSrc, 200)} alt="" className="w-16 h-16 object-cover shrink-0" style={hexMask} />
            : <div className="w-16 h-16 bg-secondary flex items-center justify-center shrink-0" style={hexMask}>
                <Globe size={24} className="text-secondary-content opacity-70" />
              </div>}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h1 className="font-display text-4xl leading-none tracking-wide">{name}</h1>
            <span className="font-ui text-xs uppercase tracking-widest text-base-content/50">{domain}</span>
          </div>
        </div>

        {server.stale && (
          <p className="font-ui text-xs text-warning">Showing cached data — server unreachable</p>
        )}

        {server.description && (
          <p className="font-reading text-base text-base-content/80 leading-relaxed">
            {stripHtml(server.description)}
          </p>
        )}

        {server.location?.name && (
          <div className="flex items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-base-content/50">
            <MapPin size={13} /> {server.location.name}
          </div>
        )}

        {/* Stat pills */}
        <div className="flex flex-wrap gap-8 mt-1">
          <StatPill label="Users" value={server.userCount} />
          <StatPill label="Posts" value={server.postCount} />
          {server.openRegistrations != null && (
            <StatPill label="Registration" value={server.openRegistrations ? 'Open' : 'Closed'} />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          {authUser && (
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              <PlusCircle size={14} /> Add to Circle
            </button>
          )}
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
          >
            <ExternalLink size={11} /> {t('server.visit', { defaultValue: `Visit ${domain}` })}
          </a>
          {authUser && (
            <ServerMoreMenu domain={domain} client={client} authUser={authUser} />
          )}
        </div>
      </div>

      {/* Popular Media strip */}
      <MediaStrip items={mediaItems} baseUrl={remoteBase} onDiscoverMore={() => setTab('discover')} />

      {/* Tabs */}
      <TabBar tab={tab} onSelect={setTab} />

      {/* Tab content */}
      <div>
        {tab === 'posts' && (
          postsLoading ? (
            <Spinner centered />
          ) : postsError ? (
            <ErrorState message={postsError} onRetry={() => loadPosts({ page: 1 })} />
          ) : posts.length === 0 ? (
            <EmptyState message="No public posts yet." />
          ) : (
            <div className="flex flex-col">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
              {hasMore && (
                <div className="flex justify-center py-4">
                  {loadingMore ? (
                    <Spinner />
                  ) : (
                    <button
                      onClick={() => loadPosts({ page: postsPage + 1, append: true })}
                      className="px-6 py-3 border-2 border-base-300 font-ui text-xs uppercase tracking-widest text-base-content/70 hover:border-primary hover:text-primary transition-colors"
                    >
                      Load more
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {tab === 'circles' && (
          circles.length === 0 ? (
            <EmptyState message="No public circles cached." />
          ) : (
            <div className="flex flex-col">
              {circles.map((c) => (
                <EntityRow key={c.id} item={c} type="circle" to={c.id ? `/circles/${encodeURIComponent(c.id)}` : null} />
              ))}
            </div>
          )
        )}

        {tab === 'groups' && (
          groups.length === 0 ? (
            <EmptyState message="No public groups cached." />
          ) : (
            <div className="flex flex-col">
              {groups.map((g) => (
                <EntityRow key={g.id} item={g} type="group" to={g.id ? `/groups/${encodeURIComponent(g.id)}` : null} />
              ))}
            </div>
          )
        )}

        {tab === 'pages' && (
          pages.length === 0 ? (
            <EmptyState message="No public pages cached." />
          ) : (
            <div className="flex flex-col">
              {pages.map((p) => (
                <a
                  key={p.id || p.url}
                  href={p.url || externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-3 border-b border-base-300 hover:bg-base-200 px-2 -mx-2 transition-colors"
                >
                  <ExternalLink size={12} className="text-base-content/40 shrink-0" />
                  <span className="font-ui text-sm text-base-content truncate flex-1">{p.title || p.name}</span>
                  <ChevronRight size={14} className="text-base-content/40 shrink-0" />
                </a>
              ))}
            </div>
          )
        )}

        {/* Discover — the remote server's own shelves over ITS blurred hero. */}
        {tab === 'discover' && (
          <div className="relative -mx-2 min-h-[520px] p-2" style={{ backgroundColor: KLEIN }}>
            {recBg && (
              <div
                className="absolute inset-0"
                style={{ backgroundImage: `url(${recBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                aria-hidden="true"
              />
            )}
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div className="relative z-10 py-3">
              {recLoading ? (
                <div className="py-16 flex justify-center"><span className="loading loading-spinner loading-lg text-white/70" /></div>
              ) : recError ? (
                <div className="bg-black/50 px-6 py-16 flex flex-col items-center gap-4">
                  <p className="font-ui text-sm text-white text-center">{recError}</p>
                  <button
                    onClick={loadDiscover}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 font-ui text-xs uppercase tracking-widest text-white transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : !recSections || recSections.length === 0 ? (
                <div className="bg-black/50 px-6 py-16">
                  <p className="font-ui text-base text-white/80 text-center">
                    This server hasn't featured anything to discover yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {recSections.map((s) => <DiscoveryShelf key={s.id} section={s} baseUrl={remoteBase} onDark />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {pickerOpen && authUser && (
        <AddServerToCircleModal
          domain={domain}
          authUser={authUser}
          client={client}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
