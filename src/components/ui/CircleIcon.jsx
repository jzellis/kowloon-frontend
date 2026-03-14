// CircleIcon / GroupIcon — type icons for circles and groups.
// Uses currentColor so callers can tint with a CSS color prop.
// Props: type ('circle' | 'group'), size ('sm' | 'md' | 'lg'), color (CSS string)

import CircleSvg from '../../assets/icons/circle.svg?react'
import GroupSvg  from '../../assets/icons/group.svg?react'

const ICONS = { circle: CircleSvg, group: GroupSvg }
const SIZES = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-9 h-9' }

export default function CircleIcon({ type = 'circle', size = 'md', color, className = '' }) {
  const Icon = ICONS[type] ?? CircleSvg
  return (
    <span
      className={`${SIZES[size]} shrink-0 flex items-center justify-center ${className}`}
      style={color ? { color } : undefined}
    >
      <Icon className="w-full h-full" />
    </span>
  )
}
