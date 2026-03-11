// PostMeta — author avatar, name, handle, timestamp, and visibility.
// Props: post object

import UserAvatar from '../ui/UserAvatar'
import Timestamp from '../ui/Timestamp'
import VisibilityTag from '../ui/VisibilityTag'

export default function PostMeta({ post }) {
  const author = post?.attributedTo

  return (
    <div className="flex items-center gap-3">
      <UserAvatar user={author} size="sm" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-ui text-sm font-medium text-base-content truncate">
          {author?.displayName ?? author?.username}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-ui text-xs text-base-content/50 truncate">
            {author?.id}
          </span>
          <Timestamp date={post?.published} />
          <VisibilityTag visibility={post?.visibility} />
        </div>
      </div>
    </div>
  )
}
