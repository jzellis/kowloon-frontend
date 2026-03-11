// ReactList — reactions on a single post view.
// Props: reacts (array), loading, error

import Spinner from '../ui/Spinner'

export default function ReactList({ reacts = [], loading, error }) {
  if (loading) return <Spinner />
  if (!reacts.length) return null

  // Group reacts by type/emoji
  const grouped = reacts.reduce((acc, react) => {
    const key = react.content ?? react.type
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {Object.entries(grouped).map(([type, count]) => (
        <span
          key={type}
          className="flex items-center gap-1 px-2 py-1 bg-base-200 font-ui text-xs uppercase tracking-widest"
        >
          {type} <span className="text-base-content/50">{count}</span>
        </span>
      ))}
    </div>
  )
}
