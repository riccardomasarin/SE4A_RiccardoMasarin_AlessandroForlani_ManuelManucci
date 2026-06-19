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
      .catch(() => setError('Could not load this pregame room.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <StateBlock title="Loading pregame" message="Opening the pre-serata room." />
  }

  if (error || !room) {
    return <StateBlock title="Pregame unavailable" message={error || 'This room was not found.'} />
  }

  const isJoined = Boolean(user && room.participants.some((participant) => participant.id === user.id))
  const isFull = room.currentParticipants >= room.maxParticipants

  const joinRoom = async () => {
    if (!user || acting || isFull || isJoined) return
    setActing(true)
    setActionError('')
    setActionMessage('')
    try {
      const updated = await nightoutApi.joinPregame(room.id, user.id)
      setRoom(updated)
      setActionMessage(`You joined ${updated.title}.`)
    } catch (requestError) {
      setActionError(friendlyPregameError(requestError))
    } finally {
      setActing(false)
    }
  }

  const leaveRoom = async () => {
    if (!user || acting || !isJoined) return
    setActing(true)
    setActionError('')
    setActionMessage('')
    try {
      const updated = await nightoutApi.leavePregame(room.id, user.id)
      setRoom(updated)
      setActionMessage(`You left ${updated.title}.`)
    } catch (requestError) {
      setActionError(friendlyPregameError(requestError))
    } finally {
      setActing(false)
    }
  }

  return (
    <article className="page-stack pregame-detail">
      <img className="pregame-detail-hero" src={imageForId(room.id, 'pregame')} alt="" />
      <div className="pregame-detail-header">
        <div>
          {room.officialPartner && <span className="badge">Partner</span>}
          <h1>{room.title}</h1>
          <p>{room.eventTitle}</p>
        </div>
        <Link className="secondary-action" to={`/events/${room.eventId}`}>Event</Link>
      </div>

      <div className="info-grid">
        <MetricCard label="Host" value={room.hostName} />
        <MetricCard label="Meeting" value={formatDateTime(room.meetingTime)} />
        <MetricCard label="Location" value={room.meetingLocation} />
        <MetricCard label="Capacity" value={`${room.currentParticipants}/${room.maxParticipants}`} />
      </div>

      <p className="body-copy">{room.description}</p>

      {actionMessage && <p className="inline-success">{actionMessage}</p>}
      {actionError && <p className="inline-error">{actionError}</p>}
      {!isJoined && isFull && (
        <p className="inline-warning">This pregame is full. You cannot join unless someone leaves.</p>
      )}

      <div className="pregame-actions">
        {isJoined ? (
          <button className="secondary-action" type="button" onClick={leaveRoom} disabled={acting}>
            {acting ? 'Leaving...' : 'Leave pregame'}
          </button>
        ) : (
          <button className="primary-action" type="button" onClick={joinRoom} disabled={acting || isFull}>
            {isFull ? 'Room full' : acting ? 'Joining...' : 'Join pregame'}
          </button>
        )}
      </div>

      <section className="section-block">
        <div className="section-heading">
          <h2>Participants</h2>
          <span>{room.currentParticipants} people</span>
        </div>
        <div className="participant-list">
          {room.participants.map((participant) => (
            <span className="participant-chip" key={participant.id}>
              <b>{participant.name.slice(0, 1)}</b>
              {participant.name}
            </span>
          ))}
        </div>
      </section>
    </article>
  )
}

function friendlyPregameError(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message ?? ''
    if (message.toLowerCase().includes('already joined')) {
      return 'You are already in this pregame room.'
    }
    if (message.toLowerCase().includes('full')) {
      return 'This pregame is full. Try another room or check again later.'
    }
    if (message.toLowerCase().includes('not a participant')) {
      return 'You are not currently in this pregame room.'
    }
    if (message) {
      return message
    }
  }
  return 'Could not update this pregame. Please try again.'
}
