// EventCard — event-specific post layout.
// Calendar tear-off block (month + day) beside title, location prominent below.
// Used by PostCard whenever post.type === 'Event'.

import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import PostMeta from './PostMeta'
import PostToolbar from './PostToolbar'
import PostTypeTag from '../ui/PostTypeTag'
import { POST_TYPES } from '../../lib/postTypes'
import { marked } from 'marked'

marked.use({ breaks: true, gfm: true })

const EVENT_COLOR = POST_TYPES['Event']?.color ?? '#cc272e'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT']

function formatTimeRange(start, end) {
  if (!start) return null
  const s = new Date(start)
  const opts = { hour: 'numeric', minute: '2-digit', hour12: true }
  const startStr = s.toLocaleTimeString([], opts)
  if (!end) return startStr
  const e = new Date(end)
  const endStr = e.toLocaleTimeString([], opts)
  // Same day — show just times
  if (s.toDateString() === e.toDateString()) return `${startStr} – ${endStr}`
  // Multi-day — show end date too
  return `${startStr} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${endStr}`
}

function CalendarBlock({ date }) {
  if (!date) return null
  const d = new Date(date)
  const month = MONTHS[d.getMonth()]
  const day   = d.getDate()
  const dow   = DAYS[d.getDay()]

  return (
    <div className="flex flex-col shrink-0 w-14 border-2 border-base-300 overflow-hidden self-start">
      {/* Month strip */}
      <div
        className="flex items-center justify-center py-0.5"
        style={{ backgroundColor: EVENT_COLOR }}
      >
        <span className="font-ui text-[10px] font-bold uppercase tracking-widest text-white">{month}</span>
      </div>
      {/* Day number */}
      <div className="flex flex-col items-center justify-center py-1 bg-base-100">
        <span className="font-display text-3xl leading-none text-base-content">{day}</span>
        <span className="font-ui text-[9px] uppercase tracking-widest text-base-content/40 mt-0.5">{dow}</span>
      </div>
    </div>
  )
}

export default function EventCard({ post }) {
  const timeRange = formatTimeRange(post?.startTime, post?.endTime)
  const locationName = post?.location?.name ?? null
  const raw  = post?.source ?? post?.content ?? ''
  const html = marked.parse(raw)

  return (
    <article className="flex flex-col gap-3 py-5 border-b border-base-300 mb-8">

      {/* Top row: calendar block + title + time */}
      <div className="flex gap-4 items-start">
        <CalendarBlock date={post?.startTime} />

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {timeRange && (
            <p className="font-ui text-xs uppercase tracking-widest text-base-content/50">{timeRange}</p>
          )}
          <Link
            to={`/posts/${encodeURIComponent(post?.id)}`}
            className="font-display text-4xl leading-tight tracking-wide text-base-content hover:text-primary transition-colors"
          >
            {post?.name ?? 'Untitled Event'}
          </Link>

          {/* Location — prominent, right below title */}
          {locationName && (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={13} className="shrink-0" style={{ color: EVENT_COLOR }} />
              <span className="font-ui text-sm tracking-wide text-base-content/70">{locationName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Author */}
      <div
        className="border-l-4 pl-3"
        style={{ borderLeftColor: EVENT_COLOR + '66' }}
      >
        <PostMeta post={post} />
      </div>

      {/* Body (description) if present */}
      {raw && (
        <div
          className="font-reading text-base-content/80 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-base-300">
        <PostTypeTag type="Event" />
        <PostToolbar post={post} />
      </div>

    </article>
  )
}
