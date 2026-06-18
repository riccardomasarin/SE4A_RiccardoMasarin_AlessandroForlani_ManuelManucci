import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
        <MetricCard label="Punti" value={profile.user.points} />
      </div>

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
