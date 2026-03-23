// PostMeta — author avatar, name, handle, timestamp, and visibility.
// Props: post object

import { Link } from 'react-router-dom'
import UserAvatar from '../ui/UserAvatar'
import Timestamp from '../ui/Timestamp'
import VisibilityTag from '../ui/VisibilityTag'

const TIMESTAMP_LINK_TYPES = ['Note', 'Link']

export default function PostMeta({ post }) {
  const author = post?.attributedTo
  const userUrl = author?.id ? `/users/${encodeURIComponent(author.id)}` : null
  const postUrl = post?.id ? `/posts/${encodeURIComponent(post.id)}` : null
  const timestampTo = TIMESTAMP_LINK_TYPES.includes(post?.type) ? postUrl : null

  return (
    <div className="flex items-center gap-3">
      {userUrl
        ? <Link to={userUrl}><UserAvatar user={author} size="sm" /></Link>
        : <UserAvatar user={author} size="sm" />
      }
      <div className="flex flex-col gap-0.5 min-w-0">
        {userUrl
          ? <Link to={userUrl} className="font-ui text-sm font-medium text-base-content truncate hover:text-primary transition-colors">
              {author?.displayName ?? author?.username}
            </Link>
          : <span className="font-ui text-sm font-medium text-base-content truncate">
              {author?.displayName ?? author?.username}
            </span>
        }
        <div className="flex items-center gap-2">
          <span className="font-ui text-sm text-base-content/65 dark:text-base-content/80 truncate">
            {author?.id}
          </span>
          <Timestamp date={post?.published} to={timestampTo} />
          <VisibilityTag visibility={post?.visibility} />
        </div>
      </div>
    </div>
  )
}
