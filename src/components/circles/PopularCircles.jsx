// PopularCircles — sidebar list of popular/featured circles.
// Shows circle icon, name, creator avatar+name, and description.
// Props: circles (array)
// Falls back to mock data if no circles prop passed.

import { Link } from 'react-router-dom'
import CircleIcon from '../ui/CircleIcon'

const MOCK_CIRCLES = [
  {
    id: 'circle:writing@kwln.org',
    name: 'Writing',
    icon: 'https://picsum.photos/seed/writing55/200/200',
    summary: 'Fiction, essays, poetry — all forms welcome. Share your work and get feedback.',
    attributedTo: { id: '@jzellis@kwln.org', username: 'jzellis', displayName: 'Joshua Ellis' },
    memberCount: 34,
  },
  {
    id: 'circle:jazz@kwln.org',
    name: 'Jazz & Improvised Music',
    icon: 'https://picsum.photos/seed/jazz11/200/200',
    summary: 'From bebop to free jazz. New recordings, old recordings, gear, theory, gigs.',
    attributedTo: { id: '@recordhead@kwln.org', username: 'recordhead', displayName: 'Record Head' },
    memberCount: 91,
  },
  {
    id: 'circle:design@kwln.org',
    name: 'Graphic Design',
    icon: 'https://picsum.photos/seed/design74/200/200',
    summary: 'Typography, print, digital, and everything in between. Modernist sympathizers welcome.',
    attributedTo: { id: '@designthink@kwln.org', username: 'designthink', displayName: 'Design Thinking' },
    memberCount: 57,
  },
  {
    id: 'circle:scifi@kwln.org',
    name: 'Science Fiction',
    icon: 'https://picsum.photos/seed/scifi29/200/200',
    summary: 'Books, films, ideas. We take the genre seriously as literature.',
    attributedTo: { id: '@jzellis@kwln.org', username: 'jzellis', displayName: 'Joshua Ellis' },
    memberCount: 22,
  },
  {
    id: 'circle:localtech@kwln.org',
    name: 'London Tech',
    icon: 'https://picsum.photos/seed/londontech/200/200',
    summary: 'Tech community in and around London. Events, jobs, projects, rants.',
    attributedTo: { id: '@cityhacker@kwln.org', username: 'cityhacker', displayName: 'City Hacker' },
    memberCount: 143,
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
      <div className="flex items-center gap-2 mb-3" style={{ minHeight: '36px' }}>
        <CircleIcon type="circle" size="lg" className="opacity-50 !w-11 !h-11" />
        <h3 className="font-display text-3xl tracking-wide text-base-content leading-none">Popular Circles</h3>
      </div>
      <ul className="flex flex-col gap-0">
        {circles.map((circle) => (
          <li key={circle.id} className="border-b border-base-300 last:border-b-0 mb-3 last:mb-0">
            <Link to={`/circles/${encodeURIComponent(circle.id)}`} className="flex flex-col gap-2 py-4 px-3 -mx-3 hover:bg-base-300 transition-colors">
            {/* Icon column + text column */}
            <div className="flex items-start gap-2">
              <div className="flex items-center self-start" style={{ minHeight: '36px' }}>
                <CircleAvatar circle={circle} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center" style={{ minHeight: '36px' }}>
                  <span className="font-display text-xl leading-none tracking-wide">
                    {circle.name}
                  </span>
                </div>
                {circle.attributedTo && (
                  <div className="flex items-center gap-1 font-ui text-xs uppercase tracking-widest text-base-content/75">
                    <span className="font-bold">
                      {circle.attributedTo.displayName ?? circle.attributedTo.username}
                    </span>
                    {circle.memberCount > 0 && (
                      <>
                        <span>|</span>
                        <span>{circle.memberCount} members</span>
                      </>
                    )}
                  </div>
                )}
                {circle.summary && (
                  <p className="font-ui text-xs text-base-content/60 leading-relaxed line-clamp-2 mt-1">
                    {circle.summary}
                  </p>
                )}
              </div>
            </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
