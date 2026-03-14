// Home — server landing page for anonymous users; default circle feed for authenticated users.

import { useSelector } from 'react-redux'
import FeedHeader from '../components/posts/FeedHeader'
import PostComposer from '../components/posts/PostComposer'
import PostList from '../components/posts/PostList'

// ── Stub data for mockup ───────────────────────────────────────────────────

const MOCK_CIRCLES = [
  { id: 'circle:following@kwln.org', name: 'Following', summary: 'Everyone you follow',   icon: 'https://picsum.photos/seed/following/200/200' },
  { id: 'circle:friends@kwln.org',   name: 'Friends',   summary: 'Close friends',         icon: 'https://picsum.photos/seed/friends7/200/200' },
  { id: 'circle:music@kwln.org',     name: 'Music',     summary: 'Music folks',           icon: 'https://picsum.photos/seed/music42/200/200' },
  { id: 'circle:tech@kwln.org',      name: 'Tech',      summary: 'Tech & programming',    icon: 'https://picsum.photos/seed/tech19/200/200' },
  { id: 'circle:art@kwln.org',       name: 'Art',       summary: 'Visual art & design',   icon: 'https://picsum.photos/seed/art88/200/200' },
  { id: 'circle:local@kwln.org',     name: 'Local',     summary: 'People nearby',         icon: 'https://picsum.photos/seed/local33/200/200' },
]

const MOCK_USER = {
  id: '@jzellis@kwln.org',
  username: 'jzellis',
  displayName: 'Joshua Ellis',
  summary: 'Writer, musician, technologist.',
}

const H = (n) => new Date(Date.now() - 1000 * 60 * 60 * n).toISOString()
const M = (n) => new Date(Date.now() - 1000 * 60 * n).toISOString()

