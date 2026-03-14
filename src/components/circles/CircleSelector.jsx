// CircleSelector — reusable dropdown for selecting a circle or post audience.
//
// Props:
//   circles       — array of { id, name, summary }
//   value         — 'public' | 'server' | circleId
//   onChange      — fn(value)
//   showAudience  — include Public / Server options at top (for post addressing)
//   allowCreate   — show "New circle…" option at bottom
//   onCreateCircle — fn() called when "New circle…" is clicked
//   direction     — 'down' (default) | 'up' — which way the panel opens
//   className     — extra classes on the trigger button

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import NewCircleModal from './NewCircleModal'
import CircleIcon from '../ui/CircleIcon'

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

const AUDIENCE_OPTIONS = [
  { id: 'public', label: 'Public', summary: 'Anyone' },
  { id: 'server', label: 'Server', summary: 'This server only' },
]

export default function CircleSelector({
  circles = [],
  value = 'public',
  onChange,
  showAudience = false,
  allowCreate = false,
  onCreateCircle,
  direction = 'down',
  variant = 'default', // 'default' | 'title'
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filter circles — only apply filter at 2+ chars (so short names like "QA" still work)
  const filtered = query.length >= 2
    ? circles.filter((c) =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.summary?.toLowerCase().includes(query.toLowerCase())
      )
    : circles

  // Resolve label for the trigger button
  const audience = AUDIENCE_OPTIONS.find((a) => a.id === value)
  const circle   = circles.find((c) => c.id === value)
  const label    = audience?.label ?? circle?.name ?? 'Select…'

  const handleSelect = (id) => {
    onChange?.(id)
    setOpen(false)
    setQuery('')
  }

  const panelPos = direction === 'up'
    ? 'bottom-full mb-0 border-b-4 border-b-primary border-t-2'
    : 'top-full mt-0 border-t-4 border-t-primary border-b-2'

  const isTitle = variant === 'title'

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 transition-colors ${
          isTitle
            ? `font-display tracking-wide hover:text-primary ${open ? 'text-primary' : 'text-base-content'}`
            : `px-3 py-1.5 font-ui text-xs uppercase tracking-widest ${
                open ? 'bg-base-300 text-base-content' : 'bg-base-100 text-base-content/70 hover:bg-base-200'
              }`
        } ${className}`}
      >
        <span className={isTitle ? 'text-3xl leading-none' : ''}>{label}</span>
        <ChevronDown className={`transition-transform ${isTitle ? 'w-5 h-5 mt-0.5' : 'w-3 h-3'} ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Panel */}
      {open && (
        <div className={`absolute left-0 z-30 w-64 bg-base-100 border-x-2 border-base-300 shadow-lg ${panelPos}`}>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-base-300">
            <Search className="w-3 h-3 text-base-content/40 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search circles…"
              className="flex-1 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none"
            />
          </div>

          <ul className="max-h-72 overflow-y-auto">
            {/* Audience options */}
            {showAudience && AUDIENCE_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex flex-col px-4 py-2.5 text-left transition-colors ${
                    value === opt.id
                      ? 'bg-secondary text-secondary-content'
                      : 'hover:bg-base-200 text-base-content'
                  }`}
                >
                  <span className="font-ui text-xs uppercase tracking-widest">{opt.label}</span>
                  <span className={`font-reading text-xs mt-0.5 ${value === opt.id ? 'text-secondary-content/70' : 'text-base-content/40'}`}>
                    {opt.summary}
                  </span>
                </button>
              </li>
            ))}

            {/* Divider */}
            {showAudience && circles.length > 0 && (
              <li className="border-t-2 border-base-300" aria-hidden />
            )}

            {/* Circles */}
            {filtered.length === 0 && (
              <li className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-content/40">
                No circles found
              </li>
            )}
            {filtered.map((circle) => (
              <li key={circle.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(circle.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                    value === circle.id
                      ? 'bg-secondary text-secondary-content'
                      : 'hover:bg-base-200 text-base-content'
                  }`}
                >
                  {circle.icon
                    ? <img src={circle.icon} alt="" className="w-5 h-5 object-cover shrink-0" style={hexMask} />
                    : <CircleIcon type="circle" size="sm" className="shrink-0 opacity-50" />
                  }
                  <span className="flex flex-col min-w-0">
                    <span className="font-ui text-xs uppercase tracking-widest truncate">{circle.name}</span>
                    {circle.summary && (
                      <span className={`font-reading text-xs truncate ${value === circle.id ? 'text-secondary-content/70' : 'text-base-content/40'}`}>
                        {circle.summary}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}

            {/* Create new circle */}
            {allowCreate && (
              <li className="border-t-2 border-base-300">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setCreating(true) }}
                  className="w-full px-4 py-2.5 text-left font-ui text-xs uppercase tracking-widest text-primary hover:bg-base-200 transition-colors"
                >
                  + New circle…
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {creating && (
        <NewCircleModal
          onClose={() => setCreating(false)}
          onCreated={(circle) => { onCreateCircle?.(circle); setCreating(false) }}
        />
      )}
    </div>
  )
}
