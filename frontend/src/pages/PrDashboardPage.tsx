import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type {
  PrDashboardDto,
  PrEventPerformanceDto,
} from '../types/nightout'

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function calculateCheckinRate(
  performance: PrEventPerformanceDto,
) {
  if (performance.confirmedTickets === 0) {
    return 0
  }

  return Math.round(
    (performance.checkins /
      performance.confirmedTickets) *
      100,
  )
}

export function PrDashboardPage() {
  const { user } = useSession()

  const [dashboard, setDashboard] =
    useState<PrDashboardDto | null>(null)

  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    setError(false)

    nightoutApi
      .getPrDashboard(user.id)
      .then((data) => {
        setDashboard(data)
        setError(false)
      })
      .catch(() => {
        setError(true)
      })
  }, [user])

  const checkinRate = useMemo(() => {
    if (
      !dashboard ||
      dashboard.confirmedTickets === 0
    ) {
      return 0
    }

    return Math.round(
      (dashboard.totalCheckins /
        dashboard.confirmedTickets) *
        100,
    )
  }, [dashboard])

  const bestEvent = useMemo(() => {
    if (
      !dashboard ||
      dashboard.eventPerformance.length === 0
    ) {
      return null
    }

    return [...dashboard.eventPerformance].sort(
      (firstEvent, secondEvent) =>
        secondEvent.ticketsSold -
        firstEvent.ticketsSold,
    )[0]
  }, [dashboard])

  if (error) {
    return (
      <StateBlock
        title="Dashboard unavailable"
        message="Could not load PR dashboard data."
      />
    )
  }

  if (!dashboard) {
    return (
      <StateBlock
        title="Loading dashboard"
        message="Opening your PR dashboard."
      />
    )
  }

  const currentEvent = dashboard.currentEvent

  return (
    <section className="manager page-stack pr-dashboard">
      <PageHeader
        title="PR Dashboard"
        subtitle={`Welcome back, ${dashboard.prName}`}
        action={
          <Link
            className="small-action create-action"
            to="/pr/tickets"
          >
            View code
          </Link>
        }
      />

      <section className="venue-overview-section pr-current-event">
        <div className="venue-overview-heading">
          <div>
            <span className="venue-section-label">
              Current event
            </span>

            <h2>
              {currentEvent
                ? currentEvent.eventTitle
                : 'No active event'}
            </h2>

            {currentEvent && (
              <p className="section-description">
                {currentEvent.venueName}
                {' · '}
                {formatEventDate(
                  currentEvent.eventStartsAt,
                )}
              </p>
            )}
          </div>

          {currentEvent && (
            <div className="pr-current-code">
              <span>Promo code</span>

              <strong>
                {currentEvent.promoCode}
              </strong>

              <small>
                {currentEvent.discountPercentage}%
                discount
              </small>
            </div>
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Performance overview</h2>

            <p className="section-description">
              Sales, entries and earnings generated
              through your promotional codes.
            </p>
          </div>
        </div>

        <div className="manager-grid venue-metrics-grid">
          <MetricCard
            label="Tickets sold"
            value={dashboard.totalTicketsSold}
            hint="Using your PR codes"
          />

          <MetricCard
            label="Confirmed tickets"
            value={dashboard.confirmedTickets}
            hint="Currently valid tickets"
          />

          <MetricCard
            label="Confirmed entries"
            value={dashboard.totalCheckins}
            hint={`${checkinRate}% check-in rate`}
          />

          <MetricCard
            label="Waiting list"
            value={dashboard.waitingListTickets}
            hint="Waiting for confirmation"
          />

          <MetricCard
            label="Revenue generated"
            value={formatCurrency(
              dashboard.totalRevenue,
            )}
            hint="Total ticket revenue"
          />

          <MetricCard
            label="Your commissions"
            value={formatCurrency(
              dashboard.totalCommissionEarned,
            )}
            hint="Commission earned"
          />
        </div>
      </section>

      {currentEvent && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Current event performance</h2>

              <p className="section-description">
                Results generated for your next active
                collaboration.
              </p>
            </div>

            <Link to="/pr/tickets">
              View tickets
            </Link>
          </div>

          <article className="channel-card venue-channel-card pr-event-card">
            <div className="venue-channel-header">
              <div>
                <h3>{currentEvent.eventTitle}</h3>

                <span>
                  {currentEvent.venueName}
                  {' · '}
                  {formatEventDate(
                    currentEvent.eventStartsAt,
                  )}
                </span>
              </div>

              <span className="venue-promo-badge">
                {currentEvent.promoCode}
              </span>
            </div>

            <div className="channel-stats pr-channel-stats">
              <div>
                <strong>
                  {currentEvent.ticketsSold}
                </strong>
                <span>Tickets sold</span>
              </div>

              <div>
                <strong>
                  {currentEvent.checkins}
                </strong>
                <span>Check-ins</span>
              </div>

              <div>
                <strong>
                  {formatCurrency(
                    currentEvent.commissionEarned,
                  )}
                </strong>
                <span>Commission</span>
              </div>
            </div>
          </article>
        </section>
      )}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Promo-code performance</h2>

            <p className="section-description">
              Performance of your codes for every event.
            </p>
          </div>
        </div>

        {dashboard.eventPerformance.length === 0 ? (
          <div className="manager-empty-state">
            <strong>No collaborations yet</strong>

            <span>
              Your assigned events and promotional
              codes will appear here.
            </span>
          </div>
        ) : (
          <div className="channel-list">
            {dashboard.eventPerformance.map(
              (performance) => {
                const eventCheckinRate =
                  calculateCheckinRate(performance)

                return (
                  <article
                    className="channel-card venue-channel-card"
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
                          {formatEventDate(
                            performance.eventStartsAt,
                          )}
                        </span>
                      </div>

                      <span className="venue-promo-badge">
                        {performance.promoCode}
                      </span>
                    </div>

                    <div className="channel-stats">
                      <div>
                        <strong>
                          {performance.ticketsSold}
                        </strong>
                        <span>Tickets sold</span>
                      </div>

                      <div>
                        <strong>
                          {performance.checkins}
                        </strong>
                        <span>Check-ins</span>
                      </div>

                      <div>
                        <strong>
                          {formatCurrency(
                            performance
                              .commissionEarned,
                          )}
                        </strong>
                        <span>Commission</span>
                      </div>
                    </div>

                    <div className="venue-progress-bar">
                      <i
                        style={{
                          width: `${Math.min(
                            eventCheckinRate,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    <small>
                      {eventCheckinRate}% check-in rate
                      {' · '}
                      {performance.discountPercentage}%
                      customer discount
                    </small>
                  </article>
                )
              },
            )}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Performance summary</h2>

            <p className="section-description">
              Main indicators for your PR activity.
            </p>
          </div>
        </div>

        <div className="venue-performance-grid">
          <article className="venue-performance-card">
            <span>Overall check-in rate</span>

            <strong>{checkinRate}%</strong>

            <div className="venue-progress-bar">
              <i
                style={{
                  width: `${Math.min(
                    checkinRate,
                    100,
                  )}%`,
                }}
              />
            </div>
          </article>

          <article className="venue-performance-card">
            <span>Best performing event</span>

            <strong>
              {bestEvent
                ? bestEvent.eventTitle
                : 'No data'}
            </strong>

            <small>
              {bestEvent
                ? `${bestEvent.ticketsSold} tickets sold`
                : 'No sales recorded yet'}
            </small>
          </article>

          <article className="venue-performance-card">
            <span>Average commission</span>

            <strong>
              {dashboard.totalTicketsSold > 0
                ? formatCurrency(
                    dashboard
                      .totalCommissionEarned /
                      dashboard.totalTicketsSold,
                  )
                : formatCurrency(0)}
            </strong>

            <small>Per ticket sold</small>
          </article>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Quick actions</h2>

            <p className="section-description">
              Access your main PR tools.
            </p>
          </div>
        </div>

        <div className="venue-quick-actions">
          <Link
            className="venue-action-card"
            to="/pr/tickets"
          >
            <strong>Code and tickets</strong>

            <span>
              Share your code and inspect associated
              ticket sales.
            </span>
          </Link>

          <Link
            className="venue-action-card"
            to="/pr/account"
          >
            <strong>PR account</strong>

            <span>
              Manage personal information,
              collaborations and settings.
            </span>
          </Link>
        </div>
      </section>
    </section>
  )
}