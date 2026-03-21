// UserPage — user profile: avatar, bio, links, public circles, and posts.

import { useParams, Link } from 'react-router-dom'
import PostList from '../components/posts/PostList'
import CircleIcon from '../components/ui/CircleIcon'

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

const MOCK_USER = {
  id: '@jzellis@kwln.org',
  username: 'jzellis',
  displayName: 'Joshua Ellis',
  profile: {
    name: 'Joshua Ellis',
    description: 'Writer, musician, technologist. Making things on the internet since 1994. Currently building Kowloon.',
    icon: 'https://picsum.photos/seed/jzellis/400/400',
    urls: ['https://jzellis.com', 'https://github.com/jzellis'],
    pronouns: 'he/him',
  },
}

const MOCK_CIRCLES = [
  { id: 'circle:writing@kwln.org',   name: 'Writing',          icon: 'https://picsum.photos/seed/writing55/200/200',  memberCount: 34 },
  { id: 'circle:scifi@kwln.org',     name: 'Science Fiction',  icon: 'https://picsum.photos/seed/scifi29/200/200',    memberCount: 22 },
  { id: 'circle:localtech@kwln.org', name: 'London Tech',      icon: 'https://picsum.photos/seed/londontech/200/200', memberCount: 143 },
]

const H = (n) => new Date(Date.now() - 1000 * 60 * 60 * n).toISOString()

const MOCK_POSTS = [
  {
    id: 'post:1@kwln.org',
    type: 'Note',
    source: 'Just finished reading *The Stars My Destination* for the third time. Still the best science fiction novel ever written, no notes.',
    published: H(1),
    visibility: 'Public',
    attributedTo: MOCK_USER,
  },
  {
    id: 'post:2@kwln.org',
    type: 'Article',
    name: 'On the Aesthetics of Midcentury Design',
    source: 'Reid Miles understood that negative space is content — that what you leave out is as important as what you put in.',
    published: H(10),
    visibility: 'Public',
    attributedTo: MOCK_USER,
  },
  {
    id: 'post:3@kwln.org',
    type: 'Media',
    name: 'New track: "Wanchai Drift"',
    source: 'Recorded this late last night. Somewhere between jazz and something else entirely.',
    published: H(24),
    visibility: 'Public',
    attributedTo: MOCK_USER,
    attachments: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/WPGC_-_Jingle_%22Bright_New_Sound%22.ogg', mediaType: 'audio/ogg', name: 'Wanchai Drift' }],
  },
]

function CircleChip({ circle }) {
  return (
    <Link
      to={`/circles/${encodeURIComponent(circle.id)}`}
      className="flex items-center gap-2 px-3 py-2 border border-base-300 hover:border-primary hover:bg-base-200 transition-colors"
    >
      {circle.icon
        ? <img src={circle.icon} alt={circle.name} className="w-6 h-6 object-cover" style={hexMask} />
        : <CircleIcon type="circle" size="sm" />
      }
      <span className="font-ui text-xs uppercase tracking-widest text-base-content/80">{circle.name}</span>
      <span className="font-ui text-xs uppercase tracking-widest text-base-content/65">{circle.memberCount}</span>
    </Link>
  )
}

export default function UserPage() {
  const { id } = useParams()
  const user = MOCK_USER // TODO: fetch by id

  return (
    <div className="flex flex-col gap-8">

      {/* Profile header */}
      <div className="flex flex-col gap-4 pb-6 border-b-2 border-base-300">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <img
            src={user.profile.icon}
            alt={user.displayName}
            className="w-20 h-20 object-cover shrink-0"
            style={hexMask}
          />
          {/* Name + handle + pronouns */}
          <div className="flex flex-col gap-1 min-w-0 pt-1">
            <h1 className="font-display text-4xl leading-none tracking-wide">
              {user.displayName}
            </h1>
            <div className="flex items-center gap-3">
              <span className="font-ui text-xs uppercase tracking-widest text-base-content/70">
                {user.id}
              </span>
              {user.profile.pronouns && (
                <span className="font-ui text-xs uppercase tracking-widest text-base-content/65">
                  {user.profile.pronouns}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.profile.description && (
          <p className="font-reading text-base text-base-content/80 leading-relaxed">
            {user.profile.description}
          </p>
        )}

        {/* Links */}
        {user.profile.urls?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {user.profile.urls.map((url) => {
              let display = url
              try { display = new URL(url).hostname.replace(/^www\./, '') } catch {}
              return (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-ui text-xs uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                >
                  {display}
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* Public circles */}
      {MOCK_CIRCLES.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-2xl tracking-wide">Circles</h2>
          <div className="flex flex-wrap gap-2">
            {MOCK_CIRCLES.map((c) => <CircleChip key={c.id} circle={c} />)}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="flex flex-col gap-0">
        <h2 className="font-display text-2xl tracking-wide mb-4">Posts</h2>
        <PostList posts={MOCK_POSTS} ignoreTypeFilter />
      </div>

    </div>
  )
}
