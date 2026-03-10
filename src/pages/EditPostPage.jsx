// Edit Post — edit an existing post. Owner only.
import { useParams } from 'react-router-dom'

export default function EditPostPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Edit Post</h2>
      <p className="text-base-content/60">Editing post {id} — coming soon.</p>
    </div>
  )
}
