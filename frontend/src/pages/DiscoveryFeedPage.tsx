import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { nightoutApi } from '../api/nightoutApi'
import { EventCard } from '../components/EventCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type {
  EventSummaryDto,
  FriendUserDto,
  MusicGenre,
  VenueCategory,
} from '../types/nightout'

const genres: Array<{
  value: MusicGenre | 'ALL'
  label: string
}> = [
  { value: 'ALL', label: 'All genres' },
  { value: 'HIP_HOP', label: 'Hip-Hop' },
  { value: 'HOUSE', label: 'House' },
  { value: 'TECHNO', label: 'Techno' },
  { value: 'POP', label: 'Pop' },
]

const areas = [
  { value: 'Centro', label: 'City Centre' },
  { value: 'Navigli', label: 'Navigli' },
  { value: 'Porta Nuova', label: 'Porta Nuova' },
  { value: 'Sempione', label: 'Sempione' },
]

const categories: Array<{
  value: VenueCategory | 'ALL'
  label: string
}> = [
  { value: 'ALL', label: 'All venues' },
  { value: 'CLUB', label: 'Club' },
  { value: 'BAR', label: 'Bar' },
  { value: 'LOUNGE', label: 'Lounge' },
  {
    value: 'LIVE_MUSIC_VENUE',
    label: 'Live music venue',
  },
]

const entryOptions = [
  { value: 'Standard', label: 'Standard' },
  { value: 'VIP', label: 'VIP' },
  { value: 'gratuito', label: 'Free entry' },
  { value: 'Saltafila', label: 'Skip-the-line' },
  { value: 'Offerta', label: 'Special offer' },
]

