// RichTextEditor — TipTap WYSIWYG editor with Markdown output.
// Supports bold, italic, underline, and links. No unsafe HTML.
// Props: content (Markdown string), onChange (fn — called with Markdown string)

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'

function ToolbarButton({ onClick, active, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`px-3 py-1.5 font-ui text-xs uppercase tracking-widest transition-colors ${
        active
          ? 'bg-primary text-primary-content'
          : 'bg-base-200 text-base-content/70 hover:bg-base-300'
      }`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ content = '', onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Markdown,
    ],
    content,
    onUpdate({ editor }) {
      onChange?.(editor.storage.markdown.getMarkdown())
    },
  })

  if (!editor) return null

  return (
    <div className="border-2 border-base-300 focus-within:border-primary transition-colors">
      {/* Toolbar */}
      <div className="flex gap-0 border-b-2 border-base-300 bg-base-200">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          B
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          I
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          U
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('URL')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          active={editor.isActive('link')}
        >
          Link
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} active={false}>
            Unlink
          </ToolbarButton>
        )}
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="font-reading text-base-content p-4 min-h-32 prose max-w-none focus:outline-none"
      />
    </div>
  )
}
