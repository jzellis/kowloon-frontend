// Pagination — prev/next and page number controls.
// Props: page (number), totalPages (number), onChange (fn)

export default function Pagination({ page = 1, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-1 font-ui text-xs uppercase tracking-widest">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 bg-base-200 hover:bg-base-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>

      <span className="px-3 py-2 text-base-content/60">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 bg-base-200 hover:bg-base-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  )
}
