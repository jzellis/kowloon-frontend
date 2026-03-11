// PopularCircles — sidebar list of popular/featured circles.
// Shows circle icon, name, creator avatar+name, and description.
// Props: circles (array)
// Falls back to mock data if no circles prop passed.

import { Link } from 'react-router-dom'
import UserAvatar from '../ui/UserAvatar'

const MOCK_CIRCLES = [
  {
    id: 'circle:writing@kwln.org',
    name: 'Writing',
    icon: null,
    summary: 'Fiction, essays, poetry — all forms welcome. Share your work and get feedback.',
    attributedTo: { id: '@jzellis@kwln.org', username: 'jzellis', displayName: 'Joshua Ellis' },
  },
  {
    id: 'circle:jazz@kwln.org',
    name: 'Jazz & Improvised Music',
    icon: null,
    summary: 'From bebop to free jazz. New recordings, old recordings, gear, theory, gigs.',
    attributedTo: { id: '@recordhead@kwln.org', username: 'recordhead', displayName: 'Record Head' },
  },
  {
    id: 'circle:design@kwln.org',
    name: 'Graphic Design',
    icon: null,
    summary: 'Typography, print, digital, and everything in between. Modernist sympathizers welcome.',
    attributedTo: { id: '@designthink@kwln.org', username: 'designthink', displayName: 'Design Thinking' },
  },
  {
    id: 'circle:scifi@kwln.org',
    name: 'Science Fiction',
    icon: null,
    summary: 'Books, films, ideas. We take the genre seriously as literature.',
    attributedTo: { id: '@jzellis@kwln.org', username: 'jzellis', displayName: 'Joshua Ellis' },
  },
  {
    id: 'circle:localtech@kwln.org',
    name: 'London Tech',
    icon: null,
    summary: 'Tech community in and around London. Events, jobs, projects, rants.',
    attributedTo: { id: '@cityhacker@kwln.org', username: 'cityhacker', displayName: 'City Hacker' },
  },
]

function CircleIcon({ circle }) {
  if (circle.icon) {
    return (
      <img
        src={circle.icon}
        alt={circle.name}
        className="w-9 h-9 object-cover shrink-0 bg-base-300"
      />
    )
  }
  // Fallback: first letter of circle name on primary bg
  return (
    <div className="w-9 h-9 bg-secondary flex items-center justify-center shrink-0">
      <span className="font-display text-lg text-secondary-content">
        {circle.name?.[0]?.toUpperCase()}
      </span>
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
              <CircleIcon circle={circle} />
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
              <div className="flex items-center gap-1.5">
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
