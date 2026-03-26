// NotificationList — list of NotificationItems.
// Props: notifications (array), loading, error, onMarkRead (fn), onDismiss (fn)

import { useTranslation } from 'react-i18next'
import NotificationItem from './NotificationItem'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'

export default function NotificationList({ notifications = [], loading, error, onRetry, onMarkRead, onDismiss }) {
  const { t } = useTranslation()
  if (loading) return <Spinner centered />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!notifications.length) return <EmptyState message={t('notification.empty')} />

  return (
    <div className="flex flex-col">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
