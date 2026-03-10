// User Posts — all posts by a specific user visible to the current viewer.
import { useParams } from 'react-router-dom'

export default function UserPostsPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Posts by {id}</h2>
      <p className="text-base-content/60">Coming soon.</p>
    </div>
  )
}
