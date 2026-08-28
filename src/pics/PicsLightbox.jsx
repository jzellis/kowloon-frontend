// PicsLightbox — fullscreen photo viewer for pics.<domain>, two-axis nav:
//   left/right (swipe or arrow keys) — other photos in the SAME post
//   up/down    (swipe or arrow keys) — next/previous POST, landing on its
//                                       first photo
//
// MediaLightbox (extracted from the main site's PostBody.jsx) already owns
// the left/right swipe/zoom/keyboard engine — reused completely unmodified,
// scoped to just the current post's own attachments, so it naturally stops
// at that post's first/last photo with no new clamping logic. Its root is
// `position: fixed inset-0` (always full-viewport, regardless of DOM
// nesting), so the info panel below is a SEPARATE fixed sibling layered on
// top at a higher z-index, not a flex/grid layout partner.
//
// Up/down is new code: a capture-phase touch handler on the outer wrapper
// determines the drag's dominant axis: a mostly-vertical drag is intercepted
// (stopPropagation) before it reaches MediaLightbox's own bubble-phase swipe
// handler, and drives post-to-post nav instead; a mostly-horizontal drag is
// left alone entirely and falls through to MediaLightbox exactly as today.

import { useEffect, useRef } from 'react'
import MediaLightbox from '../components/ui/MediaLightbox'
import PostMeta from '../components/posts/PostMeta'
import PostReacts from '../components/posts/PostReacts'
import PostToolbar from '../components/posts/PostToolbar'

const VERTICAL_SWIPE_THRESHOLD = 60
const AXIS_LOCK_THRESHOLD = 10

export default function PicsLightbox({ posts, activePostIndex, activePhotoIndex, onNavigatePhoto, onNavigatePost, onClose }) {
  const post = posts[activePostIndex]
  const attachments = post?.attachments ?? []

  const touchStartRef = useRef(null)
  const axisRef = useRef(null)

  const handleTouchStartCapture = (e) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
    axisRef.current = null
  }

  const handleTouchMoveCapture = (e) => {
    if (!touchStartRef.current) return
    const t = e.touches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    if (!axisRef.current && (Math.abs(dx) > AXIS_LOCK_THRESHOLD || Math.abs(dy) > AXIS_LOCK_THRESHOLD)) {
      axisRef.current = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x'
    }
    // Vertical drag: keep MediaLightbox's own horizontal handler from ever seeing it.
    if (axisRef.current === 'y') e.stopPropagation()
  }

  const handleTouchEndCapture = (e) => {
    if (axisRef.current === 'y' && touchStartRef.current) {
      const t = e.changedTouches[0]
      const dy = t.clientY - touchStartRef.current.y
      e.stopPropagation()
      if (dy < -VERTICAL_SWIPE_THRESHOLD && activePostIndex < posts.length - 1) onNavigatePost(activePostIndex + 1)
      else if (dy > VERTICAL_SWIPE_THRESHOLD && activePostIndex > 0) onNavigatePost(activePostIndex - 1)
    }
    touchStartRef.current = null
    axisRef.current = null
  }

  // Up/Down arrow keys — MediaLightbox already owns Left/Right/Esc internally.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowUp' && activePostIndex > 0) onNavigatePost(activePostIndex - 1)
      else if (e.key === 'ArrowDown' && activePostIndex < posts.length - 1) onNavigatePost(activePostIndex + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activePostIndex, posts.length, onNavigatePost])

  if (!post) return null

  const mainDomain = window.location.hostname.replace(/^pics\./, '')

  return (
    <div
      onTouchStartCapture={handleTouchStartCapture}
      onTouchMoveCapture={handleTouchMoveCapture}
      onTouchEndCapture={handleTouchEndCapture}
    >
      <MediaLightbox items={attachments} index={activePhotoIndex} onClose={onClose} onNavigate={onNavigatePhoto} />

      {/* Info panel — fixed sibling layered above MediaLightbox's full-bleed image. */}
      <div className="fixed inset-x-0 bottom-0 z-[110] max-h-[45vh] overflow-y-auto bg-base-100 text-base-content border-t-2 border-base-300 px-4 py-4 flex flex-col gap-3">
        <PostMeta post={post} />
        {post?.body && (
          // Server-sanitized HTML (same trust boundary the main site's PostBody
          // already relies on) — not re-rendering PostBody itself here, since
          // it would also try to render this Media post's own attachment
          // gallery a second time (the photo is already the fullscreen image).
          <div
            className="reading-surface font-reading text-sm max-h-32 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        )}
        <PostReacts post={post} />
        <PostToolbar
          post={post}
          onReplyClick={() => {
            window.location.href = `${window.location.protocol}//${mainDomain}/posts/${encodeURIComponent(post.id)}`
          }}
        />
      </div>
    </div>
  )
}
