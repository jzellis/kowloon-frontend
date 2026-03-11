// PostCard — full post preview card.
// Composes PostMeta, PostTypeTag, PostBody, and PostToolbar.
// Left border color indicates post type — part of the type color language.
// Props: post object

import PostMeta from './PostMeta'
import PostBody from './PostBody'
import PostToolbar from './PostToolbar'
import PostTypeTag from '../ui/PostTypeTag'
import { POST_TYPES } from '../../lib/postTypes'

export default function PostCard({ post }) {
  const typeColor = POST_TYPES[post?.type]?.color

  return (
    <article
      className="flex flex-col gap-3 py-5 pl-4 border-b border-base-300 border-l-4"
      style={{ borderLeftColor: typeColor ?? 'transparent' }}
    >
      <PostMeta post={post} />
      <PostBody post={post} />
      <div className="flex items-center gap-3 pt-2 border-t border-base-300">
        <PostTypeTag type={post?.type} />
        <PostToolbar post={post} />
      </div>
    </article>
  )
}
