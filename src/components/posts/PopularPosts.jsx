// PopularPosts — sidebar widget showing most popular posts on the server.
// Ranked by reaction + reply count. Shows post type color, title/summary, author, and counts.
// Media posts additionally show a thumbnail or A/V placeholder.

import { Link } from 'react-router-dom'
import { MessageSquare, Smile, Play, Music } from 'lucide-react'
import { POST_TYPES } from '../../lib/postTypes'
import PostTypeIcon from '../ui/PostTypeIcon'

const MEDIA_COLOR = POST_TYPES['Media']?.color ?? '#009084'

const MOCK_POPULAR = [
  {
    id: 'post:2@kwln.org',
    type: 'Article',
    name: 'On the Aesthetics of Midcentury Design',
    summary: 'Reid Miles understood that negative space is content — that what you leave out is as important as what you put in.',
    attributedTo: { id: '@designthink@kwln.org', displayName: 'Design Thinking' },
    replyCount: 24,
    reactCount: 91,
  },
  {
    id: 'post:8@kwln.org',
    type: 'Media',
    name: 'Rooftop at golden hour',
    summary: 'The light does something different up here.',
    attributedTo: { id: '@jzellis@kwln.org', displayName: 'Joshua Ellis' },
    featuredImage: 'https://picsum.photos/seed/roof1/800/800',
    replyCount: 5,
    reactCount: 74,
  },
  {
    id: 'post:3@kwln.org',
    type: 'Link',
    name: 'Blue Note Records: The Complete Discography',
    summary: 'An absolutely essential resource. Every cover, every session date, every pressing.',
    attributedTo: { id: '@recordhead@kwln.org', displayName: 'Record Head' },
    replyCount: 8,
    reactCount: 57,
  },
  {
    id: 'post:5@kwln.org',
    type: 'Media',
    name: 'New track: "Wanchai Drift"',
    summary: 'Recorded this late last night. Somewhere between jazz and something else entirely.',
    attributedTo: { id: '@jzellis@kwln.org', displayName: 'Joshua Ellis' },
    attachments: [{ mediaType: 'audio/ogg' }],
    replyCount: 14,
    reactCount: 52,
  },
  {
    id: 'post:4@kwln.org',
    type: 'Event',
    name: 'Kowloon Dev Meetup #4',
    summary: 'Come hang out and talk federated social networks, indie web, ActivityPub, and whatever else you\'re building.',
    attributedTo: { id: '@jzellis@kwln.org', displayName: 'Joshua Ellis' },
    replyCount: 12,
    reactCount: 44,
  },
  {
    id: 'post:20@kwln.org',
    type: 'Media',
    name: 'Timelapse: setting up the stage',
    summary: 'Four hours in forty seconds.',
    attributedTo: { id: '@jzellis@kwln.org', displayName: 'Joshua Ellis' },
    attachments: [{ mediaType: 'video/mp4' }],
    replyCount: 9,
    reactCount: 41,
  },
  {
    id: 'post:1@kwln.org',
    type: 'Note',
    name: null,
    summary: 'Just finished reading The Stars My Destination for the third time. Still the best science fiction novel ever written, no notes.',
    attributedTo: { id: '@jzellis@kwln.org', displayName: 'Joshua Ellis' },
    replyCount: 19,
    reactCount: 38,
  },
]

function MediaThumb({ post }) {
  if (post.featuredImage) {
    return (
      <img
        src={post.featuredImage}
        alt={post.name ?? ''}
        className="w-16 h-16 object-cover shrink-0"
      />
    )
  }

  const mt = post.attachments?.[0]?.mediaType ?? ''
  const isAudio = mt.startsWith('audio/')
  const isVideo = mt.startsWith('video/')
  if (!isAudio && !isVideo) return null

  return (
    <div
      className="w-16 h-16 shrink-0 flex items-center justify-center"
      style={{ backgroundColor: MEDIA_COLOR + '22' }}
    >
      {isAudio
        ? <Music size={22} style={{ color: MEDIA_COLOR }} />
        : <Play  size={22} style={{ color: MEDIA_COLOR }} />
      }
    </div>
  )
}

export default function PopularPosts({ posts = MOCK_POPULAR }) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-2 mb-3" style={{ minHeight: '36px' }}>
        <span className="opacity-50 !w-11 !h-11" style={{ filter: 'grayscale(1)' }}><PostTypeIcon type="Article" size="lg" /></span>
        <h3 className="font-display text-3xl tracking-wide text-base-content leading-none">Popular Posts</h3>
      </div>
      <ul className="flex flex-col gap-0">
        {posts.map((post) => {
          const typeColor = POST_TYPES[post.type]?.color
          const showThumb = post.type === 'Media'

          return (
            <li key={post.id} className="border-b border-base-300 last:border-b-0 mb-3 last:mb-0">
              <Link
                to={`/posts/${encodeURIComponent(post.id)}`}
                className="flex flex-col gap-1.5 py-4 px-3 -mx-3 hover:bg-base-300 transition-colors"
              >
                {/* Type indicator + content + optional thumb */}
                <div className="flex items-start gap-2">
                  <div
                    className="w-1 self-stretch shrink-0 mt-0.5"
                    style={{ backgroundColor: typeColor }}
                  />
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      {post.name && (
                        <span className="font-display text-xl leading-tight tracking-wide">
                          {post.name}
                        </span>
                      )}
                      <p className={`font-reading text-base-content/60 leading-snug line-clamp-2 ${post.name ? 'text-xs' : 'text-sm'}`}>
                        {post.summary}
                      </p>
                    </div>
                    {showThumb && <MediaThumb post={post} />}
                  </div>
                </div>

                {/* Author + counts */}
                <div className="flex items-center justify-between pl-3">
                  <span className="font-ui text-xs font-bold uppercase tracking-widest text-base-content/75">
                    {post.attributedTo.displayName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-ui text-xs uppercase tracking-widest text-base-content/40">
                      <Smile size={11} />
                      {post.reactCount}
                    </span>
                    <span className="flex items-center gap-1 font-ui text-xs uppercase tracking-widest text-base-content/40">
                      <MessageSquare size={11} />
                      {post.replyCount}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
