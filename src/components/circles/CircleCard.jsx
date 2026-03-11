// CircleCard — circle name, description, member count, and visibility.
// Props: circle object

import { Link } from 'react-router-dom'
import VisibilityTag from '../ui/VisibilityTag'

export default function CircleCard({ circle }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-base-300">
      <div className="flex items-center gap-2">
        <Link
          to={`/circles/${encodeURIComponent(circle?.id)}`}
          className="font-display text-2xl tracking-wide hover:text-primary transition-colors"
        >
          {circle?.name}
        </Link>
        <VisibilityTag visibility={circle?.visibility} />
      </div>
      {circle?.summary && (
        <p className="font-ui text-sm text-base-content/70">{circle.summary}</p>
      )}
      {circle?.memberCount != null && (
        <span className="font-ui text-xs uppercase tracking-widest text-base-content/50">
          {circle.memberCount} members
        </span>
      )}
    </div>
  )
}
