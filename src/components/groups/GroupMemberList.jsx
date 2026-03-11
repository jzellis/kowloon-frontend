// GroupMemberList — members of a group.
// Props: members (array), loading, error

import UserAvatar from '../ui/UserAvatar'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'

export default function GroupMemberList({ members = [], loading, error, onRetry }) {
  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!members.length) return <EmptyState message="No members yet." />

  return (
    <div className="flex flex-col gap-3">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-3 py-2 border-b border-base-300">
          <UserAvatar user={member} size="sm" />
          <div className="flex flex-col min-w-0">
            <span className="font-ui text-sm font-medium truncate">{member.displayName ?? member.username}</span>
            <span className="font-ui text-xs text-base-content/50 truncate">{member.id}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
