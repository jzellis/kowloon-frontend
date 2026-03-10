// User — profile page showing a user's info, public posts, and circles.
import { useParams } from 'react-router-dom'

export default function UserPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">User</h2>
      <p className="text-base-content/60">Profile for {id} — coming soon.</p>
    </div>
  )
}
