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

import { useState, useRef, useEffect, useId } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const id = useId()
  const listboxId = `${id}-listbox`

  const [open, setOpen]         = useState(false)
  const [query, setQuery]       = useState('')
  const [creating, setCreating] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const containerRef = useRef(null)
  const searchRef    = useRef(null)
  const optionRefs   = useRef([])

  const AUDIENCE_OPTIONS = [
    { id: 'public', label: t('circle.public'), summary: t('circle.publicSummary') },
    { id: 'server', label: t('circle.server'), summary: t('circle.serverSummary') },
  ]

  // Filter circles — only apply filter at 2+ chars
  const filtered = query.length >= 2
    ? circles.filter((c) =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.summary?.toLowerCase().includes(query.toLowerCase())
      )
    : circles

  // Flat list of all selectable options for keyboard nav
  const allOptions = [
    ...(showAudience ? AUDIENCE_OPTIONS : []),
    ...filtered,
    ...(allowCreate ? [{ id: '__create__', label: t('circle.new') }] : []),
  ]

  // Resolve trigger label
  const audience = AUDIENCE_OPTIONS.find((a) => a.id === value)
  const circle   = circles.find((c) => c.id === value)
  const label    = audience?.label ?? circle?.name ?? 'Select…'

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus the right element when focusedIndex changes
  useEffect(() => {
    if (!open) return
    if (focusedIndex === -1) {
      searchRef.current?.focus()
    } else {
      optionRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex, open])

  const handleOpen = () => {
    setOpen((o) => !o)
    setFocusedIndex(-1)
  }

  const handleSelect = (id) => {
    onChange?.(id)
    setOpen(false)
    setQuery('')
    setFocusedIndex(-1)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (allOptions.length > 0) setFocusedIndex(0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (allOptions.length > 0) setFocusedIndex(allOptions.length - 1)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      setFocusedIndex(-1)
    }
  }

  const handleOptionKeyDown = (e, index) => {
    const opt = allOptions[index]
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(index < allOptions.length - 1 ? index + 1 : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (index === 0) setFocusedIndex(-1)
      else setFocusedIndex(index - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (opt.id === '__create__') { setOpen(false); setCreating(true) }
      else handleSelect(opt.id)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      setFocusedIndex(-1)
    } else if (e.key === 'Tab') {
      setOpen(false)
      setQuery('')
      setFocusedIndex(-1)
    }
  }

  const panelPos = direction === 'up'
    ? 'bottom-full mb-0 border-b-4 border-b-primary border-t-2'
    : 'top-full mt-0 border-t-4 border-t-primary border-b-2'

  const isTitle = variant === 'title'

  // Map all options to flat index for refs (audience + circles + create)
  let optionIndex = -1

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={label}
        className={`flex items-center gap-2 transition-colors ${
          isTitle
            ? `font-display tracking-wide hover:text-primary ${open ? 'text-primary' : 'text-base-content'}`
            : `px-3 py-1.5 font-ui text-xs uppercase tracking-widest ${
                open ? 'bg-base-300 text-base-content' : 'bg-base-100 text-base-content/70 hover:bg-base-200'
              }`
        } ${className}`}
      >
        {isTitle && circle && (
          circle.icon
            ? <img src={circle.icon} alt="" className="w-9 h-9 object-cover shrink-0" style={hexMask} />
            : <CircleIcon type="circle" size="lg" className="shrink-0 opacity-60" />
        )}
        <span className={isTitle ? 'text-3xl leading-none' : ''} aria-hidden="true">{label}</span>
        <ChevronDown className={`transition-transform ${isTitle ? 'w-5 h-5 mt-0.5' : 'w-3 h-3'} ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {/* Panel */}
      {open && (
        <div className={`absolute left-0 z-30 w-64 bg-base-100 border-x-2 border-base-300 shadow-lg ${panelPos}`}>

          {/* Search — combobox input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-base-300">
            <Search className="w-3 h-3 text-base-content/40 shrink-0" aria-hidden="true" />
            <input
              ref={searchRef}
              autoFocus
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={focusedIndex >= 0 ? `${id}-opt-${focusedIndex}` : undefined}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setFocusedIndex(-1) }}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('circle.searchPlaceholder')}
              className="flex-1 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none"
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label={t('circle.searchPlaceholder')}
            className="max-h-72 overflow-y-auto"
          >
            {/* Audience options */}
            {showAudience && AUDIENCE_OPTIONS.map((opt) => {
              optionIndex++
              const i = optionIndex
              return (
                <li key={opt.id} role="option" aria-selected={value === opt.id} id={`${id}-opt-${i}`}>
                  <button
                    ref={(el) => { optionRefs.current[i] = el }}
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleSelect(opt.id)}
                    onKeyDown={(e) => handleOptionKeyDown(e, i)}
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
              )
            })}

            {/* Divider */}
            {showAudience && circles.length > 0 && (
              <li className="border-t-2 border-base-300" role="separator" />
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <li className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-content/40" role="status">
                {t('circle.noResults')}
              </li>
            )}

            {/* Circles */}
            {filtered.map((circle) => {
              optionIndex++
              const i = optionIndex
              return (
                <li key={circle.id} role="option" aria-selected={value === circle.id} id={`${id}-opt-${i}`}>
                  <button
                    ref={(el) => { optionRefs.current[i] = el }}
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleSelect(circle.id)}
                    onKeyDown={(e) => handleOptionKeyDown(e, i)}
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
              )
            })}

            {/* Create new circle */}
            {allowCreate && (() => {
              optionIndex++
              const i = optionIndex
              return (
                <li key="__create__" className="border-t-2 border-base-300" role="option" aria-selected={false} id={`${id}-opt-${i}`}>
                  <button
                    ref={(el) => { optionRefs.current[i] = el }}
                    type="button"
                    tabIndex={-1}
                    onClick={() => { setOpen(false); setCreating(true) }}
                    onKeyDown={(e) => handleOptionKeyDown(e, i)}
                    className="w-full px-4 py-2.5 text-left font-ui text-xs uppercase tracking-widest text-primary hover:bg-base-200 transition-colors"
                  >
                    {t('circle.new')}
                  </button>
                </li>
              )
            })()}
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
