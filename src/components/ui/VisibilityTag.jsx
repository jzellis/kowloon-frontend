// VisibilityTag — badge showing post/object audience visibility.
// Props: visibility (string) — e.g. "Public", "Server", or a circle name

export default function VisibilityTag({ visibility }) {
  return (
    <span className="font-ui text-xs uppercase tracking-widest px-2 py-0.5 bg-base-200 text-base-content/60 dark:text-base-content/85">
      {visibility ?? 'Public'}
    </span>
  )
}