const AU = { url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/WPGC_-_Jingle_%22Bright_New_Sound%22.ogg', mediaType: 'audio/ogg' }
const VID = { url: 'https://www.w3schools.com/html/mov_bbb.mp4', mediaType: 'video/mp4' }
const IMG = (seed) => ({ url: `https://picsum.photos/seed/${seed}/800/800`, mediaType: 'image/jpeg' })

const DESIGN  = { ...MOCK_USER, id: '@designthink@kwln.org',  username: 'designthink',  displayName: 'Design Thinking' }
const RECORDS = { ...MOCK_USER, id: '@recordhead@kwln.org',   username: 'recordhead',   displayName: 'Record Head'     }
const CITY    = { ...MOCK_USER, id: '@cityhacker@kwln.org',   username: 'cityhacker',   displayName: 'City Hacker'     }

const MOCK_POSTS = [
  {
    id: 'post:1@kwln.org',
    type: 'Note',
    source: 'Just finished reading *The Stars My Destination* for the third time. Still the best science fiction novel ever written, no notes.',
    published: M(14),
    visibility: 'Public',
    attributedTo: MOCK_USER,
  },
  { id: 'post:8@kwln.org',  type: 'Media', published: H(1),   visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Rooftop at golden hour', source: 'The light does something different up here.',
    attachments: [{ ...IMG('roof1') }] },

  { id: 'post:14@kwln.org', type: 'Media', published: H(1.5), visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Sketch: "Harbour Lights"', source: 'Chord changes are still rough but the vibe is there.',
    attachments: [{ ...AU, name: 'Harbour Lights' }] },

  {
    id: 'post:2@kwln.org',
    type: 'Article',
    name: 'On the Aesthetics of Midcentury Design',
    source: 'There is something about the graphic design of the 1950s that feels both timeless and urgently contemporary. Reid Miles understood that negative space *is* content — that what you leave out is as important as what you put in.\n\nThis is a lesson most modern UI designers have forgotten entirely.',
    published: H(2),
    visibility: 'Public',
    attributedTo: DESIGN,
  },
  { id: 'post:20@kwln.org', type: 'Media', published: H(3),  visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Timelapse: setting up the stage', source: 'Four hours in forty seconds.',
    attachments: [{ ...VID, name: 'Stage setup' }] },

  { id: 'post:9@kwln.org',  type: 'Media', published: H(4),  visibility: 'Public', attributedTo: RECORDS,
    name: 'Record fair haul', source: 'Four hours, sore feet, zero regrets.',
    attachments: [{ ...IMG('records2') }] },

  { id: 'post:3@kwln.org',  type: 'Link',  published: H(5),  visibility: 'Server', attributedTo: RECORDS,
    name: 'Blue Note Records: The Complete Discography',
    href: 'https://www.discogs.com/label/3073-Blue-Note-Records',
    source: 'An absolutely essential resource. Every cover, every session date, every pressing.' },

  { id: 'post:15@kwln.org', type: 'Media', published: H(6),  visibility: 'Public', attributedTo: CITY,
    name: 'Field recording: Borough Market', source: 'An hour with a Zoom H5. The acoustics under the railway are extraordinary.',
    attachments: [{ ...AU, name: 'Borough Market' }] },

  { id: 'post:21@kwln.org', type: 'Media', published: H(7),  visibility: 'Public', attributedTo: DESIGN,
    name: 'Type specimen reel', source: "A quick showcase of the new typeface I've been working on.",
    attachments: [{ ...VID, name: 'Type reel' }] },

  { id: 'post:10@kwln.org', type: 'Media', published: H(8),  visibility: 'Public', attributedTo: DESIGN,
    name: 'New poster for the show', source: 'Hand-set type, printed on a Vandercook. Limited run of 50.',
    attachments: [{ ...IMG('poster3') }] },

  { id: 'post:4@kwln.org',  type: 'Event', published: H(10), visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Kowloon Dev Meetup',
    source: 'Come hang out and talk about federated social networks, indie web, and whatever else. Drinks provided.' },

  { id: 'post:5@kwln.org',  type: 'Media', published: H(12), visibility: 'Public', attributedTo: MOCK_USER,
    name: 'New track: "Wanchai Drift"', source: 'Recorded this late last night. Somewhere between jazz and something else entirely. Let me know what you think.',
    attachments: [{ ...AU, name: 'Wanchai Drift' }] },

  { id: 'post:16@kwln.org', type: 'Media', published: H(14), visibility: 'Public', attributedTo: MOCK_USER,
    name: '"Neon District" — full mix', source: 'Three months of evenings. Finally done. Be honest.',
    attachments: [{ ...AU, name: 'Neon District' }] },

  { id: 'post:22@kwln.org', type: 'Media', published: H(16), visibility: 'Public', attributedTo: CITY,
    name: 'Busker at Waterloo', source: "Genuinely one of the best guitar players I've heard in years.",
    attachments: [{ ...VID, name: 'Waterloo busker' }] },

  { id: 'post:11@kwln.org', type: 'Media', published: H(18), visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Studio corner', source: 'Reorganised the whole room. Finally feels right.',
    attachments: [{ ...IMG('studio4') }] },

  { id: 'post:6@kwln.org',  type: 'Media', published: H(20), visibility: 'Public', attributedTo: DESIGN,
    name: 'Reid Miles exhibition — a few photos', source: 'Spent the afternoon at the ICA. These covers hold up like nothing else.',
    attachments: [{ ...IMG('bluenote1'), name: 'Exhibition entrance' }] },

  { id: 'post:17@kwln.org', type: 'Media', published: H(22), visibility: 'Public', attributedTo: RECORDS,
    name: 'Piano improv, Sunday afternoon', source: 'Nothing in particular. Just playing.',
    attachments: [{ ...AU, name: 'Sunday improv' }] },

  { id: 'post:7@kwln.org',  type: 'Media', published: H(24), visibility: 'Public', attributedTo: MOCK_USER,
    name: "Short clip from last night's session", source: 'Just a minute of us warming up but I love how the room sounds.',
    attachments: [{ ...VID, name: 'Session clip' }] },

  { id: 'post:23@kwln.org', type: 'Media', published: H(26), visibility: 'Public', attributedTo: DESIGN,
    name: 'Process: screen printing', source: 'First time using a proper press. Completely addicted now.',
    attachments: [{ ...VID, name: 'Screen printing' }] },

  { id: 'post:12@kwln.org', type: 'Media', published: H(28), visibility: 'Public', attributedTo: CITY,
    name: 'Fog on the Thames', source: 'Early morning walk paid off.',
    attachments: [{ ...IMG('thames5') }] },

  { id: 'post:18@kwln.org', type: 'Media', published: H(30), visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Demo: "Last Train North"', source: 'Vocals are temp. Everything else is pretty much final.',
    attachments: [{ ...AU, name: 'Last Train North' }] },

  { id: 'post:24@kwln.org', type: 'Media', published: H(32), visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Gear rundown', source: 'People keep asking so here it is. Nothing fancy.',
    attachments: [{ ...VID, name: 'Gear rundown' }] },

  { id: 'post:13@kwln.org', type: 'Media', published: H(34), visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Bookshelf reorganisation', source: 'By colour was a mistake. By subject was worse. Back to by author.',
    attachments: [{ ...IMG('books6') }] },

  { id: 'post:19@kwln.org', type: 'Media', published: H(36), visibility: 'Public', attributedTo: MOCK_USER,
    name: 'Live at the Barbican — excerpt', source: 'Someone in the audience recorded this. Not bad for a phone.',
    attachments: [{ ...AU, name: 'Barbican excerpt' }] },

  { id: 'post:25@kwln.org', type: 'Media', published: H(40), visibility: 'Public', attributedTo: CITY,
    name: 'Walking tour: Shoreditch murals', source: 'Half of these will be gone in six months. Wanted to document them.',
    attachments: [{ ...VID, name: 'Shoreditch murals' }] },
]

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useSelector((state) => state.auth)
  const { circleId } = useSelector((state) => state.feed)
  const currentCircle = MOCK_CIRCLES.find((c) => c.id === circleId) ?? MOCK_CIRCLES[0]

  // TODO: anon users will see the server landing page instead of the feed.
  // Skipped for mockup purposes — remove the comment below to restore auth gating.
  // if (!user) { return <ServerLanding /> }

  return (
    <div className="flex flex-col">
      <FeedHeader
        circles={MOCK_CIRCLES}
        currentCircle={currentCircle}
      />
      <PostComposer circles={MOCK_CIRCLES} />
      <PostList
        posts={MOCK_POSTS}
        page={1}
        totalPages={3}
        onPageChange={() => {}}
      />
    </div>
  )
}
