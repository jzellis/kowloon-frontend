// PostPage — single post view with full content and replies.

import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PostCard from '../components/posts/PostCard'
import UserAvatar from '../components/ui/UserAvatar'
import Timestamp from '../components/ui/Timestamp'

const MOCK_POST = {
  id: 'post:2@kwln.org',
  type: 'Article',
  name: 'On the Aesthetics of Midcentury Design',
  source: `There is something about the graphic design of the 1950s that feels both timeless and urgently contemporary. Reid Miles understood that negative space *is* content — that what you leave out is as important as what you put in.

This is a lesson most modern UI designers have forgotten entirely. We live in an era of maximum surface density: every pixel colonised, every margin filled with a notification badge or a call to action. The silence that makes music possible has been designed out of our interfaces.

Look at a Blue Note record sleeve from 1957. The typography is aggressive but controlled. The photography — almost always Francis Wolff's — is cropped to the point of abstraction. There is one thing happening on that cover, and it is happening with total commitment.

## The Grid as Argument

Midcentury designers didn't use grids because they were fashionable. They used grids because a grid is a *position* — a statement that visual relationships are meaningful, that alignment is a form of respect for the reader's eye.

Pick a typeface and mean it. Leave space empty on purpose. Make the thing *say* something.`,
  published: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  visibility: 'Public',
  attributedTo: {
    id: '@designthink@kwln.org',
    username: 'designthink',
    displayName: 'Design Thinking',
    profile: { icon: 'https://picsum.photos/seed/designthink/200/200' },
  },
  replyCount: 3,
  reactCount: 91,
}

const MOCK_REPLIES = [
  {
    id: 'reply:1',
    source: "This is exactly what I've been trying to articulate for years. The grid isn't a constraint — it's a commitment.",
    published: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    attributedTo: { id: '@recordhead@kwln.org', username: 'recordhead', displayName: 'Record Head', profile: { icon: 'https://picsum.photos/seed/recordhead/200/200' } },
  },
  {
    id: 'reply:2',
    source: "The Francis Wolff photography point is so right. Those crops are almost violent in how decisive they are.",
    published: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    attributedTo: { id: '@jzellis@kwln.org', username: 'jzellis', displayName: 'Joshua Ellis', profile: { icon: 'https://picsum.photos/seed/jzellis/200/200' } },
  },
  {
    id: 'reply:3',
    source: "Have you read Müller-Brockmann's own writing on the grid? His explanations of *why* are even better than the posters.",
    published: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    attributedTo: { id: '@cityhacker@kwln.org', username: 'cityhacker', displayName: 'City Hacker', profile: { icon: 'https://picsum.photos/seed/cityhacker/200/200' } },
  },
]

function Reply({ reply }) {
  return (
    <div className="flex gap-3 py-4 border-b border-base-300 last:border-b-0">
      <UserAvatar user={reply.attributedTo} size="sm" />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/users/${encodeURIComponent(reply.attributedTo.id)}`}
            className="font-ui text-sm font-bold text-base-content hover:text-primary transition-colors"
          >
            {reply.attributedTo.displayName}
          </Link>
          <Timestamp date={reply.published} />
        </div>
        <p className="font-reading text-sm text-base-content/80 leading-relaxed">
          {reply.source}
        </p>
      </div>
    </div>
  )
}

export default function PostPage() {
  const { id } = useParams()
  const post = MOCK_POST // TODO: fetch by id

  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/"
        className="flex items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-base-content/40 hover:text-primary transition-colors self-start"
      >
        <ArrowLeft size={13} /> Back
      </Link>

      <PostCard post={post} />

      <div className="flex flex-col gap-0">
        <h2 className="font-display text-2xl tracking-wide text-base-content mb-2">
          {MOCK_REPLIES.length} {MOCK_REPLIES.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <div className="border-t-2 border-base-300">
          {MOCK_REPLIES.map((reply) => (
            <Reply key={reply.id} reply={reply} />
          ))}
        </div>
      </div>
    </div>
  )
}
