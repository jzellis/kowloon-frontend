// PostComposer — inline expanding post editor at the top of the feed.
// Collapsed: shows user avatar + prompt text. Clicking expands the full editor.
// Expanded: type selector, rich text editor, audience picker, submit/cancel.
// Auth-aware: renders nothing if not logged in.

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useClient } from '../../hooks/useClient'
import UserAvatar from '../ui/UserAvatar'
import PostTypeSelector from './PostTypeSelector'
import RichTextEditor from './RichTextEditor'
import CircleSelector from '../circles/CircleSelector'
import AudioPlayer from '../ui/AudioPlayer'

const NOTE_MAX_WORDS = 500
const NOTE_MAX_CHARS = 5000

const countWords = (md) => md.trim().split(/\s+/).filter(Boolean).length

// ── Tags input ─────────────────────────────────────────────────────────────

function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  const commit = () => {
    const tag = input.trim().replace(/^#+/, '').toLowerCase()
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput('')
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b-2 border-base-300 bg-base-100 min-h-10">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-base-200 font-ui text-xs uppercase tracking-widest">
          #{tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="text-base-content/40 hover:text-error transition-colors leading-none ml-0.5"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
          if (e.key === 'Backspace' && !input && tags.length) {
            onChange(tags.slice(0, -1))
          }
        }}
        onBlur={commit}
        placeholder={tags.length ? '' : 'Add tags…'}
        className="flex-1 min-w-24 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none"
      />
    </div>
  )
}

// ── Attachment row (Media type) ────────────────────────────────────────────

function AttachmentPreview({ att }) {
  const mt = att.file.type
  if (mt.startsWith('image/')) {
    return (
      <img
        src={att.previewUrl}
        alt=""
        className="w-20 h-20 object-cover shrink-0 bg-base-300"
      />
    )
  }
  if (mt.startsWith('video/')) {
    return (
      <video
        src={att.previewUrl}
        className="w-20 h-20 object-cover shrink-0 bg-black"
        muted
        preload="metadata"
      />
    )
  }
  if (mt.startsWith('audio/')) {
    return <AudioPlayer src={att.previewUrl} className="w-20 h-20" />
  }
  return null
}

