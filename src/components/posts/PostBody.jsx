// PostBody — renders post content.
// Handles type-specific rendering: linked titles for Link posts, media attachments for Media posts.
// Props: post object

import { marked } from 'marked'

marked.use({ breaks: true, gfm: true })

function LinkTitle({ post }) {
  let domain = null
  if (post.href) {
    try { domain = new URL(post.href).hostname.replace(/^www\./, '') } catch {}
  }

  return (
    <div className="mb-3">
      <h2 className="font-display text-3xl">
        {post.href
          ? <a href={post.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{post.name}</a>
          : post.name
        }
      </h2>
      {domain && (
        <p className="font-ui text-xs uppercase tracking-widest text-base-content/40 mt-0.5">{domain}</p>
      )}
    </div>
  )
}


function Attachments({ attachments = [] }) {
  if (!attachments.length) return null
  return (
    <div className="flex flex-col gap-2 mt-3">
      {attachments.map((a, i) => {
        const mt = a.mediaType ?? ''
        if (mt.startsWith('image/')) {
          return (
            <img
              key={i}
              src={a.url}
              alt={a.name ?? ''}
              className="w-full object-cover max-h-96"
            />
          )
        }
        if (mt.startsWith('audio/')) {
          return (
            <audio key={i} controls className="w-full mt-1">
              <source src={a.url} type={mt} />
            </audio>
          )
        }
        if (mt.startsWith('video/')) {
          return (
            <video key={i} controls className="w-full max-h-96 object-contain bg-black">
              <source src={a.url} type={mt} />
            </video>
          )
        }
        // Generic file attachment
        return (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-xs uppercase tracking-widest text-primary hover:opacity-80"
          >
            {a.name ?? a.url}
          </a>
        )
      })}
    </div>
  )
}

export default function PostBody({ post }) {
  const raw  = post?.source ?? post?.content ?? ''
  const html = marked.parse(raw)
  const isLink = post?.type === 'Link'

  return (
    <div className="font-reading text-base-content leading-relaxed">
      {post?.name && (
        isLink
          ? <LinkTitle post={post} />
          : <h2 className="font-display text-3xl mb-3">{post.name}</h2>
      )}
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {post?.attachments?.length > 0 && <Attachments attachments={post.attachments} />}
    </div>
  )
}
