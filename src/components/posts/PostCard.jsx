// PostCard — full post preview card.
// Composes PostMeta, PostTypeTag, PostBody, and PostToolbar.
// Left border color indicates post type — part of the type color language.
// Props: post object

import PostMeta from './PostMeta'
import PostBody from './PostBody'
import PostToolbar from './PostToolbar'
import PostTypeTag from '../ui/PostTypeTag'
import EventCard from './EventCard'
import { POST_TYPES } from '../../lib/postTypes'

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function PostCard({ post }) {
  if (post?.type === 'Event') return <EventCard post={post} />

  const typeColor = POST_TYPES[post?.type]?.color

  return (
    <article
      className={`post-type-${post?.type?.toLowerCase()} flex flex-col gap-3 py-5 border-b border-base-300 mb-12`}
    >
      <div
        className="border-l-4 pl-3"
        style={{ borderLeftColor: typeColor ? hexToRgba(typeColor, 0.4) : 'transparent' }}
      >
        <PostMeta post={post} />
      </div>
      <PostBody post={post} />
      <div className="flex items-center gap-3 pt-2 border-t border-base-300">
        <PostTypeTag type={post?.type} />
        <PostToolbar post={post} />
      </div>
    </article>
  )
}
