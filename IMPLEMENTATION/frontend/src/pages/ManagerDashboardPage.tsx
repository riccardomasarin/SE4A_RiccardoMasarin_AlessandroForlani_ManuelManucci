import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import type { ManagerDashboardDto } from '../types/nightout'

export function ManagerDashboardPage() {
  const [dashboard, setDashboard] =
    useState<ManagerDashboardDto | null>(null)

  const [error, setError] = useState(false)

  useEffect(() => {
    nightoutApi
      .getDashboard()
      .then((data) => {
        setDashboard(data)
        setError(false)
      })
      .catch(() => {
        setError(true)
      })
  }, [])

  const totalRevenue = useMemo(() => {
    if (!dashboard) return 0

    return dashboard.salesChannels.reduce(
      (total, channel) => total + channel.revenue,
      0,
    )
  }, [dashboard])

  const bestSalesChannel = useMemo(() => {
    if (!dashboard || dashboard.salesChannels.length === 0) {
      return null
    }

    return [...dashboard.salesChannels].sort(
      (firstChannel, secondChannel) =>
        secondChannel.ticketCount -
        firstChannel.ticketCount,
    )[0]
  }, [dashboard])

  if (error) {
    return (
      <StateBlock
        title="Dashboard unavailable"
        message="Could not load venue dashboard data."
      />
    )
  }

  if (!dashboard) {
    return (
      <StateBlock
        title="Loading dashboard"
        message="Opening the venue management dashboard."
      />
    )
  }

  const activeEvents =
    dashboard.selectedEventTitle ? 1 : 0

  const expectedAttendees =
    dashboard.totalTickets

  return (
    <section className="manager page-stack">
      <PageHeader
        title={dashboard.venueName}
        subtitle={`Venue dashboard · ${dashboard.managerName}`}
        action={
          <Link
            className="small-action create-action"
            to="/manager/events/new"
          >
            Create event
          </Link>
        }
      />

      <section className="venue-overview-section">
        <div className="venue-overview-heading">
          <div>
            <span className="venue-section-label">
              Current event
            </span>

            <h2>{dashboard.selectedEventTitle}</h2>
          </div>

          <Link
            className="secondary-action"
            to="/manager/events"
          >
            Manage events
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Dashboard overview</h2>

            <p className="section-description">
              Main information about the selected event
              and current ticket sales.
            </p>
          </div>
        </div>

        <div className="manager-grid venue-metrics-grid">
          <MetricCard
            label="Active events"
            value={activeEvents}
            hint="Currently selected"
          />

          <MetricCard
            label="Tickets sold"
            value={dashboard.totalTickets}
            hint="Across all sales channels"
          />

          <MetricCard
            label="Expected attendees"
            value={expectedAttendees}
            hint="Based on sold tickets"
          />

          <MetricCard
            label="Reserved tables"
            value={dashboard.totalTables}
            hint="For the selected event"
          />

          <MetricCard
            label="Today's revenue"
            value={formatCurrency(
              dashboard.todayRevenue,
            )}
            hint="Revenue generated today"
          />

          <MetricCard
            label="Total revenue"
            value={formatCurrency(totalRevenue)}
            hint="Across all sales channels"
          />
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Ticket sales</h2>

            <p className="section-description">
              Ticket sales divided by channel.
            </p>
          </div>

          <Link to="/manager/tickets">
            View tickets
          </Link>
        </div>

        {dashboard.salesChannels.length === 0 ? (
          <div className="manager-empty-state">
            <strong>No ticket sales yet</strong>

            <span>
              Sales data will appear here after the
              first ticket purchase.
            </span>
          </div>
        ) : (
          <div className="channel-list">
            {dashboard.salesChannels.map((channel) => (
              <article
                className="channel-card venue-channel-card"
                key={channel.id}
              >
                <div className="venue-channel-header">
                  <div>
                    <h3>{channel.name}</h3>
                    <span>{channel.channelType}</span>
                  </div>

                  {channel.promoLabel && (
                    <span className="venue-promo-badge">
                      {channel.promoLabel}
                    </span>
                  )}
                </div>

                <div className="channel-stats">
                  <div>
                    <strong>
                      {channel.ticketCount}
                    </strong>
                    <span>Tickets sold</span>
                  </div>

                  <div>
                    <strong>
                      {formatCurrency(
                        channel.revenue,
                      )}
                    </strong>
                    <span>Revenue</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Performance summary</h2>

            <p className="section-description">
              Quick indicators for the selected event.
            </p>
          </div>
        </div>

        <div className="venue-performance-grid">
          <article className="venue-performance-card">
            <span>Check-in rate</span>

            <strong>
              {dashboard.checkinRate}%
            </strong>

            <div className="venue-progress-bar">
              <i
                style={{
                  width: `${Math.min(
                    dashboard.checkinRate,
                    100,
                  )}%`,
                }}
              />
            </div>
          </article>

          <article className="venue-performance-card">
            <span>Best sales channel</span>

            <strong>
              {bestSalesChannel
                ? bestSalesChannel.name
                : 'No data'}
            </strong>

            <small>
              {bestSalesChannel
                ? `${bestSalesChannel.ticketCount} tickets sold`
                : 'No sales have been recorded yet'}
            </small>
          </article>

          <article className="venue-performance-card">
            <span>Average revenue per ticket</span>

            <strong>
              {dashboard.totalTickets > 0
                ? formatCurrency(
                    totalRevenue /
                      dashboard.totalTickets,
                  )
                : formatCurrency(0)}
            </strong>

            <small>
              Based on current sales data
            </small>
          </article>
        </div>

        {dashboard.insightCards.filter(
  (insight) =>
    !insight
      .toLowerCase()
      .includes('syncride return transport'),
).length > 0 && (
  <div className="venue-insights">
    {dashboard.insightCards
      .filter(
        (insight) =>
          !insight
            .toLowerCase()
            .includes('syncride return transport'),
      )
      .map((insight) => {
        const separatorIndex =
          insight.indexOf(':')

        const title =
          separatorIndex >= 0
            ? insight
                .slice(0, separatorIndex)
                .trim()
            : 'Insight'

        const value =
          separatorIndex >= 0
            ? insight
                .slice(separatorIndex + 1)
                .trim()
            : insight

        return (
          <div
            className="list-tile"
            key={insight}
          >
            <strong>{title}</strong>
            <span>{value}</span>
          </div>
        )
      })}
  </div>
)}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Quick actions</h2>

            <p className="section-description">
              Access the main venue management tools.
            </p>
          </div>
        </div>

        <div className="venue-quick-actions">
          <Link
            className="venue-action-card"
            to="/manager/events"
          >
            <strong>Manage events</strong>
            <span>
              View, create and update venue events.
            </span>
          </Link>

          <Link
            className="venue-action-card"
            to="/manager/tickets"
          >
            <strong>Manage tickets</strong>
            <span>
              View sales, payments and check-ins.
            </span>
          </Link>

          <Link
            className="venue-action-card"
            to="/manager/promotions"
          >
            <strong>Manage promotions</strong>
            <span>
              Create discounts and promotional codes.
            </span>
          </Link>

          <Link
            className="venue-action-card"
            to="/manager/profile"
          >
            <strong>Venue profile</strong>
            <span>
              Update venue information and settings.
            </span>
          </Link>
        </div>
      </section>
    </section>
  )
}