// DiscoveryShelf — one Discover shelf: a section title/blurb over a horizontally
// scrolling row of DiscoveryCards. Web counterpart of the mobile DiscoveryShelf.
//
// `onDark` renders the shelf as a translucent-black panel with white text, for
// the Discover screen's blurred-hero background.
// A `contentType === 'media'` section renders DiscoverMediaTiles instead of cards.

import DiscoveryCard from './DiscoveryCard'
import DiscoverMediaTile from './DiscoverMediaTile'

export default function DiscoveryShelf({ section, baseUrl, onDark }) {
  if (!section?.items?.length) return null
  const isMedia = section.contentType === 'media'

  return (
    <div className={onDark ? 'mb-4 bg-black/45 pt-4 pb-3' : 'mb-8'}>
      <div className={`mb-3 ${onDark ? 'px-4' : ''}`}>
        <h2 className={`font-display text-2xl tracking-wide leading-tight ${onDark ? 'text-white' : ''}`}>
          {section.name}
        </h2>
        {section.summary && (
          <p className={`font-ui text-xs mt-0.5 line-clamp-2 ${onDark ? 'text-white/70' : 'text-base-content/55'}`}>
            {section.summary}
          </p>
        )}
      </div>
      {/* Horizontal shelf — scrolls within its own track, never the page body. */}
      <div className={`flex gap-3 overflow-x-auto pb-2 ${onDark ? 'px-4' : '-mx-1 px-1'}`}>
        {section.items.map((item, i) =>
          isMedia ? (
            <DiscoverMediaTile
              key={`${item.id}:${i}`}
              item={item}
              size={150}
              baseUrl={baseUrl}
              showAuthor
            />
          ) : (
            <DiscoveryCard key={`${item.id}:${i}`} item={item} baseUrl={baseUrl} onDark={onDark} />
          )
        )}
      </div>
    </div>
  )
}
