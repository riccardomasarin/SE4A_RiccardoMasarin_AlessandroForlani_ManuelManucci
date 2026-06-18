import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { nightoutApi } from '../api/nightoutApi'
import { EventCard } from '../components/EventCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import type { EventSummaryDto, MusicGenre } from '../types/nightout'

const genres: Array<{ value: MusicGenre | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'HIP_HOP', label: 'Hip-Hop' },
  { value: 'HOUSE', label: 'House' },
  { value: 'TECHNO', label: 'Techno' },
  { value: 'POP', label: 'Pop' },
]

export function DiscoveryFeedPage() {
  const [events, setEvents] = useState<EventSummaryDto[]>([])
  const [genre, setGenre] = useState<MusicGenre | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    nightoutApi
      .getEvents({ city: 'Milano', genre: genre === 'ALL' ? undefined : genre, sort: 'popularity' })
      .then((data) => {
        if (active) {
          setEvents(data)
          setError(false)
        }
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [genre])

  const featured = useMemo(() => events.filter((event) => event.featured), [events])
  const promos = useMemo(
    () => events.filter((event) => event.promotionLabels.length > 0),
    [events],
  )

  if (error) {
    return (
      <StateBlock
        title="Backend offline"
        message="Start the Spring Boot backend on http://localhost:8080, then refresh this page."
      />
    )
  }

  return (
    <section className="page-stack">
      <PageHeader title="Milano" subtitle="Find the right night, fast." />

      <div className="search-row">
        <input aria-label="Search clubs" placeholder="Cerca un club..." />
        <button type="button">Filter</button>
      </div>

      <div className="chip-row">
        {genres.map((item) => (
          <button
            className={genre === item.value ? 'chip active' : 'chip'}
            type="button"
            key={item.value}
            onClick={() => setGenre(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <StateBlock title="Loading events" message="Fetching demo nightlife data from the backend." />
      ) : (
        <>
          <section className="spotlight-carousel">
            {featured.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h2>Promo</h2>
              <Link to="/feed">Mostra tutto</Link>
            </div>
            <div className="horizontal-list">
              {promos.map((event) => (
                <EventCard compact event={event} key={event.id} />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h2>Il meglio della tua zona</h2>
              <span>{events.length} serate</span>
            </div>
            <div className="event-list">
              {events.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  )
}
