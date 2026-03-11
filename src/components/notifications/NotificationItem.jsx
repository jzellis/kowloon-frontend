// NotificationItem — single notification with type icon, text, timestamp, and actions.
// Props: notification object, onMarkRead (fn), onDismiss (fn)

import Timestamp from '../ui/Timestamp'

const TYPE_LABELS = {
  mention:      'Mentioned you',
  react:        'Reacted to your post',
  follow:       'Followed you',
  circle_invite: 'Invited you to a circle',
  group_invite:  'Invited you to a group',
  reply:        'Replied to your post',
}

export default function NotificationItem({ notification, onMarkRead, onDismiss }) {
  const label = TYPE_LABELS[notification?.type] ?? notification?.type

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
            Mark read
          </button>
        )}
        <button
          onClick={() => onDismiss?.(notification.id)}
          className="font-ui text-xs uppercase tracking-widest text-base-content/50 hover:text-error transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
