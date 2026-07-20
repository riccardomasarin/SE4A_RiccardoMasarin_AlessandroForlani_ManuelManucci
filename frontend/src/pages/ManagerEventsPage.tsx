import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import {
  formatCurrency,
  formatDateTime,
  readableGenre,
} from '../api/format'
import {
  nightoutApi,
  type UpdateEventRequest,
} from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { imageForId } from '../components/images'
import { useSession } from '../session'
import type {
  EventDetailDto,
  MusicGenre,
} from '../types/nightout'

type EventFilter =
  | 'all'
  | 'active'
  | 'past'

type EditEventForm = {
  title: string
  description: string
  venueId: string
  startsAt: string
  endsAt: string
  musicGenre: MusicGenre
  dressCode: string
  ageRestriction: string
  entryCondition: string
  price: string
  vipPrice: string
  capacity: string
  imageUrl: string
}

const genres: MusicGenre[] = [
  'TECHNO',
  'HOUSE',
  'HIP_HOP',
  'RNB',
  'POP',
  'COMMERCIAL',
  'LATIN',
  'ROCK',
  'LIVE_MUSIC',
]

export function ManagerEventsPage() {
  const { user } = useSession()

  const [events, setEvents] =
    useState<EventDetailDto[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [successMessage, setSuccessMessage] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [eventFilter, setEventFilter] =
    useState<EventFilter>('all')

  const [editingEvent, setEditingEvent] =
    useState<EventDetailDto | null>(null)

  const [editForm, setEditForm] =
    useState<EditEventForm | null>(null)

  const [saving, setSaving] =
    useState(false)

  const [
    deletingEventId,
    setDeletingEventId,
  ] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadEvents() {
      if (!user) {
        return
      }

      setLoading(true)
      setError('')

      try {
        const data =
          await nightoutApi.getManagerEvents(
            user.id,
          )

        if (!cancelled) {
          setEvents(data)
        }
      } catch {
        if (!cancelled) {
          setError(
            'Could not load the venue events. Check that the backend is running.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadEvents()

    return () => {
      cancelled = true
    }
  }, [user])

  const filteredEvents =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase()

      const now = Date.now()

      return events
        .filter((event) => {
          const eventEndTime =
            getEventEndTime(event)

          const matchesSearch =
            !normalizedSearch
            || event.title
              .toLowerCase()
              .includes(normalizedSearch)
            || event.venue.name
              .toLowerCase()
              .includes(normalizedSearch)

          /*
           * Un evento è ancora attivo finché
           * non viene raggiunto endsAt.
           *
           * Sono quindi considerati attivi sia
           * gli eventi futuri sia quelli in corso.
           */
          const matchesStatus =
            eventFilter === 'all'
            || (
              eventFilter === 'active'
              && eventEndTime >= now
            )
            || (
              eventFilter === 'past'
              && eventEndTime < now
            )

          return (
            matchesSearch
            && matchesStatus
          )
        })
        .sort(
          (
            firstEvent,
            secondEvent,
          ) =>
            new Date(
              firstEvent.startsAt,
            ).getTime()
            - new Date(
              secondEvent.startsAt,
            ).getTime(),
        )
    }, [
      events,
      search,
      eventFilter,
    ])

  const activeEvents =
    useMemo(
      () =>
        events.filter(
          (event) =>
            getEventEndTime(event)
            >= Date.now(),
        ).length,
      [events],
    )

  function openEditModal(
    event: EventDetailDto,
  ) {
    setEditingEvent(event)

    setEditForm({
      title: event.title,
      description: event.description,
      venueId: String(event.venue.id),
      startsAt: toDateTimeLocal(
        event.startsAt,
      ),
      endsAt: toDateTimeLocal(
        event.endsAt,
      ),
      musicGenre: event.musicGenre,
      dressCode: event.dressCode,
      ageRestriction:
        event.ageRestriction,
      entryCondition:
        event.entryCondition,
      price: String(event.price),
      vipPrice: String(event.vipPrice),
      capacity: String(event.capacity),
      imageUrl: event.imageUrl ?? '',
    })

    setError('')
    setSuccessMessage('')
  }

  function closeEditModal() {
    if (saving) {
      return
    }

    setEditingEvent(null)
    setEditForm(null)
  }

  function updateEditField(
    field: keyof EditEventForm,
    value: string,
  ) {
    setEditForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    )
  }

  function updateEditStartTime(
    value: string,
  ) {
    setEditForm((current) => {
      if (!current) {
        return current
      }

      if (!value) {
        return {
          ...current,
          startsAt: '',
        }
      }

      const startDate =
        new Date(value)

      const currentEndDate =
        new Date(current.endsAt)

      const endIsInvalid =
        !current.endsAt
        || Number.isNaN(
          currentEndDate.getTime(),
        )
        || currentEndDate.getTime()
        <= startDate.getTime()

      if (!endIsInvalid) {
        return {
          ...current,
          startsAt: value,
        }
      }

      /*
       * Se il nuovo inizio supera la vecchia
       * fine, propone una nuova fine sei ore
       * dopo l'inizio.
       */
      startDate.setHours(
        startDate.getHours() + 6,
      )

      return {
        ...current,
        startsAt: value,
        endsAt:
          toDateTimeLocalFromDate(
            startDate,
          ),
      }
    })
  }

  async function saveEventChanges(
    formEvent:
      FormEvent<HTMLFormElement>,
  ) {
    formEvent.preventDefault()

    if (
      !user
      || !editingEvent
      || !editForm
      || saving
    ) {
      return
    }

    if (
      !editForm.title.trim()
      || !editForm.description.trim()
      || !editForm.startsAt
      || !editForm.endsAt
      || !editForm.dressCode.trim()
      || !editForm.ageRestriction.trim()
      || !editForm.entryCondition.trim()
    ) {
      setError(
        'Please complete all required fields.',
      )
      return
    }

    const startTime =
      new Date(
        editForm.startsAt,
      ).getTime()

    const endTime =
      new Date(
        editForm.endsAt,
      ).getTime()

    if (
      Number.isNaN(startTime)
      || Number.isNaN(endTime)
    ) {
      setError(
        'Enter valid start and end times.',
      )
      return
    }

    if (endTime <= startTime) {
      setError(
        'End date and time must be after the start.',
      )
      return
    }

    const price =
      Number(editForm.price)

    const vipPrice =
      Number(editForm.vipPrice)

    const capacity =
      Number(editForm.capacity)

    if (
      Number.isNaN(price)
      || Number.isNaN(vipPrice)
      || Number.isNaN(capacity)
      || price < 0
      || vipPrice < 0
      || capacity < 1
    ) {
      setError(
        'Prices cannot be negative and capacity must be at least 1.',
      )
      return
    }

    const request:
      UpdateEventRequest = {
        title:
          editForm.title.trim(),

        description:
          editForm.description.trim(),

        venueId:
          Number(editForm.venueId),

        managerId:
          user.id,

        /*
         * datetime-local produce già un formato
         * compatibile con LocalDateTime:
         * YYYY-MM-DDTHH:mm
         */
        startsAt:
          editForm.startsAt,

        endsAt:
          editForm.endsAt,

        musicGenre:
          editForm.musicGenre,

        dressCode:
          editForm.dressCode.trim(),

        ageRestriction:
          editForm
            .ageRestriction
            .trim(),

        entryCondition:
          editForm
            .entryCondition
            .trim(),

        price,

        vipPrice,

        capacity,

        imageUrl:
          editForm.imageUrl.trim()
          || '/demo/new-event.jpg',
      }

    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const updated =
        await nightoutApi
          .updateManagerEvent(
            editingEvent.id,
            request,
          )

      setEvents(
        (currentEvents) =>
          currentEvents.map(
            (event) =>
              event.id === updated.id
                ? updated
                : event,
          ),
      )

      setSuccessMessage(
        'Event updated successfully.',
      )

      /*
       * Non utilizziamo closeEditModal()
       * perché saving è ancora true.
       */
      setEditingEvent(null)
      setEditForm(null)
    } catch {
      setError(
        'Could not update the event. Check the entered information.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteEvent(
    event: EventDetailDto,
  ) {
    if (!user) {
      return
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      )

    if (!confirmed) {
      return
    }

    setDeletingEventId(event.id)
    setError('')
    setSuccessMessage('')

    try {
      await nightoutApi
        .deleteManagerEvent(
          event.id,
          user.id,
        )

      setEvents(
        (currentEvents) =>
          currentEvents.filter(
            (currentEvent) =>
              currentEvent.id
              !== event.id,
          ),
      )

      setSuccessMessage(
        'Event deleted successfully.',
      )
    } catch {
      setError(
        'Could not delete the event. Only its creator can delete it.',
      )
    } finally {
      setDeletingEventId(null)
    }
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
        title="Loading events"
        message="Fetching venue events."
      />
    )
  }

  return (
    <section className="page-stack manager-events-page">
      <PageHeader
        title="Events"
        subtitle="Create and manage your venue events."
        action={
          <Link
            className="small-action create-action"
            to="/manager/events/new"
          >
            Create event
          </Link>
        }
      />

      {error && (
        <p className="inline-error">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="inline-success">
          {successMessage}
        </p>
      )}

      <section className="manager-events-summary">
        <div>
          <span>Total events</span>

          <strong>
            {events.length}
          </strong>
        </div>

        <div>
          <span>Active events</span>

          <strong>
            {activeEvents}
          </strong>
        </div>

        <div>
          <span>Past events</span>

          <strong>
            {events.length
              - activeEvents}
          </strong>
        </div>
      </section>

      <section className="manager-events-toolbar">
        <label className="manager-event-search">
          <span>Search events</span>

          <input
            type="search"
            placeholder="Search by event or venue..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </label>

        <div className="manager-event-filter-buttons">
          <button
            className={
              eventFilter === 'all'
                ? 'active'
                : undefined
            }
            type="button"
            onClick={() =>
              setEventFilter('all')
            }
          >
            All
          </button>

          <button
            className={
              eventFilter === 'active'
                ? 'active'
                : undefined
            }
            type="button"
            onClick={() =>
              setEventFilter('active')
            }
          >
            Active
          </button>

          <button
            className={
              eventFilter === 'past'
                ? 'active'
                : undefined
            }
            type="button"
            onClick={() =>
              setEventFilter('past')
            }
          >
            Past
          </button>
        </div>
      </section>

      {filteredEvents.length === 0 ? (
        <div className="manager-events-empty">
          <strong>
            No events found
          </strong>

          <span>
            Create a new event or change
            the selected filters.
          </span>

          <Link
            className="primary-action"
            to="/manager/events/new"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="manager-events-grid">
          {filteredEvents.map(
            (event) => {
              const now =
                Date.now()

              const startTime =
                new Date(
                  event.startsAt,
                ).getTime()

              const endTime =
                getEventEndTime(event)

              const isPast =
                endTime < now

              const isOngoing =
                startTime <= now
                && endTime >= now

              const statusLabel =
                isPast
                  ? 'Past event'
                  : isOngoing
                    ? 'Ongoing'
                    : 'Upcoming'

              return (
                <article
                  className="manager-event-card"
                  key={event.id}
                >
                  <div className="manager-event-image">
                    <img
                      src={imageForId(
                        event.id,
                      )}
                      alt={`${event.title} event`}
                    />

                    <span
                      className={
                        isPast
                          ? 'manager-event-status past'
                          : 'manager-event-status active'
                      }
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="manager-event-content">
                    <div className="manager-event-heading">
                      <div>
                        <h2>
                          {event.title}
                        </h2>

                        <p>
                          {event.venue.name}
                        </p>
                      </div>

                      <span className="chip active">
                        {readableGenre(
                          event.musicGenre,
                        )}
                      </span>
                    </div>

                    <div className="manager-event-details">
                      <div>
                        <span>Starts</span>

                        <strong>
                          {formatDateTime(
                            event.startsAt,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Ends</span>

                        <strong>
                          {formatDateTime(
                            event.endsAt,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Standard price
                        </span>

                        <strong>
                          {formatCurrency(
                            event.price,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>VIP price</span>

                        <strong>
                          {formatCurrency(
                            event.vipPrice,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Capacity</span>

                        <strong>
                          {event.capacity}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Tickets confirmed
                        </span>

                        <strong>
                          {
                            event
                              .confirmedTickets
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Available spots
                        </span>

                        <strong>
                          {
                            event
                              .availableSpots
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="manager-event-actions">
                      <Link
                        className="secondary-action"
                        to={`/events/${event.id}`}
                      >
                        View
                      </Link>

                      <button
                        className="secondary-action"
                        type="button"
                        onClick={() =>
                          openEditModal(
                            event,
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="danger-action"
                        type="button"
                        onClick={() =>
                          deleteEvent(
                            event,
                          )
                        }
                        disabled={
                          deletingEventId
                          === event.id
                        }
                      >
                        {deletingEventId
                          === event.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            },
          )}
        </div>
      )}

      {editingEvent && editForm && (
        <div
          className="manager-event-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target
              === event.currentTarget
            ) {
              closeEditModal()
            }
          }}
        >
          <section
            className="manager-event-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-event-title"
          >
            <div className="manager-event-modal-header">
              <div>
                <h2 id="edit-event-title">
                  Edit event
                </h2>

                <p>
                  Update event information,
                  times, prices and
                  availability.
                </p>
              </div>

              <button
                className="manager-event-modal-close"
                type="button"
                aria-label="Close edit event form"
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>

            <form
              className="manager-event-edit-form"
              onSubmit={
                saveEventChanges
              }
            >
              <label className="manager-event-form-full">
                <span>
                  Event title *
                </span>

                <input
                  type="text"
                  value={editForm.title}
                  onChange={(event) =>
                    updateEditField(
                      'title',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label className="manager-event-form-full">
                <span>
                  Description *
                </span>

                <textarea
                  value={
                    editForm.description
                  }
                  onChange={(event) =>
                    updateEditField(
                      'description',
                      event.target.value,
                    )
                  }
                  rows={5}
                  required
                />
              </label>

              <label>
                <span>
                  Start date and time *
                </span>

                <input
                  type="datetime-local"
                  value={
                    editForm.startsAt
                  }
                  onChange={(event) =>
                    updateEditStartTime(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>
                  End date and time *
                </span>

                <input
                  type="datetime-local"
                  value={
                    editForm.endsAt
                  }
                  min={
                    editForm.startsAt
                    || undefined
                  }
                  onChange={(event) =>
                    updateEditField(
                      'endsAt',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Music genre *
                </span>

                <select
                  value={
                    editForm.musicGenre
                  }
                  onChange={(event) =>
                    updateEditField(
                      'musicGenre',
                      event.target
                        .value as MusicGenre,
                    )
                  }
                >
                  {genres.map(
                    (genre) => (
                      <option
                        value={genre}
                        key={genre}
                      >
                        {genre.replaceAll(
                          '_',
                          '-',
                        )}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span>Dress code *</span>

                <input
                  type="text"
                  value={
                    editForm.dressCode
                  }
                  onChange={(event) =>
                    updateEditField(
                      'dressCode',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Age restriction *
                </span>

                <input
                  type="text"
                  value={
                    editForm
                      .ageRestriction
                  }
                  onChange={(event) =>
                    updateEditField(
                      'ageRestriction',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label className="manager-event-form-full">
                <span>
                  Entry conditions *
                </span>

                <input
                  type="text"
                  value={
                    editForm
                      .entryCondition
                  }
                  onChange={(event) =>
                    updateEditField(
                      'entryCondition',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Standard price *
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.price}
                  onChange={(event) =>
                    updateEditField(
                      'price',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>VIP price *</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    editForm.vipPrice
                  }
                  onChange={(event) =>
                    updateEditField(
                      'vipPrice',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>Capacity *</span>

                <input
                  type="number"
                  min="1"
                  value={
                    editForm.capacity
                  }
                  onChange={(event) =>
                    updateEditField(
                      'capacity',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>Image URL</span>

                <input
                  type="text"
                  value={
                    editForm.imageUrl
                  }
                  onChange={(event) =>
                    updateEditField(
                      'imageUrl',
                      event.target.value,
                    )
                  }
                />
              </label>

              <div className="manager-event-modal-actions">
                <button
                  className="secondary-action"
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="primary-action"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

function getEventEndTime(
  event: EventDetailDto,
) {
  const parsedEndTime =
    new Date(
      event.endsAt,
    ).getTime()

  if (
    !Number.isNaN(
      parsedEndTime,
    )
  ) {
    return parsedEndTime
  }

  /*
   * Fallback per eventuali vecchi dati:
   * se endsAt manca, considera sei ore.
   */
  return (
    new Date(
      event.startsAt,
    ).getTime()
    + 6 * 60 * 60 * 1000
  )
}

function toDateTimeLocal(
  value: string,
) {
  return toDateTimeLocalFromDate(
    new Date(value),
  )
}

function toDateTimeLocalFromDate(
  date: Date,
) {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0')

  const hours =
    String(
      date.getHours(),
    ).padStart(2, '0')

  const minutes =
    String(
      date.getMinutes(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}