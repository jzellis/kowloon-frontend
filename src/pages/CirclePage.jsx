// Circle — circle info, if visible to current viewer.
import { useParams } from 'react-router-dom'

export default function CirclePage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Circle</h2>
      <p className="text-base-content/60">Circle {id} — coming soon.</p>
    </div>
  )
}
