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
// Future date helpers: F(daysFromNow, hourOfDay)
const F = (days, hour = 19) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

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
    source: `There is something about the graphic design of the 1950s that feels both timeless and urgently contemporary. Reid Miles understood that negative space *is* content — that what you leave out is as important as what you put in.

This is a lesson most modern UI designers have forgotten entirely. We live in an era of maximum surface density: every pixel colonised, every margin filled with a notification badge or a call to action. The silence that makes music possible has been designed out of our interfaces.

Look at a Blue Note record sleeve from 1957. The typography is aggressive but controlled. The photography — almost always Francis Wolff's — is cropped to the point of abstraction. There is one thing happening on that cover, and it is happening with total commitment. This is not minimalism in the contemporary sense, which is usually just maximalism with the colour drained out. It is *discipline*.

> The job of the designer is not to give the public what it wants. The job of the designer is to invent things that the public didn't know it needed, and then make it impossible for the public to imagine life without them.

## The Grid as Argument

Midcentury designers didn't use grids because they were fashionable. They used grids because a grid is a *position* — a statement that visual relationships are meaningful, that alignment is a form of respect for the reader's eye. Josef Müller-Brockmann's concert posters work not because they are beautiful, which they are, but because they are *argued*. Every element is where it is for a reason you can state out loud.

Contrast this with the dominant aesthetic of contemporary software design, which might be described as *ambient vagueness*: rounded rectangles, drop shadows that don't correspond to any light source, gradients that gesture at depth without committing to it. The visual language says *nothing*. It is designed to offend no one, which means it moves no one.

## What This Means For Us

If we are building something — a publication, a social space, a tool — we owe it to the people who will use it to have an opinion about how it looks. Not a brand identity. An *opinion*. A point of view that the design expresses whether or not anyone reads the about page.

The 1950s designers had constraints we don't: two colours, one typeface, no computers. Those constraints forced decisions. We have to impose the constraints ourselves. That is harder. It requires something closer to taste than to process, which is why most design-by-committee produces work that looks like it was designed by a committee.

Pick a typeface and mean it. Leave space empty on purpose. Make the thing *say* something.`,
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

  {
    id: 'post:4@kwln.org',
    type: 'Event',
    published: H(10),
    visibility: 'Public',
    attributedTo: MOCK_USER,
    name: 'Kowloon Dev Meetup #4',
    source: `Come hang out and talk federated social networks, indie web, ActivityPub, and whatever else you're building. This month we'll have a short demo slot — bring something to show, even if it's half-broken.

Food and drinks provided. Capacity is limited so please RSVP.`,
    startTime: F(8, 18),
    endTime:   F(8, 21),
    location:  { type: 'Place', name: 'The Barbican Centre, Silk St, London EC2Y 8DS' },
    featuredImage: 'https://picsum.photos/seed/barbican7/1200/600',
    tag: [
      { type: 'Hashtag', name: '#indieweb' },
      { type: 'Hashtag', name: '#activitypub' },
      { type: 'Hashtag', name: '#kowloon' },
    ],
  },
  {
    id: 'post:26@kwln.org',
    type: 'Event',
    published: H(6),
    visibility: 'Public',
    attributedTo: RECORDS,
    name: 'Blue Note at The Jazz Cafe',
    source: `A night of classic Blue Note repertoire — Monk, Coltrane, Miles, Lee Morgan — performed live by the **Blue Note Collective**, a rotating ensemble of London session musicians who know how to swing.

Two sets. No support act. Come early for a seat.

*"The only valid censorship of ideas is the right of people not to listen."* — Tommy Smalls`,
    startTime: F(14, 20),
    endTime:   F(14, 23),
    location:  { type: 'Place', name: 'The Jazz Cafe, 5 Parkway, Camden Town, London NW1 7PG' },
    featuredImage: 'https://picsum.photos/seed/jazzclub2/1200/600',
    tag: [
      { type: 'Hashtag', name: '#jazz' },
      { type: 'Hashtag', name: '#bluenote' },
      { type: 'Hashtag', name: '#livemusic' },
      { type: 'Hashtag', name: '#camden' },
    ],
  },

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
