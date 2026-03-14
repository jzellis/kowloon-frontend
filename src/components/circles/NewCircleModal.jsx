// NewCircleModal — dialog for creating a new Circle.
// Fields: name (required), description, members (comma-separated IDs).
// Props: onClose fn(), onCreated fn(circle)

import { useState, useEffect, useRef } from 'react'
import { X, Camera } from 'lucide-react'

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

export default function NewCircleModal({ onClose, onCreated }) {
  const [name, setName]           = useState('')
  const [summary, setSummary]     = useState('')
  const [members, setMembers]     = useState('')
  const [iconFile, setIconFile]   = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)

  const nameRef    = useRef(null)
  const iconInputRef = useRef(null)

  useEffect(() => {
    return () => { if (iconPreview) URL.revokeObjectURL(iconPreview) }
  }, [iconPreview])

  const handleIconChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (iconPreview) URL.revokeObjectURL(iconPreview)
    setIconFile(file)
    setIconPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  // Focus name input on open; close on Escape
  useEffect(() => {
    nameRef.current?.focus()
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required.'); return }
    setSubmitting(true)
    setError(null)
    try {
      // TODO: replace with client.activities.createCircle(...)
      const circle = {
        id: `circle:${name.toLowerCase().replace(/\s+/g, '-')}@local`,
        name: name.trim(),
        summary: summary.trim() || undefined,
        icon: iconPreview ?? undefined,
        iconFile: iconFile ?? undefined,
        members: members
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
      }
      onCreated?.(circle)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create circle.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onMouseDown={onClose}
      />

      {/* Panel */}
      <div
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-base-100 border-2 border-base-300 border-t-4 border-t-primary shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-base-300 bg-base-200">
          <h2 className="font-display text-2xl tracking-wide">New Circle</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-base-content/40 hover:text-base-content transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-0">

          {/* Icon + Name row */}
          <div className="flex items-center gap-4 px-6 py-4 border-b-2 border-base-300">
            {/* Hex icon picker */}
            <button
              type="button"
              onClick={() => iconInputRef.current?.click()}
              className="relative shrink-0 group"
              title="Set circle icon"
            >
              <div className="w-14 h-14 bg-secondary flex items-center justify-center" style={hexMask}>
                {iconPreview
                  ? <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                  : <span className="font-display text-2xl text-secondary-content">
                      {name?.[0]?.toUpperCase() || '?'}
                    </span>
                }
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" style={hexMask}>
                <Camera className="w-4 h-4 text-white" />
              </div>
            </button>
            <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />

            {/* Name */}
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">
                Name <span className="text-error">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Music Friends"
                className="bg-transparent font-display text-2xl tracking-wide text-base-content placeholder:text-base-content/20 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 px-6 py-4 border-b-2 border-base-300">
            <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">
              Description
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What's this circle for?"
              className="bg-transparent font-reading text-base-content placeholder:text-base-content/30 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 px-6 py-4 border-b-2 border-base-300">
            <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">
              Members
            </label>
            <textarea
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="@user@server.org, @friend@kwln.org, …"
              rows={3}
              className="bg-transparent font-reading text-sm text-base-content placeholder:text-base-content/30 outline-none resize-none"
            />
            <p className="font-ui text-xs text-base-content/30 uppercase tracking-widest">
              Comma-separated user, group, or server IDs
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 bg-base-200">
            {error
              ? <span className="font-ui text-xs uppercase tracking-widest text-error">{error}</span>
              : <span />
            }
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="px-4 py-1.5 font-ui text-xs uppercase tracking-widest bg-primary text-primary-content hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {submitting ? 'Creating…' : 'Create Circle'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </>
  )
}
