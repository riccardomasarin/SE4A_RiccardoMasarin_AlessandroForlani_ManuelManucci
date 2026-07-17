import { useEffect, useState, type FormEvent } from 'react'
import { nightoutApi } from '../api/nightoutApi'
import type {
  FriendshipDto,
  FriendUserDto,
} from '../types/nightout'

type FriendsModal =
  | 'search'
  | 'requests'
  | 'friends'
  | null

interface FriendsSectionProps {
  currentUserId: number
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

export function FriendsSection({
  currentUserId,
}: FriendsSectionProps) {
  const [friends, setFriends] = useState<FriendUserDto[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendshipDto[]>([])
  const [activeModal, setActiveModal] = useState<FriendsModal>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FriendUserDto[]>([])

  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [actionUserId, setActionUserId] = useState<number | null>(null)
  const [actionRequestId, setActionRequestId] = useState<number | null>(null)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadFriendshipData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        nightoutApi.getFriends(currentUserId),
        nightoutApi.getReceivedFriendRequests(currentUserId),
      ])

      setFriends(friendsData)
      setReceivedRequests(requestsData)
      setErrorMessage('')
    } catch {
      setErrorMessage('Could not load friendship data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFriendshipData()
  }, [currentUserId])

  const openModal = (modal: FriendsModal) => {
    setActiveModal(modal)
    setErrorMessage('')
    setSuccessMessage('')

    if (modal !== 'search') {
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setSearchQuery('')
    setSearchResults([])
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedQuery = searchQuery.trim()

    if (!normalizedQuery) {
      setSearchResults([])
      setErrorMessage('Enter a name to search.')
      return
    }

    setSearching(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const results = await nightoutApi.searchUsers(
        currentUserId,
        normalizedQuery,
      )

      setSearchResults(results)

      if (results.length === 0) {
        setSuccessMessage('No available users found.')
      }
    } catch {
      setErrorMessage('Could not search for users.')
    } finally {
      setSearching(false)
    }
  }

  const sendFriendRequest = async (receiverId: number) => {
    setActionUserId(receiverId)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await nightoutApi.sendFriendRequest({
        senderId: currentUserId,
        receiverId,
      })

      setSearchResults((currentResults) =>
        currentResults.filter((candidate) => candidate.id !== receiverId),
      )

      setSuccessMessage('Friend request sent successfully.')
    } catch {
      setErrorMessage('Could not send the friend request.')
    } finally {
      setActionUserId(null)
    }
  }

  const acceptFriendRequest = async (request: FriendshipDto) => {
    setActionRequestId(request.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await nightoutApi.acceptFriendRequest(
        request.id,
        currentUserId,
      )

      setReceivedRequests((currentRequests) =>
        currentRequests.filter(
          (currentRequest) => currentRequest.id !== request.id,
        ),
      )

      const updatedFriends = await nightoutApi.getFriends(currentUserId)

      setFriends(updatedFriends)
      setSuccessMessage('Friend request accepted.')
    } catch {
      setErrorMessage('Could not accept the friend request.')
    } finally {
      setActionRequestId(null)
    }
  }

  const rejectFriendRequest = async (request: FriendshipDto) => {
    setActionRequestId(request.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await nightoutApi.rejectFriendRequest(
        request.id,
        currentUserId,
      )

      setReceivedRequests((currentRequests) =>
        currentRequests.filter(
          (currentRequest) => currentRequest.id !== request.id,
        ),
      )

      setSuccessMessage('Friend request rejected.')
    } catch {
      setErrorMessage('Could not reject the friend request.')
    } finally {
      setActionRequestId(null)
    }
  }

  const removeFriend = async (friend: FriendUserDto) => {
    const confirmed = window.confirm(
      `Remove ${friend.name} from your friends?`,
    )

    if (!confirmed) {
      return
    }

    setActionUserId(friend.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await nightoutApi.removeFriend(
        currentUserId,
        friend.id,
      )

      setFriends((currentFriends) =>
        currentFriends.filter(
          (currentFriend) => currentFriend.id !== friend.id,
        ),
      )

      setSuccessMessage(`${friend.name} was removed from your friends.`)
    } catch {
      setErrorMessage('Could not remove this friend.')
    } finally {
      setActionUserId(null)
    }
  }

  const previewFriends = friends.slice(0, 5)

  return (
    <>
      <section className="section-block friends-section">
        <div className="section-heading">
          <div>
            <h2>Friends</h2>

            <p className="section-description">
              Find people and see who is joining NightOut events.
            </p>
          </div>

          {friends.length > 0 && (
            <button
              className="small-action"
              type="button"
              onClick={() => openModal('friends')}
            >
              View all
            </button>
          )}
        </div>

        <div className="friends-preview-card">
          <div className="friends-preview-summary">
            <strong>
              {loading
                ? 'Loading friends...'
                : `${friends.length} ${
                    friends.length === 1 ? 'friend' : 'friends'
                  }`}
            </strong>

            <span>
              {receivedRequests.length === 0
                ? 'No pending requests'
                : `${receivedRequests.length} ${
                    receivedRequests.length === 1
                      ? 'pending request'
                      : 'pending requests'
                  }`}
            </span>
          </div>

          <div className="friends-avatar-list">
            {previewFriends.length === 0 ? (
              <div className="friends-empty-preview">
                <strong>No friends yet</strong>

                <span>Search for people and send your first request.</span>
              </div>
            ) : (
              <>
                {previewFriends.map((friend) => {
                  const avatarUrl = resolveAvatarUrl(friend.avatarUrl)

                  return (
                    <div
                      className="friend-preview-avatar"
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

                {friends.length > previewFriends.length && (
                  <div className="friend-preview-avatar friend-preview-more">
                    +{friends.length - previewFriends.length}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="friends-preview-actions">
            <button
              className="secondary-action"
              type="button"
              onClick={() => openModal('search')}
            >
              Find people
            </button>

            <button
              className="secondary-action"
              type="button"
              onClick={() => openModal('requests')}
            >
              Manage requests
              {receivedRequests.length > 0 &&
                ` (${receivedRequests.length})`}
            </button>
          </div>
        </div>
      </section>

      {activeModal && (
        <div
          className="profile-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal()
            }
          }}
        >
          <section
            className="profile-edit-modal friends-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="friends-modal-title"
          >
            <div className="profile-modal-header">
              <div>
                <h2 id="friends-modal-title">
                  {activeModal === 'search' && 'Find people'}
                  {activeModal === 'requests' && 'Friend requests'}
                  {activeModal === 'friends' && 'Your friends'}
                </h2>

                <p>
                  {activeModal === 'search' &&
                    'Search for NightOut users by name.'}

                  {activeModal === 'requests' &&
                    'Accept or reject requests you received.'}

                  {activeModal === 'friends' &&
                    'View and manage your current friends.'}
                </p>
              </div>

              <button
                className="profile-modal-close"
                type="button"
                aria-label="Close friends window"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {errorMessage && (
              <p className="inline-error">{errorMessage}</p>
            )}

            {successMessage && (
              <p className="inline-success">{successMessage}</p>
            )}

            {activeModal === 'search' && (
              <>
                <form
                  className="friend-search-form"
                  onSubmit={handleSearch}
                >
                  <input
                    type="search"
                    value={searchQuery}
                    placeholder="Search by name..."
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                  />

                  <button
                    className="primary-action"
                    type="submit"
                    disabled={searching}
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </form>

                <div className="friends-modal-list">
                  {searchResults.map((candidate) => {
                    const avatarUrl = resolveAvatarUrl(
                      candidate.avatarUrl,
                    )

                    return (
                      <article
                        className="friend-list-item"
                        key={candidate.id}
                      >
                        <div className="friend-list-user">
                          <div className="friend-list-avatar">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={`${candidate.name} profile`}
                              />
                            ) : (
                              <span>{getInitial(candidate.name)}</span>
                            )}
                          </div>

                          <div>
                            <strong>{candidate.name}</strong>

                            <span>
                              {candidate.city ?? 'City hidden'}
                            </span>
                          </div>
                        </div>

                        <button
                          className="small-action"
                          type="button"
                          disabled={actionUserId === candidate.id}
                          onClick={() =>
                            void sendFriendRequest(candidate.id)
                          }
                        >
                          {actionUserId === candidate.id
                            ? 'Sending...'
                            : 'Add friend'}
                        </button>
                      </article>
                    )
                  })}
                </div>
              </>
            )}

            {activeModal === 'requests' && (
              <div className="friends-modal-list">
                {receivedRequests.length === 0 ? (
                  <div className="profile-empty-state">
                    <strong>No pending requests</strong>

                    <span>
                      New friend requests will appear here.
                    </span>
                  </div>
                ) : (
                  receivedRequests.map((request) => {
                    const sender = request.sender
                    const avatarUrl = resolveAvatarUrl(sender.avatarUrl)

                    return (
                      <article
                        className="friend-list-item"
                        key={request.id}
                      >
                        <div className="friend-list-user">
                          <div className="friend-list-avatar">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={`${sender.name} profile`}
                              />
                            ) : (
                              <span>{getInitial(sender.name)}</span>
                            )}
                          </div>

                          <div>
                            <strong>{sender.name}</strong>

                            <span>{sender.city ?? 'City hidden'}</span>
                          </div>
                        </div>

                        <div className="friend-request-actions">
                          <button
                            className="primary-action"
                            type="button"
                            disabled={actionRequestId === request.id}
                            onClick={() =>
                              void acceptFriendRequest(request)
                            }
                          >
                            Accept
                          </button>

                          <button
                            className="secondary-action"
                            type="button"
                            disabled={actionRequestId === request.id}
                            onClick={() =>
                              void rejectFriendRequest(request)
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </article>
                    )
                  })
                )}
              </div>
            )}

            {activeModal === 'friends' && (
              <div className="friends-modal-list">
                {friends.length === 0 ? (
                  <div className="profile-empty-state">
                    <strong>No friends yet</strong>

                    <span>
                      Use Find people to send a friend request.
                    </span>
                  </div>
                ) : (
                  friends.map((friend) => {
                    const avatarUrl = resolveAvatarUrl(friend.avatarUrl)

                    return (
                      <article
                        className="friend-list-item"
                        key={friend.id}
                      >
                        <div className="friend-list-user">
                          <div className="friend-list-avatar">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={`${friend.name} profile`}
                              />
                            ) : (
                              <span>{getInitial(friend.name)}</span>
                            )}
                          </div>

                          <div>
                            <strong>{friend.name}</strong>

                            <span>{friend.city ?? 'City hidden'}</span>
                          </div>
                        </div>

                        <button
                          className="secondary-action"
                          type="button"
                          disabled={actionUserId === friend.id}
                          onClick={() => void removeFriend(friend)}
                        >
                          {actionUserId === friend.id
                            ? 'Removing...'
                            : 'Remove'}
                        </button>
                      </article>
                    )
                  })
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}