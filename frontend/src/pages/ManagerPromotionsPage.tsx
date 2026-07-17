import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { formatDateTime } from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type {
  CreatePromotionRequest,
  EventDetailDto,
  PromotionDto,
  PromotionType,
  UpdatePromotionRequest,
  VenueDto,
} from '../types/nightout'

type PromotionFilter =
  | 'all'
  | 'active'
  | 'scheduled'
  | 'inactive'
  | 'expired'

type PromotionState =
  | 'active'
  | 'scheduled'
  | 'inactive'
  | 'expired'

type PromotionForm = {
  eventId: string
  label: string
  description: string
  type: PromotionType
  promoCode: string
  discountPercentage: string
  active: boolean
  validFrom: string
  validTo: string
}

const emptyPromotionForm: PromotionForm = {
  eventId: '',
  label: '',
  description: '',
  type: 'SPECIAL_OFFER',
  promoCode: '',
  discountPercentage: '',
  active: true,
  validFrom: '',
  validTo: '',
}

export function ManagerPromotionsPage() {
  const { user } = useSession()

  const [venues, setVenues] =
    useState<VenueDto[]>([])

  const [events, setEvents] =
    useState<EventDetailDto[]>([])

  const [promotions, setPromotions] =
    useState<PromotionDto[]>([])

  const [selectedVenueId, setSelectedVenueId] =
    useState<number | null>(null)

  const [loadingPage, setLoadingPage] =
    useState(true)

  const [loadingPromotions, setLoadingPromotions] =
    useState(false)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] =
    useState('')

  const [search, setSearch] = useState('')

  const [promotionFilter, setPromotionFilter] =
    useState<PromotionFilter>('all')

  const [formOpen, setFormOpen] =
    useState(false)

  const [editingPromotion, setEditingPromotion] =
    useState<PromotionDto | null>(null)

  const [promotionForm, setPromotionForm] =
    useState<PromotionForm>(emptyPromotionForm)

  const [saving, setSaving] = useState(false)

  const [
    processingPromotionId,
    setProcessingPromotionId,
  ] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setLoadingPage(false)
      return
    }

    setLoadingPage(true)
    setError('')

    Promise.all([
      nightoutApi.getManagerVenues(user.id),
      nightoutApi.getManagerEvents(user.id),
    ])
      .then(([venueData, eventData]) => {
        setVenues(venueData)
        setEvents(eventData)

        setSelectedVenueId((currentVenueId) => {
          if (
            currentVenueId !== null &&
            venueData.some(
              (venue) =>
                venue.id === currentVenueId,
            )
          ) {
            return currentVenueId
          }

          return venueData[0]?.id ?? null
        })
      })
      .catch(() => {
        setError(
          'Could not load the venue information. Check that the backend is running.',
        )
      })
      .finally(() => {
        setLoadingPage(false)
      })
  }, [user])

  useEffect(() => {
    if (!user || selectedVenueId === null) {
      setPromotions([])
      return
    }

    setLoadingPromotions(true)
    setError('')

    nightoutApi
      .getManagerPromotions(
        selectedVenueId,
        user.id,
      )
      .then(setPromotions)
      .catch(() => {
        setError(
          'Could not load the venue promotions.',
        )
      })
      .finally(() => {
        setLoadingPromotions(false)
      })
  }, [user, selectedVenueId])

  const selectedVenue = useMemo(
    () =>
      venues.find(
        (venue) =>
          venue.id === selectedVenueId,
      ) ?? null,
    [venues, selectedVenueId],
  )

  const venueEvents = useMemo(
    () =>
      events
        .filter(
          (event) =>
            event.venue.id === selectedVenueId,
        )
        .sort(
          (firstEvent, secondEvent) =>
            new Date(
              firstEvent.startsAt,
            ).getTime() -
            new Date(
              secondEvent.startsAt,
            ).getTime(),
        ),
    [events, selectedVenueId],
  )

  const promotionCounts = useMemo(() => {
    const counts = {
      active: 0,
      scheduled: 0,
      inactive: 0,
      expired: 0,
    }

    promotions.forEach((promotion) => {
      const state =
        getPromotionState(promotion)

      counts[state] += 1
    })

    return counts
  }, [promotions])

  const filteredPromotions = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return promotions
      .filter((promotion) => {
        const state =
          getPromotionState(promotion)

        const matchesFilter =
          promotionFilter === 'all' ||
          promotionFilter === state

        const searchableValues = [
          promotion.label,
          promotion.description,
          promotion.eventTitle,
          promotion.promoCode,
          promotion.venueName,
        ]

        const matchesSearch =
          !normalizedSearch ||
          searchableValues.some((value) =>
            value
              ?.toLowerCase()
              .includes(normalizedSearch),
          )

        return matchesFilter && matchesSearch
      })
      .sort((firstPromotion, secondPromotion) => {
        const firstDate =
          firstPromotion.validFrom
            ? new Date(
                firstPromotion.validFrom,
              ).getTime()
            : 0

        const secondDate =
          secondPromotion.validFrom
            ? new Date(
                secondPromotion.validFrom,
              ).getTime()
            : 0

        return secondDate - firstDate
      })
  }, [promotions, promotionFilter, search])

  function openCreateModal() {
    if (selectedVenueId === null) return

    setEditingPromotion(null)
    setPromotionForm(emptyPromotionForm)
    setFormOpen(true)
    setError('')
    setSuccessMessage('')
  }

  function openEditModal(
    promotion: PromotionDto,
  ) {
    setEditingPromotion(promotion)

    setPromotionForm({
      eventId:
        promotion.eventId !== null
          ? String(promotion.eventId)
          : '',
      label: promotion.label,
      description:
        promotion.description ?? '',
      type: promotion.type,
      promoCode: promotion.promoCode ?? '',
      discountPercentage:
        promotion.discountPercentage !== null
          ? String(
              promotion.discountPercentage,
            )
          : '',
      active: promotion.active,
      validFrom: toDateTimeLocal(
        promotion.validFrom,
      ),
      validTo: toDateTimeLocal(
        promotion.validTo,
      ),
    })

    setFormOpen(true)
    setError('')
    setSuccessMessage('')
  }

  function closeFormModal(force = false) {
    if (saving && !force) return

    setFormOpen(false)
    setEditingPromotion(null)
    setPromotionForm(emptyPromotionForm)
  }

  function updateFormField(
    field: keyof PromotionForm,
    value: string | boolean,
  ) {
    setPromotionForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  async function savePromotion(
    formEvent: FormEvent<HTMLFormElement>,
  ) {
    formEvent.preventDefault()

    if (
      !user ||
      selectedVenueId === null ||
      saving
    ) {
      return
    }

    const label =
      promotionForm.label.trim()

    const description =
      promotionForm.description.trim()

    const promoCode =
      promotionForm.promoCode.trim()

    if (!label) {
      setError(
        'Please enter a promotion title.',
      )
      return
    }

    let discountPercentage: number | null =
      null

    if (
      promotionForm.discountPercentage.trim()
    ) {
      discountPercentage = Number(
        promotionForm.discountPercentage,
      )

      if (
        !Number.isFinite(
          discountPercentage,
        ) ||
        discountPercentage < 1 ||
        discountPercentage > 100
      ) {
        setError(
          'The discount percentage must be between 1 and 100.',
        )
        return
      }
    }

    if (
      promotionForm.type === 'DISCOUNT' &&
      discountPercentage === null
    ) {
      setError(
        'A discount promotion requires a percentage.',
      )
      return
    }

    if (
      promotionForm.type === 'PROMO_CODE' &&
      !promoCode
    ) {
      setError(
        'A promo-code promotion requires a promo code.',
      )
      return
    }

    const validFrom =
      promotionForm.validFrom
        ? new Date(
            promotionForm.validFrom,
          ).toISOString()
        : null

    const validTo =
      promotionForm.validTo
        ? new Date(
            promotionForm.validTo,
          ).toISOString()
        : null

    if (
      validFrom &&
      validTo &&
      new Date(validTo).getTime() <
        new Date(validFrom).getTime()
    ) {
      setError(
        'The end date cannot be before the start date.',
      )
      return
    }

    const eventId =
      promotionForm.eventId
        ? Number(promotionForm.eventId)
        : null

    const normalizedPromoCode =
      promotionForm.type === 'PROMO_CODE'
        ? promoCode
        : null

    const normalizedDiscount =
      promotionForm.type === 'DISCOUNT' ||
      promotionForm.type === 'PROMO_CODE'
        ? discountPercentage
        : null

    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      if (editingPromotion) {
        const request: UpdatePromotionRequest = {
          managerId: user.id,
          eventId,
          label,
          description:
            description || null,
          type: promotionForm.type,
          promoCode: normalizedPromoCode,
          discountPercentage:
            normalizedDiscount,
          active: promotionForm.active,
          validFrom,
          validTo,
        }

        const updatedPromotion =
          await nightoutApi.updatePromotion(
            editingPromotion.id,
            request,
          )

        setPromotions((currentPromotions) =>
          currentPromotions.map(
            (promotion) =>
              promotion.id ===
              updatedPromotion.id
                ? updatedPromotion
                : promotion,
          ),
        )

        setSuccessMessage(
          'Promotion updated successfully.',
        )
      } else {
        const request: CreatePromotionRequest = {
          venueId: selectedVenueId,
          managerId: user.id,
          eventId,
          label,
          description:
            description || null,
          type: promotionForm.type,
          promoCode: normalizedPromoCode,
          discountPercentage:
            normalizedDiscount,
          active: promotionForm.active,
          validFrom,
          validTo,
        }

        const createdPromotion =
          await nightoutApi.createPromotion(
            request,
          )

        setPromotions((currentPromotions) => [
          createdPromotion,
          ...currentPromotions,
        ])

        setSuccessMessage(
          'Promotion created successfully.',
        )
      }

      closeFormModal(true)
    } catch {
      setError(
        'Could not save the promotion. Check the entered information.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function togglePromotionStatus(
    promotion: PromotionDto,
  ) {
    if (!user) return

    setProcessingPromotionId(
      promotion.id,
    )

    setError('')
    setSuccessMessage('')

    try {
      const updatedPromotion =
        await nightoutApi.setPromotionStatus(
          promotion.id,
          user.id,
          !promotion.active,
        )

      setPromotions((currentPromotions) =>
        currentPromotions.map(
          (currentPromotion) =>
            currentPromotion.id ===
            updatedPromotion.id
              ? updatedPromotion
              : currentPromotion,
        ),
      )

      setSuccessMessage(
        updatedPromotion.active
          ? 'Promotion activated successfully.'
          : 'Promotion deactivated successfully.',
      )
    } catch {
      setError(
        'Could not change the promotion status.',
      )
    } finally {
      setProcessingPromotionId(null)
    }
  }

  async function deletePromotion(
    promotion: PromotionDto,
  ) {
    if (!user) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${promotion.label}"? This action cannot be undone.`,
    )

    if (!confirmed) return

    setProcessingPromotionId(
      promotion.id,
    )

    setError('')
    setSuccessMessage('')

    try {
      await nightoutApi.deletePromotion(
        promotion.id,
        user.id,
      )

      setPromotions((currentPromotions) =>
        currentPromotions.filter(
          (currentPromotion) =>
            currentPromotion.id !==
            promotion.id,
        ),
      )

      setSuccessMessage(
        'Promotion deleted successfully.',
      )
    } catch {
      setError(
        'Could not delete the promotion.',
      )
    } finally {
      setProcessingPromotionId(null)
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
        message="Only venue managers and PR users can manage promotions."
      />
    )
  }

  if (loadingPage) {
    return (
      <StateBlock
        title="Loading promotions"
        message="Fetching venue information."
      />
    )
  }

  return (
    <section className="page-stack manager-promotions-page">
      <PageHeader
        title="Promotions"
        subtitle="Create and manage discounts, promo codes and special offers."
        action={
          <button
            className="small-action create-action"
            type="button"
            onClick={openCreateModal}
            disabled={
              selectedVenueId === null
            }
          >
            Create promotion
          </button>
        }
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

      {venues.length === 0 ? (
        <div className="manager-promotions-empty">
          <strong>No managed venue found</strong>

          <span>
            A venue must be assigned to your
            manager account before you can create
            promotions.
          </span>
        </div>
      ) : (
        <>
          <section className="manager-promotions-summary">
            <div>
              <span>Total promotions</span>
              <strong>
                {promotions.length}
              </strong>
            </div>

            <div>
              <span>Currently active</span>
              <strong>
                {promotionCounts.active}
              </strong>
            </div>

            <div>
              <span>Scheduled</span>
              <strong>
                {promotionCounts.scheduled}
              </strong>
            </div>

            <div>
              <span>Inactive</span>
              <strong>
                {promotionCounts.inactive}
              </strong>
            </div>

            <div>
              <span>Expired</span>
              <strong>
                {promotionCounts.expired}
              </strong>
            </div>
          </section>

          <section className="manager-promotions-toolbar">
            <label>
              <span>Venue</span>

              <select
                value={
                  selectedVenueId ?? ''
                }
                onChange={(event) => {
                  setSelectedVenueId(
                    Number(
                      event.target.value,
                    ),
                  )

                  setSearch('')
                  setPromotionFilter('all')
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

            <label className="manager-promotion-search">
              <span>Search promotions</span>

              <input
                type="search"
                placeholder="Search by title, event or code..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />
            </label>
          </section>

          <section className="manager-promotion-filter-buttons">
            <button
              className={
                promotionFilter === 'all'
                  ? 'active'
                  : undefined
              }
              type="button"
              onClick={() =>
                setPromotionFilter('all')
              }
            >
              All
            </button>

            <button
              className={
                promotionFilter === 'active'
                  ? 'active'
                  : undefined
              }
              type="button"
              onClick={() =>
                setPromotionFilter('active')
              }
            >
              Active
            </button>

            <button
              className={
                promotionFilter ===
                'scheduled'
                  ? 'active'
                  : undefined
              }
              type="button"
              onClick={() =>
                setPromotionFilter(
                  'scheduled',
                )
              }
            >
              Scheduled
            </button>

            <button
              className={
                promotionFilter ===
                'inactive'
                  ? 'active'
                  : undefined
              }
              type="button"
              onClick={() =>
                setPromotionFilter(
                  'inactive',
                )
              }
            >
              Inactive
            </button>

            <button
              className={
                promotionFilter ===
                'expired'
                  ? 'active'
                  : undefined
              }
              type="button"
              onClick={() =>
                setPromotionFilter('expired')
              }
            >
              Expired
            </button>
          </section>

          {loadingPromotions ? (
            <StateBlock
              title="Loading promotions"
              message={`Fetching promotions for ${
                selectedVenue?.name ??
                'the selected venue'
              }.`}
            />
          ) : filteredPromotions.length === 0 ? (
            <div className="manager-promotions-empty">
              <strong>
                No promotions found
              </strong>

              <span>
                Create a promotion or change the
                selected filters.
              </span>

              <button
                className="primary-action"
                type="button"
                onClick={openCreateModal}
              >
                Create your first promotion
              </button>
            </div>
          ) : (
            <div className="manager-promotions-grid">
              {filteredPromotions.map(
                (promotion) => {
                  const state =
                    getPromotionState(
                      promotion,
                    )

                  const processing =
                    processingPromotionId ===
                    promotion.id

                  return (
                    <article
                      className="manager-promotion-card"
                      key={promotion.id}
                    >
                      <div className="manager-promotion-heading">
                        <div>
                          <div className="manager-promotion-badges">
                            <span
                              className={`manager-promotion-status ${state}`}
                            >
                              {readablePromotionState(
                                state,
                              )}
                            </span>

                            <span className="chip">
                              {readablePromotionType(
                                promotion.type,
                              )}
                            </span>
                          </div>

                          <h2>
                            {promotion.label}
                          </h2>

                          <p>
                            {promotion.description ||
                              'No description provided.'}
                          </p>
                        </div>
                      </div>

                      <div className="manager-promotion-details">
                        <div>
                          <span>Applies to</span>

                          <strong>
                            {promotion.eventTitle ??
                              'Entire venue'}
                          </strong>
                        </div>

                        <div>
                          <span>Valid from</span>

                          <strong>
                            {formatOptionalDate(
                              promotion.validFrom,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Valid until</span>

                          <strong>
                            {formatOptionalDate(
                              promotion.validTo,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Discount</span>

                          <strong>
                            {promotion.discountPercentage !==
                            null
                              ? `${promotion.discountPercentage}%`
                              : 'Not applicable'}
                          </strong>
                        </div>

                        <div>
                          <span>Promo code</span>

                          <strong>
                            {promotion.promoCode ??
                              'Not required'}
                          </strong>
                        </div>

                        <div>
                          <span>Venue</span>

                          <strong>
                            {promotion.venueName ??
                              selectedVenue?.name ??
                              'Venue'}
                          </strong>
                        </div>
                      </div>

                      <div className="manager-promotion-actions">
                        <button
                          className="secondary-action"
                          type="button"
                          onClick={() =>
                            openEditModal(
                              promotion,
                            )
                          }
                          disabled={processing}
                        >
                          Edit
                        </button>

                        <button
                          className="secondary-action"
                          type="button"
                          onClick={() =>
                            togglePromotionStatus(
                              promotion,
                            )
                          }
                          disabled={processing}
                        >
                          {processing
                            ? 'Updating...'
                            : promotion.active
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>

                        <button
                          className="danger-action"
                          type="button"
                          onClick={() =>
                            deletePromotion(
                              promotion,
                            )
                          }
                          disabled={processing}
                        >
                          {processing
                            ? 'Processing...'
                            : 'Delete'}
                        </button>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          )}
        </>
      )}

      {formOpen && (
        <div
          className="manager-promotion-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeFormModal()
            }
          }}
        >
          <section
            className="manager-promotion-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-form-title"
          >
            <div className="manager-promotion-modal-header">
              <div>
                <h2 id="promotion-form-title">
                  {editingPromotion
                    ? 'Edit promotion'
                    : 'Create promotion'}
                </h2>

                <p>
                  Configure the offer, validity
                  period and associated event.
                </p>
              </div>

              <button
                className="manager-promotion-modal-close"
                type="button"
                aria-label="Close promotion form"
                onClick={() => closeFormModal()}
              >
                ×
              </button>
            </div>

            <form
              className="manager-promotion-form"
              onSubmit={savePromotion}
            >
              <label className="manager-promotion-form-full">
                <span>Promotion title *</span>

                <input
                  type="text"
                  value={
                    promotionForm.label
                  }
                  onChange={(event) =>
                    updateFormField(
                      'label',
                      event.target.value,
                    )
                  }
                  placeholder="Example: Early bird discount"
                  required
                />
              </label>

              <label className="manager-promotion-form-full">
                <span>Description</span>

                <textarea
                  value={
                    promotionForm.description
                  }
                  onChange={(event) =>
                    updateFormField(
                      'description',
                      event.target.value,
                    )
                  }
                  placeholder="Describe the offer and its conditions."
                  rows={4}
                />
              </label>

              <label>
                <span>Promotion type *</span>

                <select
                  value={promotionForm.type}
                  onChange={(event) =>
                    updateFormField(
                      'type',
                      event.target
                        .value as PromotionType,
                    )
                  }
                >
                  <option value="SPECIAL_OFFER">
                    Special offer
                  </option>

                  <option value="DISCOUNT">
                    Percentage discount
                  </option>

                  <option value="PROMO_CODE">
                    Promo code
                  </option>

                  <option value="FREE_ENTRY">
                    Free entry
                  </option>
                </select>
              </label>

              <label>
                <span>Associated event</span>

                <select
                  value={
                    promotionForm.eventId
                  }
                  onChange={(event) =>
                    updateFormField(
                      'eventId',
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Entire venue
                  </option>

                  {venueEvents.map((event) => (
                    <option
                      key={event.id}
                      value={event.id}
                    >
                      {event.title}
                    </option>
                  ))}
                </select>
              </label>

              {(promotionForm.type ===
                'DISCOUNT' ||
                promotionForm.type ===
                  'PROMO_CODE') && (
                <label>
                  <span>
                    Discount percentage
                    {promotionForm.type ===
                    'DISCOUNT'
                      ? ' *'
                      : ''}
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={
                      promotionForm.discountPercentage
                    }
                    onChange={(event) =>
                      updateFormField(
                        'discountPercentage',
                        event.target.value,
                      )
                    }
                    required={
                      promotionForm.type ===
                      'DISCOUNT'
                    }
                  />
                </label>
              )}

              {promotionForm.type ===
                'PROMO_CODE' && (
                <label>
                  <span>Promo code *</span>

                  <input
                    type="text"
                    value={
                      promotionForm.promoCode
                    }
                    onChange={(event) =>
                      updateFormField(
                        'promoCode',
                        event.target.value,
                      )
                    }
                    placeholder="Example: NIGHT20"
                    required
                  />
                </label>
              )}

              <label>
                <span>Valid from</span>

                <input
                  type="datetime-local"
                  value={
                    promotionForm.validFrom
                  }
                  onChange={(event) =>
                    updateFormField(
                      'validFrom',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Valid until</span>

                <input
                  type="datetime-local"
                  value={
                    promotionForm.validTo
                  }
                  onChange={(event) =>
                    updateFormField(
                      'validTo',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="manager-promotion-active-field manager-promotion-form-full">
                <input
                  type="checkbox"
                  checked={
                    promotionForm.active
                  }
                  onChange={(event) =>
                    updateFormField(
                      'active',
                      event.target.checked,
                    )
                  }
                />

                <span>
                  Activate this promotion
                </span>
              </label>

              <div className="manager-promotion-modal-actions">
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => closeFormModal()}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="primary-action"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingPromotion
                      ? 'Save changes'
                      : 'Create promotion'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

function getPromotionState(
  promotion: PromotionDto,
): PromotionState {
  if (!promotion.active) {
    return 'inactive'
  }

  const now = Date.now()

  if (
    promotion.validTo &&
    new Date(
      promotion.validTo,
    ).getTime() < now
  ) {
    return 'expired'
  }

  if (
    promotion.validFrom &&
    new Date(
      promotion.validFrom,
    ).getTime() > now
  ) {
    return 'scheduled'
  }

  return 'active'
}

function readablePromotionState(
  state: PromotionState,
) {
  switch (state) {
    case 'active':
      return 'Active'
    case 'scheduled':
      return 'Scheduled'
    case 'inactive':
      return 'Inactive'
    case 'expired':
      return 'Expired'
  }
}

function readablePromotionType(
  type: PromotionType,
) {
  switch (type) {
    case 'DISCOUNT':
      return 'Discount'
    case 'PROMO_CODE':
      return 'Promo code'
    case 'FREE_ENTRY':
      return 'Free entry'
    case 'SPECIAL_OFFER':
      return 'Special offer'
  }
}

function formatOptionalDate(
  value: string | null,
) {
  return value
    ? formatDateTime(value)
    : 'No date limit'
}

function toDateTimeLocal(
  value: string | null,
) {
  if (!value) return ''

  const date = new Date(value)

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  const hours = String(
    date.getHours(),
  ).padStart(2, '0')

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}