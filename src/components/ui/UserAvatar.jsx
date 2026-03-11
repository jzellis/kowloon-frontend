// UserAvatar — user icon with initial fallback.
// Square, no rounding, consistent sizing. Enforces design system geometry.
// Props: user object, size (sm | md | lg)

export default function UserAvatar({ user, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }
  const initial = user?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <div className={`${sizes[size]} bg-primary flex items-center justify-center shrink-0`}>
      {user?.icon
        ? <img src={user.icon} alt={user.username} className="w-full h-full object-cover" />
        : <span className="font-display text-primary-content">{initial}</span>
      }
    </div>
  )
}
