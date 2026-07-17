import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type { PrivacySettingsDto } from '../types/nightout'

const DEFAULT_SETTINGS: PrivacySettingsDto = {
  privateProfile: false,
  showCity: true,
  showMusicPreferences: true,
  allowPregameInvites: true,
  allowFriendRequests: true,
}

export function PrivacySettingsPage() {
  const { user } = useSession()

  const [settings, setSettings] =
    useState<PrivacySettingsDto>(
      DEFAULT_SETTINGS,
    )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [saveError, setSaveError] =
    useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    nightoutApi
      .getPrivacySettings(user.id)
      .then((data) => {
        setSettings(data)
        setError(false)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

  const updateSetting = (
    setting: keyof PrivacySettingsDto,
  ) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [setting]: !currentSettings[setting],
    }))

    setSuccessMessage('')
    setSaveError('')
  }

  const saveSettings = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!user || saving) return

    setSaving(true)
    setSuccessMessage('')
    setSaveError('')

    try {
      const updatedSettings =
        await nightoutApi.updatePrivacySettings(
          user.id,
          settings,
        )

      setSettings(updatedSettings)

      setSuccessMessage(
        'Privacy settings updated successfully.',
      )
    } catch {
      setSaveError(
        'Could not update privacy settings. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <StateBlock
        title="Loading settings"
        message="Fetching your privacy preferences."
      />
    )
  }

  if (!user || error) {
    return (
      <StateBlock
        title="Settings unavailable"
        message="Could not load your privacy settings."
      />
    )
  }

  return (
    <section className="page-stack privacy-settings-page">
      <PageHeader
        title="Privacy and security"
        action={
          <Link
            className="small-action"
            to="/profile"
          >
            Back to account
          </Link>
        }
      />

      <form
        className="privacy-settings-form"
        onSubmit={saveSettings}
      >
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Profile visibility</h2>

              <p className="section-description">
                Choose what other NightOut
                users can see on your profile.
              </p>
            </div>
          </div>

          <div className="privacy-settings-list">
            <label className="privacy-setting-row">
              <div>
                <strong>Private profile</strong>

                <span>
                  Only approved users will be
                  able to view your complete
                  profile.
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.privateProfile
                }
                onChange={() =>
                  updateSetting(
                    'privateProfile',
                  )
                }
              />
            </label>

            <label className="privacy-setting-row">
              <div>
                <strong>Show city</strong>

                <span>
                  Display your city on your
                  public profile.
                </span>
              </div>

              <input
                type="checkbox"
                checked={settings.showCity}
                onChange={() =>
                  updateSetting('showCity')
                }
              />
            </label>

            <label className="privacy-setting-row">
              <div>
                <strong>
                  Show music preferences
                </strong>

                <span>
                  Display your favourite music
                  genres on your profile.
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.showMusicPreferences
                }
                onChange={() =>
                  updateSetting(
                    'showMusicPreferences',
                  )
                }
              />
            </label>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Social permissions</h2>

              <p className="section-description">
                Decide how other users can
                interact with you.
              </p>
            </div>
          </div>

          <div className="privacy-settings-list">
            <label className="privacy-setting-row">
              <div>
                <strong>
                  Pregame invitations
                </strong>

                <span>
                  Allow other users to invite
                  you to pregames.
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.allowPregameInvites
                }
                onChange={() =>
                  updateSetting(
                    'allowPregameInvites',
                  )
                }
              />
            </label>

            <label className="privacy-setting-row">
              <div>
                <strong>
                  Friend requests
                </strong>

                <span>
                  Allow other users to send you
                  friend requests.
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.allowFriendRequests
                }
                onChange={() =>
                  updateSetting(
                    'allowFriendRequests',
                  )
                }
              />
            </label>
          </div>
        </section>

        {successMessage && (
          <p className="inline-success">
            {successMessage}
          </p>
        )}

        {saveError && (
          <p className="inline-error">
            {saveError}
          </p>
        )}

        <div className="privacy-settings-actions">
          <Link
            className="secondary-action"
            to="/profile"
          >
            Cancel
          </Link>

          <button
            className="primary-action"
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : 'Save settings'}
          </button>
        </div>
      </form>
    </section>
  )
}