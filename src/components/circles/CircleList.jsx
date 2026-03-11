// CircleList — renders a list of CircleCards.
// Props: circles (array), loading, error

import CircleCard from './CircleCard'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'

export default function CircleList({ circles = [], loading, error, onRetry }) {
  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!circles.length) return <EmptyState message="No circles found." />

  return (
    <div className="flex flex-col">
      {circles.map((circle) => (
        <CircleCard key={circle.id} circle={circle} />
      ))}
    </div>
  )
}
