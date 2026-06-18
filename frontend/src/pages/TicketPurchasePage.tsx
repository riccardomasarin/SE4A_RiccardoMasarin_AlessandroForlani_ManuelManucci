import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type { EventDetailDto, TicketDto } from '../types/nightout'

export function TicketPurchasePage() {
  const { user } = useSession()
  const { eventId } = useParams()
  const id = Number(eventId)
  const [event, setEvent] = useState<EventDetailDto | null>(null)
  const [ticketType, setTicketType] = useState('Standard')
  const [createdTicket, setCreatedTicket] = useState<TicketDto | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      nightoutApi.getEvent(id).then(setEvent).catch(() => setError('Event not available.'))
    }
  }, [id])

  async function buyTicket() {
    if (!user || !event) return
    setError('')
    try {
      const ticket = await nightoutApi.requestTicket({
        userId: user.id,
        eventId: event.id,
        ticketType,
        salesChannel: user.role === 'PR_MANAGER' ? user.name : 'NightOut App',
      })
      setCreatedTicket(ticket)
    } catch {
      setError('Ticket request rejected. You may already have an active ticket for this event.')
    }
  }

  if (!event) {
    return <StateBlock title="Loading checkout" message="Preparing the mock purchase flow." />
  }

  if (createdTicket) {
    return (
      <section className="ticket-screen page-stack">
        <h1>Il mio biglietto</h1>
        <article className="ticket-card">
          <div className="ticket-band">
            <div>
              <h2>{createdTicket.ticketType}</h2>
              <p>NightOut · Biglietto digitale</p>
            </div>
            <span>{createdTicket.status}</span>
          </div>
          <div className="ticket-body">
            <h2>{createdTicket.eventTitle}</h2>
            <p>{createdTicket.venueAddress}</p>
            <div className="ticket-grid">
              <span>Data<strong>{formatDateTime(createdTicket.eventStartsAt)}</strong></span>
              <span>Accesso<strong>{createdTicket.ticketType}</strong></span>
              <span>Biglietto<strong>{createdTicket.code}</strong></span>
              <span>Canale<strong>{createdTicket.salesChannel}</strong></span>
            </div>
            <div className="qr-box">{createdTicket.qrPayload}</div>
          </div>
        </article>
        <Link className="secondary-action" to="/tickets">Vai ai miei ticket</Link>
      </section>
    )
  }

  return (
    <section className="checkout page-stack">
      <h1>Ticket mock flow</h1>
      <article className="checkout-card">
        <h2>{event.title}</h2>
        <p>{event.venue.name} · {formatDateTime(event.startsAt)}</p>

        <div className="ticket-options">
          <button
            className={ticketType === 'Standard' ? 'selected' : ''}
            type="button"
            onClick={() => setTicketType('Standard')}
          >
            Standard <strong>{formatCurrency(event.price)}</strong>
          </button>
          <button
            className={ticketType === 'VIP' ? 'selected' : ''}
            type="button"
            onClick={() => setTicketType('VIP')}
          >
            VIP <strong>{formatCurrency(event.vipPrice)}</strong>
          </button>
        </div>

        <p className="body-copy">No real payment is processed. The backend creates a simulated ticket or waiting-list entry.</p>
        {error && <p className="inline-error">{error}</p>}
        <button className="primary-action" type="button" onClick={buyTicket}>Confirm mock purchase</button>
      </article>
    </section>
  )
}
