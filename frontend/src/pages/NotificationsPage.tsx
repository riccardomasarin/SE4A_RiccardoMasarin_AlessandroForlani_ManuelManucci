import { useEffect, useMemo, useState } from 'react'
import { formatDateTime } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type { NotificationDto } from '../types/nightout'

export function NotificationsPage() {
  const { user } = useSession()
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [markingId, setMarkingId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    nightoutApi
      .getNotifications(user.id)
      .then((data) => {
        setNotifications(data)
        setError('')
      })
      .catch(() => setError('Could not load notifications.'))
      .finally(() => setLoading(false))
  }, [user])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const markAsRead = async (notificationId: number) => {
    setActionError('')
    setMarkingId(notificationId)
    try {
      const updated = await nightoutApi.markNotificationRead(notificationId)
      setNotifications((current) =>
        current.map((notification) => (notification.id === updated.id ? updated : notification)),
      )
    } catch {
      setActionError('Could not mark this notification as read.')
    } finally {
      setMarkingId(null)
    }
  }

  if (loading) {
    return <StateBlock title="Loading notifications" message="Fetching your demo updates." />
  }

  if (error) {
    return <StateBlock title="Notifications unavailable" message={error} />
  }

  return (
    <section className="page-stack">
      <PageHeader title="Notifiche" subtitle={`${unreadCount} unread updates`} />
      {actionError && <p className="inline-error">{actionError}</p>}

      {notifications.length === 0 ? (
        <StateBlock title="No notifications" message="Reservation, pregame, and social updates will appear here." />
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <article className={notification.read ? 'notification-card read' : 'notification-card unread'} key={notification.id}>
              <div>
                <span className="notification-type">{readableType(notification.type)}</span>
                {!notification.read && <span className="unread-dot">Unread</span>}
              </div>
              <strong>{notification.message}</strong>
              <small>{formatDateTime(notification.createdAt)}</small>
              {notification.read ? (
                <span className="read-label">Read</span>
              ) : (
                <button type="button" onClick={() => markAsRead(notification.id)} disabled={markingId === notification.id}>
                  {markingId === notification.id ? 'Marking...' : 'Mark as read'}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function readableType(type: string) {
  return type.replaceAll('_', ' ')
}
