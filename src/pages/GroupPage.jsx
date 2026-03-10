// Group — group info and recent posts, if visible to current viewer.
import { useParams } from 'react-router-dom'

export default function GroupPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Group</h2>
      <p className="text-base-content/60">Group {id} — coming soon.</p>
    </div>
  )
}
