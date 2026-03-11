// GroupCard — group name, description, member count, and visibility.
// Props: group object

import { Link } from 'react-router-dom'
import VisibilityTag from '../ui/VisibilityTag'

export default function GroupCard({ group }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-base-300">
      <div className="flex items-center gap-2">
        <Link
          to={`/groups/${encodeURIComponent(group?.id)}`}
          className="font-display text-2xl tracking-wide hover:text-primary transition-colors"
        >
          {group?.name}
        </Link>
        <VisibilityTag visibility={group?.visibility} />
      </div>
      {group?.summary && (
        <p className="font-ui text-sm text-base-content/70">{group.summary}</p>
      )}
      {group?.memberCount != null && (
        <span className="font-ui text-xs uppercase tracking-widest text-base-content/50">
          {group.memberCount} members
        </span>
      )}
    </div>
  )
}
