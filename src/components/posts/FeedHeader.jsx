// FeedHeader — circle switcher and post type filter for timeline views.
//
// Circle switcher: shows pinned circles + a "More" dropdown with live search.
// Type filter: multi-select icon+label buttons per post type. None selected = show all.
//
// Props:
//   circles        — full list of user's circles (array)
//   currentCircle  — currently selected circle object
//   onCircleChange — fn(circleId)
//   onPinCircle    — fn(circleId)
//   onUnpinCircle  — fn(circleId)

import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Pin, PinOff } from 'lucide-react'
import {
  setCircle, toggleType, clearTypes, resetToDefaults,
  pinCircle, unpinCircle,
  saveDefaultTypesAsync, savePinnedCirclesAsync,
} from '../../app/feedSlice'
import PostTypeIcon from '../ui/PostTypeIcon'

const POST_TYPES = ['Note', 'Article', 'Media', 'Event', 'Link']

// ── Circle Switcher ────────────────────────────────────────────────────────

function CircleSwitcher({ circles = [], currentCircle, pinnedCircleIds }) {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const dropdownRef = useRef(null)

  const pinned = circles.filter((c) => pinnedCircleIds.includes(c.id))
  const filtered = circles.filter((c) =>
    c.name?.toLowerCase().includes(query.toLowerCase())
  )

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (circleId) => {
    dispatch(setCircle(circleId))
    setOpen(false)
    setQuery('')
  }

  const handlePin = (e, circleId) => {
    e.stopPropagation()
    const next = pinnedCircleIds.includes(circleId)
      ? pinnedCircleIds.filter((id) => id !== circleId)
      : [...pinnedCircleIds, circleId]
    if (pinnedCircleIds.includes(circleId)) {
      dispatch(unpinCircle(circleId))
    } else {
      dispatch(pinCircle(circleId))
    }
    dispatch(savePinnedCirclesAsync(next))
  }

  return (
    <div className="flex items-center gap-0 flex-wrap">
      {/* Pinned circles */}
      {pinned.map((circle) => (
        <button
          key={circle.id}
          onClick={() => handleSelect(circle.id)}
          className={`px-4 py-2 font-ui text-xs uppercase tracking-widest transition-colors border-r border-base-300 ${
            currentCircle?.id === circle.id
              ? 'bg-secondary text-secondary-content'
              : 'bg-base-200 text-base-content/70 hover:bg-base-300'
          }`}
        >
          {circle.name}
        </button>
      ))}

      {/* More dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-4 py-2 font-ui text-xs uppercase tracking-widest bg-base-200 text-base-content/70 hover:bg-base-300 transition-colors"
        >
          More
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-0 z-20 w-64 bg-base-100 border-2 border-base-300 border-t-4 border-t-primary shadow-lg">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-base-300">
              <Search className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search circles…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none"
              />
            </div>

            {/* Results */}
            <ul className="max-h-64 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-base-content/40">
                  No circles found
                </li>
              )}
              {filtered.map((circle) => {
                const isPinned = pinnedCircleIds.includes(circle.id)
                return (
                  <li key={circle.id}>
                    <button
                      onClick={() => handleSelect(circle.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors group ${
                        currentCircle?.id === circle.id
                          ? 'bg-secondary text-secondary-content'
                          : 'hover:bg-base-200 text-base-content'
                      }`}
                    >
                      <span className="font-ui text-xs uppercase tracking-widest truncate">
                        {circle.name}
                      </span>
                      <button
                        onClick={(e) => handlePin(e, circle.id)}
                        title={isPinned ? 'Unpin' : 'Pin'}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-base-content/40 hover:text-primary"
                      >
                        {isPinned
                          ? <PinOff className="w-3 h-3" />
                          : <Pin className="w-3 h-3" />
                        }
                      </button>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Type Filter ────────────────────────────────────────────────────────────

function TypeFilter({ activeTypes, defaultTypes }) {
  const dispatch = useDispatch()

  const isDirty =
    activeTypes.length !== defaultTypes.length ||
    activeTypes.some((t) => !defaultTypes.includes(t))

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-0">
        {/* All button */}
        <button
          onClick={() => dispatch(clearTypes())}
          className={`px-3 py-2 font-ui text-xs uppercase tracking-widest transition-colors border-r border-base-300 ${
            activeTypes.length === 0
              ? 'bg-primary text-primary-content'
              : 'bg-base-200 text-base-content/60 hover:bg-base-300'
          }`}
        >
          All
        </button>

        {POST_TYPES.map((type) => {
          const active = activeTypes.includes(type)
          return (
            <button
              key={type}
              onClick={() => dispatch(toggleType(type))}
              title={type}
              className={`flex items-center gap-1.5 px-3 py-2 font-ui text-xs uppercase tracking-widest transition-colors border-r border-base-300 last:border-r-0 ${
                active
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content/60 hover:bg-base-300'
              }`}
            >
              <PostTypeIcon type={type} className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{type}</span>
            </button>
          )
        })}
      </div>

      {/* Save/reset — only shown when selection differs from saved defaults */}
      {isDirty && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(saveDefaultTypesAsync(activeTypes))}
            className="font-ui text-xs uppercase tracking-widest text-primary hover:underline transition-colors"
          >
            Save as default
          </button>
          <button
            onClick={() => dispatch(resetToDefaults())}
            className="font-ui text-xs uppercase tracking-widest text-base-content/40 hover:text-base-content transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

// ── FeedHeader ─────────────────────────────────────────────────────────────

export default function FeedHeader({ circles = [], currentCircle }) {
  const { activeTypes, defaultTypes, pinnedCircleIds } = useSelector((state) => state.feed)

  return (
    <div className="flex flex-col gap-0 border-b-2 border-base-300 mb-4">
      {/* Circle name */}
      {currentCircle && (
        <div className="flex items-baseline gap-3 py-3">
          <h2 className="font-display text-3xl tracking-wide">{currentCircle.name}</h2>
          {currentCircle.summary && (
            <span className="font-ui text-xs text-base-content/50 uppercase tracking-widest">
              {currentCircle.summary}
            </span>
          )}
        </div>
      )}

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <CircleSwitcher
          circles={circles}
          currentCircle={currentCircle}
          pinnedCircleIds={pinnedCircleIds}
        />
        <TypeFilter activeTypes={activeTypes} defaultTypes={defaultTypes} />
      </div>
    </div>
  )
}
