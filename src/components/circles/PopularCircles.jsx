// PopularCircles — sidebar list of popular/featured circles.
// Shows circle icon, name, creator avatar+name, and description.
// Props: circles (array)
// Falls back to mock data if no circles prop passed.

import { Link } from 'react-router-dom'
import UserAvatar from '../ui/UserAvatar'
import CircleIcon from '../ui/CircleIcon'

const MOCK_CIRCLES = [
  {
    id: 'circle:writing@kwln.org',
    name: 'Writing',
    icon: 'https://picsum.photos/seed/writing55/200/200',
    summary: 'Fiction, essays, poetry — all forms welcome. Share your work and get feedback.',
    attributedTo: { id: '@jzellis@kwln.org', username: 'jzellis', displayName: 'Joshua Ellis' },
  },
  {
    id: 'circle:jazz@kwln.org',
    name: 'Jazz & Improvised Music',
    icon: 'https://picsum.photos/seed/jazz11/200/200',
    summary: 'From bebop to free jazz. New recordings, old recordings, gear, theory, gigs.',
    attributedTo: { id: '@recordhead@kwln.org', username: 'recordhead', displayName: 'Record Head' },
  },
  {
    id: 'circle:design@kwln.org',
    name: 'Graphic Design',
    icon: 'https://picsum.photos/seed/design74/200/200',
    summary: 'Typography, print, digital, and everything in between. Modernist sympathizers welcome.',
    attributedTo: { id: '@designthink@kwln.org', username: 'designthink', displayName: 'Design Thinking' },
  },
  {
    id: 'circle:scifi@kwln.org',
    name: 'Science Fiction',
    icon: 'https://picsum.photos/seed/scifi29/200/200',
    summary: 'Books, films, ideas. We take the genre seriously as literature.',
    attributedTo: { id: '@jzellis@kwln.org', username: 'jzellis', displayName: 'Joshua Ellis' },
  },
  {
    id: 'circle:localtech@kwln.org',
    name: 'London Tech',
    icon: 'https://picsum.photos/seed/londontech/200/200',
    summary: 'Tech community in and around London. Events, jobs, projects, rants.',
    attributedTo: { id: '@cityhacker@kwln.org', username: 'cityhacker', displayName: 'City Hacker' },
  },
]

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

function CircleAvatar({ circle }) {
  if (circle.icon) {
    return (
      <img
        src={circle.icon}
        alt={circle.name}
        className="w-9 h-9 object-cover shrink-0 bg-base-300"
        style={hexMask}
      />
    )
  }
  return (
    <div className="w-9 h-9 bg-secondary flex items-center justify-center shrink-0" style={hexMask}>
      <CircleIcon type="circle" size="lg" className="opacity-70 text-secondary-content" />
    </div>
  )
}

export default function PopularCircles({ circles = MOCK_CIRCLES }) {
  return (
    <div className="flex flex-col gap-0">
      <h3 className="font-display text-lg tracking-widest text-base-content mb-3">Popular Circles</h3>
      <ul className="flex flex-col gap-0">
        {circles.map((circle) => (
          <li key={circle.id} className="flex flex-col gap-1.5 py-3 border-b border-base-300 last:border-b-0">
            {/* Circle icon + name */}
            <div className="flex items-center gap-2">
              <CircleAvatar circle={circle} />
              <Link
                to={`/circles/${encodeURIComponent(circle.id)}`}
                className="font-display text-lg leading-tight tracking-wide hover:text-primary transition-colors"
              >
                {circle.name}
              </Link>
            </div>

            {/* Description */}
            {circle.summary && (
              <p className="font-ui text-xs text-base-content/60 leading-relaxed line-clamp-2">
                {circle.summary}
              </p>
            )}

            {/* Creator */}
            {circle.attributedTo && (
              <div className="flex items-center justify-end gap-1.5">
                <UserAvatar user={circle.attributedTo} size="sm" />
                <Link
                  to={`/users/${encodeURIComponent(circle.attributedTo.id)}`}
                  className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-primary transition-colors"
                >
                  {circle.attributedTo.displayName ?? circle.attributedTo.username}
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
