// Post type color language and icon mapping.
// Import POST_TYPES anywhere you need colors, icons, or labels for post types.
//
// Colors are intentionally distinct but harmonious — each evokes the nature
// of the content type. Used as left borders on cards, tag backgrounds, and
// icon accent colors throughout the UI.

export const POST_TYPES = {
  Note:    { label: 'Note',    color: '#b76c00' },
  Article: { label: 'Article', color: '#006893' },
  Media:   { label: 'Media',   color: '#009084' },
  Link:    { label: 'Link',    color: '#417843' },
  Event:   { label: 'Event',   color: '#cc272e' },
}

export const POST_TYPE_LIST = Object.values(POST_TYPES)
export const POST_TYPE_NAMES = Object.keys(POST_TYPES)
