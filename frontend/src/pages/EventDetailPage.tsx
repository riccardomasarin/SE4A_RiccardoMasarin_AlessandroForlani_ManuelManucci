import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  formatCurrency,
  formatDateTime,
  readableGenre,
} from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { MetricCard } from '../components/MetricCard'
import { StateBlock } from '../components/StateBlock'
import { imageForId } from '../components/images'
import { useSession } from '../session'
import type {
  EventDetailDto,
  FriendUserDto,
} from '../types/nightout'

const BACKEND_URL = 'http://localhost:8080'

function resolveAvatarUrl(avatarUrl: string | null) {
  if (!avatarUrl) {
    return ''
  }

  if (
    avatarUrl.startsWith('http://') ||
    avatarUrl.startsWith('https://') ||
    avatarUrl.startsWith('blob:') ||
    avatarUrl.startsWith('data:')
  ) {
    return avatarUrl
  }

  return `${BACKEND_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`
}

function getInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase()
}

function getFriendsAttendingMessage(
  friends: FriendUserDto[],
) {
  if (friends.length === 1) {
    return `${friends[0].name} is attending`
  }

  if (friends.length === 2) {
    return `${friends[0].name} and ${friends[1].name} are attending`
  }

  const remainingFriends = friends.length - 2

  return `${friends[0].name}, ${friends[1].name} and ${remainingFriends} ${
    remainingFriends === 1 ? 'other friend' : 'other friends'
  } are attending`
}

