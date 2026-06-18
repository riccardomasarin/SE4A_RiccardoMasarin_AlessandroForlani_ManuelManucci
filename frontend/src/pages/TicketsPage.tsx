import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDateTime } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type { TicketDto } from '../types/nightout'

export function TicketsPage() {
  const { user } = useSession()
  const [tickets, setTickets] = useState<TicketDto[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user) return
    nightoutApi.getTickets(user.id).then(setTickets).catch(() => setError(true))
  }, [user])

  if (error) {
    return <StateBlock title="Tickets unavailable" message="Could not load tickets from the backend." />
  }

  return (
    <section className="page-stack">
      <PageHeader title="Il mio biglietto" subtitle="Digital confirmations for the demo." />
      {tickets.length === 0 ? (
        <StateBlock title="No tickets yet" message="Open an event and complete the mock purchase flow." />
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <Link className="ticket-row" to={`/events/${ticket.eventId}`} key={ticket.id}>
              <strong>{ticket.eventTitle}</strong>
              <span>{ticket.status} · {formatDateTime(ticket.eventStartsAt)}</span>
              <small>{ticket.code}</small>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
