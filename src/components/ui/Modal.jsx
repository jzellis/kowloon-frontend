// Modal — accessible dialog wrapper using DaisyUI modal.
// Props: open (bool), onClose (fn), title (string), children

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 max-w-lg p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-base-300">
          {title && <h3 className="font-display text-2xl tracking-wide">{title}</h3>}
          <button onClick={onClose} className="font-ui text-xs uppercase tracking-widest text-base-content/60 hover:text-base-content">
            Close
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
