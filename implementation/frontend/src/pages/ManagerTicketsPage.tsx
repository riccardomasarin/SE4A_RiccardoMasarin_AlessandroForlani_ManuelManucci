import { useEffect, useMemo, useState } from 'react'
import {
  formatCurrency,
  formatDateTime,
} from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type { TicketDto } from '../types/nightout'

type TicketStatusFilter =
  | 'ALL'
  | 'CONFIRMED'
  | 'WAITING_LIST'
  | 'PENDING'
  | 'CANCELLED'

export function ManagerTicketsPage() {
  const { user } = useSession()

  const [tickets, setTickets] = useState<TicketDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>('ALL')
  const [ticketTypeFilter, setTicketTypeFilter] =
    useState('ALL')
  const [selectedTicket, setSelectedTicket] =
    useState<TicketDto | null>(null)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    setError('')

    nightoutApi
      .getManagerTickets(user.id)
      .then((data) => {
        setTickets(data)
      })
      .catch(() => {
        setError(
          'Could not load venue tickets. Check that the backend is running.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

  const ticketTypes = useMemo(() => {
    return Array.from(
      new Set(
        tickets
          .map((ticket) => ticket.ticketType)
          .filter(Boolean),
      ),
    )
  }, [tickets])

  const filteredTickets = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.code
          .toLowerCase()
          .includes(normalizedSearch) ||
        ticket.userName
          .toLowerCase()
          .includes(normalizedSearch) ||
        ticket.eventTitle
          .toLowerCase()
          .includes(normalizedSearch) ||
        ticket.qrPayload
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'ALL' ||
        ticket.status === statusFilter

      const matchesType =
        ticketTypeFilter === 'ALL' ||
        ticket.ticketType === ticketTypeFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      )
    })
  }, [
    tickets,
    search,
    statusFilter,
    ticketTypeFilter,
  ])

  const confirmedTickets = tickets.filter(
    (ticket) => ticket.status === 'CONFIRMED',
  ).length

  const waitingListTickets = tickets.filter(
    (ticket) =>
      ticket.status === 'WAITING_LIST',
  ).length

  const cancelledTickets = tickets.filter(
    (ticket) => ticket.status === 'CANCELLED',
  ).length

  const totalRevenue = tickets
    .filter(
      (ticket) =>
        ticket.status === 'CONFIRMED',
    )
    .reduce(
      (total, ticket) =>
        total + ticket.pricePaid,
      0,
    )

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setTicketTypeFilter('ALL')
  }

  if (!user) {
    return (
      <StateBlock
        title="Access denied"
        message="You must be logged in as a venue manager."
      />
    )
  }

  if (loading) {
    return (
      <StateBlock
        title="Loading tickets"
        message="Fetching venue ticket data."
      />
    )
  }

  return (
    <section className="page-stack manager-tickets-page">
      <PageHeader
        title="Tickets"
        subtitle="Manage sold tickets and waiting-list entries."
      />

      {error && (
        <p className="inline-error">{error}</p>
      )}

      <section className="manager-ticket-summary">
        <div>
          <span>Total tickets</span>
          <strong>{tickets.length}</strong>
        </div>

        <div>
          <span>Confirmed</span>
          <strong>{confirmedTickets}</strong>
        </div>

        <div>
          <span>Waiting list</span>
          <strong>{waitingListTickets}</strong>
        </div>

        <div>
          <span>Cancelled</span>
          <strong>{cancelledTickets}</strong>
        </div>

        <div>
          <span>Confirmed revenue</span>
          <strong>
            {formatCurrency(totalRevenue)}
          </strong>
        </div>
      </section>

      <section className="manager-ticket-toolbar">
        <label className="manager-ticket-search">
          <span>Search tickets</span>

          <input
            type="search"
            placeholder="Search by name, ticket code, event or QR..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>

        <label>
          <span>Status</span>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as TicketStatusFilter,
              )
            }
          >
            <option value="ALL">
              All statuses
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="WAITING_LIST">
              Waiting list
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </label>

        <label>
          <span>Ticket type</span>

          <select
            value={ticketTypeFilter}
            onChange={(event) =>
              setTicketTypeFilter(
                event.target.value,
              )
            }
          >
            <option value="ALL">
              All ticket types
            </option>

            {ticketTypes.map((type) => (
              <option
                value={type}
                key={type}
              >
                {type}
              </option>
            ))}
          </select>
        </label>

        <button
          className="secondary-action"
          type="button"
          onClick={resetFilters}
        >
          Reset filters
        </button>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Sold tickets</h2>

            <p className="section-description">
              Confirmed, pending, waiting-list
              and cancelled tickets.
            </p>
          </div>

          <span>
            {filteredTickets.length}{' '}
            {filteredTickets.length === 1
              ? 'result'
              : 'results'}
          </span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="manager-ticket-empty">
            <strong>No tickets found</strong>

            <span>
              Try changing or resetting the
              selected filters.
            </span>
          </div>
        ) : (
          <div className="manager-ticket-list">
            {filteredTickets.map((ticket) => (
              <article
                className="manager-ticket-card"
                key={ticket.id}
              >
                <div className="manager-ticket-main">
                  <div className="manager-ticket-heading">
                    <div>
                      <h3>{ticket.userName}</h3>

                      <span>{ticket.code}</span>
                    </div>

                    <span
                      className={`manager-ticket-status ${statusClass(
                        ticket.status,
                      )}`}
                    >
                      {readableTicketStatus(
                        ticket.status,
                      )}
                    </span>
                  </div>

                  <div className="manager-ticket-information">
                    <div>
                      <span>Event</span>
                      <strong>
                        {ticket.eventTitle}
                      </strong>
                    </div>

                    <div>
                      <span>Venue</span>
                      <strong>
                        {ticket.venueName}
                      </strong>
                    </div>

                    <div>
                      <span>Event date</span>
                      <strong>
                        {formatDateTime(
                          ticket.eventStartsAt,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Ticket type</span>
                      <strong>
                        {ticket.ticketType}
                      </strong>
                    </div>

                    <div>
                      <span>Price paid</span>
                      <strong>
                        {formatCurrency(
                          ticket.pricePaid,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Sales channel</span>
                      <strong>
                        {ticket.salesChannel}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="manager-ticket-side">
                  <div className="manager-ticket-code">
                    <span>Ticket code</span>
                    <strong>{ticket.code}</strong>
                  </div>

                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() =>
                      setSelectedTicket(ticket)
                    }
                  >
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {waitingListTickets > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Waiting list</h2>

              <p className="section-description">
                Users waiting for an available
                ticket.
              </p>
            </div>

            <span>{waitingListTickets}</span>
          </div>

          <div className="manager-waiting-list">
            {tickets
              .filter(
                (ticket) =>
                  ticket.status ===
                  'WAITING_LIST',
              )
              .map((ticket, index) => (
                <article
                  className="manager-waiting-card"
                  key={ticket.id}
                >
                  <span className="waiting-position">
                    {index + 1}
                  </span>

                  <div>
                    <strong>
                      {ticket.userName}
                    </strong>

                    <span>
                      {ticket.eventTitle} ·{' '}
                      {ticket.ticketType}
                    </span>
                  </div>

                  <span>
                    {formatDateTime(
                      ticket.createdAt,
                    )}
                  </span>
                </article>
              ))}
          </div>
        </section>
      )}

      {selectedTicket && (
        <div
          className="manager-ticket-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedTicket(null)
            }
          }}
        >
          <section
            className="manager-ticket-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-detail-title"
          >
            <div className="manager-ticket-modal-header">
              <div>
                <h2 id="ticket-detail-title">
                  Ticket details
                </h2>

                <p>
                  Full information for ticket{' '}
                  {selectedTicket.code}.
                </p>
              </div>

              <button
                className="manager-ticket-modal-close"
                type="button"
                aria-label="Close ticket details"
                onClick={() =>
                  setSelectedTicket(null)
                }
              >
                ×
              </button>
            </div>

            <div className="manager-ticket-detail-grid">
              <div>
                <span>Ticket holder</span>
                <strong>
                  {selectedTicket.userName}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {readableTicketStatus(
                    selectedTicket.status,
                  )}
                </strong>
              </div>

              <div>
                <span>Ticket code</span>
                <strong>
                  {selectedTicket.code}
                </strong>
              </div>

              <div>
                <span>Ticket type</span>
                <strong>
                  {selectedTicket.ticketType}
                </strong>
              </div>

              <div>
                <span>Event</span>
                <strong>
                  {selectedTicket.eventTitle}
                </strong>
              </div>

              <div>
                <span>Venue</span>
                <strong>
                  {selectedTicket.venueName}
                </strong>
              </div>

              <div>
                <span>Venue address</span>
                <strong>
                  {selectedTicket.venueAddress}
                </strong>
              </div>

              <div>
                <span>Event date</span>
                <strong>
                  {formatDateTime(
                    selectedTicket.eventStartsAt,
                  )}
                </strong>
              </div>

              <div>
                <span>Price paid</span>
                <strong>
                  {formatCurrency(
                    selectedTicket.pricePaid,
                  )}
                </strong>
              </div>

              <div>
                <span>Purchase date</span>
                <strong>
                  {formatDateTime(
                    selectedTicket.createdAt,
                  )}
                </strong>
              </div>

              <div>
                <span>Sales channel</span>
                <strong>
                  {selectedTicket.salesChannel}
                </strong>
              </div>
            </div>

            <div className="manager-ticket-qr">
              <span>QR payload</span>

              <code>
                {selectedTicket.qrPayload}
              </code>
            </div>

            <div className="manager-ticket-modal-actions">
              <button
                className="primary-action"
                type="button"
                onClick={() =>
                  setSelectedTicket(null)
                }
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

function readableTicketStatus(
  status: string,
) {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed'
    case 'WAITING_LIST':
      return 'Waiting list'
    case 'PENDING':
      return 'Pending'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'confirmed'
    case 'WAITING_LIST':
      return 'waiting'
    case 'PENDING':
      return 'pending'
    case 'CANCELLED':
      return 'cancelled'
    default:
      return ''
  }
}