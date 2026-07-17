import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import { formatDateTime } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { MetricCard } from '../components/MetricCard'
import { StateBlock } from '../components/StateBlock'
import { imageForId } from '../components/images'
import { useSession } from '../session'
import type { PregameRoomDto } from '../types/nightout'

export function PregameDetailPage() {
  const { user } = useSession()
  const { roomId } = useParams()
  const id = Number(roomId)

  const [room, setRoom] = useState<PregameRoomDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [acting, setActing] = useState(false)

  useEffect(() => {
    if (!id) return

    setLoading(true)

    nightoutApi
      .getPregame(id)
      .then((data) => {
        setRoom(data)
        setError('')
      })
      .catch(() => {
        setError('Could not load this pregame room.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <StateBlock
        title="Loading pregame"
        message="Opening the pregame room."
      />
    )
  }

  if (error || !room) {
    return (
      <StateBlock
        title="Pregame unavailable"
        message={error || 'This room was not found.'}
      />
    )
  }

  const isJoined = Boolean(
    user &&
      room.participants.some(
        (participant) => participant.id === user.id,
      ),
  )

  const availableSpots =
    room.maxParticipants - room.currentParticipants

  const isFull = availableSpots <= 0

  const mapsQuery = encodeURIComponent(room.meetingLocation)

  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  const joinRoom = async () => {
    if (!user || acting || isFull || isJoined) return

    setActing(true)
    setActionError('')
    setActionMessage('')

    try {
      const updated = await nightoutApi.joinPregame(
        room.id,
        user.id,
      )

      setRoom(updated)
      setActionMessage(`You joined ${updated.title}.`)
    } catch (requestError) {
      setActionError(
        friendlyPregameError(requestError),
      )
    } finally {
      setActing(false)
    }
  }

  const leaveRoom = async () => {
    if (!user || acting || !isJoined) return

    const confirmed = window.confirm(
      'Are you sure you want to leave this pregame?',
    )

    if (!confirmed) return

    setActing(true)
    setActionError('')
    setActionMessage('')

    try {
      const updated = await nightoutApi.leavePregame(
        room.id,
        user.id,
      )

      setRoom(updated)
      setActionMessage(`You left ${updated.title}.`)
    } catch (requestError) {
      setActionError(
        friendlyPregameError(requestError),
      )
    } finally {
      setActing(false)
    }
  }

  return (
    <article className="page-stack pregame-detail">
      <img
        className="pregame-detail-hero"
        src={imageForId(room.id, 'pregame')}
        alt={`${room.title} pregame`}
      />

      <div className="pregame-detail-header">
        <div>
          {room.officialPartner && (
            <span className="badge">
              Official partner
            </span>
          )}

          <h1>{room.title}</h1>
          <p>{room.eventTitle}</p>
        </div>

        <Link
          className="secondary-action pregame-event-link"
          to={`/events/${room.eventId}`}
        >
          View event
        </Link>
      </div>

      <div className="info-grid">
        <MetricCard
          label="Host"
          value={room.hostName}
        />

        <MetricCard
          label="Meeting time"
          value={formatDateTime(room.meetingTime)}
        />

        <MetricCard
          label="Meeting point"
          value={room.meetingLocation}
        />

        <MetricCard
          label="Capacity"
          value={`${room.currentParticipants}/${room.maxParticipants}`}
          hint={
            isFull
              ? 'Full'
              : `${availableSpots} ${
                  availableSpots === 1 ? 'spot' : 'spots'
                } available`
          }
        />
      </div>

      <section className="section-block pregame-detail-section">
        <h2>Pregame information</h2>

        <p className="body-copy">
          {room.description}
        </p>

        <div className="pregame-information-grid">
          <div className="pregame-information-item">
            <span className="pregame-information-label">
              Destination event
            </span>

            <strong>{room.eventTitle}</strong>
          </div>

          <div className="pregame-information-item">
            <span className="pregame-information-label">
              Meeting point
            </span>

            <strong>{room.meetingLocation}</strong>
          </div>

          <div className="pregame-information-item">
            <span className="pregame-information-label">
              Meeting time
            </span>

            <strong>
              {formatDateTime(room.meetingTime)}
            </strong>
          </div>

          <div className="pregame-information-item">
            <span className="pregame-information-label">
              Host instructions
            </span>

            <strong>{room.description}</strong>
          </div>
        </div>
      </section>

      <section className="section-block pregame-detail-section">
        <div className="section-heading">
          <h2>Meeting location</h2>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Get directions
          </a>
        </div>

        <div className="pregame-location-card">
          <div className="pregame-location-details">
            <strong>{room.meetingLocation}</strong>

            <span>
              Open the meeting point in Google Maps.
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

      {actionMessage && (
        <p className="inline-success">
          {actionMessage}
        </p>
      )}

      {actionError && (
        <p className="inline-error">
          {actionError}
        </p>
      )}

      {!isJoined && isFull && (
        <div className="pregame-full-message">
          <strong>This pregame is full</strong>

          <span>
            There are currently no available spots.
            Waiting-list registration will be added later.
          </span>
        </div>
      )}

      <div className="pregame-actions">
        {isJoined ? (
          <button
            className="secondary-action"
            type="button"
            onClick={leaveRoom}
            disabled={acting}
          >
            {acting
              ? 'Leaving...'
              : 'Leave pregame'}
          </button>
        ) : (
          <button
            className="primary-action"
            type="button"
            onClick={joinRoom}
            disabled={acting || isFull}
          >
            {isFull
              ? 'Pregame full'
              : acting
                ? 'Joining...'
                : 'Join pregame'}
          </button>
        )}
      </div>

      <section className="section-block">
        <div className="section-heading">
          <h2>Participants</h2>

          <span>
            {room.currentParticipants}{' '}
            {room.currentParticipants === 1
              ? 'person'
              : 'people'}
          </span>
        </div>

        <div className="participant-list">
          {room.participants.map((participant) => {
            const isHost =
              participant.name.trim().toLowerCase() ===
              room.hostName.trim().toLowerCase()

            return (
              <div
                className={
                  isHost
                    ? 'participant-chip participant-host'
                    : 'participant-chip'
                }
                key={participant.id}
              >
                <span className="participant-avatar">
                  {participant.name
                    .slice(0, 1)
                    .toUpperCase()}
                </span>

                <span className="participant-name">
                  {participant.name}
                </span>

                {isHost && (
                  <span className="host-badge">
                    Host
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </article>
  )
}

function friendlyPregameError(error: unknown) {
  if (
    axios.isAxiosError<{ message?: string }>(
      error,
    )
  ) {
    const message =
      error.response?.data?.message ?? ''

    if (
      message
        .toLowerCase()
        .includes('already joined')
    ) {
      return 'You are already in this pregame room.'
    }

    if (
      message.toLowerCase().includes('full')
    ) {
      return 'This pregame is full. Try another room or check again later.'
    }

    if (
      message
        .toLowerCase()
        .includes('not a participant')
    ) {
      return 'You are not currently in this pregame room.'
    }

    if (message) {
      return message
    }
  }

  return 'Could not update this pregame. Please try again.'
}