// PostTypeIcon — post type icon rendered in its type color.
// SVGs use currentColor, so setting `color` on the wrapper propagates the type color.
// Props: type (string), size (sm | md | lg)

import { POST_TYPES } from '../../lib/postTypes'

import NoteIcon    from '../../assets/icons/post-note.svg?react'
import ArticleIcon from '../../assets/icons/post-article.svg?react'
import MediaIcon   from '../../assets/icons/post-media.svg?react'
import LinkIcon    from '../../assets/icons/post-link.svg?react'
import EventIcon   from '../../assets/icons/post-event.svg?react'

const ICONS = {
  Note:    NoteIcon,
  Article: ArticleIcon,
  Media:   MediaIcon,
  Link:    LinkIcon,
  Event:   EventIcon,
}

const SIZES = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
}

export default function PostTypeIcon({ type, size = 'md' }) {
  const config = POST_TYPES[type]
  const Icon   = ICONS[type]
  if (!config || !Icon) return null

  return (
    <span
      className={`${SIZES[size]} shrink-0 flex items-center justify-center`}
      aria-label={config.label}
      title={config.label}
      style={{ color: `var(--post-color-${type.toLowerCase()})` }}
    >
      <Icon className={SIZES[size]} />
    </span>
  )
}
