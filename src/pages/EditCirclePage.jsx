// Edit Circle — edit circle settings and membership. Owner only.
import { useParams } from 'react-router-dom'

export default function EditCirclePage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Edit Circle</h2>
      <p className="text-base-content/60">Editing circle {id} — coming soon.</p>
    </div>
  )
}
