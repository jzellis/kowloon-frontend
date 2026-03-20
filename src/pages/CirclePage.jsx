// CirclePage — circle detail: icon, title, description, member list, and actions.
// Copy is available to all logged-in users. Edit/Delete only for the circle owner.

import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { Copy, Share2, Pencil, Trash2 } from 'lucide-react'
import UserAvatar from '../components/ui/UserAvatar'
import CircleIcon from '../components/ui/CircleIcon'

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

const MOCK_CIRCLE = {
  id: 'circle:jazz@kwln.org',
  name: 'Jazz & Improvised Music',
  icon: 'https://picsum.photos/seed/jazz11/200/200',
  description: 'From bebop to free jazz. New recordings, old recordings, gear, theory, gigs. All eras, all traditions — the only requirement is that someone is listening.',
  memberCount: 91,
  attributedTo: { id: '@recordhead@kwln.org', username: 'recordhead', displayName: 'Record Head', profile: { icon: 'https://picsum.photos/seed/recordhead/200/200' } },
  members: [
    { id: '@jzellis@kwln.org',       username: 'jzellis',       displayName: 'Joshua Ellis',       profile: { icon: 'https://picsum.photos/seed/jzellis/200/200' } },
    { id: '@cityhacker@kwln.org',    username: 'cityhacker',    displayName: 'City Hacker',        profile: { icon: 'https://picsum.photos/seed/cityhacker/200/200' } },
    { id: '@designthink@kwln.org',   username: 'designthink',   displayName: 'Design Thinking',    profile: { icon: 'https://picsum.photos/seed/designthink/200/200' } },
    { id: '@recordhead@kwln.org',    username: 'recordhead',    displayName: 'Record Head',        profile: { icon: 'https://picsum.photos/seed/recordhead/200/200' } },
    { id: '@milesahead@kwln.org',    username: 'milesahead',    displayName: 'Miles Ahead',        profile: { icon: 'https://picsum.photos/seed/milesahead/200/200' } },
    { id: '@bluebird@kwln.org',      username: 'bluebird',      displayName: 'Bluebird Parker',    profile: { icon: 'https://picsum.photos/seed/bluebird/200/200' } },
    { id: '@trane@kwln.org',         username: 'trane',         displayName: 'A. Trane',           profile: { icon: 'https://picsum.photos/seed/trane/200/200' } },
    { id: '@mingusmouth@kwln.org',   username: 'mingusmouth',   displayName: 'Mingus Mouth',       profile: { icon: 'https://picsum.photos/seed/mingusmouth/200/200' } },
    { id: '@rollinsstone@kwln.org',  username: 'rollinsstone',  displayName: 'Rollins Stone',      profile: { icon: 'https://picsum.photos/seed/rollinsstone/200/200' } },
    { id: '@koloursofbop@kwln.org',  username: 'koloursofbop',  displayName: 'Kolours of Bop',     profile: { icon: 'https://picsum.photos/seed/koloursofbop/200/200' } },
    { id: '@voiceofeve@kwln.org',    username: 'voiceofeve',    displayName: 'Eve Cassidy-Reed',   profile: { icon: 'https://picsum.photos/seed/voiceofeve/200/200' } },
    { id: '@waxpoetic@kwln.org',     username: 'waxpoetic',     displayName: 'Wax Poetic',         profile: { icon: 'https://picsum.photos/seed/waxpoetic/200/200' } },
    { id: '@sidemansteve@kwln.org',  username: 'sidemansteve',  displayName: 'Sideman Steve',      profile: { icon: 'https://picsum.photos/seed/sidemansteve/200/200' } },
    { id: '@lowendbass@kwln.org',    username: 'lowendbass',    displayName: 'Low End Theory',     profile: { icon: 'https://picsum.photos/seed/lowendbass/200/200' } },
    { id: '@clubbackroom@kwln.org',  username: 'clubbackroom',  displayName: 'The Backroom',       profile: { icon: 'https://picsum.photos/seed/clubbackroom/200/200' } },
  ],
}

