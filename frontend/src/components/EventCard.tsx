import { Link } from 'react-router-dom'
import { formatDateTime, formatCurrency, readableGenre } from '../api/format'
import type { EventSummaryDto } from '../types/nightout'
import { imageForId } from './images'

interface EventCardProps {
  event: EventSummaryDto
  compact?: boolean
}

export function EventCard({ event, compact = false }: EventCardProps) {
  return (
    <Link className={compact ? 'event-card compact' : 'event-card'} to={`/events/${event.id}`}>
      <img src={imageForId(event.id)} alt="" />
      <div className="event-card-body">
        <div>
          {event.promotionLabels[0] && <span className="badge">{event.promotionLabels[0]}</span>}
          <h3>{event.title}</h3>
          <p>{event.venueName}</p>
        </div>
        <div className="event-card-meta">
          <span>{formatDateTime(event.startsAt)}</span>
          <span>{readableGenre(event.musicGenre)}</span>
          <strong>{event.price === 0 ? 'Free' : formatCurrency(event.price)}</strong>
        </div>
      </div>
    </Link>
  )
}
