import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import {
  formatCurrency,
  formatDateTime,
} from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type {
  PrDashboardDto,
  ProfileDto,
} from '../types/nightout'

const MAX_AVATAR_SIZE =
  5 * 1024 * 1024

const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const BACKEND_URL =
  'http://localhost:8080'

function resolveAvatarUrl(
  avatarUrl?: string | null,
) {
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

  return `${BACKEND_URL}${
    avatarUrl.startsWith('/') ? '' : '/'
  }${avatarUrl}`
}

function parseMusicPreferences(
  value: string,
) {
  const preferences = value
    .split(',')
    .map((preference) =>
      preference.trim(),
    )
    .filter(Boolean)

  return Array.from(
    new Set(preferences),
  )
}

export function PrAccountPage() {
  const { user, resetRole } =
    useSession()

  const [profile, setProfile] =
    useState<ProfileDto | null>(null)

  const [dashboard, setDashboard] =
    useState<PrDashboardDto | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(false)

  const [editProfileOpen, setEditProfileOpen] =
    useState(false)

  const [displayName, setDisplayName] =
    useState('')

  const [displayCity, setDisplayCity] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [
    musicPreferences,
    setMusicPreferences,
  ] = useState('')

  const [
    avatarPreview,
    setAvatarPreview,
  ] = useState('')

  const [
    avatarDraftPreview,
    setAvatarDraftPreview,
  ] = useState('')

  const [
    avatarFileName,
    setAvatarFileName,
  ] = useState('')

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null)

  const [
    removeAvatarRequested,
    setRemoveAvatarRequested,
  ] = useState(false)

  const [
    profileMessage,
    setProfileMessage,
  ] = useState('')

  const [
    profileFormError,
    setProfileFormError,
  ] = useState('')

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)

    Promise.all([
      nightoutApi.getProfile(user.id),
      nightoutApi.getPrDashboard(user.id),
    ])
      .then(
        ([
          profileData,
          dashboardData,
        ]) => {
          setProfile(profileData)
          setDashboard(dashboardData)

          setDisplayName(
            profileData.user.name,
          )

          setDisplayCity(
            profileData.user.city,
          )

          setEmail(
            profileData.user.email,
          )

          setMusicPreferences(
            profileData.user.musicPreferences.join(
              ', ',
            ),
          )

          const initialAvatar =
            resolveAvatarUrl(
              profileData.user.avatarUrl,
            )

          setAvatarPreview(
            initialAvatar,
          )

          setAvatarDraftPreview(
            initialAvatar,
          )

          setError(false)
        },
      )
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

  const confirmLogout = () => {
    const confirmed = window.confirm(
      'Are you sure you want to log out?',
    )

    if (confirmed) {
      resetRole()
    }
  }

  const openEditProfile = () => {
    if (!profile) {
      return
    }

    setDisplayName(
      profile.user.name,
    )

    setDisplayCity(
      profile.user.city,
    )

    setEmail(profile.user.email)

    setMusicPreferences(
      profile.user.musicPreferences.join(
        ', ',
      ),
    )

    setAvatarDraftPreview(
      avatarPreview,
    )

    setAvatarFile(null)
    setAvatarFileName('')
    setRemoveAvatarRequested(false)
    setProfileFormError('')
    setProfileMessage('')
    setEditProfileOpen(true)
  }

  const closeEditProfile = () => {
    if (
      avatarDraftPreview.startsWith(
        'blob:',
      ) &&
      avatarDraftPreview !==
        avatarPreview
    ) {
      URL.revokeObjectURL(
        avatarDraftPreview,
      )
    }

    setAvatarDraftPreview(
      avatarPreview,
    )

    setAvatarFile(null)
    setAvatarFileName('')
    setRemoveAvatarRequested(false)
    setProfileFormError('')
    setEditProfileOpen(false)
  }

  const handleAvatarChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    setProfileFormError('')

    if (
      !ALLOWED_AVATAR_TYPES.includes(
        file.type,
      )
    ) {
      setProfileFormError(
        'Choose a JPG, PNG or WebP image.',
      )

      setAvatarFile(null)
      setAvatarFileName('')
      event.target.value = ''
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setProfileFormError(
        'The profile picture must be smaller than 5 MB.',
      )

      setAvatarFile(null)
      setAvatarFileName('')
      event.target.value = ''
      return
    }

    if (
      avatarDraftPreview.startsWith(
        'blob:',
      ) &&
      avatarDraftPreview !==
        avatarPreview
    ) {
      URL.revokeObjectURL(
        avatarDraftPreview,
      )
    }

    const previewUrl =
      URL.createObjectURL(file)

    setAvatarDraftPreview(
      previewUrl,
    )

    setAvatarFileName(file.name)
    setAvatarFile(file)
    setRemoveAvatarRequested(false)
  }

  const handleRemoveAvatar = () => {
    if (
      avatarDraftPreview.startsWith(
        'blob:',
      ) &&
      avatarDraftPreview !==
        avatarPreview
    ) {
      URL.revokeObjectURL(
        avatarDraftPreview,
      )
    }

    setAvatarDraftPreview('')
    setAvatarFileName('')
    setAvatarFile(null)
    setRemoveAvatarRequested(true)
    setProfileFormError('')
  }

  const saveProfileChanges = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      !user ||
      savingProfile
    ) {
      return
    }

    const nextName =
      displayName.trim()

    const nextCity =
      displayCity.trim()

    const nextEmail =
      email.trim()

    setProfileFormError('')
    setProfileMessage('')

    if (
      !nextName ||
      !nextCity ||
      !nextEmail
    ) {
      setProfileFormError(
        'Name, email and city are required.',
      )
      return
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailPattern.test(nextEmail)
    ) {
      setProfileFormError(
        'Enter a valid email address.',
      )
      return
    }

    const parsedPreferences =
      parseMusicPreferences(
        musicPreferences,
      )

    setSavingProfile(true)

    try {
      let updatedUser =
        await nightoutApi.updateProfile(
          user.id,
          {
            name: nextName,
            email: nextEmail,
            city: nextCity,
            musicPreferences:
              parsedPreferences,
          },
        )

      if (avatarFile) {
        updatedUser =
          await nightoutApi.updateAvatar(
            user.id,
            avatarFile,
          )
      } else if (
        removeAvatarRequested
      ) {
        updatedUser =
          await nightoutApi.removeAvatar(
            user.id,
          )
      }

      const savedAvatarUrl =
        resolveAvatarUrl(
          updatedUser.avatarUrl,
        )

      setProfile(
        (currentProfile) => {
          if (!currentProfile) {
            return currentProfile
          }

          return {
            ...currentProfile,
            user: updatedUser,
          }
        },
      )

      setDisplayName(
        updatedUser.name,
      )

      setDisplayCity(
        updatedUser.city,
      )

      setEmail(updatedUser.email)

      setMusicPreferences(
        updatedUser.musicPreferences.join(
          ', ',
        ),
      )

      if (
        avatarDraftPreview.startsWith(
          'blob:',
        )
      ) {
        URL.revokeObjectURL(
          avatarDraftPreview,
        )
      }

      setAvatarPreview(
        savedAvatarUrl,
      )

      setAvatarDraftPreview(
        savedAvatarUrl,
      )

      setAvatarFile(null)
      setAvatarFileName('')
      setRemoveAvatarRequested(false)
      setEditProfileOpen(false)

      setProfileMessage(
        'Profile updated successfully.',
      )
    } catch {
      setProfileFormError(
        'Could not save the profile or profile picture. Please try again.',
      )
    } finally {
      setSavingProfile(false)
    }
  }

  if (!user) {
    return (
      <StateBlock
        title="Access denied"
        message="You must be logged in as a PR manager."
      />
    )
  }

  if (loading) {
    return (
      <StateBlock
        title="Loading PR account"
        message="Fetching account and collaboration data."
      />
    )
  }

  if (
    error ||
    !profile ||
    !dashboard
  ) {
    return (
      <StateBlock
        title="Account unavailable"
        message="Could not load the PR account."
      />
    )
  }

  const activeCollaborations =
    dashboard.eventPerformance.filter(
      (performance) =>
        performance.active,
    )

  const pastCollaborations =
    dashboard.eventPerformance.filter(
      (performance) =>
        !performance.active,
    )

  return (
    <section className="page-stack profile-page pr-account-page">
      <PageHeader
        title="PR account"
        subtitle="Manage your profile, collaborations and settings."
        action={
          <div className="profile-header-actions">
            <button
              className="small-action"
              type="button"
              onClick={
                openEditProfile
              }
            >
              Edit profile
            </button>

            <button
              className="small-action profile-logout-button"
              type="button"
              onClick={confirmLogout}
            >
              Log out
            </button>
          </div>
        }
      />

      <article className="profile-card profile-summary-card">
        {avatarPreview ? (
          <img
            className="profile-avatar-image"
            src={avatarPreview}
            alt={`${profile.user.name} profile`}
          />
        ) : (
          <div className="profile-avatar">
            {profile.user.name
              .slice(0, 1)
              .toUpperCase()}
          </div>
        )}

        <div className="profile-main-information">
          <div className="profile-name-row">
            <h2>
              {profile.user.name}
            </h2>

            {profile.user.verified && (
              <span className="verified-badge">
                Verified PR
              </span>
            )}
          </div>

          <p>{profile.user.city}</p>

          <span className="profile-email">
            {profile.user.email}
          </span>

          {profile.user
            .musicPreferences.length >
            0 && (
            <span className="profile-preferences">
              Music preferences:{' '}
              {profile.user.musicPreferences.join(
                ', ',
              )}
            </span>
          )}
        </div>
      </article>

      {profileMessage && (
        <p className="inline-success">
          {profileMessage}
        </p>
      )}

      <div className="manager-grid">
        <MetricCard
          label="Collaborations"
          value={
            dashboard.eventPerformance
              .length
          }
          hint={`${activeCollaborations.length} active`}
        />

        <MetricCard
          label="Tickets sold"
          value={
            dashboard.totalTicketsSold
          }
          hint="Using your promo codes"
        />

        <MetricCard
          label="Confirmed entries"
          value={
            dashboard.totalCheckins
          }
          hint="Completed check-ins"
        />

        <MetricCard
          label="Total commissions"
          value={formatCurrency(
            dashboard.totalCommissionEarned,
          )}
          hint="Current earnings"
        />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>
              Active collaborations
            </h2>

            <p className="section-description">
              Events and venues where your
              promotional code is active.
            </p>
          </div>

          <span>
            {
              activeCollaborations.length
            }{' '}
            active
          </span>
        </div>

        {activeCollaborations.length ===
        0 ? (
          <div className="profile-empty-state">
            <strong>
              No active collaborations
            </strong>

            <span>
              New event assignments will
              appear here.
            </span>
          </div>
        ) : (
          <div className="channel-list">
            {activeCollaborations.map(
              (collaboration) => (
                <article
                  className="channel-card venue-channel-card"
                  key={
                    collaboration.assignmentId
                  }
                >
                  <div className="venue-channel-header">
                    <div>
                      <h3>
                        {
                          collaboration.eventTitle
                        }
                      </h3>

                      <span>
                        {
                          collaboration.venueName
                        }
                        {' · '}
                        {formatDateTime(
                          collaboration.eventStartsAt,
                        )}
                      </span>
                    </div>

                    <span className="venue-promo-badge">
                      {
                        collaboration.promoCode
                      }
                    </span>
                  </div>

                  <div className="channel-stats">
                    <div>
                      <strong>
                        {
                          collaboration.ticketsSold
                        }
                      </strong>

                      <span>
                        Tickets sold
                      </span>
                    </div>

                    <div>
                      <strong>
                        {
                          collaboration.discountPercentage
                        }
                        %
                      </strong>

                      <span>
                        Customer discount
                      </span>
                    </div>

                    <div>
                      <strong>
                        {formatCurrency(
                          collaboration.commissionEarned,
                        )}
                      </strong>

                      <span>
                        Commission
                      </span>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>
              Commission and activity
              history
            </h2>

            <p className="section-description">
              Performance recorded for your
              event collaborations.
            </p>
          </div>

          <Link to="/pr/tickets">
            View tickets
          </Link>
        </div>

        {dashboard.eventPerformance
          .length === 0 ? (
          <div className="profile-empty-state">
            <strong>
              No activity yet
            </strong>

            <span>
              Sales and commissions will
              appear after the first ticket
              purchase.
            </span>
          </div>
        ) : (
          <div className="compact-list">
            {dashboard.eventPerformance.map(
              (performance) => (
                <div
                  className="list-tile"
                  key={
                    performance.assignmentId
                  }
                >
                  <strong>
                    {
                      performance.eventTitle
                    }
                  </strong>

                  <span>
                    {
                      performance.venueName
                    }
                    {' · '}
                    {
                      performance.ticketsSold
                    }{' '}
                    tickets
                    {' · '}
                    {
                      performance.checkins
                    }{' '}
                    check-ins
                    {' · '}
                    {formatCurrency(
                      performance.commissionEarned,
                    )}{' '}
                    earned
                  </span>
                </div>
              ),
            )}
          </div>
        )}

        {pastCollaborations.length >
          0 && (
          <p className="section-description">
            {
              pastCollaborations.length
            }{' '}
            inactive or completed
            collaborations are included in
            the activity history.
          </p>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Settings</h2>

            <p className="section-description">
              Manage account preferences,
              notifications and security.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          <Link
            className="settings-card"
            to="/notifications"
          >
            <div className="settings-icon">
              🔔
            </div>

            <div>
              <strong>
                Notifications
              </strong>

              <span>
                View ticket and event
                updates.
              </span>
            </div>
          </Link>

          <Link
            className="settings-card"
            to="/privacy-settings"
          >
            <div className="settings-icon">
              🔒
            </div>

            <div>
              <strong>
                Privacy and security
              </strong>

              <span>
                Manage profile visibility
                and permissions.
              </span>
            </div>
          </Link>

          <div className="settings-card">
            <div className="settings-icon">
              🔑
            </div>

            <div>
              <strong>
                Password
              </strong>

              <span>
                Password management will be
                available after authentication
                is implemented.
              </span>
            </div>
          </div>

          <Link
            className="settings-card"
            to="/help-support"
          >
            <div className="settings-icon">
              ?
            </div>

            <div>
              <strong>
                Help and support
              </strong>

              <span>
                Contact NightOut support.
              </span>
            </div>
          </Link>
        </div>
      </section>

      {editProfileOpen && (
        <div
          className="profile-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditProfile()
            }
          }}
        >
          <section
            className="profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-pr-profile-title"
          >
            <div className="profile-modal-header">
              <div>
                <h2 id="edit-pr-profile-title">
                  Edit PR profile
                </h2>

                <p>
                  Update your personal
                  information and profile
                  picture.
                </p>
              </div>

              <button
                className="profile-modal-close"
                type="button"
                aria-label="Close edit profile"
                onClick={
                  closeEditProfile
                }
              >
                ×
              </button>
            </div>

            <form
              className="profile-edit-form"
              onSubmit={
                saveProfileChanges
              }
            >
              <div className="profile-photo-field">
                <span className="profile-field-label">
                  Profile picture
                </span>

                <div className="profile-photo-controls">
                  <div className="profile-photo-preview">
                    {avatarDraftPreview ? (
                      <img
                        src={
                          avatarDraftPreview
                        }
                        alt="Profile preview"
                      />
                    ) : (
                      <div className="profile-avatar">
                        {displayName
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="profile-photo-upload">
                    <input
                      id="pr-profile-picture-input"
                      className="profile-photo-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleAvatarChange
                      }
                    />

                    <label
                      className="profile-photo-button"
                      htmlFor="pr-profile-picture-input"
                    >
                      Choose photo
                    </label>

                    {avatarDraftPreview && (
                      <button
                        className="profile-photo-remove-button"
                        type="button"
                        onClick={
                          handleRemoveAvatar
                        }
                        disabled={
                          savingProfile
                        }
                      >
                        Remove photo
                      </button>
                    )}

                    <span className="profile-photo-filename">
                      {avatarFileName ||
                        'No photo selected'}
                    </span>

                    <small className="profile-photo-help">
                      JPG, PNG or WebP.
                      Maximum size: 5 MB.
                    </small>
                  </div>
                </div>
              </div>

              {profileFormError && (
                <p className="inline-error">
                  {profileFormError}
                </p>
              )}

              <label>
                <span>Name</span>

                <input
                  type="text"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(
                      event.target.value,
                    )
                  }
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  autoComplete="email"
                  required
                />
              </label>

              <div className="profile-verification-row">
                <div>
                  <strong>
                    PR verification
                  </strong>

                  <span>
                    {profile.user.verified
                      ? 'Your PR account is verified.'
                      : 'Verification is pending.'}
                  </span>
                </div>

                <span
                  className={
                    profile.user.verified
                      ? 'verified-badge'
                      : 'verification-pending-badge'
                  }
                >
                  {profile.user.verified
                    ? 'Verified'
                    : 'Not verified'}
                </span>
              </div>

              <label>
                <span>City</span>

                <input
                  type="text"
                  value={displayCity}
                  onChange={(event) =>
                    setDisplayCity(
                      event.target.value,
                    )
                  }
                  autoComplete="address-level2"
                  required
                />
              </label>

              <label>
                <span>
                  Music preferences
                </span>

                <input
                  type="text"
                  placeholder="House, Techno, Hip-Hop..."
                  value={
                    musicPreferences
                  }
                  onChange={(event) =>
                    setMusicPreferences(
                      event.target.value,
                    )
                  }
                />
              </label>

              <div className="profile-modal-actions">
                <button
                  className="secondary-action"
                  type="button"
                  onClick={
                    closeEditProfile
                  }
                  disabled={
                    savingProfile
                  }
                >
                  Cancel
                </button>

                <button
                  className="primary-action"
                  type="submit"
                  disabled={
                    savingProfile
                  }
                >
                  {savingProfile
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