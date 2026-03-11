// UserList — renders a list of UserCards.
// Props: users (array), loading, error

import UserCard from './UserCard'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'

export default function UserList({ users = [], loading, error, onRetry }) {
  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!users.length) return <EmptyState message="No users found." />

  return (
    <div className="flex flex-col">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
