// PostBody — renders post content.
// Markdown source is rendered to HTML for display.
// Props: post object

export default function PostBody({ post }) {
  // TODO: render post.source (Markdown) to HTML via a markdown parser
  // For now, render source as plain text
  return (
    <div className="font-reading text-base-content leading-relaxed">
      {post?.name && (
        <h2 className="font-display text-3xl mb-3">{post.name}</h2>
      )}
      <p className="whitespace-pre-wrap">{post?.source ?? post?.content}</p>
    </div>
  )
}
