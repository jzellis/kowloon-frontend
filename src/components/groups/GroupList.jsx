// GroupList — renders a list of GroupCards.
// Props: groups (array), loading, error

import GroupCard from './GroupCard'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'

export default function GroupList({ groups = [], loading, error, onRetry }) {
  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!groups.length) return <EmptyState message="No groups found." />

  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  )
}
