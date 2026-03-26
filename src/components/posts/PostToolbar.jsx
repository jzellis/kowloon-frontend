// PostToolbar — react, reply, bookmark, and share actions for a post.
// Auth-aware: shows actions only when appropriate.
// Props: post object

import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

export default function PostToolbar({ post }) {
  const { user } = useSelector((state) => state.auth)
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-4 flex-1">
      {/* Reply */}
      <button className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors">
        {t('post.reply')}
      </button>

      {/* React */}
      {user && (
        <button className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors">
          {t('post.react')}
        </button>
      )}

      {/* Bookmark */}
      {user && (
        <button className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors">
          {t('post.bookmark')}
        </button>
      )}

      {/* Share */}
      <button className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors ml-auto">
        {t('post.share')}
      </button>
    </div>
  )
}
