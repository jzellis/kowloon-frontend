// ReplyList — threaded replies on a single post view.
// Props: postId (string), replies (array), loading, error

import PostCard from './PostCard'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'

export default function ReplyList({ replies = [], loading, error, onRetry }) {
  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!replies.length) return <EmptyState message="No replies yet." />

  return (
    <div className="flex flex-col border-t-2 border-base-300 mt-4">
      <h3 className="font-display text-xl tracking-wide py-4">Replies</h3>
      {replies.map((reply) => (
        <PostCard key={reply.id} post={reply} />
      ))}
    </div>
  )
}