export function EventDetailPage() {
  const { user } = useSession()
  const { id } = useParams()

  const eventId = Number(id)

  const [event, setEvent] = useState<EventDetailDto | null>(null)

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [shareMessage, setShareMessage] = useState('')

  const [friendsAttending, setFriendsAttending] = useState<
    FriendUserDto[]
  >([])

  const [friendsLoading, setFriendsLoading] = useState(false)
  const [friendsError, setFriendsError] = useState('')

  const [error, setError] = useState(false)

  useEffect(() => {
    if (!eventId) {
      return
    }

    nightoutApi
      .getEvent(eventId, user?.id)
      .then((data) => {
        setEvent(data)
        setError(false)
      })
      .catch(() => {
        setError(true)
      })
  }, [eventId, user?.id])

  useEffect(() => {
    if (!eventId || !user) {
      return
    }

    setSaveError('')

    nightoutApi
      .getSavedEvent(user.id, eventId)
      .then((data) => {
        setSaved(data.saved)
      })
      .catch(() => {
        setSaveError('Saved state unavailable.')
      })
  }, [eventId, user])

  useEffect(() => {
    if (!eventId || !user) {
      setFriendsAttending([])
      setFriendsLoading(false)
      setFriendsError('')
      return
    }

    setFriendsLoading(true)
    setFriendsError('')

    nightoutApi
      .getFriendsAttending(user.id, eventId)
      .then((data) => {
        setFriendsAttending(data)
      })
      .catch(() => {
        setFriendsAttending([])
        setFriendsError(
          'Could not load friends attending this event.',
        )
      })
      .finally(() => {
        setFriendsLoading(false)
      })
  }, [eventId, user])

  const toggleSaved = async () => {
    if (!user || !event || saving) {
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      const nextState = saved
        ? await nightoutApi.unsaveEvent(user.id, event.id)
        : await nightoutApi.saveEvent(user.id, event.id)

      setSaved(nextState.saved)
    } catch {
      setSaveError('Could not update saved events.')
    } finally {
      setSaving(false)
    }
  }

  const shareEvent = async () => {
    if (!event) {
      return
    }

    setShareMessage('')

    const shareData = {
      title: event.title,
      text: `Check out ${event.title} at ${event.venue.address}.`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(
          window.location.href,
        )

        setShareMessage('Event link copied.')
      }
    } catch {
      setShareMessage('The event could not be shared.')
    }
  }

  if (error) {
    return (
      <StateBlock
        title="Event unavailable"
        message="The backend did not return this event."
      />
    )
  }

  if (!event) {
    return (
      <StateBlock
        title="Loading event"
        message="Opening event details."
      />
    )
  }

  const mapsQuery = encodeURIComponent(
    `${event.venue.address}, ${event.venue.city}`,
  )

  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  return (
    <article className="event-detail page-stack">
      <img
        className="detail-hero"
        src={imageForId(event.id)}
        alt={`${event.title} event`}
      />

      <div className="detail-title">
        <h1>{event.title}</h1>

        <p>
          {event.venue.address} · {event.venue.city}
        </p>

        <div className="chip-row">
          <span className="chip active">
            {readableGenre(event.musicGenre)}
          </span>

          <span className="chip">
            {event.ageRestriction}
          </span>

          <span className="chip">
            {event.dressCode}
          </span>
        </div>
      </div>

      <div className="action-grid">
        <button
          className={saved ? 'saved' : undefined}
          type="button"
          onClick={toggleSaved}
          disabled={saving}
        >
          {saving
            ? 'Saving...'
            : saved
              ? 'Saved'
              : 'Save'}
        </button>

        <button
          type="button"
          onClick={shareEvent}
        >
          Share
        </button>

        <Link to={`/transport/${event.id}`}>
          Syncride
        </Link>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
      </div>

      {saveError && (
        <p className="inline-error">
          {saveError}
        </p>
      )}

      {shareMessage && (
        <p className="inline-message">
          {shareMessage}
        </p>
      )}

      <div className="info-grid">
        <MetricCard
          label="Date and time"
          value={formatDateTime(event.startsAt)}
        />

        <MetricCard
          label="Entry"
          value={`${formatCurrency(event.price)} / VIP ${formatCurrency(event.vipPrice)}`}
        />

        <MetricCard
          label="Availability"
          value={event.availableSpots}
          hint={`${event.confirmedTickets} confirmed`}
        />

        <MetricCard
          label="Rating"
          value={`${event.venue.rating} stars`}
        />

        <MetricCard
          label="Distance from you"
          value={
            event.distanceKm !== null
              ? `${event.distanceKm} km`
              : 'Unavailable'
          }
        />
      </div>

      <section className="section-block friends-attending-section">
        <div className="section-heading">
          <div>
            <h2>Friends attending</h2>

            <p className="section-description">
              See which of your friends already have a confirmed
              ticket.
            </p>
          </div>

          {!friendsLoading && !friendsError && (
            <span>
              {friendsAttending.length}{' '}
              {friendsAttending.length === 1
                ? 'friend'
                : 'friends'}
            </span>
          )}
        </div>

        {friendsLoading ? (
          <div className="friends-attending-card">
            <span className="friends-attending-status">
              Loading friends...
            </span>
          </div>
        ) : friendsError ? (
          <p className="inline-error">
            {friendsError}
          </p>
        ) : friendsAttending.length === 0 ? (
          <div className="friends-attending-card friends-attending-empty">
            <strong>No friends attending yet</strong>

            <span>
              Friends with a confirmed ticket will appear here.
            </span>
          </div>
        ) : (
          <div className="friends-attending-card">
            <div className="friends-attending-avatars">
              {friendsAttending
                .slice(0, 6)
                .map((friend) => {
                  const avatarUrl = resolveAvatarUrl(
                    friend.avatarUrl,
                  )

                  return (
                    <div
                      className="friends-attending-avatar"
                      key={friend.id}
                      title={friend.name}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${friend.name} profile`}
                        />
                      ) : (
                        <span>
                          {getInitial(friend.name)}
                        </span>
                      )}
                    </div>
                  )
                })}

              {friendsAttending.length > 6 && (
                <div className="friends-attending-avatar friends-attending-more">
                  +{friendsAttending.length - 6}
                </div>
              )}
            </div>

            <div className="friends-attending-copy">
              <strong>
                {getFriendsAttendingMessage(
                  friendsAttending,
                )}
              </strong>

              <span>
                They already have a confirmed ticket for this
                event.
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="section-block">
        <h2>About this event</h2>

        <p className="body-copy">
          {event.description}
        </p>

        <div className="event-information-grid">
          <div className="event-information-item">
            <strong>Music</strong>

            <span>
              {readableGenre(event.musicGenre)}
            </span>
          </div>

          <div className="event-information-item">
            <strong>Dress code</strong>

            <span>{event.dressCode}</span>
          </div>

          <div className="event-information-item">
            <strong>Age requirement</strong>

            <span>{event.ageRestriction}</span>
          </div>

          <div className="event-information-item">
            <strong>Available spots</strong>

            <span>{event.availableSpots}</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Venue location</h2>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Get directions
          </a>
        </div>

        <div className="location-card">
          <div className="location-details">
            <strong>{event.venue.address}</strong>

            <span>
              {event.venue.city}
              {event.distanceKm !== null
                ? ` · ${event.distanceKm} km away`
                : ''}
            </span>
          </div>

          <a
            className="secondary-action"
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
      </section>

      <section className="section-block">
        <h2>Tonight&apos;s vibe</h2>

        <div className="vibe-bars">
          <Vibe
            label="Atmosphere"
            value={event.atmosphereScore}
          />

          <Vibe
            label="Music"
            value={event.musicScore}
          />

          <Vibe
            label="Drinks"
            value={event.drinkScore}
          />

          <Vibe
            label="Waiting time"
            value={event.lineScore}
          />
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Related pregames</h2>

          <Link to={`/pregames?eventId=${event.id}`}>
            View all
          </Link>
        </div>

        <div className="compact-list">
          {event.pregames.slice(0, 3).map((room) => (
            <div
              className="list-tile"
              key={room.id}
            >
              <strong>{room.title}</strong>

              <span>
                {room.currentParticipants} /{' '}
                {room.maxParticipants} people
              </span>
            </div>
          ))}
        </div>
      </section>

      <Link
        className="primary-action sticky-action"
        to={`/checkout/${event.id}`}
      >
        Buy ticket
      </Link>
    </article>
  )
}

function Vibe({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="vibe-row">
      <span>{label}</span>

      <div>
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}