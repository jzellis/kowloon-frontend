// PostTypeIcon — post type icon rendered in its type color on a transparent background.
// Uses CSS filter to tint the black PNG icon to the type color.
// Props: type (string), size (sm | md | lg)

import { POST_TYPES } from '../../lib/postTypes'

const SIZES = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
}

export default function PostTypeIcon({ type, size = 'md' }) {
  const config = POST_TYPES[type]
  if (!config) return null

  return (
    <div
      className={`${SIZES[size]} shrink-0`}
      aria-label={config.label}
      title={config.label}
      style={{
        backgroundColor: config.color,
        WebkitMask: `url(${config.icon}) no-repeat center / contain`,
        mask: `url(${config.icon}) no-repeat center / contain`,
      }}
    />
  )
}
