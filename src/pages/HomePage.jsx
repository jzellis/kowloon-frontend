// Home — server landing page for anonymous users; default circle feed for authenticated users.

import { useSelector } from 'react-redux'
import FeedHeader from '../components/posts/FeedHeader'
import PostComposer from '../components/posts/PostComposer'
import PostList from '../components/posts/PostList'

// ── Stub data for mockup ───────────────────────────────────────────────────

const MOCK_CIRCLES = [
  { id: 'circle:following@kwln.org', name: 'Following', summary: 'Everyone you follow' },
  { id: 'circle:friends@kwln.org',   name: 'Friends',   summary: 'Close friends' },
  { id: 'circle:music@kwln.org',     name: 'Music',     summary: 'Music folks' },
  { id: 'circle:tech@kwln.org',      name: 'Tech',      summary: 'Tech & programming' },
  { id: 'circle:art@kwln.org',       name: 'Art',       summary: 'Visual art & design' },
  { id: 'circle:local@kwln.org',     name: 'Local',     summary: 'People nearby' },
]

const MOCK_USER = {
  id: '@jzellis@kwln.org',
  username: 'jzellis',
  displayName: 'Joshua Ellis',
  summary: 'Writer, musician, technologist.',
}

const MOCK_POSTS = [
  {
    id: 'post:1@kwln.org',
    type: 'Note',
    source: 'Just finished reading *The Stars My Destination* for the third time. Still the best science fiction novel ever written, no notes.',
    published: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    visibility: 'Public',
    attributedTo: MOCK_USER,
  },
  {
    id: 'post:2@kwln.org',
    type: 'Article',
    name: 'On the Aesthetics of Midcentury Design',
    source: 'There is something about the graphic design of the 1950s that feels both timeless and urgently contemporary. Reid Miles understood that negative space *is* content — that what you leave out is as important as what you put in.\n\nThis is a lesson most modern UI designers have forgotten entirely.',
    published: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    visibility: 'Public',
    attributedTo: { ...MOCK_USER, id: '@designthink@kwln.org', username: 'designthink', displayName: 'Design Thinking' },
  },
  {
    id: 'post:3@kwln.org',
    type: 'Link',
    name: 'Blue Note Records: The Complete Discography',
    source: 'An absolutely essential resource. Every cover, every session date, every pressing.',
    published: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    visibility: 'Server',
    attributedTo: { ...MOCK_USER, id: '@recordhead@kwln.org', username: 'recordhead', displayName: 'Record Head' },
  },
  {
    id: 'post:4@kwln.org',
    type: 'Event',
    name: 'Kowloon Dev Meetup',
    source: 'Come hang out and talk about federated social networks, indie web, and whatever else. Drinks provided.',
    published: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    visibility: 'Public',
    attributedTo: MOCK_USER,
  },
  {
    id: 'post:5@kwln.org',
    type: 'Media',
    name: 'New track: "Wanchai Drift"',
    source: 'Recorded this late last night. Somewhere between jazz and something else entirely. Let me know what you think.',
    published: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    visibility: 'Public',
    attributedTo: MOCK_USER,
  },
]

const MOCK_CURRENT_CIRCLE = MOCK_CIRCLES[0]

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useSelector((state) => state.auth)

  // TODO: anon users will see the server landing page instead of the feed.
  // Skipped for mockup purposes — remove the comment below to restore auth gating.
  // if (!user) { return <ServerLanding /> }

  return (
    <div className="flex flex-col">
      <FeedHeader
        circles={MOCK_CIRCLES}
        currentCircle={MOCK_CURRENT_CIRCLE}
      />
      <PostComposer />
      <PostList
        posts={MOCK_POSTS}
        page={1}
        totalPages={3}
        onPageChange={() => {}}
      />
    </div>
  )
}
