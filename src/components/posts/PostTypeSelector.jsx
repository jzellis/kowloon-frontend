// PostTypeSelector — choose post type when creating a new post.
// Uses the type color language and real icons.
// Props: value (string), onChange (fn)

import { useTranslation } from 'react-i18next'
import { POST_TYPE_NAMES, POST_TYPES } from '../../lib/postTypes'
import PostTypeIcon from '../ui/PostTypeIcon'

export default function PostTypeSelector({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-0">
      {POST_TYPE_NAMES.map((type) => {
        const config = POST_TYPES[type]
        const active = value === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            title={t(`postTypes.${type}`, { defaultValue: config.label })}
            className={`flex items-center gap-2 px-3 py-2 font-ui text-xs uppercase tracking-widest transition-colors border-r border-base-300 last:border-r-0 ${
              active ? 'text-base-content' : 'text-base-content/50 hover:text-base-content/80'
            }`}
            style={active ? { borderBottom: `3px solid ${config.color}` } : {}}
          >
            <PostTypeIcon type={type} size="sm" />
            {active && <span>{t(`postTypes.${type}`, { defaultValue: config.label })}</span>}
          </button>
        )
      })}
    </div>
  )
}
