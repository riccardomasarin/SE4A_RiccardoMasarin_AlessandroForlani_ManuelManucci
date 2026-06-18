import { useEffect, useState } from 'react'
import { formatCurrency } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import type { ManagerDashboardDto } from '../types/nightout'

export function ManagerDashboardPage() {
  const [dashboard, setDashboard] = useState<ManagerDashboardDto | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    nightoutApi.getDashboard().then(setDashboard).catch(() => setError(true))
  }, [])

  if (error) {
    return <StateBlock title="Dashboard unavailable" message="Could not load PR/venue dashboard data." />
  }

  if (!dashboard) {
    return <StateBlock title="Loading dashboard" message="Opening the venue partner view." />
  }

  return (
    <section className="manager page-stack">
      <PageHeader title={dashboard.venueName} subtitle={`NightOut Partner - ${dashboard.managerName}`} />

      <article className="manager-event">
        <span>Serata selezionata</span>
        <h2>{dashboard.selectedEventTitle}</h2>
      </article>

      <div className="manager-grid">
        <MetricCard label="Ticket" value={dashboard.totalTickets} />
        <MetricCard label="Tavoli" value={dashboard.totalTables} />
        <MetricCard label="Pregame" value={dashboard.totalPregames} />
        <MetricCard label="Oggi" value={formatCurrency(dashboard.todayRevenue)} />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <h2>Ticket attivi</h2>
          <span>PR e app</span>
        </div>
        <div className="channel-list">
          {dashboard.salesChannels.map((channel) => (
            <article className="channel-card" key={channel.id}>
              <div>
                <h3>{channel.name}</h3>
                <span>{channel.channelType}</span>
              </div>
              <div className="channel-stats">
                <strong>{channel.ticketCount}</strong>
                <span>Ticket</span>
                <strong>{formatCurrency(channel.revenue)}</strong>
                <span>Revenue</span>
              </div>
              <p>Promo: {channel.promoLabel}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Performance</h2>
          <span>{dashboard.checkinRate}% check-in</span>
        </div>
        <div className="insight-grid">
          {dashboard.insightCards.map((insight) => (
            <div className="list-tile" key={insight}>
              <strong>{insight.split(':')[0]}</strong>
              <span>{insight.includes(':') ? insight.split(':').slice(1).join(':').trim() : insight}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
