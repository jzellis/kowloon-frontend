// ErrorState — error display with optional retry action.
// Props: message (string), onRetry (optional fn)

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center border-l-4 border-error pl-6">
      <p className="font-ui text-sm uppercase tracking-widest text-error">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="font-ui text-xs uppercase tracking-widest text-base-content/60 hover:text-base-content underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}
