// Page Detail — single page view.
import { useParams } from 'react-router-dom'

export default function PageDetailPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Page</h2>
      <p className="text-base-content/60">Page {id} — coming soon.</p>
    </div>
  )
}
