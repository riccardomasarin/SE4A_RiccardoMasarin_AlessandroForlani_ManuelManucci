import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatTime } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { imageForId } from '../components/images'
import { useSession } from '../session'
import type { PregameRoomDto } from '../types/nightout'

type PregameSort = 'time' | 'availability' | 'name'

type PregameFormData = {
  title: string
  eventId: string
  meetingLocation: string
  meetingDate: string
  meetingTime: string
  maxParticipants: string
  description: string
}

type ExtendedNightoutApi = typeof nightoutApi & {
  deletePregame?: (
    roomId: number,
    userId: number,
  ) => Promise<void>
}

const initialFormData: PregameFormData = {
  title: '',
  eventId: '',
  meetingLocation: '',
  meetingDate: '',
  meetingTime: '',
  maxParticipants: '8',
  description: '',
}

export function PregamePage() {
  const { user } = useSession()
  const [searchParams] = useSearchParams()
  const eventIdFromUrl = searchParams.get('eventId')

  const [rooms, setRooms] = useState<PregameRoomDto[]>([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [locationFilter, setLocationFilter] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sortBy, setSortBy] = useState<PregameSort>('time')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null)

  const [formData, setFormData] = useState<PregameFormData>({
    ...initialFormData,
    eventId: eventIdFromUrl ?? '',
  })

  function loadRooms() {
    setLoading(true)

    nightoutApi
      .getPregames(
        eventIdFromUrl
          ? Number(eventIdFromUrl)
          : undefined,
      )
      .then((data) => {
        setRooms(data)
        setError('')
      })
      .catch(() => {
        setError(
          'Could not load pregames. Start the backend and try again.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(loadRooms, [eventIdFromUrl])

  const filteredRooms = useMemo(() => {
    const normalizedSearch =
      locationFilter.trim().toLowerCase()

    const filtered = rooms.filter((room) => {
      const matchesLocation =
        !normalizedSearch ||
        room.meetingLocation
          .toLowerCase()
          .includes(normalizedSearch) ||
        room.eventTitle
          .toLowerCase()
          .includes(normalizedSearch) ||
        room.title
          .toLowerCase()
          .includes(normalizedSearch)

      const hasAvailableSpots =
        room.currentParticipants <
        room.maxParticipants

      return (
        matchesLocation &&
        (!onlyAvailable || hasAvailableSpots)
      )
    })

    return [...filtered].sort(
      (firstRoom, secondRoom) => {
        if (sortBy === 'availability') {
          const firstAvailable =
            firstRoom.maxParticipants -
            firstRoom.currentParticipants

          const secondAvailable =
            secondRoom.maxParticipants -
            secondRoom.currentParticipants

          return secondAvailable - firstAvailable
        }

        if (sortBy === 'name') {
          return firstRoom.title.localeCompare(
            secondRoom.title,
          )
        }

        return (
          new Date(
            firstRoom.meetingTime,
          ).getTime() -
          new Date(
            secondRoom.meetingTime,
          ).getTime()
        )
      },
    )
  }, [
    rooms,
    locationFilter,
    onlyAvailable,
    sortBy,
  ])

  const activeRooms = useMemo(
    () =>
      filteredRooms.filter(
        (room) => !room.officialPartner,
      ),
    [filteredRooms],
  )

  const officialRooms = useMemo(
    () =>
      filteredRooms.filter(
        (room) => room.officialPartner,
      ),
    [filteredRooms],
  )

  const activeFilterCount = [
    locationFilter.trim(),
    onlyAvailable,
    sortBy !== 'time',
  ].filter(Boolean).length

  async function joinRoom(roomId: number) {
    if (!user) return

    setError('')
    setSuccessMessage('')

    try {
      const updated =
        await nightoutApi.joinPregame(
          roomId,
          user.id,
        )

      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === updated.id
            ? updated
            : room,
        ),
      )

      setSuccessMessage(
        `You joined ${updated.title}.`,
      )
    } catch {
      setError(
        'Could not join this pregame. The room may be full or you may already be a participant.',
      )
    }
  }

  function openCreateModal() {
    if (!user) {
      setError(
        'You must be logged in to create a pregame.',
      )
      return
    }

    setFormData({
      ...initialFormData,
      eventId: eventIdFromUrl ?? '',
    })

    setError('')
    setSuccessMessage('')
    setCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (creating) return

    setCreateModalOpen(false)
    setFormData({
      ...initialFormData,
      eventId: eventIdFromUrl ?? '',
    })
  }

  function updateFormField(
    field: keyof PregameFormData,
    value: string,
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function createRoom(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!user || creating) return

    if (
      !formData.title.trim() ||
      !formData.eventId ||
      !formData.meetingLocation.trim() ||
      !formData.meetingDate ||
      !formData.meetingTime ||
      !formData.maxParticipants ||
      !formData.description.trim()
    ) {
      setError(
        'Please complete all required fields.',
      )
      return
    }

    const maximumParticipants = Number(
      formData.maxParticipants,
    )

    if (
      Number.isNaN(maximumParticipants) ||
      maximumParticipants < 2
    ) {
      setError(
        'The pregame must allow at least 2 participants.',
      )
      return
    }

    const meetingDateTime = new Date(
      `${formData.meetingDate}T${formData.meetingTime}`,
    )

    if (
      Number.isNaN(meetingDateTime.getTime())
    ) {
      setError(
        'Please select a valid date and time.',
      )
      return
    }

    if (
      meetingDateTime.getTime() <= Date.now()
    ) {
      setError(
        'The meeting date must be in the future.',
      )
      return
    }

    setCreating(true)
    setError('')
    setSuccessMessage('')

    try {
      await nightoutApi.createPregame({
        title: formData.title.trim(),
        eventId: Number(formData.eventId),
        hostId: user.id,
        meetingLocation:
          formData.meetingLocation.trim(),
        meetingTime:
          meetingDateTime.toISOString(),
        maxParticipants:
          maximumParticipants,
        description:
          formData.description.trim(),
        imageUrl:
          '/demo/pregame-created.jpg',
        officialPartner: false,
      })

      setSuccessMessage(
        'Pregame created successfully.',
      )

      closeCreateModal()
      loadRooms()
    } catch {
      setError(
        'Could not create the pregame. Check the information and try again.',
      )
    } finally {
      setCreating(false)
    }
  }

  async function deleteRoom(
    room: PregameRoomDto,
  ) {
    if (!user) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${room.title}"? This action cannot be undone.`,
    )

    if (!confirmed) return

    const api =
      nightoutApi as ExtendedNightoutApi

    if (!api.deletePregame) {
      setError(
        'Pregame deletion is not available yet. A delete endpoint must be added to the backend and to nightoutApi.',
      )
      return
    }

    setDeletingRoomId(room.id)
    setError('')
    setSuccessMessage('')

    try {
      await api.deletePregame(
        room.id,
        user.id,
      )

      setRooms((currentRooms) =>
        currentRooms.filter(
          (currentRoom) =>
            currentRoom.id !== room.id,
        ),
      )

      setSuccessMessage(
        'Pregame deleted successfully.',
      )
    } catch {
      setError(
        'Could not delete this pregame. Only the host can delete it.',
      )
    } finally {
      setDeletingRoomId(null)
    }
  }

  function resetFilters() {
    setLocationFilter('')
    setOnlyAvailable(false)
    setSortBy('time')
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Pregame"
        subtitle="Find people to start the night with."
        action={
          <button
            className="small-action"
            type="button"
            onClick={openCreateModal}
          >
            Create pregame
          </button>
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

      <section className="pregame-search-section">
        <div className="pregame-search-header">
          <div>
            <h2>Find a pregame</h2>
            <p>
              Search by area, destination or
              availability.
            </p>
          </div>

          <button
            className={
  filtersOpen
    ? 'pregame-filter-toggle active'
    : 'pregame-filter-toggle'
}
            type="button"
            onClick={() =>
              setFiltersOpen((open) => !open)
            }
          >
            Filters
            {activeFilterCount > 0
              ? ` (${activeFilterCount})`
              : ''}
          </button>
        </div>

        <div className="pregame-main-search">
          <label>
            <span>Area, venue or event</span>

            <input
              type="search"
              placeholder="Search for a location, venue or event..."
              value={locationFilter}
              onChange={(event) =>
                setLocationFilter(
                  event.target.value,
                )
              }
            />
          </label>
        </div>

        {filtersOpen && (
          <div className="pregame-extra-filters">
            <label>
              <span>Sort results</span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target
                      .value as PregameSort,
                  )
                }
              >
                <option value="time">
                  Earliest meeting time
                </option>

                <option value="availability">
                  Most available spots
                </option>

                <option value="name">
                  Pregame name
                </option>
              </select>
            </label>

            <label className="pregame-availability-toggle">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(event) =>
                  setOnlyAvailable(
                    event.target.checked,
                  )
                }
              />

              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>

              <span>
                Only show rooms with available
                spots
              </span>
            </label>

            <button
  className="secondary-action pregame-reset-button"
  type="button"
  onClick={resetFilters}
>
  Reset filters
</button>
          </div>
        )}
      </section>

      {loading ? (
        <StateBlock
          title="Loading pregames"
          message="Fetching pregame rooms."
        />
      ) : (
        <>
          <section className="section-block">
            <div className="section-heading">
              <h2>Active pregames tonight</h2>
              <span>{activeRooms.length}</span>
            </div>

            {activeRooms.length === 0 ? (
              <StateBlock
                title="No pregames found"
                message="Try changing or resetting the filters."
              />
            ) : (
              <div className="pregame-grid">
                {activeRooms.map((room) => (
                  <PregameCard
                    room={room}
                    key={room.id}
                    userId={user?.id}
                    onJoin={joinRoom}
                    onDelete={deleteRoom}
                    deleting={
                      deletingRoomId === room.id
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <h2>
                  Official venue pregames
                </h2>

                <p className="section-description">
                  Official pregames organised
                  by partner venues.
                </p>
              </div>

              <span>{officialRooms.length}</span>
            </div>

            {officialRooms.length === 0 ? (
              <StateBlock
                title="No official pregames found"
                message="No partner venue pregames match the selected filters."
              />
            ) : (
              <div className="pregame-grid">
                {officialRooms.map((room) => (
                  <PregameCard
                    room={room}
                    key={room.id}
                    userId={user?.id}
                    onJoin={joinRoom}
                    onDelete={deleteRoom}
                    deleting={
                      deletingRoomId === room.id
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {createModalOpen && (
        <div
          className="pregame-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal()
            }
          }}
        >
          <section
            className="pregame-create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-pregame-title"
          >
            <div className="pregame-modal-header">
              <div>
                <h2 id="create-pregame-title">
                  Create a pregame
                </h2>

                <p>
                  Add the meeting information
                  and invite other users.
                </p>
              </div>

              <button
                className="pregame-modal-close"
                type="button"
                aria-label="Close create pregame form"
                onClick={closeCreateModal}
              >
                ×
              </button>
            </div>

            <form
              className="pregame-create-form"
              onSubmit={createRoom}
            >
              <label className="pregame-form-full">
                <span>Pregame name *</span>

                <input
                  type="text"
                  placeholder="Example: Aperitivo before Fabric"
                  value={formData.title}
                  onChange={(event) =>
                    updateFormField(
                      'title',
                      event.target.value,
                    )
                  }
                  maxLength={80}
                  required
                />
              </label>

              <label>
                <span>Event ID *</span>

                <input
                  type="number"
                  min="1"
                  placeholder="Event ID"
                  value={formData.eventId}
                  onChange={(event) =>
                    updateFormField(
                      'eventId',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>Maximum participants *</span>

                <input
                  type="number"
                  min="2"
                  max="50"
                  value={
                    formData.maxParticipants
                  }
                  onChange={(event) =>
                    updateFormField(
                      'maxParticipants',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label className="pregame-form-full">
                <span>Meeting point *</span>

                <input
                  type="text"
                  placeholder="Example: Via Borsieri 12, Milan"
                  value={
                    formData.meetingLocation
                  }
                  onChange={(event) =>
                    updateFormField(
                      'meetingLocation',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>Meeting date *</span>

                <input
                  type="date"
                  value={formData.meetingDate}
                  onChange={(event) =>
                    updateFormField(
                      'meetingDate',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>Meeting time *</span>

                <input
                  type="time"
                  value={formData.meetingTime}
                  onChange={(event) =>
                    updateFormField(
                      'meetingTime',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label className="pregame-form-full">
                <span>
                  Description and instructions *
                </span>

                <textarea
                  placeholder="Explain the plan, who can join and any useful instructions..."
                  value={formData.description}
                  onChange={(event) =>
                    updateFormField(
                      'description',
                      event.target.value,
                    )
                  }
                  rows={5}
                  maxLength={500}
                  required
                />

                <small>
                  {formData.description.length}/500
                </small>
              </label>

              <div className="pregame-modal-actions">
                <button
                  className="secondary-action"
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  className="primary-action"
                  type="submit"
                  disabled={creating}
                >
                  {creating
                    ? 'Creating...'
                    : 'Confirm and create'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

function PregameCard({
  room,
  userId,
  onJoin,
  onDelete,
  deleting,
}: {
  room: PregameRoomDto
  userId?: number
  onJoin: (roomId: number) => void
  onDelete: (
    room: PregameRoomDto,
  ) => void
  deleting: boolean
}) {
  const isJoined = Boolean(
    userId &&
      room.participants.some(
        (participant) =>
          participant.id === userId,
      ),
  )

  const isHost = Boolean(
    userId &&
      room.participants.some(
        (participant) =>
          participant.id === userId &&
          participant.name
            .trim()
            .toLowerCase() ===
            room.hostName
              .trim()
              .toLowerCase(),
      ),
  )

  const availableSpots =
    room.maxParticipants -
    room.currentParticipants

  const isFull = availableSpots <= 0

  return (
    <article className="pregame-card">
      <Link
        className="pregame-card-link"
        to={`/pregames/${room.id}`}
      >
        <img
          src={imageForId(
            room.id,
            'pregame',
          )}
          alt={`${room.title} pregame`}
        />
      </Link>

      <div className="pregame-card-content">
        <div className="pregame-card-information">
          <div className="pregame-card-badges">
            {room.officialPartner && (
              <span className="badge">
                Official partner
              </span>
            )}

            {isHost && (
              <span className="host-badge">
                Your pregame
              </span>
            )}
          </div>

          <h3>{room.title}</h3>

          <p>
            <strong>Destination:</strong>{' '}
            {room.eventTitle}
          </p>

          <p>
            <strong>Meeting point:</strong>{' '}
            {room.meetingLocation}
          </p>

          <p>
            <strong>Time:</strong>{' '}
            {formatTime(room.meetingTime)}
          </p>

          <p>
            <strong>Participants:</strong>{' '}
            {room.currentParticipants}/
            {room.maxParticipants}
          </p>

          <span
            className={
              isFull
                ? 'pregame-availability full'
                : 'pregame-availability'
            }
          >
            {isFull
              ? 'Full'
              : `${availableSpots} ${
                  availableSpots === 1
                    ? 'spot'
                    : 'spots'
                } available`}
          </span>
        </div>

        <div className="pregame-card-actions">
          <Link
            className="secondary-action"
            to={`/pregames/${room.id}`}
          >
            Details
          </Link>

          <button
            className="primary-action"
            type="button"
            onClick={() =>
              onJoin(room.id)
            }
            disabled={isJoined || isFull}
          >
            {isJoined
              ? 'Joined'
              : isFull
                ? 'Full'
                : 'Join pregame'}
          </button>

          {isHost && (
            <button
              className="danger-action"
              type="button"
              onClick={() =>
                onDelete(room)
              }
              disabled={deleting}
            >
              {deleting
                ? 'Deleting...'
                : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}