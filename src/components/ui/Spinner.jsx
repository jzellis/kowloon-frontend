// Spinner — loading state indicator.
// Props: size (sm | md | lg), centered (bool)

export default function Spinner({ size = 'md', centered = false }) {
  const sizes = { sm: 'loading-sm', md: 'loading-md', lg: 'loading-lg' }

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <span className={`loading loading-spinner ${sizes[size]} text-primary`} />
      </div>
    )
  }

  return <span className={`loading loading-spinner ${sizes[size]} text-primary`} />
}
