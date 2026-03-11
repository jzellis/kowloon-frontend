// Post type color language and icon mapping.
// Import POST_TYPES anywhere you need colors, icons, or labels for post types.
//
// Colors are intentionally distinct but harmonious — each evokes the nature
// of the content type. Used as left borders on cards, tag backgrounds, and
// icon accent colors throughout the UI.

export const POST_TYPES = {
  Note: {
    label: 'Note',
    icon:  '/post-note.png',
    color: 'oklch(60% 0.15 70deg)',    // warm amber — personal, handwritten
  },
  Article: {
    label: 'Article',
    icon:  '/post-article.png',
    color: 'oklch(48% 0.12 230deg)',   // steel blue — editorial, considered
  },
  Media: {
    label: 'Media',
    icon:  '/post-media.png',
    color: 'oklch(58% 0.12 185deg)',   // teal — visual, immediate
  },
  Link: {
    label: 'Link',
    icon:  '/post-link.png',
    color: 'oklch(52% 0.10 145deg)',   // moss green — outbound, external
  },
  Event: {
    label: 'Event',
    icon:  '/post-event.png',
    color: 'oklch(55% 0.20 25deg)',    // vermillion — urgent, time-based
  },
}

export const POST_TYPE_LIST = Object.values(POST_TYPES)
export const POST_TYPE_NAMES = Object.keys(POST_TYPES)
