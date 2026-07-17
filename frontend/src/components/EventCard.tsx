import { Link } from 'react-router-dom'
import {
  formatCurrency,
  formatDateTime,
  readableGenre,
} from '../api/format'
import type {
  EventSummaryDto,
  FriendUserDto,
} from '../types/nightout'
import { imageForId } from './images'

interface EventCardProps {
  event: EventSummaryDto
  compact?: boolean
  saved?: boolean
  friendsAttending?: FriendUserDto[]
}

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

function getFriendsLabel(friends: FriendUserDto[]) {
  if (friends.length === 1) {
    return `${friends[0].name} is attending`
  }

  if (friends.length === 2) {
    return `${friends[0].name} and ${friends[1].name} are attending`
  }

  return `${friends.length} friends are attending`
}

export function EventCard({
  event,
  compact = false,
  saved = false,
  friendsAttending = [],
}: EventCardProps) {
  return (
    <Link
      className={compact ? 'event-card compact' : 'event-card'}
      to={`/events/${event.id}`}
    >
      {saved && <span className="saved-badge">Saved</span>}

      <img
        src={imageForId(event.id)}
        alt={`${event.title} event`}
      />

      <div className="event-card-body">
        <div>
          {event.promotionLabels[0] && (
            <span className="badge">
              {event.promotionLabels[0]}
            </span>
          )}

          <h3>{event.title}</h3>

          <p>{event.venueName}</p>

          {event.distanceKm !== null && (
            <span className="event-card-distance">
              {event.distanceKm} km away
            </span>
          )}
        </div>

        {friendsAttending.length > 0 && (
          <div className="event-card-friends">
            <div className="event-card-friend-avatars">
              {friendsAttending
                .slice(0, 3)
                .map((friend) => {
                  const avatarUrl = resolveAvatarUrl(
                    friend.avatarUrl,
                  )

                  return (
                    <div
                      className="event-card-friend-avatar"
                      key={friend.id}
                      title={friend.name}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${friend.name} profile`}
                        />
                      ) : (
                        <span>{getInitial(friend.name)}</span>
                      )}
                    </div>
                  )
                })}

              {friendsAttending.length > 3 && (
                <div className="event-card-friend-avatar event-card-friend-more">
                  +{friendsAttending.length - 3}
                </div>
              )}
            </div>

            <span className="event-card-friends-label">
              {getFriendsLabel(friendsAttending)}
            </span>
          </div>
        )}

        <div className="event-card-meta">
          <span>{formatDateTime(event.startsAt)}</span>

          <span>{readableGenre(event.musicGenre)}</span>

          <strong>
            {event.price === 0
              ? 'Free'
              : formatCurrency(event.price)}
          </strong>
        </div>
      </div>
    </Link>
  )
}