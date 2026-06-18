import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatTime } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { imageForId } from '../components/images'
import { useSession } from '../session'
import type { PregameRoomDto } from '../types/nightout'

export function PregamePage() {
  const { user } = useSession()
  const [searchParams] = useSearchParams()
  const eventId = searchParams.get('eventId')
  const [rooms, setRooms] = useState<PregameRoomDto[]>([])
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const activeRooms = useMemo(
    () => rooms.filter((room) => !room.officialPartner),
    [rooms],
  )
  const officialRooms = useMemo(
    () => rooms.filter((room) => room.officialPartner),
    [rooms],
  )

  function loadRooms() {
    nightoutApi
      .getPregames(eventId ? Number(eventId) : undefined)
      .then((data) => {
        setRooms(data)
        setError('')
      })
      .catch(() => setError('Could not load pregames. Start the backend and retry.'))
  }

  useEffect(loadRooms, [eventId])

  async function joinRoom(roomId: number) {
    if (!user) return
    setError('')
    try {
      const updated = await nightoutApi.joinPregame(roomId, user.id)
      setRooms((current) => current.map((room) => (room.id === updated.id ? updated : room)))
    } catch {
      setError('Join rejected. The room may be full or you may already be inside.')
    }
  }

  async function createRoom() {
    if (!user) return
    setCreating(true)
    setError('')
    try {
      await nightoutApi.createPregame({
        title: `Pre-serata di ${user.name.split(' ')[0]}`,
        eventId: eventId ? Number(eventId) : 1,
        hostId: user.id,
        meetingLocation: 'Isola - demo location',
        meetingTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
        maxParticipants: 8,
        description: 'Demo room created from the frontend.',
        imageUrl: '/demo/pregame-created.jpg',
        officialPartner: false,
      })
      loadRooms()
    } catch {
      setError('Could not create the demo pregame room.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Pregame"
        subtitle="Trova con chi iniziare la serata."
        action={<button className="small-action" type="button" onClick={createRoom} disabled={creating}>Crea</button>}
      />

      {error && <p className="inline-error">{error}</p>}

      <section className="section-block">
        <div className="section-heading">
          <h2>Stanze attive stasera</h2>
          <span>{activeRooms.length}</span>
        </div>
        {rooms.length === 0 && !error ? (
          <StateBlock title="Loading pregames" message="Fetching pre-serata rooms." />
        ) : (
          <div className="pregame-grid">
            {activeRooms.map((room) => (
              <PregameCard room={room} key={room.id} onJoin={joinRoom} />
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Locali con preserata</h2>
          <span>Partner</span>
        </div>
        <div className="pregame-grid">
          {officialRooms.map((room) => (
            <PregameCard room={room} key={room.id} onJoin={joinRoom} />
          ))}
        </div>
      </section>
    </section>
  )
}

function PregameCard({ room, onJoin }: { room: PregameRoomDto; onJoin: (roomId: number) => void }) {
  return (
    <article className="pregame-card">
      <img src={imageForId(room.id, 'pregame')} alt="" />
      <div>
        <h3>{room.title}</h3>
        <p>{room.meetingLocation} - {formatTime(room.meetingTime)}</p>
        <span>{room.currentParticipants} / {room.maxParticipants} persone</span>
        <button type="button" onClick={() => onJoin(room.id)}>Unisciti</button>
      </div>
    </article>
  )
}
