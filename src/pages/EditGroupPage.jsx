// Edit Group — edit group settings and membership. Owner/admins only.
import { useParams } from 'react-router-dom'

export default function EditGroupPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Edit Group</h2>
      <p className="text-base-content/60">Editing group {id} — coming soon.</p>
    </div>
  )
}