export default function CirclePage() {
  const { id } = useParams()
  const circle = MOCK_CIRCLE // TODO: fetch by id
  const user = useSelector((state) => state.auth.user)

  const isOwner = user && circle.attributedTo?.id === user.id
  const isLoggedIn = !!user

  const containerRef = useRef(null)
  const [shadowProgress, setShadowProgress] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Walk up to find the scrolling ancestor
    let parent = el.parentElement
    while (parent && getComputedStyle(parent).overflowY === 'visible') {
      parent = parent.parentElement
    }
    if (!parent) return
    const handleScroll = () => {
      setShadowProgress(Math.min(parent.scrollTop / 60, 1))
    }
    parent.addEventListener('scroll', handleScroll, { passive: true })
    return () => parent.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col gap-8">

      {/* Header — sticky within the scrolling content column */}
      <div
        className="sticky top-0 bg-base-100 z-10 flex flex-col gap-4 pt-6 pb-6 px-4 border-b-2 border-base-300"
        style={{
          filter: `drop-shadow(${shadowProgress * 8}px ${shadowProgress * 8}px ${shadowProgress * 8}px rgba(0,0,0,${(shadowProgress * 0.35).toFixed(3)}))`,
          transform: `translate(${shadowProgress * -3}px, ${shadowProgress * -3}px)`,
        }}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          {circle.icon
            ? <img src={circle.icon} alt={circle.name} className="w-20 h-20 object-cover shrink-0" style={hexMask} />
            : <div className="w-20 h-20 bg-secondary flex items-center justify-center shrink-0" style={hexMask}>
                <CircleIcon type="circle" size="lg" className="text-secondary-content opacity-70" />
              </div>
          }
          {/* Name + creator + count + description + posts link */}
          <div className="flex flex-col gap-3 min-w-0 pt-1 flex-1">
            <h1 className="font-display text-4xl leading-none tracking-wide">{circle.name}</h1>
            <div className="flex items-center gap-2 font-ui text-xs uppercase tracking-widest text-base-content/50">
              <Link to={`/users/${encodeURIComponent(circle.attributedTo.id)}`} className="font-bold hover:text-primary transition-colors">
                {circle.attributedTo.displayName}
              </Link>
              <span>·</span>
              <span>{circle.memberCount} members</span>
            </div>
            {circle.description && (
              <p className="font-reading text-base text-base-content/80 leading-relaxed">
                {circle.description}
              </p>
            )}
            <Link
              to={`/circles/${encodeURIComponent(circle.id)}/posts`}
              className="self-start flex items-center gap-2 px-4 py-2 bg-base-200 hover:bg-base-300 font-ui text-xs uppercase tracking-widest text-base-content/70 hover:text-base-content transition-colors"
            >
              Posts From This Circle
            </Link>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            {isLoggedIn && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-base-300 font-ui text-xs uppercase tracking-widest text-base-content/60 hover:border-primary hover:text-primary transition-colors">
                <Copy size={12} /> Copy
              </button>
            )}
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-base-300 font-ui text-xs uppercase tracking-widest text-base-content/60 hover:border-primary hover:text-primary transition-colors">
              <Share2 size={12} /> Share
            </button>
            {isOwner && (
              <>
                <Link
                  to={`/circles/${encodeURIComponent(circle.id)}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-base-300 font-ui text-xs uppercase tracking-widest text-base-content/60 hover:border-primary hover:text-primary transition-colors"
                >
                  <Pencil size={12} /> Edit
                </Link>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-error/40 font-ui text-xs uppercase tracking-widest text-error/60 hover:border-error hover:text-error transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Members */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Members</h2>
        <div className="flex flex-col gap-0 border-t border-base-300">
          {circle.members.map((member) => (
            <Link
              key={member.id}
              to={`/users/${encodeURIComponent(member.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-3 border-b border-base-300 hover:bg-base-200 px-2 -mx-2 transition-colors"
            >
              <UserAvatar user={member} size="sm" />
              <div className="flex flex-col min-w-0">
                <span className="font-ui text-sm font-bold text-base-content">{member.displayName}</span>
                <span className="font-ui text-xs uppercase tracking-widest text-base-content/40">{member.id}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
