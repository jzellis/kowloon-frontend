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

const AUDIENCES = [
  { value: 'public',  label: 'Public'  },
  { value: 'server',  label: 'Server'  },
  { value: 'circles', label: 'Circles' },
]

export default function PostComposer({ onPostCreated }) {
  const { user } = useSelector((state) => state.auth)
  const client = useClient()

  const [expanded, setExpanded]   = useState(false)
  const [postType, setPostType]   = useState('Note')
  const [content, setContent]     = useState('')
  const [title, setTitle]         = useState('')
  const [audience, setAudience]   = useState('public')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)

  const composerRef = useRef(null)

  // Collapse on outside click
  useEffect(() => {
    function handleClick(e) {
      if (composerRef.current && !composerRef.current.contains(e.target)) {
        if (!content && !title) setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [content, title])

  const handleCancel = () => {
    setExpanded(false)
    setContent('')
    setTitle('')
    setPostType('Note')
    setAudience('public')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await client.activities.createPost({
        type: postType,
        name: title || undefined,
        source: content,
        mediaType: 'text/markdown',
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

  // ── Collapsed state ──────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div
        ref={composerRef}
        onClick={() => setExpanded(true)}
        className="flex items-center gap-3 px-4 py-3 bg-base-100 border-2 border-base-300 hover:border-primary cursor-text transition-colors mb-4 group"
      >
        <UserAvatar user={mockUser} size="sm" />
        <span className="font-reading text-base-content/40 group-hover:text-base-content/60 transition-colors select-none">
          Write something…
        </span>
      </div>
    )
  }

  // ── Expanded state ───────────────────────────────────────────────────────
  return (
    <div ref={composerRef} className="flex flex-col gap-0 border-2 border-primary mb-4">

      {/* Type selector */}
      <div className="flex items-center justify-between border-b-2 border-base-300 bg-base-200">
        <PostTypeSelector value={postType} onChange={setPostType} />
        <Link
          to="/posts/new"
          className="px-4 py-2 font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-primary transition-colors"
        >
          Full editor →
        </Link>
      </div>

      {/* Title — only for types that have one */}
      {(postType === 'Article' || postType === 'Event' || postType === 'Link') && (
        <input
          type="text"
          placeholder={postType === 'Link' ? 'URL or title…' : 'Title…'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-base-100 font-display text-2xl tracking-wide text-base-content placeholder:text-base-content/30 outline-none border-b-2 border-base-300"
        />
      )}

      {/* Rich text editor */}
      <div className="border-b-2 border-base-300">
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* Footer: audience + actions */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-base-200">

        {/* Audience */}
        <div className="flex items-center gap-0">
          {AUDIENCES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setAudience(a.value)}
              className={`px-3 py-1.5 font-ui text-xs uppercase tracking-widest transition-colors border-r border-base-300 last:border-r-0 ${
                audience === a.value
                  ? 'bg-secondary text-secondary-content'
                  : 'bg-base-100 text-base-content/50 hover:bg-base-300'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Error + submit */}
        <div className="flex items-center gap-3">
          {error && (
            <span className="font-ui text-xs uppercase tracking-widest text-error">{error}</span>
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
            disabled={submitting || !content.trim()}
            className="px-4 py-1.5 font-ui text-xs uppercase tracking-widest bg-primary text-primary-content hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

    </div>
  )
}
