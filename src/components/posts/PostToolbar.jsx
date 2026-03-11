// PostToolbar — react, reply, bookmark, and share actions for a post.
// Auth-aware: shows actions only when appropriate.
// Props: post object

import { useSelector } from 'react-redux'

export default function PostToolbar({ post }) {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="flex items-center gap-4 flex-1">
      {/* Reply */}
      <button className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors">
        Reply
      </button>

      {/* React */}
      {user && (
        <button className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors">
          React
        </button>
      )}

      {/* Bookmark */}
      {user && (
        <button className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors">
          Bookmark
        </button>
      )}

      {/* Share */}
      <button className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors ml-auto">
        Share
      </button>
    </div>
  )
}
