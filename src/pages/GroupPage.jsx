// GroupPage — group info, PostComposer (no audience picker), and post feed.

import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, ExternalLink, Users } from 'lucide-react'
import PostList from '../components/posts/PostList'
import PostComposer from '../components/posts/PostComposer'
import CircleIcon from '../components/ui/CircleIcon'

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

const MOCK_GROUP = {
  id: 'group:jazz@kwln.org',
  name: 'London Jazz Society',
  icon: 'https://picsum.photos/seed/jazzgroup/200/200',
  description: 'A community for jazz lovers in London and beyond. Live music listings, recordings, discussion, and the occasional argument about whether fusion counts.',
  location: { name: 'London, UK' },
  memberCount: 214,
  urls: ['https://londonjazzsociety.co.uk', 'https://ra.co/promoters/londonjazz'],
  rsvpPolicy: 'open',
}

const H = (n) => new Date(Date.now() - 1000 * 60 * 60 * n).toISOString()

const AUTHOR = { id: '@recordhead@kwln.org', username: 'recordhead', displayName: 'Record Head', profile: { icon: 'https://picsum.photos/seed/recordhead/200/200' } }
const AUTHOR2 = { id: '@jzellis@kwln.org', username: 'jzellis', displayName: 'Joshua Ellis', profile: { icon: 'https://picsum.photos/seed/jzellis/200/200' } }

const MOCK_POSTS = [
  {
    id: 'post:26@kwln.org',
    type: 'Event',
    name: 'Blue Note at The Jazz Cafe',
    source: 'A night of classic Blue Note repertoire performed live by the Blue Note Collective. Two sets. No support act. Come early for a seat.',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    endTime:   new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 3).toISOString(),
    location:  { type: 'Place', name: 'The Jazz Cafe, Camden Town, London' },
    published: H(6),
    visibility: 'Public',
    attributedTo: AUTHOR,
  },
  {
    id: 'post:3@kwln.org',
    type: 'Link',
    name: 'Blue Note Records: The Complete Discography',
    source: 'An absolutely essential resource. Every cover, every session date, every pressing.',
    href: 'https://www.discogs.com/label/3073-Blue-Note-Records',
    published: H(12),
    visibility: 'Public',
    attributedTo: AUTHOR,
  },
  {
    id: 'post:note1@kwln.org',
    type: 'Note',
    source: "Anyone catch Empirical at Ronnie's last night? That set in the second half was something else entirely.",
    published: H(20),
    visibility: 'Public',
    attributedTo: AUTHOR2,
  },
]

const POLICY_LABELS = {
  open: 'Open — anyone can join',
  serverOpen: 'Server members only',
  serverApproval: 'Server members, approval required',
  approvalOnly: 'Approval required',
}

export default function GroupPage() {
  const { id } = useParams()
  const group = MOCK_GROUP // TODO: fetch by id
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-8">

      {/* Group header */}
      <div className="flex flex-col gap-4 pb-6 border-b-2 border-base-300">
        <div className="flex items-start gap-4">
          {/* Icon */}
          {group.icon
            ? <img src={group.icon} alt={group.name} className="w-20 h-20 object-cover shrink-0" style={hexMask} />
            : <div className="w-20 h-20 bg-secondary flex items-center justify-center shrink-0" style={hexMask}>
                <CircleIcon type="group" size="lg" className="text-secondary-content opacity-70" />
              </div>
          }
          {/* Name + meta */}
          <div className="flex flex-col gap-1.5 min-w-0 pt-1 flex-1">
            <h1 className="font-display text-4xl leading-none tracking-wide">{group.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs uppercase tracking-widest text-base-content/50">
              <span className="flex items-center gap-1">
                <Users size={11} />
                {group.memberCount.toLocaleString()} members
              </span>
              {group.location?.name && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {group.location.name}
                </span>
              )}
              <span>{POLICY_LABELS[group.rsvpPolicy]}</span>
            </div>
          </div>
          {/* Join button */}
          <button className="shrink-0 px-4 py-2 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest hover:opacity-90 transition-opacity mt-1">
            {t('group.join')}
          </button>
        </div>

        {/* Description */}
        {group.description && (
          <p className="font-reading text-base text-base-content/80 leading-relaxed">
            {group.description}
          </p>
        )}

        {/* URLs */}
        {group.urls?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {group.urls.map((url) => {
              let display = url
              try { display = new URL(url).hostname.replace(/^www\./, '') } catch {}
              return (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-ui text-xs uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                >
                  <ExternalLink size={11} />
                  {display}
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* Composer — no audience picker, posts go to group */}
      <PostComposer />

      {/* Posts */}
      <PostList posts={MOCK_POSTS} ignoreTypeFilter />

    </div>
  )
}