function AttachmentRow({ att, index, onUpdate, onRemove, isFeatured, onSetFeatured }) {
  const isAudio = att.file.type.startsWith('audio/')
  return (
    <div className={`flex gap-3 items-start px-4 py-2.5 border-b border-base-300 bg-base-100 ${isAudio ? 'flex-col' : ''}`}>
      {!isAudio && <AttachmentPreview att={att} />}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {isAudio && <AttachmentPreview att={att} />}
        <input
          type="text"
          value={att.title}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          placeholder="Title…"
          className="bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none border-b border-base-300 pb-0.5"
        />
        <input
          type="text"
          value={att.alt}
          onChange={(e) => onUpdate(index, 'alt', e.target.value)}
          placeholder="Alt text / description…"
          className="bg-transparent font-reading text-xs text-base-content/70 placeholder:text-base-content/30 outline-none"
        />
      </div>
      <div className="flex flex-col gap-1 items-end shrink-0 pt-0.5">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="font-ui text-xs uppercase tracking-widest text-base-content/30 hover:text-error transition-colors"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={() => onSetFeatured(index)}
          className={`font-ui text-xs uppercase tracking-widest transition-colors ${
            isFeatured ? 'text-primary' : 'text-base-content/30 hover:text-base-content'
          }`}
        >
          {isFeatured ? 'Featured' : 'Set featured'}
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PostComposer({ circles = [], onPostCreated }) {
  const { user, token, serverUrl } = useSelector((state) => state.auth)
  const client = useClient()

  const [expanded, setExpanded]       = useState(false)
  const [postType, setPostType]       = useState('Note')
  const [content, setContent]         = useState('')
  const [title, setTitle]             = useState('')
  const [href, setHref]               = useState('')
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')
  const [tags, setTags]               = useState([])
  const [location, setLocation]       = useState('')
  const [attachments, setAttachments] = useState([])   // [{ file, title, alt }]
  const [featuredIdx, setFeaturedIdx] = useState(0)
  const [geo, setGeo]                 = useState(null) // { lat, lon } from browser
  const [locating, setLocating]       = useState(false)
  const [audience, setAudience]       = useState('public')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState(null)
  const [editorKey, setEditorKey]     = useState(0)
  const [fetchingMeta, setFetchingMeta] = useState(false)

  const composerRef = useRef(null)
  const fileInputRef = useRef(null)

  const wordCount = postType === 'Note' ? countWords(content) : 0
  const charCount = postType === 'Note' ? content.length : 0
  const atNoteLimit = postType === 'Note' && (wordCount >= NOTE_MAX_WORDS || charCount >= NOTE_MAX_CHARS)
  const noteWarn = postType === 'Note' && (wordCount >= 450 || charCount >= 4500)

  const hasTitle    = postType !== 'Note'
  const hasTags     = postType !== 'Note'
  const canPost     = !submitting && !atNoteLimit &&
    (content.trim() || (postType === 'Event' && startDate) || (postType === 'Media' && attachments.length))

  const handleTypeChange = (newType) => {
    if (newType === 'Note' && postType !== 'Note') {
      const words = content.trim().split(/\s+/).filter(Boolean)
      if (words.length > NOTE_MAX_WORDS) {
        setContent(words.slice(0, NOTE_MAX_WORDS).join(' '))
        setEditorKey((k) => k + 1)
      }
    }
    setPostType(newType)
  }

  // Collapse on outside click
  useEffect(() => {
    function handleClick(e) {
      if (composerRef.current && !composerRef.current.contains(e.target)) {
        if (!content && !title && !href) setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [content, title, href])

  const handleCancel = () => {
    setExpanded(false)
    setContent('')
    setTitle('')
    setHref('')
    setStartDate('')
    setEndDate('')
    setTags([])
    setLocation('')
    setGeo(null)
    setAttachments((prev) => { prev.forEach((a) => URL.revokeObjectURL(a.previewUrl)); return [] })
    setFeaturedIdx(0)
    setPostType('Note')
    setAudience('public')
    setError(null)
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords
        setGeo({ lat, lon })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'kowloon-frontend/1.0' } }
          )
          const data = await res.json()
          const place = data.address
          // Build a concise human-readable name: "City, State, Country" or similar
          const parts = [
            place.city || place.town || place.village || place.county,
            place.state,
            place.country_code?.toUpperCase(),
          ].filter(Boolean)
          setLocation(parts.join(', '))
        } catch {
          setLocation(`${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        } finally {
          setLocating(false)
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  // Auto-fetch link metadata on href blur
  const handleHrefBlur = async () => {
    if (!href || !serverUrl || !token) return
    setFetchingMeta(true)
    try {
      const res = await fetch(
        `${serverUrl}/preview?url=${encodeURIComponent(href)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const meta = await res.json()
      if (meta.title && !title) setTitle(meta.title)
      if (meta.summary && !content) setContent(meta.summary)
    } catch {}
    finally { setFetchingMeta(false) }
  }

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files)
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({
        file: f,
        title: f.name.replace(/\.[^.]+$/, ''),
        alt: '',
        previewUrl: URL.createObjectURL(f),
      })),
    ])
    e.target.value = ''
  }

  const updateAttachment = (i, field, value) =>
    setAttachments((prev) => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a))

  const removeAttachment = (i) => {
    setAttachments((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl)
      const next = prev.filter((_, idx) => idx !== i)
      return next
    })
    setFeaturedIdx((prev) => (prev >= i && prev > 0 ? prev - 1 : prev))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await client.activities.createPost({
        type: postType,
        name: title || undefined,
        source: content || undefined,
        mediaType: 'text/markdown',
        href: href || undefined,
        startTime: startDate || undefined,
        endTime: endDate || undefined,
        tag: tags.length ? tags.map((t) => ({ type: 'Hashtag', name: `#${t}` })) : undefined,
        location: location
          ? { type: 'Place', name: location, ...(geo ?? {}) }
          : undefined,
        to: audience,
      })
      handleCancel()
      onPostCreated?.()
    } catch (err) {
      setError(err.message || 'Failed to post.')
    } finally {
      setSubmitting(false)
    }
  }

  // TODO: restore auth gate when login is wired up
  // if (!user) return null
  const mockUser = user ?? { username: 'you', displayName: 'You' }

  // ── Collapsed ─────────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div
        ref={composerRef}
        onClick={() => setExpanded(true)}
        className="flex items-center gap-3 px-4 py-3 bg-base-100 border-2 border-base-300 hover:border-primary cursor-text transition-colors mb-8 group"
      >
        <UserAvatar user={mockUser} size="sm" />
        <span className="font-reading text-base-content/40 group-hover:text-base-content/60 transition-colors select-none">
          Write something…
        </span>
      </div>
    )
  }

  // ── Expanded ──────────────────────────────────────────────────────────────
  return (
    <div ref={composerRef} className="flex flex-col gap-0 border-2 border-base-300 mb-8">

      {/* Type selector */}
      <div className="flex items-center justify-between border-b-2 border-base-300 bg-base-200">
        <PostTypeSelector value={postType} onChange={handleTypeChange} />
        <Link
          to="/posts/new"
          className="px-4 py-2 font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-primary transition-colors"
        >
          Full editor →
        </Link>
      </div>

      {/* Title — Article, Event, Link, Media */}
      {hasTitle && (
        <input
          type="text"
          placeholder="Title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-base-100 font-display text-2xl tracking-wide text-base-content placeholder:text-base-content/30 outline-none border-b-2 border-base-300"
        />
      )}

      {/* Link URL */}
      {postType === 'Link' && (
        <input
          type="url"
          placeholder="https://…"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          onBlur={handleHrefBlur}
          className={`w-full px-4 py-2.5 bg-base-100 font-ui text-sm tracking-wide text-base-content placeholder:text-base-content/30 outline-none border-b-2 border-base-300 ${fetchingMeta ? 'opacity-50' : ''}`}
        />
      )}

      {/* Event datetimes + location */}
      {postType === 'Event' && (
        <>
          <div className="flex border-b-2 border-base-300">
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-base-100 font-ui text-sm text-base-content outline-none border-r-2 border-base-300"
            />
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-base-100 font-ui text-sm text-base-content/60 outline-none"
            />
          </div>
          <div className="flex items-center border-b-2 border-base-300 bg-base-100">
            <input
              type="text"
              placeholder="Location (optional)…"
              value={location}
              onChange={(e) => { setLocation(e.target.value); if (!e.target.value) setGeo(null) }}
              className="flex-1 px-4 py-2 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none"
            />
            <button
              type="button"
              onClick={handleGeolocate}
              disabled={locating}
              title="Use my location"
              className={`px-3 py-2 font-ui text-xs uppercase tracking-widest transition-colors shrink-0 ${
                geo ? 'text-primary' : locating ? 'text-base-content/20 cursor-wait' : 'text-base-content/30 hover:text-base-content'
              }`}
            >
              {locating ? '…' : 'GPS'}
            </button>
          </div>
        </>
      )}

      {/* Rich text editor */}
      <div className="border-b-2 border-base-300">
        <RichTextEditor
          key={editorKey}
          content={content}
          onChange={setContent}
          maxWords={postType === 'Note' ? NOTE_MAX_WORDS : undefined}
        />
      </div>

      {/* Media attachments */}
      {postType === 'Media' && (
        <div className="border-b-2 border-base-300">
          {attachments.map((att, i) => (
            <AttachmentRow
              key={i}
              att={att}
              index={i}
              onUpdate={updateAttachment}
              onRemove={removeAttachment}
              isFeatured={i === featuredIdx}
              onSetFeatured={setFeaturedIdx}
            />
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2.5 font-ui text-xs uppercase tracking-widest text-base-content/40 hover:text-base-content hover:bg-base-200 transition-colors text-left"
          >
            + Add file…
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            className="hidden"
            onChange={handleFileAdd}
          />
        </div>
      )}

      {/* Tags — Article, Link, Event, Media */}
      {hasTags && <TagsInput tags={tags} onChange={setTags} />}

      {/* Location — all types except Event (rendered above datetimes for Event) */}
      {postType !== 'Event' && <div className="flex items-center border-b-2 border-base-300 bg-base-100">
        <input
          type="text"
          placeholder="Location (optional)…"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value)
            if (!e.target.value) setGeo(null)
          }}
          className="flex-1 px-4 py-2 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none"
        />
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={locating}
          title="Use my location"
          className={`px-3 py-2 font-ui text-xs uppercase tracking-widest transition-colors shrink-0 ${
            geo
              ? 'text-primary'
              : locating
                ? 'text-base-content/20 cursor-wait'
                : 'text-base-content/30 hover:text-base-content'
          }`}
        >
          {locating ? '…' : geo ? 'GPS' : 'GPS'}
        </button>
      </div>}

      {/* Footer: audience + actions */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-base-200">

        {/* Audience */}
        <CircleSelector
          circles={circles}
          value={audience}
          onChange={setAudience}
          showAudience
          allowCreate
          direction="up"
        />

        {/* Error + word count + actions */}
        <div className="flex items-center gap-3">
          {error && (
            <span className="font-ui text-xs uppercase tracking-widest text-error">{error}</span>
          )}
          {postType === 'Note' && (
            <span className={`font-ui text-xs uppercase tracking-widest tabular-nums ${
              atNoteLimit ? 'text-error' : noteWarn ? 'text-warning' : 'text-base-content/30'
            }`}>
              {wordCount}/{NOTE_MAX_WORDS}
            </span>
          )}
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canPost}
            className="px-4 py-1.5 font-ui text-xs uppercase tracking-widest bg-primary text-primary-content hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

    </div>
  )
}
