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
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [error, setError] = useState(false)

  const loadTickets = () => {
    if (!user) return
    nightoutApi
      .getTickets(user.id)
      .then((data) => {
        setTickets(data)
        setError(false)
      })
      .catch(() => setError(true))
  }

  useEffect(() => {
    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const cancelTicket = async (ticket: TicketDto) => {
    setActionMessage('')
    setActionError('')
    setCancellingId(ticket.id)
    try {
      await nightoutApi.cancelTicket(ticket.id)
      setActionMessage(`Cancelled ticket for ${ticket.eventTitle}.`)
      loadTickets()
    } catch {
      setActionError('Could not cancel this ticket. It may already be cancelled.')
    } finally {
      setCancellingId(null)
    }
  }

  if (error) {
    return <StateBlock title="Tickets unavailable" message="Could not load tickets from the backend." />
  }

  return (
    <section className="page-stack">
      <PageHeader title="Il mio biglietto" subtitle="Digital confirmations for the demo." />
      {actionMessage && <p className="inline-success">{actionMessage}</p>}
      {actionError && <p className="inline-error">{actionError}</p>}
      {tickets.length === 0 ? (
        <StateBlock title="No tickets yet" message="Open an event and complete the mock purchase flow." />
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <article className={ticket.status === 'CANCELLED' ? 'ticket-row cancelled' : 'ticket-row'} key={ticket.id}>
              <Link to={`/events/${ticket.eventId}`}>
                <strong>{ticket.eventTitle}</strong>
                <span>{formatDateTime(ticket.eventStartsAt)}</span>
                <small>{ticket.code}</small>
              </Link>
              <div className="ticket-row-footer">
                <span className={`status-pill ${ticket.status.toLowerCase().replace('_', '-')}`}>
                  {readableStatus(ticket.status)}
                </span>
                {ticket.status === 'CANCELLED' ? (
                  <small>Reservation cancelled</small>
                ) : (
                  <button type="button" onClick={() => cancelTicket(ticket)} disabled={cancellingId === ticket.id}>
                    {cancellingId === ticket.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function readableStatus(status: TicketDto['status']) {
  return status.replace('_', ' ')
}
