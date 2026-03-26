// NotificationItem — single notification with type icon, text, timestamp, and actions.
// Props: notification object, onMarkRead (fn), onDismiss (fn)

import { useTranslation } from 'react-i18next'
import Timestamp from '../ui/Timestamp'

const NOTIFICATION_TYPE_KEYS = {
  mention:      'notification.mention',
  react:        'notification.react',
  follow:       'notification.follow',
  circle_invite: 'notification.circleInvite',
  group_invite:  'notification.groupInvite',
  reply:        'notification.reply',
}

export default function NotificationItem({ notification, onMarkRead, onDismiss }) {
  const { t } = useTranslation()
  const key = NOTIFICATION_TYPE_KEYS[notification?.type]
  const label = key ? t(key) : notification?.type

  return (
    <div className={`flex items-start gap-4 py-4 border-b border-base-300 ${!notification?.read ? 'border-l-4 border-l-primary pl-3' : ''}`}>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="font-ui text-xs uppercase tracking-widest text-base-content/50">{label}</span>
        <p className="font-ui text-sm text-base-content">{notification?.message}</p>
        <Timestamp date={notification?.createdAt} />
      </div>
      <div className="flex gap-2 shrink-0">
        {!notification?.read && (
          <button
            onClick={() => onMarkRead?.(notification.id)}
            className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-base-content transition-colors"
          >
            {t('notification.markRead')}
          </button>
        )}
        <button
          onClick={() => onDismiss?.(notification.id)}
          className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-error transition-colors"
        >
          {t('notification.dismiss')}
        </button>
      </div>
    </div>
  )
}
