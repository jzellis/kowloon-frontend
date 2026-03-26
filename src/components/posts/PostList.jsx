// PostList — renders a paginated list of PostCards, or a media grid when only Media is filtered.
// Props: posts (array), page, totalPages, onPageChange, loading, error

import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PostCard from './PostCard'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'
import Pagination from '../ui/Pagination'
import { POST_TYPES } from '../../lib/postTypes'
import { Play } from 'lucide-react'

// ── Media grid ────────────────────────────────────────────────────────────────

function MediaThumb({ post }) {
  const att = post.attachments?.[0]
  const mt  = att?.mediaType ?? ''

  let thumb = null

  if (mt.startsWith('image/')) {
    thumb = <img src={att.url} alt={post.name ?? ''} className="absolute inset-0 w-full h-full object-cover" />
  } else if (mt.startsWith('video/')) {
    thumb = (
      <>
        <video src={att.url} className="absolute inset-0 w-full h-full object-cover" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xl leading-none ml-0.5">&#9654;</span>
          </div>
        </div>
      </>
    )
  } else if (mt.startsWith('audio/')) {
    const bg = post.featuredImage ?? post.image ?? null
    thumb = (
      <>
        {bg
          ? <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="absolute inset-0 bg-base-300" />
        }
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Play className="w-8 h-8 text-white translate-x-0.5" />
        </div>
      </>
    )
  } else {
    // No attachment — solid color placeholder
    thumb = (
      <div className="absolute inset-0 flex items-center justify-center bg-base-200">
        <p className="font-display text-lg tracking-wide text-base-content/40 px-3 text-center line-clamp-3">{post.name}</p>
      </div>
    )
  }

  return (
    <Link
      to={`/posts/${encodeURIComponent(post.id)}`}
      className="relative block aspect-square overflow-hidden bg-base-300 group"
    >
      {thumb}
      {/* Always-visible title/author bar */}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 pt-6 pb-2 bg-gradient-to-t from-black/75 to-transparent">
        {post.name && (
          <p className="font-display text-white text-base leading-tight tracking-wide line-clamp-2">{post.name}</p>
        )}
        {post.attributedTo && (
          <p className="font-ui text-xs uppercase tracking-widest text-white/70 mt-0.5 truncate">
            {post.attributedTo.displayName ?? post.attributedTo.username}
          </p>
        )}
      </div>
      {/* Hover brighten */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
    </Link>
  )
}

function MediaGrid({ posts, page, totalPages, onPageChange }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
        {posts.map((post) => (
          <MediaThumb key={post.id} post={post} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PostList({ posts = [], page, totalPages, onPageChange, loading, error, ignoreTypeFilter = false }) {
  const { activeTypes } = useSelector((state) => state.feed)
  const { t } = useTranslation()

  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={() => onPageChange(page)} />
  if (!posts.length) return <EmptyState message={t('post.empty')} />

  const visible = (!ignoreTypeFilter && activeTypes.length > 0)
    ? posts.filter((p) => activeTypes.includes(p.type))
    : posts

  if (!visible.length) return <EmptyState message={t('post.emptyFiltered')} />

  const isMediaGrid = !ignoreTypeFilter && activeTypes.length === 1 && activeTypes[0] === 'Media'

  if (isMediaGrid) {
    return <MediaGrid posts={visible} page={page} totalPages={totalPages} onPageChange={onPageChange} />
  }

  return (
    <div role="feed" aria-busy={loading} className="flex flex-col">
      {visible.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div className="pt-6">
        <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
      </div>
    </div>
  )
}
