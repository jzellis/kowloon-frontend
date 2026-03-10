// Circle Posts — primary timeline view. Posts by circle members visible to current viewer.
// Supports ?type= filter (Note, Article, Media, etc.).
import { useParams } from 'react-router-dom'

export default function CirclePostsPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Circle Feed</h2>
      <p className="text-base-content/60">Posts for circle {id} — coming soon.</p>
    </div>
  )
}
