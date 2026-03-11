// PostTypeTag — label badge for post type with type color language.
// Shows a colored left border + icon + label.
// Props: type (string)

import { POST_TYPES } from '../../lib/postTypes'
import PostTypeIcon from './PostTypeIcon'

export default function PostTypeTag({ type }) {
  const config = POST_TYPES[type]
  if (!config) return null

  return (
    <div
      className="flex items-center gap-1.5 pl-1 pr-3 py-1 group"
    >
      <PostTypeIcon type={type} size="sm" />
      <span className="font-ui text-xs uppercase tracking-widest text-base-content/30 group-hover:text-base-content/70 transition-colors">
        {config.label}
      </span>
    </div>
  )
}
