// PicsComposeFab — pics.<domain>'s "new post" button. Visually matches the
// main site's ComposeFab collapsed state (square plum button, bottom-right),
// but skips its fan-out type picker entirely — there's only one type here.
// Tapping it opens PostComposer directly, locked to Media with an image-only
// file picker that opens itself.

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import PostComposer from '../components/posts/PostComposer'

export default function PicsComposeFab({ onPostCreated }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="sticky z-30 flex justify-end items-end pointer-events-none h-14"
        style={{
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('composer.newPost', { defaultValue: 'New post' })}
          className="pointer-events-auto w-14 h-14 bg-primary text-primary-content flex items-center justify-center shadow-lg hover:bg-primary/90 active:bg-primary/80 transition-colors"
        >
          <Plus size={26} strokeWidth={2} />
        </button>
      </div>

      <PostComposer
        hideTrigger
        open={open}
        onOpenChange={setOpen}
        initialValues={{ type: 'Media', to: '@public' }}
        lockType
        autoOpenFilePicker
        mediaAccept="image/*"
        onPostCreated={() => { setOpen(false); onPostCreated?.() }}
        prompt={t('pics.composerPrompt', { defaultValue: 'Add a photo…' })}
      />
    </>
  )
}
