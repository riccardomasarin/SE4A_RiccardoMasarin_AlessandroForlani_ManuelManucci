import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDateTime, readableGenre } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type { ProfileDto } from '../types/nightout'

export function ProfilePage() {
  const { user, resetRole } = useSession()
  const [profile, setProfile] = useState<ProfileDto | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user) return
    nightoutApi.getProfile(user.id).then(setProfile).catch(() => setError(true))
  }, [user])

  if (error) {
    return <StateBlock title="Profile unavailable" message="Could not load profile data." />
  }

  if (!profile) {
    return <StateBlock title="Loading profile" message="Fetching demo account data." />
  }

  return (
    <section className="page-stack">
      <PageHeader title="Profilo" action={<button className="small-action" type="button" onClick={resetRole}>Esci</button>} />
      <article className="profile-card">
        <div className="profile-avatar">{profile.user.name.slice(0, 1)}</div>
        <div>
          <h2>{profile.user.name}</h2>
          <p>{profile.user.verified ? 'Verificato' : 'Demo'} - {profile.user.city}</p>
        </div>
      </article>

      <div className="manager-grid">
        <MetricCard label="Serate" value={profile.attendedNights} />
        <MetricCard label="Ticket" value={profile.activeTickets} />
        <MetricCard label="Salvati" value={profile.savedEvents.length} />
        <MetricCard label="Punti" value={profile.user.points} />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <h2>Eventi salvati</h2>
          <span>{profile.savedEvents.length} totali</span>
        </div>
        <div className="compact-list">
          {profile.savedEvents.length === 0 ? (
            <div className="list-tile">
              <strong>Nessun evento salvato</strong>
              <span>Salva una serata dalla pagina evento per ritrovarla qui.</span>
            </div>
          ) : (
            profile.savedEvents.map((event) => (
              <Link className="list-tile saved-event-tile" to={`/events/${event.id}`} key={event.id}>
                <strong>{event.title}</strong>
                <span>{event.venueName} - {formatDateTime(event.startsAt)}</span>
                <span>{readableGenre(event.musicGenre)} - {event.price === 0 ? 'Free' : formatCurrency(event.price)}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="section-block">
        <h2>Biglietti e notifiche</h2>
        <div className="compact-list">
          <Link className="list-tile" to="/tickets">
            <strong>Biglietti attivi</strong>
            <span>{profile.tickets.length} nel profilo</span>
          </Link>
          {profile.notifications.slice(0, 3).map((notification) => (
            <div className="list-tile" key={notification.id}>
              <strong>{notification.type}</strong>
              <span>{notification.message}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
