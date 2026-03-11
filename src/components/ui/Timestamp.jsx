// Timestamp — relative or absolute date with full datetime tooltip.
// Props: date (ISO string or Date), absolute (bool — force full date display)

function formatRelative(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days < 30)  return `${days}d`
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Timestamp({ date, absolute = false }) {
  if (!date) return null
  const full = new Date(date).toLocaleString()
  const display = absolute ? full : formatRelative(date)

  return (
    <time
      dateTime={new Date(date).toISOString()}
      title={full}
      className="font-ui text-xs text-base-content/50 uppercase tracking-widest cursor-default"
    >
      {display}
    </time>
  )
}
