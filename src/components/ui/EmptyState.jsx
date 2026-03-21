// EmptyState — consistent zero-state placeholder.
// Props: message (string), action (optional ReactNode)

export default function EmptyState({ message = 'Nothing here yet.', action }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="font-ui text-sm uppercase tracking-widest text-base-content/65">{message}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
