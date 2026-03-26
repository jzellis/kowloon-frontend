// VisibilityTag — badge showing post/object audience visibility.
// Props: visibility (string) — e.g. "Public", "Server", or a circle name

import { useTranslation } from 'react-i18next'

export default function VisibilityTag({ visibility }) {
  const { t } = useTranslation()
  return (
    <span className="font-ui text-xs uppercase tracking-widest px-2 py-0.5 bg-base-200 text-base-content/60 dark:text-base-content/85">
      {t(`visibility.${visibility}`, { defaultValue: visibility ?? t('visibility.Public') })}
    </span>
  )
}
