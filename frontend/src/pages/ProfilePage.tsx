import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime, readableGenre } from "../api/format";
import { nightoutApi } from "../api/nightoutApi";
import { FriendsSection } from "../components/FriendsSection";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { StateBlock } from "../components/StateBlock";
import { imageForId } from "../components/images";
import { useSession } from "../session";
import type { ProfileDto } from "../types/nightout";

type ProfileUserExtras = {
  email?: string;
  avatarUrl?: string | null;
  musicPreferences?: string[];
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function parseMusicPreferences(value: string): string[] {
  const preferences = value
    .split(",")
    .map((preference) => preference.trim())
    .filter(Boolean);

  return Array.from(new Set(preferences));
}

const BACKEND_URL = "http://localhost:8080";

function resolveAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return "";

  if (
    avatarUrl.startsWith("http://") ||
    avatarUrl.startsWith("https://") ||
    avatarUrl.startsWith("blob:") ||
    avatarUrl.startsWith("data:")
  ) {
    return avatarUrl;
  }

  return `${BACKEND_URL}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`;
}

export function ProfilePage() {
  const { user, resetRole } = useSession();

  const [profile, setProfile] = useState<ProfileDto | null>(null);

  const [error, setError] = useState(false);

  const [editProfileOpen, setEditProfileOpen] = useState(false);

  /*
   * Valori temporanei utilizzati all'interno
   * del form di modifica.
   */
  const [displayName, setDisplayName] = useState("");

  const [displayCity, setDisplayCity] = useState("");

  const [email, setEmail] = useState("");

  const [musicPreferences, setMusicPreferences] = useState("");

  /*
   * Valori locali già confermati.
   * Per salvarli definitivamente sarà necessario
   * aggiungere un endpoint nel backend.
   */
  const [savedEmail, setSavedEmail] = useState("");

  const [savedMusicPreferences, setSavedMusicPreferences] = useState("");

  /*
   * avatarPreview è la foto attualmente confermata.
   * avatarDraftPreview è l'anteprima mostrata nel form.
   */
  const [avatarPreview, setAvatarPreview] = useState("");

  const [avatarDraftPreview, setAvatarDraftPreview] = useState("");

  const [avatarFileName, setAvatarFileName] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [removeAvatarRequested, setRemoveAvatarRequested] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");

  const [profileFormError, setProfileFormError] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;

    nightoutApi
      .getProfile(user.id)
      .then((data) => {
        const extendedUser = data.user as typeof data.user & ProfileUserExtras;

        const initialEmail = extendedUser.email ?? "";

        const initialPreferences =
          extendedUser.musicPreferences?.join(", ") ?? "";

        setProfile(data);

        const initialAvatar = resolveAvatarUrl(extendedUser.avatarUrl);

        setAvatarPreview(initialAvatar);
        setAvatarDraftPreview(initialAvatar);
        setAvatarFile(null);
        setAvatarFileName("");
        setRemoveAvatarRequested(false);

        setDisplayName(data.user.name);
        setDisplayCity(data.user.city);

        setEmail(initialEmail);
        setSavedEmail(initialEmail);

        setMusicPreferences(initialPreferences);

        setSavedMusicPreferences(initialPreferences);

        setError(false);
      })
      .catch(() => {
        setError(true);
      });
  }, [user]);

  const confirmLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (confirmed) {
      resetRole();
    }
  };

  const openEditProfile = () => {
    if (!profile) return;

    setDisplayName(profile.user.name);
    setDisplayCity(profile.user.city);

    setEmail(savedEmail);

    setMusicPreferences(savedMusicPreferences);

    setAvatarDraftPreview(avatarPreview);

    setAvatarFileName("");
    setAvatarFile(null);
    setRemoveAvatarRequested(false);
    setProfileFormError("");
    setProfileMessage("");
    setEditProfileOpen(true);
  };

  const closeEditProfile = () => {
    /*
     * Se l'utente ha selezionato una nuova foto
     * ma poi annulla, eliminiamo l'anteprima temporanea.
     */
    if (
      avatarDraftPreview.startsWith("blob:") &&
      avatarDraftPreview !== avatarPreview
    ) {
      URL.revokeObjectURL(avatarDraftPreview);
    }

    setAvatarDraftPreview(avatarPreview);

    setAvatarFileName("");
    setAvatarFile(null);
    setRemoveAvatarRequested(false);
    setProfileFormError("");
    setEditProfileOpen(false);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setProfileFormError("");

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setProfileFormError("Choose a JPG, PNG or WebP image.");

      setAvatarFile(null);
      setAvatarFileName("");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setProfileFormError("The profile picture must be smaller than 5 MB.");

      setAvatarFile(null);
      setAvatarFileName("");
      event.target.value = "";
      return;
    }

    /*
     * Rimuoviamo una precedente anteprima temporanea,
     * senza eliminare la foto già confermata.
     */
    if (
      avatarDraftPreview.startsWith("blob:") &&
      avatarDraftPreview !== avatarPreview
    ) {
      URL.revokeObjectURL(avatarDraftPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setAvatarDraftPreview(previewUrl);
    setAvatarFileName(file.name);
    setAvatarFile(file);
    setRemoveAvatarRequested(false);
  };

  const handleRemoveAvatar = () => {
    if (
      avatarDraftPreview.startsWith("blob:") &&
      avatarDraftPreview !== avatarPreview
    ) {
      URL.revokeObjectURL(avatarDraftPreview);
    }

    setAvatarDraftPreview("");
    setAvatarFileName("");
    setAvatarFile(null);
    setRemoveAvatarRequested(true);
    setProfileFormError("");
  };

  const saveProfileChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || savingProfile) return;

    const nextName = displayName.trim();
    const nextCity = displayCity.trim();
    const nextEmail = email.trim();
    const nextMusicPreferences = musicPreferences.trim();

    setProfileFormError("");
    setProfileMessage("");

    if (!nextName || !nextEmail || !nextCity) {
      setProfileFormError("Name, email and city are required.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(nextEmail)) {
      setProfileFormError("Enter a valid email address.");
      return;
    }

    const parsedPreferences = parseMusicPreferences(nextMusicPreferences);

    setSavingProfile(true);

    try {
      let updatedUser = await nightoutApi.updateProfile(user.id, {
        name: nextName,
        email: nextEmail,
        city: nextCity,
        musicPreferences: parsedPreferences,
      });

      if (avatarFile) {
        updatedUser = await nightoutApi.updateAvatar(user.id, avatarFile);
      } else if (removeAvatarRequested) {
        updatedUser = await nightoutApi.removeAvatar(user.id);
      }

      const extendedUpdatedUser = updatedUser as typeof updatedUser &
        ProfileUserExtras;

      const updatedPreferences =
        extendedUpdatedUser.musicPreferences?.join(", ") ?? "";

      const updatedEmail = extendedUpdatedUser.email ?? "";

      const savedAvatarUrl = resolveAvatarUrl(extendedUpdatedUser.avatarUrl);

      setProfile((currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        return {
          ...currentProfile,
          user: updatedUser,
        };
      });

      setDisplayName(updatedUser.name);
      setDisplayCity(updatedUser.city);
      setEmail(updatedEmail);

      setMusicPreferences(updatedPreferences);

      setSavedEmail(updatedEmail);

      setSavedMusicPreferences(updatedPreferences);

      if (avatarDraftPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarDraftPreview);
      }

      setAvatarPreview(savedAvatarUrl);
      setAvatarDraftPreview(savedAvatarUrl);

      setAvatarFile(null);
      setAvatarFileName("");
      setRemoveAvatarRequested(false);
      setEditProfileOpen(false);

      setProfileMessage("Profile updated successfully.");
    } catch {
      setProfileFormError(
        "Could not save the profile or profile picture. Please try again.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (error) {
    return (
      <StateBlock
        title="Profile unavailable"
        message="Could not load profile data."
      />
    );
  }

  if (!profile) {
    return (
      <StateBlock title="Loading profile" message="Fetching account data." />
    );
  }

  return (
    <section className="page-stack profile-page">
      <PageHeader
        title="Account"
        action={
          <div className="profile-header-actions">
            <button
              className="small-action"
              type="button"
              onClick={openEditProfile}
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
            {profile.user.name.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div className="profile-main-information">
          <div className="profile-name-row">
            <h2>{profile.user.name}</h2>

            {profile.user.verified && (
              <span className="verified-badge">Verified</span>
            )}
          </div>

          <p>{profile.user.city}</p>

          {savedEmail && <span className="profile-email">{savedEmail}</span>}

          {savedMusicPreferences && (
            <span className="profile-preferences">
              Music preferences: {savedMusicPreferences}
            </span>
          )}
        </div>
      </article>

      {profileMessage && <p className="inline-success">{profileMessage}</p>}

      <div className="manager-grid">
        <MetricCard label="Nights attended" value={profile.attendedNights} />

        <MetricCard label="Active tickets" value={profile.activeTickets} />

        <MetricCard label="Saved events" value={profile.savedEvents.length} />

        <MetricCard label="Points" value={profile.user.points} />
      </div>

      <FriendsSection currentUserId={profile.user.id} />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Saved events</h2>

            <p className="section-description">
              Events you saved to view again later.
            </p>
          </div>

          <span>
            {profile.savedEvents.length}{" "}
            {profile.savedEvents.length === 1 ? "event" : "events"}
          </span>
        </div>

        {profile.savedEvents.length === 0 ? (
          <div className="profile-empty-state">
            <strong>No saved events</strong>

            <span>Save an event from its detail page to find it here.</span>

            <Link className="secondary-action" to="/feed">
              Discover events
            </Link>
          </div>
        ) : (
          <div className="saved-events-grid">
            {profile.savedEvents.map((event) => (
              <Link
                className="saved-event-card"
                to={`/events/${event.id}`}
                key={event.id}
              >
                <img
                  src={event.imageUrl || imageForId(event.id)}
                  alt={`${event.title} event`}
                />

                <div className="saved-event-content">
                  <div>
                    <h3>{event.title}</h3>

                    <p>{event.venueName}</p>
                  </div>

                  <div className="saved-event-details">
                    <span>{formatDateTime(event.startsAt)}</span>

                    <span>{readableGenre(event.musicGenre)}</span>

                    <strong>
                      {event.price === 0
                        ? "Free entry"
                        : formatCurrency(event.price)}
                    </strong>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Tickets</h2>

            <p className="section-description">
              View and manage your purchased tickets in the dedicated section.
            </p>
          </div>
        </div>

        <Link className="profile-navigation-card" to="/tickets">
          <div>
            <strong>Active tickets</strong>

            <span>
              {profile.activeTickets}{" "}
              {profile.activeTickets === 1 ? "active ticket" : "active tickets"}
            </span>
          </div>

          <span className="profile-navigation-arrow">→</span>
        </Link>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Notifications</h2>

            <p className="section-description">
              View updates about tickets, pregames and saved events.
            </p>
          </div>

          <Link to="/notifications">View all</Link>
        </div>

        <div className="compact-list">
          {profile.notifications.length === 0 ? (
            <div className="list-tile">
              <strong>No notifications</strong>

              <span>You do not have any new updates.</span>
            </div>
          ) : (
            profile.notifications.slice(0, 3).map((notification) => (
              <Link
                className={
                  notification.read
                    ? "list-tile notification-preview read"
                    : "list-tile notification-preview unread"
                }
                to="/notifications"
                key={notification.id}
              >
                <strong>{notification.type}</strong>

                <span>{notification.message}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Settings</h2>

            <p className="section-description">
              Manage your account preferences, privacy and security.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          <Link className="settings-card" to="/notifications">
            <div className="settings-icon">🔔</div>

            <div>
              <strong>Notification settings</strong>

              <span>Manage alerts and updates.</span>
            </div>
          </Link>

          <Link className="settings-card" to="/privacy-settings">
            <div className="settings-icon">🔒</div>

            <div>
              <strong>Privacy and security</strong>

              <span>
                Manage profile visibility and social permissions.
              </span>
            </div>
          </Link>

          <Link className="settings-card" to="/payment-methods">
            <div className="settings-icon">💳</div>

            <div>
              <strong>Payment methods</strong>

              <span>Manage your saved payment methods.</span>
            </div>
          </Link>

          <Link className="settings-card" to="/help-support">
            <div className="settings-icon">?</div>

            <div>
              <strong>Help and support</strong>

              <span>Read FAQs or contact NightOut support.</span>
            </div>
          </Link>
        </div>
      </section>

      {editProfileOpen && (
        <div
          className="profile-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditProfile();
            }
          }}
        >
          <section
            className="profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="profile-modal-header">
              <div>
                <h2 id="edit-profile-title">Edit profile</h2>

                <p>Update your personal information and preferences.</p>
              </div>

              <button
                className="profile-modal-close"
                type="button"
                aria-label="Close edit profile"
                onClick={closeEditProfile}
              >
                ×
              </button>
            </div>

            <form className="profile-edit-form" onSubmit={saveProfileChanges}>
              <div className="profile-photo-field">
                <span className="profile-field-label">Profile picture</span>

                <div className="profile-photo-controls">
                  <div className="profile-photo-preview">
                    {avatarDraftPreview ? (
                      <img src={avatarDraftPreview} alt="Profile preview" />
                    ) : (
                      <div className="profile-avatar">
                        {displayName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="profile-photo-upload">
                    <input
                      id="profile-picture-input"
                      className="profile-photo-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                    />

                    <label
                      className="profile-photo-button"
                      htmlFor="profile-picture-input"
                    >
                      Choose photo
                    </label>

                    {avatarDraftPreview && (
                      <button
                        className="profile-photo-remove-button"
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={savingProfile}
                      >
                        Remove photo
                      </button>
                    )}

                    <span className="profile-photo-filename">
                      {avatarFileName || "No photo selected"}
                    </span>

                    <small className="profile-photo-help">
                      JPG, PNG or WebP. Maximum size: 5 MB.
                    </small>
                  </div>
                </div>
              </div>

              {profileFormError && (
                <p className="inline-error">{profileFormError}</p>
              )}

              <label>
                <span>Name</span>

                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <div className="profile-verification-row">
                <div>
                  <strong>Email verification</strong>

                  <span>
                    {profile.user.verified
                      ? "Your account is verified."
                      : "Email verification will be available soon."}
                  </span>
                </div>

                <span
                  className={
                    profile.user.verified
                      ? "verified-badge"
                      : "verification-pending-badge"
                  }
                >
                  {profile.user.verified ? "Verified" : "Not verified"}
                </span>
              </div>

              <label>
                <span>City</span>

                <input
                  type="text"
                  value={displayCity}
                  onChange={(event) => setDisplayCity(event.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </label>

              <label>
                <span>Music preferences</span>

                <input
                  type="text"
                  placeholder="House, Techno, Hip-Hop..."
                  value={musicPreferences}
                  onChange={(event) => setMusicPreferences(event.target.value)}
                />
              </label>

              <div className="profile-modal-actions">
                <button
                  className="secondary-action"
                  type="button"
                  onClick={closeEditProfile}
                  disabled={savingProfile}
                >
                  Cancel
                </button>

                <button
                  className="primary-action"
                  type="submit"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
