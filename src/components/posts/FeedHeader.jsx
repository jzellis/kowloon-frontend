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

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PinOff } from 'lucide-react'
import CircleSelector from '../circles/CircleSelector'
import {
  setCircle, toggleType, clearTypes, resetToDefaults,
  pinCircle, unpinCircle,
  saveDefaultTypesAsync, savePinnedCirclesAsync,
} from '../../app/feedSlice'
import PostTypeIcon from '../ui/PostTypeIcon'

const POST_TYPES = ['Note', 'Article', 'Media', 'Event', 'Link']
const POST_TYPE_LABELS = { Note: 'Notes', Article: 'Articles', Media: 'Media', Event: 'Events', Link: 'Links' }

// ── Circle Switcher ────────────────────────────────────────────────────────

function CircleSwitcher({ circles = [], currentCircle, pinnedCircleIds }) {
  const dispatch = useDispatch()

  const pinned = circles.filter((c) => pinnedCircleIds.includes(c.id))

  const handleSelect = (circleId) => dispatch(setCircle(circleId))

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
      {/* Pinned circles as quick-access tabs */}
      {pinned.map((circle) => (
        <div key={circle.id} className="relative group flex items-center border-r border-base-300">
          <button
            onClick={() => handleSelect(circle.id)}
            className={`px-4 py-2 font-ui text-xs uppercase tracking-widest transition-colors ${
              currentCircle?.id === circle.id
                ? 'bg-secondary text-secondary-content'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            {circle.name}
          </button>
          <button
            onClick={(e) => handlePin(e, circle.id)}
            title="Unpin"
            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-base-content/40 hover:text-error"
          >
            <PinOff className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}

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
              <PostTypeIcon type={type} size="sm" />
              <span className="hidden sm:inline">{POST_TYPE_LABELS[type]}</span>
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
  const dispatch = useDispatch()
  const { activeTypes, defaultTypes, pinnedCircleIds } = useSelector((state) => state.feed)

  const currentCircleObj = circles.find((c) => c.id === currentCircle?.id) ?? currentCircle

  return (
    <div className="flex flex-col gap-0 border-b-2 border-base-300 mb-4">
      {/* Title row — circle name IS the selector trigger */}
      <div className="flex items-center gap-3 py-3">
        <CircleSelector
          circles={circles}
          value={currentCircleObj?.id}
          onChange={(id) => dispatch(setCircle(id))}
          variant="title"
        />
        {currentCircleObj?.summary && (
          <span className="font-ui text-xs text-base-content/50 uppercase tracking-widest">
            {currentCircleObj.summary}
          </span>
        )}
      </div>

      {/* Controls row — pinned tabs + type filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <CircleSwitcher
          circles={circles}
          currentCircle={currentCircleObj}
          pinnedCircleIds={pinnedCircleIds}
        />
        <TypeFilter activeTypes={activeTypes} defaultTypes={defaultTypes} />
      </div>
    </div>
  )
}
