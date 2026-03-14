// PostList — renders a paginated list of PostCards, or a media grid when only Media is filtered.
// Props: posts (array), page, totalPages, onPageChange, loading, error

import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import PostCard from './PostCard'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'
import Pagination from '../ui/Pagination'
import { POST_TYPES } from '../../lib/postTypes'

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
    thumb = (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300 px-3">
        <span className="font-display text-4xl" style={{ color: POST_TYPES.Media.color }}>&#9834;</span>
        <p className="font-ui text-xs uppercase tracking-widest text-base-content/60 text-center mt-2 line-clamp-2">{post.name}</p>
      </div>
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
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100">
        {post.name && (
          <p className="font-display text-white text-lg leading-tight tracking-wide line-clamp-2">{post.name}</p>
        )}
        {post.attributedTo && (
          <p className="font-ui text-xs uppercase tracking-widest text-white/70 mt-1">
            {post.attributedTo.displayName ?? post.attributedTo.username}
          </p>
        )}
      </div>
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

export default function PostList({ posts = [], page, totalPages, onPageChange, loading, error }) {
  const { activeTypes } = useSelector((state) => state.feed)

  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={() => onPageChange(page)} />
  if (!posts.length) return <EmptyState message="No posts yet." />

  const visible = activeTypes.length > 0
    ? posts.filter((p) => activeTypes.includes(p.type))
    : posts

  if (!visible.length) return <EmptyState message="No posts of the selected types." />

  const isMediaGrid = activeTypes.length === 1 && activeTypes[0] === 'Media'

  if (isMediaGrid) {
    return <MediaGrid posts={visible} page={page} totalPages={totalPages} onPageChange={onPageChange} />
  }

  return (
    <div className="flex flex-col">
      {visible.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div className="pt-6">
        <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
      </div>
    </div>
  )
}
