import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatCurrency, formatDateTime, readableGenre } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { MetricCard } from '../components/MetricCard'
import { StateBlock } from '../components/StateBlock'
import { imageForId } from '../components/images'
import { useSession } from '../session'
import type { EventDetailDto } from '../types/nightout'

export function EventDetailPage() {
  const { user } = useSession()
  const { id } = useParams()
  const eventId = Number(id)
  const [event, setEvent] = useState<EventDetailDto | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!eventId) return
    nightoutApi
      .getEvent(eventId)
      .then((data) => {
        setEvent(data)
        setError(false)
      })
      .catch(() => setError(true))
  }, [eventId])

  useEffect(() => {
    if (!eventId || !user) return
    setSaveError('')
    nightoutApi
      .getSavedEvent(user.id, eventId)
      .then((data) => setSaved(data.saved))
      .catch(() => setSaveError('Saved state unavailable.'))
  }, [eventId, user])

  const toggleSaved = async () => {
    if (!user || !event || saving) return
    setSaving(true)
    setSaveError('')
    try {
      const nextState = saved
        ? await nightoutApi.unsaveEvent(user.id, event.id)
        : await nightoutApi.saveEvent(user.id, event.id)
      setSaved(nextState.saved)
    } catch {
      setSaveError('Could not update saved events.')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return <StateBlock title="Event unavailable" message="The backend did not return this event." />
  }

  if (!event) {
    return <StateBlock title="Loading event" message="Opening event details." />
  }

  return (
    <article className="event-detail page-stack">
      <img className="detail-hero" src={imageForId(event.id)} alt="" />
      <div className="detail-title">
        <h1>{event.title}</h1>
        <p>{event.venue.address} · {event.venue.city}</p>
        <div className="chip-row">
          <span className="chip active">{readableGenre(event.musicGenre)}</span>
          <span className="chip">{event.ageRestriction}</span>
          <span className="chip">{event.dressCode}</span>
        </div>
      </div>

      <div className="action-grid">
        <button className={saved ? 'saved' : undefined} type="button" onClick={toggleSaved} disabled={saving}>
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>
        <button type="button">Share</button>
        <Link to={`/transport/${event.id}`}>Syncride</Link>
        <a href={`tel:+3902000000`}>Contact</a>
      </div>
      {saveError && <p className="inline-error">{saveError}</p>}

      <div className="info-grid">
        <MetricCard label="Orario" value={formatDateTime(event.startsAt)} />
        <MetricCard label="Ingresso" value={`${formatCurrency(event.price)} / VIP ${formatCurrency(event.vipPrice)}`} />
        <MetricCard label="Disponibili" value={event.availableSpots} hint={`${event.confirmedTickets} confirmed`} />
        <MetricCard label="Rating" value={`${event.venue.rating} star`} />
      </div>

      <p className="body-copy">{event.description}</p>

      <section className="section-block">
        <h2>Vibe stasera</h2>
        <div className="vibe-bars">
          <Vibe label="Atmosfera" value={event.atmosphereScore} />
          <Vibe label="Musica" value={event.musicScore} />
          <Vibe label="Drink" value={event.drinkScore} />
          <Vibe label="Fila attesa" value={event.lineScore} />
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Pregame collegati</h2>
          <Link to={`/pregames?eventId=${event.id}`}>Vedi</Link>
        </div>
        <div className="compact-list">
          {event.pregames.slice(0, 3).map((room) => (
            <div className="list-tile" key={room.id}>
              <strong>{room.title}</strong>
              <span>{room.currentParticipants} / {room.maxParticipants} persone</span>
            </div>
          ))}
        </div>
      </section>

      <Link className="primary-action sticky-action" to={`/checkout/${event.id}`}>
        Compra biglietto
      </Link>
    </article>
  )
}

function Vibe({ label, value }: { label: string; value: number }) {
  return (
    <div className="vibe-row">
      <span>{label}</span>
      <div><i style={{ width: `${value}%` }} /></div>
    </div>
  )
}