const priceOptions = [
  { value: '', label: 'No price limit' },
  { value: '0', label: 'Free entry' },
  { value: '10', label: 'Up to €10' },
  { value: '20', label: 'Up to €20' },
  { value: '30', label: 'Up to €30' },
  { value: '50', label: 'Up to €50' },
]

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function DiscoveryFeedPage() {
  const { user } = useSession()

  const [events, setEvents] = useState<EventSummaryDto[]>([])

  const [savedIds, setSavedIds] = useState<Set<number>>(
    new Set(),
  )

  const [friendsByEvent, setFriendsByEvent] = useState<
    Record<number, FriendUserDto[]>
  >({})

  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [genre, setGenre] = useState<
    MusicGenre | 'ALL'
  >('ALL')

  const [area, setArea] = useState('ALL')

  const [venueCategory, setVenueCategory] = useState<
    VenueCategory | 'ALL'
  >('ALL')

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
        userId: user?.id,
        city: 'Milano',
        area: area === 'ALL' ? undefined : area,
        genre: genre === 'ALL' ? undefined : genre,
        venueCategory:
          venueCategory === 'ALL'
            ? undefined
            : venueCategory,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        maxPrice: maxPrice
          ? Number(maxPrice)
          : undefined,
        entryCondition:
          entryCondition === 'ALL'
            ? undefined
            : entryCondition,
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
        if (active) {
          setError(true)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [
    area,
    entryCondition,
    fromDate,
    genre,
    maxPrice,
    search,
    sort,
    toDate,
    user?.id,
    venueCategory,
  ])

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set())
      return
    }

    nightoutApi
      .getSavedEvents(user.id)
      .then((savedEvents) => {
        setSavedIds(
          new Set(
            savedEvents.map((event) => event.id),
          ),
        )
      })
      .catch(() => {
        setSavedIds(new Set())
      })
  }, [user])

  useEffect(() => {
    if (!user || events.length === 0) {
      setFriendsByEvent({})
      return
    }

    let active = true

    const loadFriendsAttending = async () => {
      const eventIds = Array.from(
        new Set(
          events.map((event) => event.id),
        ),
      )

      const results = await Promise.all(
        eventIds.map(async (currentEventId) => {
          try {
            const friends =
              await nightoutApi.getFriendsAttending(
                user.id,
                currentEventId,
              )

            return {
              eventId: currentEventId,
              friends,
            }
          } catch {
            return {
              eventId: currentEventId,
              friends: [] as FriendUserDto[],
            }
          }
        }),
      )

      if (!active) {
        return
      }

      const nextFriendsByEvent: Record<
        number,
        FriendUserDto[]
      > = {}

      results.forEach((result) => {
        nextFriendsByEvent[result.eventId] =
          result.friends
      })

      setFriendsByEvent(nextFriendsByEvent)
    }

    void loadFriendsAttending()

    return () => {
      active = false
    }
  }, [events, user])

  const featured = useMemo(
    () =>
      events.filter(
        (event) => event.featured,
      ),
    [events],
  )

  const promos = useMemo(
    () =>
      events.filter(
        (event) =>
          event.promotionLabels.length > 0,
      ),
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

  const selectToday = () => {
    const today = formatLocalDate(new Date())

    setFromDate(today)
    setToDate(today)
  }

  const selectTomorrow = () => {
    const tomorrow = new Date()

    tomorrow.setDate(
      tomorrow.getDate() + 1,
    )

    const tomorrowDate =
      formatLocalDate(tomorrow)

    setFromDate(tomorrowDate)
    setToDate(tomorrowDate)
  }

  const selectedGenreLabel = genres.find(
    (item) => item.value === genre,
  )?.label

  const selectedAreaLabel = areas.find(
    (item) => item.value === area,
  )?.label

  const selectedVenueLabel = categories.find(
    (item) =>
      item.value === venueCategory,
  )?.label

  const selectedEntryLabel =
    entryOptions.find(
      (item) =>
        item.value === entryCondition,
    )?.label

  const selectedPriceLabel =
    priceOptions.find(
      (item) => item.value === maxPrice,
    )?.label

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
      <PageHeader
        title="Milan"
        subtitle="Find the right night, fast."
      />

      <div className="search-row">
        <input
          aria-label="Search venues and events"
          placeholder="Search for an event or venue..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <button
          type="button"
          onClick={() =>
            setFiltersOpen(
              (open) => !open,
            )
          }
        >
          Filters
          {activeFilterCount > 0
            ? ` (${activeFilterCount})`
            : ''}
        </button>
      </div>

      {activeFilterCount > 0 && (
        <div className="active-filters">
          {search.trim() && (
            <button
              type="button"
              onClick={() => setSearch('')}
            >
              Search: {search} ×
            </button>
          )}

          {genre !== 'ALL' && (
            <button
              type="button"
              onClick={() => setGenre('ALL')}
            >
              {selectedGenreLabel} ×
            </button>
          )}

          {area !== 'ALL' && (
            <button
              type="button"
              onClick={() => setArea('ALL')}
            >
              {selectedAreaLabel ?? area} ×
            </button>
          )}

          {venueCategory !== 'ALL' && (
            <button
              type="button"
              onClick={() =>
                setVenueCategory('ALL')
              }
            >
              {selectedVenueLabel} ×
            </button>
          )}

          {fromDate && (
            <button
              type="button"
              onClick={() => setFromDate('')}
            >
              From: {fromDate} ×
            </button>
          )}

          {toDate && (
            <button
              type="button"
              onClick={() => setToDate('')}
            >
              To: {toDate} ×
            </button>
          )}

          {maxPrice && (
            <button
              type="button"
              onClick={() => setMaxPrice('')}
            >
              {selectedPriceLabel} ×
            </button>
          )}

          {entryCondition !== 'ALL' && (
            <button
              type="button"
              onClick={() =>
                setEntryCondition('ALL')
              }
            >
              {selectedEntryLabel} ×
            </button>
          )}

          {sort !== 'popularity' && (
            <button
              type="button"
              onClick={() =>
                setSort('popularity')
              }
            >
              Sort:{' '}
              {sort === 'date'
                ? 'Nearest date'
                : 'Lowest price'}{' '}
              ×
            </button>
          )}

          <button
            className="clear-filters-button"
            type="button"
            onClick={resetFilters}
          >
            Clear all
          </button>
        </div>
      )}

      {filtersOpen && (
        <section
          className="filter-panel"
          aria-label="Event filters"
        >
          <div className="filter-panel-header">
            <h2>Filters</h2>

            <button
              className="filter-close-button"
              type="button"
              aria-label="Close filters"
              onClick={() =>
                setFiltersOpen(false)
              }
            >
              ×
            </button>
          </div>

          <div className="filter-grid">
            <div className="filter-column">
              <div className="filter-group">
                <h3>When</h3>

                <div className="quick-date-filters">
                  <button
                    className="filter-option-button"
                    type="button"
                    onClick={selectToday}
                  >
                    Today
                  </button>

                  <button
                    className="filter-option-button"
                    type="button"
                    onClick={selectTomorrow}
                  >
                    Tomorrow
                  </button>
                </div>

                <label>
                  From
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) =>
                      setFromDate(
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  To
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) =>
                      setToDate(
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>

              <div className="filter-group">
                <h3>Price and entry</h3>

                <label>
                  Price
                  <select
                    value={maxPrice}
                    onChange={(event) =>
                      setMaxPrice(
                        event.target.value,
                      )
                    }
                  >
                    {priceOptions.map(
                      (item) => (
                        <option
                          value={item.value}
                          key={item.label}
                        >
                          {item.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Entry type
                  <select
                    value={entryCondition}
                    onChange={(event) =>
                      setEntryCondition(
                        event.target.value,
                      )
                    }
                  >
                    <option value="ALL">
                      Any entry type
                    </option>

                    {entryOptions.map(
                      (item) => (
                        <option
                          value={item.value}
                          key={item.value}
                        >
                          {item.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
            </div>

            <div className="filter-column">
              <div className="filter-group">
                <h3>Music genre</h3>

                <div className="chip-row">
                  {genres.map((item) => (
                    <button
                      className={
                        genre === item.value
                          ? 'chip active'
                          : 'chip'
                      }
                      type="button"
                      key={item.value}
                      onClick={() =>
                        setGenre(item.value)
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>Where</h3>

                <label>
                  Area
                  <select
                    value={area}
                    onChange={(event) =>
                      setArea(
                        event.target.value,
                      )
                    }
                  >
                    <option value="ALL">
                      All areas
                    </option>

                    {areas.map((item) => (
                      <option
                        value={item.value}
                        key={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Venue type
                  <select
                    value={venueCategory}
                    onChange={(event) =>
                      setVenueCategory(
                        event.target
                          .value as
                          | VenueCategory
                          | 'ALL',
                      )
                    }
                  >
                    {categories.map(
                      (item) => (
                        <option
                          value={item.value}
                          key={item.value}
                        >
                          {item.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              <div className="filter-group">
                <h3>Order</h3>

                <label>
                  Sort by
                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(
                        event.target.value,
                      )
                    }
                  >
                    <option value="popularity">
                      Most popular
                    </option>

                    <option value="date">
                      Nearest date
                    </option>

                    <option value="price">
                      Lowest price
                    </option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="secondary-action filter-reset-button"
              type="button"
              onClick={resetFilters}
            >
              Reset filters
            </button>

            <button
              className="filter-apply-button"
              type="button"
              onClick={() =>
                setFiltersOpen(false)
              }
            >
              Apply filters
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <StateBlock
          title="Loading events"
          message="Fetching nightlife data from the backend."
        />
      ) : events.length === 0 ? (
        <section className="empty-results">
          <strong>
            No events match these filters
          </strong>

          <span>
            Try a different date, price, area or
            search term.
          </span>

          <button
            type="button"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </section>
      ) : (
        <>
          <section className="section-block">
            <div className="section-heading">
              <h2>Weekly promotions</h2>

              <Link to="/feed">
                View all
              </Link>
            </div>

            <div className="horizontal-list">
              {promos.map((event) => (
                <EventCard
                  compact
                  event={event}
                  key={event.id}
                  saved={savedIds.has(event.id)}
                  friendsAttending={
                    friendsByEvent[event.id] ?? []
                  }
                />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h2>Best in your area</h2>
            </div>

            <div className="spotlight-carousel">
              {featured.map((event) => (
                <EventCard
                  event={event}
                  key={event.id}
                  saved={savedIds.has(event.id)}
                  friendsAttending={
                    friendsByEvent[event.id] ?? []
                  }
                />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h2>All events</h2>

              <span>
                {events.length}{' '}
                {events.length === 1
                  ? 'event'
                  : 'events'}
              </span>
            </div>

            <div className="event-list">
              {events.map((event) => (
                <EventCard
                  event={event}
                  key={event.id}
                  saved={savedIds.has(event.id)}
                  friendsAttending={
                    friendsByEvent[event.id] ?? []
                  }
                />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  )
}