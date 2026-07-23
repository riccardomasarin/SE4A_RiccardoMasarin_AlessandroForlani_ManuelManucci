import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  formatCurrency,
  formatDateTime,
} from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type {
  PrDashboardDto,
  PrEventPerformanceDto,
  TicketDto,
} from '../types/nightout'

type TicketStatusFilter =
  | 'ALL'
  | 'CONFIRMED'
  | 'WAITING_LIST'
  | 'PENDING'
  | 'CANCELLED'
  | 'CHECKED_IN'

export function PrTicketsPage() {
  const { user } = useSession()

  const [dashboard, setDashboard] =
    useState<PrDashboardDto | null>(null)

  const [tickets, setTickets] =
    useState<TicketDto[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>('ALL')

  const [eventFilter, setEventFilter] =
    useState('ALL')

  const [selectedTicket, setSelectedTicket] =
    useState<TicketDto | null>(null)

  const [copiedCode, setCopiedCode] =
    useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      return
    }

    setLoading(true)
    setError('')

    Promise.all([
      nightoutApi.getPrDashboard(user.id),
      nightoutApi.getPrTickets(user.id),
    ])
      .then(
        ([
          dashboardData,
          ticketData,
        ]) => {
          setDashboard(dashboardData)
          setTickets(ticketData)
        },
      )
      .catch(() => {
        setError(
          'Could not load your promotional codes and ticket sales. Check that the backend is running.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

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
        ticket.promoCodeUsed
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        ticket.qrPayload
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'CHECKED_IN'
          ? ticket.checkedIn
          : ticket.status === statusFilter)

      const matchesEvent =
        eventFilter === 'ALL' ||
        ticket.eventId === Number(eventFilter)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEvent
      )
    })
  }, [
    tickets,
    search,
    statusFilter,
    eventFilter,
  ])

  const confirmedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === 'CONFIRMED',
    ).length

  const waitingListTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === 'WAITING_LIST',
    ).length

  const cancelledTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === 'CANCELLED',
    ).length

  const checkedInTickets =
    tickets.filter(
      (ticket) => ticket.checkedIn,
    ).length

  const totalCommission =
    tickets.reduce(
      (total, ticket) =>
        total + ticket.commissionAmount,
      0,
    )

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setEventFilter('ALL')
  }

  const copyPromoCode = async (
    promoCode: string,
  ) => {
    try {
      await navigator.clipboard.writeText(
        promoCode,
      )

      setCopiedCode(promoCode)

      window.setTimeout(() => {
        setCopiedCode(null)
      }, 1800)
    } catch {
      setCopiedCode(null)
    }
  }

  const sharePromoCode = async (
    performance: PrEventPerformanceDto,
  ) => {
    const checkoutUrl =
      `${window.location.origin}` +
      `/checkout/${performance.eventId}` +
      `?promoCode=${encodeURIComponent(
        performance.promoCode,
      )}`

    const shareData = {
      title: performance.eventTitle,
      text:
        `Use my NightOUT code ` +
        `${performance.promoCode} for ` +
        `${performance.discountPercentage}% off ` +
        `${performance.eventTitle}.`,
      url: checkoutUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (shareError) {
        if (
          shareError instanceof DOMException &&
          shareError.name === 'AbortError'
        ) {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(
        `${shareData.text} ${checkoutUrl}`,
      )

      setCopiedCode(
        performance.promoCode,
      )

      window.setTimeout(() => {
        setCopiedCode(null)
      }, 1800)
    } catch {
      setCopiedCode(null)
    }
  }

  if (!user) {
    return (
      <StateBlock
        title="Access denied"
        message="You must be logged in as a PR manager."
      />
    )
  }

  if (loading) {
    return (
      <StateBlock
        title="Loading PR activity"
        message="Fetching your codes and associated ticket sales."
      />
    )
  }

  return (
    <section className="page-stack manager-tickets-page pr-tickets-page">
      <PageHeader
        title="Code and tickets"
        subtitle="Share your promotional codes and monitor associated ticket sales."
      />

      {error && (
        <p className="inline-error">
          {error}
        </p>
      )}

      <section className="manager-ticket-summary">
        <div>
          <span>Tickets sold</span>

          <strong>
            {dashboard?.totalTicketsSold ??
              tickets.length}
          </strong>
        </div>

        <div>
          <span>Confirmed</span>

          <strong>
            {confirmedTickets}
          </strong>
        </div>

        <div>
          <span>Check-ins</span>

          <strong>
            {checkedInTickets}
          </strong>
        </div>

        <div>
          <span>Waiting list</span>

          <strong>
            {waitingListTickets}
          </strong>
        </div>

        <div>
          <span>Cancelled</span>

          <strong>
            {cancelledTickets}
          </strong>
        </div>

        <div>
          <span>Commission earned</span>

          <strong>
            {formatCurrency(
              totalCommission,
            )}
          </strong>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Your promo codes</h2>

            <p className="section-description">
              Copy or share the code assigned to each
              collaboration.
            </p>
          </div>

          <span>
            {dashboard?.eventPerformance.length ??
              0}{' '}
            codes
          </span>
        </div>

        {!dashboard ||
        dashboard.eventPerformance.length ===
          0 ? (
          <div className="manager-ticket-empty">
            <strong>
              No promotional codes assigned
            </strong>

            <span>
              Your codes will appear here after a
              venue assigns you to an event.
            </span>
          </div>
        ) : (
          <div className="channel-list pr-code-list">
            {dashboard.eventPerformance.map(
              (performance) => (
                <article
                  className="channel-card venue-channel-card pr-code-card"
                  key={performance.assignmentId}
                >
                  <div className="venue-channel-header">
                    <div>
                      <h3>
                        {performance.eventTitle}
                      </h3>

                      <span>
                        {performance.venueName}
                        {' · '}
                        {formatDateTime(
                          performance.eventStartsAt,
                        )}
                      </span>
                    </div>

                    <span
                      className={
                        performance.active
                          ? 'venue-promo-badge'
                          : 'manager-ticket-status cancelled'
                      }
                    >
                      {performance.active
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>

                  <div className="pr-code-value">
                    <span>
                      Personal promo code
                    </span>

                    <strong>
                      {performance.promoCode}
                    </strong>
                  </div>

                  <div className="channel-stats pr-code-stats">
                    <div>
                      <strong>
                        {
                          performance.ticketsSold
                        }
                      </strong>

                      <span>Tickets sold</span>
                    </div>

                    <div>
                      <strong>
                        {
                          performance
                            .discountPercentage
                        }
                        %
                      </strong>

                      <span>User discount</span>
                    </div>

                    <div>
                      <strong>
                        {formatCurrency(
                          performance
                            .commissionPerTicket,
                        )}
                      </strong>

                      <span>
                        Per-ticket commission
                      </span>
                    </div>

                    <div>
                      <strong>
                        {formatCurrency(
                          performance
                            .commissionEarned,
                        )}
                      </strong>

                      <span>Total earned</span>
                    </div>
                  </div>

                  <div className="pr-code-actions">
                    <button
                      className="secondary-action"
                      type="button"
                      onClick={() =>
                        copyPromoCode(
                          performance.promoCode,
                        )
                      }
                    >
                      {copiedCode ===
                      performance.promoCode
                        ? 'Copied'
                        : 'Copy code'}
                    </button>

                    <button
                      className="primary-action"
                      type="button"
                      onClick={() =>
                        sharePromoCode(
                          performance,
                        )
                      }
                    >
                      Share code
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section className="manager-ticket-toolbar">
        <label className="manager-ticket-search">
          <span>Search tickets</span>

          <input
            type="search"
            placeholder="Search by customer, code, event or ticket..."
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

            <option value="CHECKED_IN">
              Used / checked in
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
          <span>Event</span>

          <select
            value={eventFilter}
            onChange={(event) =>
              setEventFilter(
                event.target.value,
              )
            }
          >
            <option value="ALL">
              All events
            </option>

            {dashboard?.eventPerformance.map(
              (performance) => (
                <option
                  value={performance.eventId}
                  key={performance.assignmentId}
                >
                  {performance.eventTitle}
                </option>
              ),
            )}
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
            <h2>Tickets using your codes</h2>

            <p className="section-description">
              Purchases attributed to your promotional
              activity.
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
              No purchases match the selected filters.
            </span>
          </div>
        ) : (
          <div className="manager-ticket-list">
            {filteredTickets.map(
              (ticket) => (
                <article
                  className="manager-ticket-card"
                  key={ticket.id}
                >
                  <div className="manager-ticket-main">
                    <div className="manager-ticket-heading">
                      <div>
                        <h3>
                          {ticket.userName}
                        </h3>

                        <span>
                          {ticket.code}
                        </span>
                      </div>

                      <div className="pr-ticket-badges">
                        {ticket.checkedIn && (
                          <span className="manager-ticket-status confirmed">
                            Used
                          </span>
                        )}

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
                    </div>

                    <div className="manager-ticket-information">
                      <div>
                        <span>Event</span>

                        <strong>
                          {ticket.eventTitle}
                        </strong>
                      </div>

                      <div>
                        <span>Promo code</span>

                        <strong>
                          {ticket.promoCodeUsed ??
                            'No code'}
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
                        <span>Discount</span>

                        <strong>
                          {formatCurrency(
                            ticket.discountAmount,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Your commission</span>

                        <strong>
                          {formatCurrency(
                            ticket
                              .commissionAmount,
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="manager-ticket-side">
                    <div className="manager-ticket-code">
                      <span>Purchase date</span>

                      <strong>
                        {formatDateTime(
                          ticket.createdAt,
                        )}
                      </strong>
                    </div>

                    <button
                      className="secondary-action"
                      type="button"
                      onClick={() =>
                        setSelectedTicket(
                          ticket,
                        )
                      }
                    >
                      View details
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

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
            aria-labelledby="pr-ticket-detail-title"
          >
            <div className="manager-ticket-modal-header">
              <div>
                <h2 id="pr-ticket-detail-title">
                  Ticket details
                </h2>

                <p>
                  Sale attributed to your promotional
                  code.
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
                  {selectedTicket.checkedIn
                    ? 'Used / checked in'
                    : readableTicketStatus(
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
                <span>Promo code used</span>

                <strong>
                  {selectedTicket
                    .promoCodeUsed ?? '—'}
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
                <span>Event date</span>

                <strong>
                  {formatDateTime(
                    selectedTicket
                      .eventStartsAt,
                  )}
                </strong>
              </div>

              <div>
                <span>Ticket type</span>

                <strong>
                  {selectedTicket.ticketType}
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
                <span>Discount applied</span>

                <strong>
                  {formatCurrency(
                    selectedTicket
                      .discountAmount,
                  )}
                </strong>
              </div>

              <div>
                <span>Commission earned</span>

                <strong>
                  {formatCurrency(
                    selectedTicket
                      .commissionAmount,
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
                <span>Check-in date</span>

                <strong>
                  {selectedTicket.checkedInAt
                    ? formatDateTime(
                        selectedTicket
                          .checkedInAt,
                      )
                    : 'Not checked in'}
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

    case 'EXPIRED':
      return 'Expired'

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
    case 'EXPIRED':
      return 'cancelled'

    default:
      return ''
  }
}