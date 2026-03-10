// Post — single post view with replies and reacts.
import { useParams } from 'react-router-dom'

export default function PostPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Post</h2>
      <p className="text-base-content/60">Post {id} coming soon.</p>
    </div>
  )
}
