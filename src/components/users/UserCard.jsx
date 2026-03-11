// UserCard — avatar, display name, handle, bio snippet, and follow button.
// Props: user object, isFollowing (bool), onFollow (fn), onUnfollow (fn)

import { Link } from 'react-router-dom'
import UserAvatar from '../ui/UserAvatar'
import FollowButton from './FollowButton'

export default function UserCard({ user, isFollowing, onFollow, onUnfollow }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-base-300">
      <Link to={`/users/${encodeURIComponent(user?.id)}`}>
        <UserAvatar user={user} size="md" />
      </Link>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/users/${encodeURIComponent(user?.id)}`}
            className="font-display text-xl tracking-wide hover:text-primary transition-colors"
          >
            {user?.displayName ?? user?.username}
          </Link>
          <FollowButton userId={user?.id} isFollowing={isFollowing} onFollow={onFollow} onUnfollow={onUnfollow} />
        </div>
        <span className="font-ui text-xs text-base-content/50 truncate">{user?.id}</span>
        {user?.summary && (
          <p className="font-ui text-sm text-base-content/70 line-clamp-2">{user.summary}</p>
        )}
      </div>
    </div>
  )
}
