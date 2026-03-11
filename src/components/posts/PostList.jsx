// PostList — renders a paginated list of PostCards.
// Props: posts (array), page, totalPages, onPageChange, loading, error

import PostCard from './PostCard'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'
import Pagination from '../ui/Pagination'

export default function PostList({ posts = [], page, totalPages, onPageChange, loading, error }) {
  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={() => onPageChange(page)} />
  if (!posts.length) return <EmptyState message="No posts yet." />

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div className="pt-6">
        <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
      </div>
    </div>
  )
}
