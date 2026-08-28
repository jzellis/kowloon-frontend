// PhotoCard — one grid cell in the pics.<domain> photo grid. The photo is a
// full-bleed CSS background (not <img>) so the author/title/action overlay
// can sit directly on top of it. Clicking the card body opens the lightbox
// at this exact photo; the react/share icons act immediately in place.

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import ReactButton from '../components/posts/ReactButton'
import { ShareButton } from '../components/posts/PostToolbar'
import sizedUrl from '../lib/sizedUrl'

export default function PhotoCard({ post, attachment, onOpen }) {
  const { t } = useTranslation()
  const { user } = useSelector((state) => state.auth)

  const author = post?.actor
  const authorName = author?.name ?? author?.id ?? post?.actorId
  const authorHandle = author?.id ?? post?.actorId
  const title = attachment?.name || attachment?.alt || post?.title || post?.name || ''
  const bgUrl = sizedUrl(attachment?.url, 600)

  return (
    <div
      className="relative aspect-square overflow-hidden bg-base-300 cursor-pointer group"
      style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.() } }}
      aria-label={title || t('pics.openPhoto', { defaultValue: 'Open photo' })}
    >
      {/* Bottom tinted overlay — author/title (left) + react/share (right), white on a dark scrim */}
      <div
        className="absolute inset-x-0 bottom-0 px-2.5 py-2 flex items-end justify-between gap-2"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0) 80%)' }}
      >
        <div className="min-w-0 flex flex-col leading-tight">
          <span className="font-ui text-[11px] font-medium text-white truncate">{authorName}</span>
          {title && <span className="font-ui text-[10px] text-white/75 truncate">{title}</span>}
        </div>
        <div
          className="flex items-center gap-2.5 shrink-0 [&_button]:text-white [&_button:hover]:text-white/70 [&_svg]:drop-shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {user && post?.canReact !== 'none' && <ReactButton post={post} t={t} />}
          <ShareButton post={post} t={t} user={user} />
        </div>
      </div>
    </div>
  )
}
