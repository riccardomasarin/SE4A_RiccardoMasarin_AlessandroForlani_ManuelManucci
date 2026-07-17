import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { imageForId } from '../components/images'
import { useSession } from '../session'
import type {
  UpdateVenueRequest,
  VenueCategory,
  VenueDto,
} from '../types/nightout'

type VenueProfileForm = {
  name: string
  category: VenueCategory
  address: string
  city: string
  area: string
  description: string
  imageUrl: string
  phoneNumber: string
  contactEmail: string
  websiteUrl: string
  instagramUrl: string
  facebookUrl: string
  tiktokUrl: string
}

const emptyVenueForm: VenueProfileForm = {
  name: '',
  category: 'CLUB',
  address: '',
  city: '',
  area: '',
  description: '',
  imageUrl: '',
  phoneNumber: '',
  contactEmail: '',
  websiteUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
}

export function ManagerVenueProfilePage() {
  const { user } = useSession()

  const [venues, setVenues] =
    useState<VenueDto[]>([])

  const [selectedVenueId, setSelectedVenueId] =
    useState<number | null>(null)

  const [form, setForm] =
    useState<VenueProfileForm>(emptyVenueForm)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] =
    useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    nightoutApi
      .getManagerVenues(user.id)
      .then((data) => {
        setVenues(data)

        setSelectedVenueId((currentId) => {
          if (
            currentId !== null &&
            data.some(
              (venue) => venue.id === currentId,
            )
          ) {
            return currentId
          }

          return data[0]?.id ?? null
        })
      })
      .catch(() => {
        setError(
          'Could not load the venue profile. Check that the backend is running.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

  const selectedVenue = useMemo(
    () =>
      venues.find(
        (venue) =>
          venue.id === selectedVenueId,
      ) ?? null,
    [venues, selectedVenueId],
  )

  useEffect(() => {
    if (!selectedVenue) {
      setForm(emptyVenueForm)
      return
    }

    setForm(venueToForm(selectedVenue))
  }, [selectedVenue])

  function updateField(
    field: keyof VenueProfileForm,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function resetForm() {
    if (!selectedVenue || saving) return

    setForm(venueToForm(selectedVenue))
    setError('')
    setSuccessMessage('')
  }

  async function saveVenueProfile(
    formEvent: FormEvent<HTMLFormElement>,
  ) {
    formEvent.preventDefault()

    if (
      !user ||
      !selectedVenue ||
      saving
    ) {
      return
    }

    if (
      !form.name.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.area.trim()
    ) {
      setError(
        'Please complete the venue name, address, city and area.',
      )
      return
    }

    if (
      form.contactEmail.trim() &&
      !isValidEmail(form.contactEmail.trim())
    ) {
      setError(
        'Please enter a valid contact email address.',
      )
      return
    }

    const request: UpdateVenueRequest = {
      managerId: user.id,
      name: form.name.trim(),
      category: form.category,
      address: form.address.trim(),
      city: form.city.trim(),
      area: form.area.trim(),
      description: optionalValue(
        form.description,
      ),
      imageUrl: optionalValue(
        form.imageUrl,
      ),
      phoneNumber: optionalValue(
        form.phoneNumber,
      ),
      contactEmail: optionalValue(
        form.contactEmail,
      ),
      websiteUrl: optionalValue(
        form.websiteUrl,
      ),
      instagramUrl: optionalValue(
        form.instagramUrl,
      ),
      facebookUrl: optionalValue(
        form.facebookUrl,
      ),
      tiktokUrl: optionalValue(
        form.tiktokUrl,
      ),
    }

    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const updatedVenue =
        await nightoutApi.updateManagerVenue(
          selectedVenue.id,
          request,
        )

      setVenues((currentVenues) =>
        currentVenues.map((venue) =>
          venue.id === updatedVenue.id
            ? updatedVenue
            : venue,
        ),
      )

      setForm(venueToForm(updatedVenue))

      setSuccessMessage(
        'Venue profile updated successfully.',
      )
    } catch {
      setError(
        'Could not update the venue profile. Check the entered information.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <StateBlock
        title="Access denied"
        message="You must be logged in as a venue manager."
      />
    )
  }

  if (
    user.role !== 'VENUE_MANAGER' &&
    user.role !== 'PR_MANAGER'
  ) {
    return (
      <StateBlock
        title="Access denied"
        message="Only venue managers and PR users can manage venue profiles."
      />
    )
  }

  if (loading) {
    return (
      <StateBlock
        title="Loading venue profile"
        message="Fetching venue information."
      />
    )
  }

  return (
    <section className="page-stack manager-venue-profile-page">
      <PageHeader
        title="Venue profile"
        subtitle="Manage public venue information, contacts and social links."
      />

      {error && (
        <p className="inline-error">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="inline-success">
          {successMessage}
        </p>
      )}

      {venues.length === 0 || !selectedVenue ? (
        <section className="manager-venue-profile-empty">
          <strong>No managed venue found</strong>

          <span>
            A venue must be assigned to your
            manager account before its profile can
            be edited.
          </span>
        </section>
      ) : (
        <>
          {venues.length > 1 && (
            <section className="manager-venue-selector">
              <label>
                <span>Select venue</span>

                <select
                  value={selectedVenueId ?? ''}
                  onChange={(event) => {
                    setSelectedVenueId(
                      Number(event.target.value),
                    )

                    setError('')
                    setSuccessMessage('')
                  }}
                >
                  {venues.map((venue) => (
                    <option
                      key={venue.id}
                      value={venue.id}
                    >
                      {venue.name}
                    </option>
                  ))}
                </select>
              </label>
            </section>
          )}

          <section className="manager-venue-profile-hero">
            <img
              src={
                selectedVenue.imageUrl ||
                imageForId(selectedVenue.id)
              }
              alt={`${selectedVenue.name} venue`}
              onError={(event) => {
                event.currentTarget.src =
                  imageForId(selectedVenue.id)
              }}
            />

            <div className="manager-venue-profile-overlay">
              <div className="manager-venue-profile-badges">
                <span className="chip active">
                  {readableVenueCategory(
                    selectedVenue.category,
                  )}
                </span>

                {selectedVenue.partnerBar && (
                  <span className="manager-venue-partner-badge">
                    Partner bar
                  </span>
                )}
              </div>

              <h2>{selectedVenue.name}</h2>

              <p>
                {selectedVenue.address},{' '}
                {selectedVenue.area},{' '}
                {selectedVenue.city}
              </p>
            </div>
          </section>

          <section className="manager-venue-profile-summary">
            <div>
              <span>Category</span>

              <strong>
                {readableVenueCategory(
                  selectedVenue.category,
                )}
              </strong>
            </div>

            <div>
              <span>Rating</span>

              <strong>
                {selectedVenue.rating > 0
                  ? selectedVenue.rating.toFixed(1)
                  : 'Not rated'}
              </strong>
            </div>

            <div>
              <span>Partner status</span>

              <strong>
                {selectedVenue.partnerBar
                  ? 'Partner bar'
                  : 'Standard venue'}
              </strong>
            </div>
          </section>

          <form
            className="manager-venue-profile-form"
            onSubmit={saveVenueProfile}
          >
            <section className="manager-venue-form-section">
              <div className="manager-venue-form-heading">
                <div>
                  <h2>Basic information</h2>

                  <p>
                    Information displayed publicly
                    throughout NightOUT.
                  </p>
                </div>
              </div>

              <div className="manager-venue-form-grid">
                <label>
                  <span>Venue name *</span>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        'name',
                        event.target.value,
                      )
                    }
                    maxLength={120}
                    required
                  />
                </label>

                <label>
                  <span>Category *</span>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateField(
                        'category',
                        event.target.value,
                      )
                    }
                  >
                    <option value="CLUB">
                      Club
                    </option>

                    <option value="BAR">
                      Bar
                    </option>

                    <option value="LOUNGE">
                      Lounge
                    </option>

                    <option value="LIVE_MUSIC_VENUE">
                      Live music venue
                    </option>
                  </select>
                </label>

                <label className="manager-venue-form-full">
                  <span>Description</span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        'description',
                        event.target.value,
                      )
                    }
                    rows={6}
                    maxLength={2000}
                    placeholder="Describe the atmosphere, music and experience offered by the venue."
                  />
                </label>

                <label className="manager-venue-form-full">
                  <span>Venue image URL</span>

                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) =>
                      updateField(
                        'imageUrl',
                        event.target.value,
                      )
                    }
                    placeholder="https://example.com/venue.jpg"
                  />
                </label>
              </div>
            </section>

            <section className="manager-venue-form-section">
              <div className="manager-venue-form-heading">
                <div>
                  <h2>Location</h2>

                  <p>
                    Address used in event pages and
                    venue directions.
                  </p>
                </div>
              </div>

              <div className="manager-venue-form-grid">
                <label className="manager-venue-form-full">
                  <span>Address *</span>

                  <input
                    type="text"
                    value={form.address}
                    onChange={(event) =>
                      updateField(
                        'address',
                        event.target.value,
                      )
                    }
                    maxLength={255}
                    required
                  />
                </label>

                <label>
                  <span>City *</span>

                  <input
                    type="text"
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        'city',
                        event.target.value,
                      )
                    }
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  <span>Area *</span>

                  <input
                    type="text"
                    value={form.area}
                    onChange={(event) =>
                      updateField(
                        'area',
                        event.target.value,
                      )
                    }
                    maxLength={100}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="manager-venue-form-section">
              <div className="manager-venue-form-heading">
                <div>
                  <h2>Contact information</h2>

                  <p>
                    Public contact details for
                    customers and event attendees.
                  </p>
                </div>
              </div>

              <div className="manager-venue-form-grid">
                <label>
                  <span>Phone number</span>

                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(event) =>
                      updateField(
                        'phoneNumber',
                        event.target.value,
                      )
                    }
                    maxLength={40}
                    placeholder="+39 02 00000000"
                  />
                </label>

                <label>
                  <span>Contact email</span>

                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) =>
                      updateField(
                        'contactEmail',
                        event.target.value,
                      )
                    }
                    maxLength={160}
                    placeholder="info@venue.com"
                  />
                </label>

                <label className="manager-venue-form-full">
                  <span>Website</span>

                  <input
                    type="url"
                    value={form.websiteUrl}
                    onChange={(event) =>
                      updateField(
                        'websiteUrl',
                        event.target.value,
                      )
                    }
                    placeholder="https://www.venue.com"
                  />
                </label>
              </div>
            </section>

            <section className="manager-venue-form-section">
              <div className="manager-venue-form-heading">
                <div>
                  <h2>Social links</h2>

                  <p>
                    Add the official social profiles
                    of the venue.
                  </p>
                </div>
              </div>

              <div className="manager-venue-form-grid">
                <label>
                  <span>Instagram</span>

                  <input
                    type="url"
                    value={form.instagramUrl}
                    onChange={(event) =>
                      updateField(
                        'instagramUrl',
                        event.target.value,
                      )
                    }
                    placeholder="https://instagram.com/venue"
                  />
                </label>

                <label>
                  <span>Facebook</span>

                  <input
                    type="url"
                    value={form.facebookUrl}
                    onChange={(event) =>
                      updateField(
                        'facebookUrl',
                        event.target.value,
                      )
                    }
                    placeholder="https://facebook.com/venue"
                  />
                </label>

                <label className="manager-venue-form-full">
                  <span>TikTok</span>

                  <input
                    type="url"
                    value={form.tiktokUrl}
                    onChange={(event) =>
                      updateField(
                        'tiktokUrl',
                        event.target.value,
                      )
                    }
                    placeholder="https://tiktok.com/@venue"
                  />
                </label>
              </div>
            </section>

            <div className="manager-venue-profile-actions">
              <button
                className="secondary-action"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Reset changes
              </button>

              <button
                className="primary-action"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save venue profile'}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  )
}

function venueToForm(
  venue: VenueDto,
): VenueProfileForm {
  return {
    name: venue.name,
    category: venue.category,
    address: venue.address,
    city: venue.city,
    area: venue.area,
    description: venue.description ?? '',
    imageUrl: venue.imageUrl ?? '',
    phoneNumber: venue.phoneNumber ?? '',
    contactEmail: venue.contactEmail ?? '',
    websiteUrl: venue.websiteUrl ?? '',
    instagramUrl: venue.instagramUrl ?? '',
    facebookUrl: venue.facebookUrl ?? '',
    tiktokUrl: venue.tiktokUrl ?? '',
  }
}

function optionalValue(
  value: string,
): string | null {
  const normalizedValue = value.trim()

  return normalizedValue
    ? normalizedValue
    : null
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  )
}

function readableVenueCategory(
  category: VenueCategory,
) {
  switch (category) {
    case 'CLUB':
      return 'Club'
    case 'BAR':
      return 'Bar'
    case 'LOUNGE':
      return 'Lounge'
    case 'LIVE_MUSIC_VENUE':
      return 'Live music venue'
  }
}