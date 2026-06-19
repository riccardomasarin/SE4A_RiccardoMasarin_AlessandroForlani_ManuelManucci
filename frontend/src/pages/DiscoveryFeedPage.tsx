import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { nightoutApi } from '../api/nightoutApi'
import { EventCard } from '../components/EventCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type { EventSummaryDto, MusicGenre, VenueCategory } from '../types/nightout'

const genres: Array<{ value: MusicGenre | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'HIP_HOP', label: 'Hip-Hop' },
  { value: 'HOUSE', label: 'House' },
  { value: 'TECHNO', label: 'Techno' },
  { value: 'POP', label: 'Pop' },
]

const areas = ['Centro', 'Navigli', 'Porta Nuova', 'Sempione']
const categories: Array<{ value: VenueCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All venues' },
  { value: 'CLUB', label: 'Club' },
  { value: 'BAR', label: 'Bar' },
  { value: 'LOUNGE', label: 'Lounge' },
  { value: 'LIVE_MUSIC_VENUE', label: 'Live music' },
]
const entryOptions = ['Standard', 'VIP', 'gratuito', 'Saltafila', 'Offerta']

export function DiscoveryFeedPage() {
  const { user } = useSession()
  const [events, setEvents] = useState<EventSummaryDto[]>([])
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [genre, setGenre] = useState<MusicGenre | 'ALL'>('ALL')
  const [area, setArea] = useState('ALL')
  const [venueCategory, setVenueCategory] = useState<VenueCategory | 'ALL'>('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [entryCondition, setEntryCondition] = useState('ALL')
  const [sort, setSort] = useState('popularity')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    nightoutApi
      .getEvents({
        city: 'Milano',
        area: area === 'ALL' ? undefined : area,
        genre: genre === 'ALL' ? undefined : genre,
        venueCategory: venueCategory === 'ALL' ? undefined : venueCategory,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        entryCondition: entryCondition === 'ALL' ? undefined : entryCondition,
        search: search.trim() || undefined,
        sort,
      })
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
  }, [area, entryCondition, fromDate, genre, maxPrice, search, sort, toDate, venueCategory])

  useEffect(() => {
    if (!user) return
    nightoutApi
      .getSavedEvents(user.id)
      .then((savedEvents) => setSavedIds(new Set(savedEvents.map((event) => event.id))))
      .catch(() => setSavedIds(new Set()))
  }, [user])

  const featured = useMemo(() => events.filter((event) => event.featured), [events])
  const promos = useMemo(
    () => events.filter((event) => event.promotionLabels.length > 0),
    [events],
  )
  const activeFilterCount = [
    search.trim(),
    genre !== 'ALL',
    area !== 'ALL',
    venueCategory !== 'ALL',
    fromDate,
    toDate,
    maxPrice,
    entryCondition !== 'ALL',
    sort !== 'popularity',
  ].filter(Boolean).length

  const resetFilters = () => {
    setSearch('')
    setGenre('ALL')
    setArea('ALL')
    setVenueCategory('ALL')
    setFromDate('')
    setToDate('')
    setMaxPrice('')
    setEntryCondition('ALL')
    setSort('popularity')
  }

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
        <input
          aria-label="Search clubs and events"
          placeholder="Cerca evento o club..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="button" onClick={() => setFiltersOpen((open) => !open)}>
          Filters{activeFilterCount > 0 ? ` ${activeFilterCount}` : ''}
        </button>
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

      {filtersOpen && (
        <section className="filter-panel" aria-label="Event filters">
          <label>
            Area
            <select value={area} onChange={(event) => setArea(event.target.value)}>
              <option value="ALL">All areas</option>
              {areas.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Venue
            <select
              value={venueCategory}
              onChange={(event) => setVenueCategory(event.target.value as VenueCategory | 'ALL')}
            >
              {categories.map((item) => (
                <option value={item.value} key={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            From
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>
          <label>
            Max price
            <input
              min="0"
              step="5"
              type="number"
              inputMode="numeric"
              placeholder="No limit"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>
          <label>
            Entry
            <select value={entryCondition} onChange={(event) => setEntryCondition(event.target.value)}>
              <option value="ALL">Any entry</option>
              {entryOptions.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Sort
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="popularity">Popularity</option>
              <option value="date">Date</option>
              <option value="price">Price</option>
            </select>
          </label>
          <button className="secondary-action" type="button" onClick={resetFilters}>
            Reset filters
          </button>
        </section>
      )}

      {loading ? (
        <StateBlock title="Loading events" message="Fetching demo nightlife data from the backend." />
      ) : events.length === 0 ? (
        <section className="empty-results">
          <strong>No events match these filters</strong>
          <span>Try a different date, price, area, or search term.</span>
          <button type="button" onClick={resetFilters}>Reset filters</button>
        </section>
      ) : (
        <>
          <section className="spotlight-carousel">
            {featured.map((event) => (
              <EventCard event={event} key={event.id} saved={savedIds.has(event.id)} />
            ))}
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h2>Promo</h2>
              <Link to="/feed">Mostra tutto</Link>
            </div>
            <div className="horizontal-list">
              {promos.map((event) => (
                <EventCard compact event={event} key={event.id} saved={savedIds.has(event.id)} />
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
                <EventCard event={event} key={event.id} saved={savedIds.has(event.id)} />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  )
}
