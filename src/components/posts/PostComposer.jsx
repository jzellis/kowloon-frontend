// PostComposer — collapsed prompt that opens a full-screen modal editor.
// Collapsed: shows user avatar + prompt text.
// Expanded: modal overlay with type selector, rich text editor, audience picker, submit/cancel.
// Auth-aware: renders nothing if not logged in.

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import FocusTrap from 'focus-trap-react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useClient } from '../../hooks/useClient'
import UserAvatar from '../ui/UserAvatar'
import PostTypeSelector from './PostTypeSelector'
import RichTextEditor from './RichTextEditor'
import CircleSelector from '../circles/CircleSelector'
import AudioPlayer from '../ui/AudioPlayer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhotoFilm, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const NOTE_MAX_WORDS = 500
const NOTE_MAX_CHARS = 5000

const countWords = (md) => md.trim().split(/\s+/).filter(Boolean).length

// ── Tags input ─────────────────────────────────────────────────────────────

function TagsInput({ tags, onChange }) {
  const { t } = useTranslation()
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
        placeholder={tags.length ? '' : t('composer.tagsPlaceholder')}
        className="flex-1 min-w-24 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none"
      />
    </div>
  )
}

// ── DateTimeField ──────────────────────────────────────────────────────────

function DateTimeField({ value, onChange, placeholder, optional = false, borderRight = false }) {
  const { t } = useTranslation()
  const [active, setActive] = useState(false)
  const inputRef = useRef(null)

  const handleActivate = () => {
    setActive(true)
    setTimeout(() => inputRef.current?.showPicker?.(), 0)
  }

  const handleBlur = () => {
    if (!value) setActive(false)
  }

  const borderClass = borderRight ? 'border-r-2 border-base-300' : ''

  if (!value && !active) {
    return (
      <button
        type="button"
        onClick={handleActivate}
        className={`flex-1 flex items-center justify-between px-4 py-2.5 bg-base-100 font-ui text-sm uppercase tracking-widest text-base-content/40 hover:text-base-content/70 transition-colors text-left ${borderClass}`}
      >
        <span>{placeholder}</span>
        {optional && <span className="text-base-content/30 normal-case tracking-normal text-xs italic font-reading">{t('common.optional')}</span>}
      </button>
    )
  }

  return (
    <input
      ref={inputRef}
      type="datetime-local"
      value={value}
      onChange={onChange}
      onBlur={handleBlur}
      autoFocus={!value}
      className={`flex-1 px-4 py-2.5 bg-base-100 font-ui text-sm text-base-content outline-none ${borderClass}`}
    />
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

function SortableAttachmentRow(props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.att.previewUrl })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }
  return (
    <div ref={setNodeRef} style={style}>
      <AttachmentRow {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

function AttachmentRow({ att, index, onUpdate, onRemove, isFeatured, onSetFeatured, dragHandleProps = {} }) {
  const { t } = useTranslation()
  const isAudio = att.file.type.startsWith('audio/')
  return (
    <div className={`flex gap-3 items-start py-2.5 border-b border-base-300 bg-base-100 ${isAudio ? 'flex-col' : ''}`}>
      {/* Drag handle */}
      <button
        type="button"
        className="shrink-0 self-center px-2 py-1 text-base-content/25 hover:text-base-content/60 cursor-grab active:cursor-grabbing touch-none"
        aria-label={t('composer.dragToReorder')}
        {...dragHandleProps}
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </button>
      {!isAudio && <AttachmentPreview att={att} />}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {isAudio && <AttachmentPreview att={att} />}
        <input
          type="text"
          value={att.title}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          placeholder={t('composer.attachmentTitle')}
          className="bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none border-b border-base-300 pb-0.5"
        />
        <input
          type="text"
          value={att.alt}
          onChange={(e) => onUpdate(index, 'alt', e.target.value)}
          placeholder={t('composer.attachmentAlt')}
          className="bg-transparent font-reading text-xs text-base-content/70 placeholder:text-base-content/30 outline-none"
        />
      </div>
      <div className="flex flex-col gap-1 items-end shrink-0 pt-0.5">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="font-ui text-xs uppercase tracking-widest text-base-content/30 hover:text-error transition-colors"
        >
          {t('composer.attachmentRemove')}
        </button>
        <button
          type="button"
          onClick={() => onSetFeatured(index)}
          className={`font-ui text-xs uppercase tracking-widest transition-colors ${
            isFeatured ? 'text-primary' : 'text-base-content/30 hover:text-base-content'
          }`}
        >
          {isFeatured ? t('composer.attachmentFeatured') : t('composer.attachmentSetFeatured')}
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PostComposer({ circles = [], onPostCreated }) {
  const { user, token, serverUrl } = useSelector((state) => state.auth)
  const client = useClient()
  const { t } = useTranslation()

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
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const composerRef = useRef(null)
  const fileInputRef = useRef(null)
  const hrefInputRef = useRef(null)
  const triggerRef  = useRef(null)

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
    if (newType === 'Link') {
      setTimeout(() => hrefInputRef.current?.focus(), 0)
    }
  }

  // Collapse on outside click (collapsed state only)
  useEffect(() => {
    function handleClick(e) {
      if (composerRef.current && !composerRef.current.contains(e.target)) {
        if (!content && !title && !href) setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [content, title, href])

  // Lock body scroll, handle Escape, and track keyboard height when modal is open
  useEffect(() => {
    if (!expanded) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => { if (e.key === 'Escape') handleCancel() }
    document.addEventListener('keydown', handleKey)

    // Shrink modal when on-screen keyboard appears
    const vv = window.visualViewport
    const updateKeyboard = () => {
      if (!vv) return
      setKeyboardHeight(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
    }
    vv?.addEventListener('resize', updateKeyboard)
    updateKeyboard()

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
      vv?.removeEventListener('resize', updateKeyboard)
      setKeyboardHeight(0)
    }
  }, [expanded])

  const handleCancel = () => {
    setExpanded(false)
    setTimeout(() => triggerRef.current?.focus(), 0)
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  const handleAttachmentDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    setAttachments((prev) => {
      const oldIndex = prev.findIndex((a) => a.previewUrl === active.id)
      const newIndex = prev.findIndex((a) => a.previewUrl === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    setFeaturedIdx((prev) => {
      const oldIndex = attachments.findIndex((a) => a.previewUrl === active.id)
      const newIndex = attachments.findIndex((a) => a.previewUrl === over.id)
      return arrayMove(attachments, oldIndex, newIndex).indexOf(attachments[prev])
    })
  }

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
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-base-100 border-2 border-base-300 hover:border-primary focus-visible:outline-none focus-visible:border-primary cursor-text transition-colors mb-8 group text-left"
        aria-label={t('composer.prompt')}
      >
        <UserAvatar user={mockUser} size="sm" />
        <span className="font-reading text-base-content/40 dark:text-base-content/65 group-hover:text-base-content/70 dark:group-hover:text-base-content/85 transition-colors select-none" aria-hidden="true">
          {t('composer.prompt')}
        </span>
      </button>
    )
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  return createPortal(
    <FocusTrap focusTrapOptions={{ escapeDeactivates: false }}>
    <div
      className="fixed inset-x-0 top-0 z-50 flex flex-col items-center justify-end lg:justify-center p-4 lg:p-8"
      style={{ bottom: `${keyboardHeight}px` }}
    >

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleCancel} />

      {/* Panel — overflow-hidden so content can never escape; flex body fills available space */}
      <div
        className="relative flex flex-col w-full lg:max-w-2xl bg-base-100 border-4 border-primary overflow-hidden"
        style={{ maxHeight: 'calc(100% - 2rem)' }}
      >

        {/* Top bar */}
        <div className="flex items-center justify-between border-b-2 border-base-300 bg-base-200 shrink-0">
          <PostTypeSelector value={postType} onChange={handleTypeChange} />
          <button
            onClick={handleCancel}
            aria-label={t('composer.close')}
            className="px-4 py-2 font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body — min-h-0 is required for flex children to shrink correctly */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">

          {/* Media file picker — shown first so adding a photo/clip is the first action */}
          {postType === 'Media' && (
            <div className="border-b-2 border-base-300">
              {attachments.length === 0 ? (
                <div className="flex items-center justify-center py-8 bg-base-200">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-content font-ui text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    <FontAwesomeIcon icon={faPhotoFilm} className="text-lg" />
                    {t('composer.addMedia')}
                  </button>
                </div>
              ) : (
                <>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleAttachmentDragEnd}>
                    <SortableContext items={attachments.map((a) => a.previewUrl)} strategy={verticalListSortingStrategy}>
                      {attachments.map((att, i) => (
                        <SortableAttachmentRow key={att.previewUrl} att={att} index={i}
                          onUpdate={updateAttachment} onRemove={removeAttachment}
                          isFeatured={i === featuredIdx} onSetFeatured={setFeaturedIdx} />
                      ))}
                    </SortableContext>
                  </DndContext>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2.5 font-ui text-xs uppercase tracking-widest text-base-content/40 hover:text-base-content hover:bg-base-200 transition-colors text-center border-t border-base-300">
                    {t('composer.addMore')}
                  </button>
                </>
              )}
              <input ref={fileInputRef} type="file" multiple accept="image/*,audio/*,video/*" className="hidden" onChange={handleFileAdd} />
            </div>
          )}

          {/* Link URL — first field for Link type, same size as title */}
          {postType === 'Link' && (
            <div className={`flex items-center border-b-2 border-base-300 bg-base-100 ${fetchingMeta ? 'opacity-50' : ''}`}>
              <input
                ref={hrefInputRef}
                type="url"
                placeholder={t('composer.linkUrl')}
                value={href}
                onChange={(e) => setHref(e.target.value)}
                onBlur={handleHrefBlur}
                className="flex-1 px-4 py-3 bg-transparent font-display text-2xl tracking-wide text-base-content placeholder:text-base-content/30 outline-none min-w-0"
              />
              {!href && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      if (text) { setHref(text); setTimeout(() => hrefInputRef.current?.blur(), 0) }
                    } catch {}
                  }}
                  className="shrink-0 px-3 py-1.5 mx-2 font-ui text-xs uppercase tracking-widest bg-base-200 hover:bg-base-300 text-base-content/60 hover:text-base-content transition-colors"
                >
                  {t('composer.linkPaste')}
                </button>
              )}
            </div>
          )}

          {/* Title — Article, Event, Link, Media */}
          {hasTitle && (
            <input
              type="text"
              placeholder={t('composer.title')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-base-100 font-display text-2xl tracking-wide text-base-content placeholder:text-base-content/30 outline-none border-b-2 border-base-300"
            />
          )}

          {/* Event datetimes + location */}
          {postType === 'Event' && (
            <>
              <div className="flex border-b-2 border-base-300">
                <DateTimeField
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder={t('composer.startDate')}
                  borderRight
                />
                <DateTimeField
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder={t('composer.endDate')}
                  optional
                />
              </div>
              <div className="flex items-center border-b-2 border-base-300 bg-base-100">
                <input type="text" placeholder={t('composer.location')} value={location}
                  onChange={(e) => { setLocation(e.target.value); if (!e.target.value) setGeo(null) }}
                  className="flex-1 px-4 py-2 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none" />
                {!location && <span className="text-base-content/30 text-xs italic font-reading shrink-0">{t('common.optional')}</span>}
                <button type="button" onClick={handleGeolocate} disabled={locating}
                  className={`px-3 py-2 font-ui text-xs uppercase tracking-widest transition-colors shrink-0 ${geo ? 'text-primary' : locating ? 'text-base-content/20 cursor-wait' : 'text-base-content/30 hover:text-base-content'}`}>
                  {locating ? '…' : t('common.gps')}
                </button>
              </div>
            </>
          )}

          {/* Rich text editor — no extra wrapper, editor fills the space */}
          <RichTextEditor
            key={editorKey}
            content={content}
            onChange={setContent}
            maxWords={postType === 'Note' ? NOTE_MAX_WORDS : undefined}
            autoFocus
            editorClassName="min-h-[40vh]"
          />

          {/* Tags */}
          {hasTags && <TagsInput tags={tags} onChange={setTags} />}

          {/* Location — all types except Event */}
          {postType !== 'Event' && (
            <div className="flex items-center border-t-2 border-base-300 bg-base-100">
              <input type="text" placeholder={t('composer.location')} value={location}
                onChange={(e) => { setLocation(e.target.value); if (!e.target.value) setGeo(null) }}
                className="flex-1 px-4 py-2 bg-transparent font-ui text-xs uppercase tracking-widest text-base-content placeholder:text-base-content/30 outline-none" />
              {!location && <span className="text-base-content/30 text-xs italic font-reading shrink-0">{t('common.optional')}</span>}
              <button type="button" onClick={handleGeolocate} disabled={locating}
                className={`px-3 py-2 font-ui text-xs uppercase tracking-widest transition-colors shrink-0 ${geo ? 'text-primary' : locating ? 'text-base-content/20 cursor-wait' : 'text-base-content/30 hover:text-base-content'}`}>
                {locating ? '…' : t('common.gps')}
              </button>
            </div>
          )}

        </div>

        {/* Footer — pinned to bottom, never scrolls away */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-base-200 border-t-2 border-base-300 shrink-0">
          <CircleSelector circles={circles} value={audience} onChange={setAudience} showAudience allowCreate direction="up" />
          <div className="flex items-center gap-3">
            {error && <span className="font-ui text-xs uppercase tracking-widest text-error">{error}</span>}
            {postType === 'Note' && (
              <span className={`font-ui text-xs uppercase tracking-widest tabular-nums ${atNoteLimit ? 'text-error' : noteWarn ? 'text-warning' : 'text-base-content/30'}`}>
                {t('composer.wordCount', { count: wordCount, max: NOTE_MAX_WORDS })}
              </span>
            )}
            <button type="button" onClick={handleCancel}
              className="px-3 py-1.5 font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors">
              {t('common.cancel')}
            </button>
            <button type="button" onClick={handleSubmit} disabled={!canPost}
              className="px-4 py-1.5 font-ui text-xs uppercase tracking-widest bg-primary text-primary-content hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
              {submitting ? t('composer.posting') : t('composer.post')}
            </button>
          </div>
        </div>

      </div>
    </div>
    </FocusTrap>,
    document.body
  )
}
