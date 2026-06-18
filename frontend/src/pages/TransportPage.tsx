import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatCurrency, formatTime } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import type { EventSummaryDto, ReturnTransportDto } from '../types/nightout'

export function TransportPage() {
  const { eventId } = useParams()
  const selectedEventId = eventId ? Number(eventId) : undefined
  const [events, setEvents] = useState<EventSummaryDto[]>([])
  const [options, setOptions] = useState<ReturnTransportDto[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    nightoutApi.getEvents({ city: 'Milano' }).then(setEvents).catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (!selectedEventId) {
      setOptions([])
      return
    }
    nightoutApi.getTransport(selectedEventId).then(setOptions).catch(() => setError(true))
  }, [selectedEventId])

  if (error) {
    return <StateBlock title="Syncride unavailable" message="Could not load the transport placeholder data." />
  }

  return (
    <section className="page-stack">
      <PageHeader title="Syncride" subtitle="Return transport placeholder for the demo." />

      <section className="transport-panel">
        <h2>{selectedEventId ? 'Return options' : 'Choose an event'}</h2>
        <p>No external transport provider is integrated yet. These routes come from the Spring Boot seed data.</p>
      </section>

      {!selectedEventId && (
        <div className="compact-list">
          {events.map((event) => (
            <Link className="list-tile" to={`/transport/${event.id}`} key={event.id}>
              <strong>{event.title}</strong>
              <span>{event.venueName}</span>
            </Link>
          ))}
        </div>
      )}

      {selectedEventId && options.length === 0 && (
        <StateBlock title="No route yet" message="This event has no Syncride placeholder option in the demo data." />
      )}

      <div className="compact-list">
        {options.map((option) => (
          <article className="transport-card" key={option.id}>
            <div>
              <strong>{option.provider}</strong>
              <span>{option.label}</span>
            </div>
            <p>{formatTime(option.pickupTime)} from {option.pickupPoint}</p>
            <p>To {option.destinationArea} - {formatCurrency(option.price)}</p>
            <small>{option.status}</small>
          </article>
        ))}
      </div>
    </section>
  )
}
