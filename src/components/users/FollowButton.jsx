// FollowButton — follow/unfollow toggle for a user.
// Auth-aware: renders nothing if not logged in.
// Props: userId (string), isFollowing (bool), onFollow (fn), onUnfollow (fn)

import { useSelector } from 'react-redux'

export default function FollowButton({ userId, isFollowing, onFollow, onUnfollow }) {
  const { user } = useSelector((state) => state.auth)

  if (!user || user.id === userId) return null

  return (
    <button
      onClick={isFollowing ? onUnfollow : onFollow}
      className={`px-4 py-1.5 font-ui text-xs uppercase tracking-widest transition-colors ${
        isFollowing
          ? 'bg-base-200 text-base-content/70 hover:bg-error hover:text-error-content'
          : 'bg-primary text-primary-content hover:opacity-90'
      }`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  )
}
