import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  nightoutApi,
  type CreateEventRequest,
} from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type {
  MusicGenre,
  VenueDto,
} from '../types/nightout'

const genres: MusicGenre[] = [
  'TECHNO',
  'HOUSE',
  'HIP_HOP',
  'RNB',
  'POP',
  'COMMERCIAL',
  'LATIN',
  'ROCK',
  'LIVE_MUSIC',
]

const initialForm = {
  title: '',
  description: '',
  venueId: '',
  startsAt: '',
  endsAt: '',
  musicGenre: 'HOUSE' as MusicGenre,
  dressCode: '',
  ageRestriction: '18+',
  entryCondition: '',
  price: '',
  vipPrice: '',
  capacity: '',
  imageUrl: '',
}

export function ManagerCreateEventPage() {
  const { user } = useSession()
  const navigate = useNavigate()

  const [venues, setVenues] =
    useState<VenueDto[]>([])

  const [form, setForm] =
    useState(initialForm)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const canCreate =
    user?.role === 'VENUE_MANAGER'
    || user?.role === 'PR_MANAGER'

  useEffect(() => {
    if (!user || !canCreate) {
      setLoading(false)
      return
    }

    async function loadVenues() {
      if (!user) {
        return
      }

      setLoading(true)
      setError('')

      try {
        let managedVenues =
          await nightoutApi.getManagerVenues(
            user.id,
          )

        if (managedVenues.length === 0) {
          const dashboard =
            await nightoutApi.getDashboard()

          managedVenues =
            await nightoutApi.getManagerVenues(
              dashboard.managerId,
            )
        }

        setVenues(managedVenues)

        setForm((current) => ({
          ...current,
          venueId:
            current.venueId
            || String(
              managedVenues[0]?.id ?? '',
            ),
        }))
      } catch {
        setError(
          'Could not load managed venues for this demo account.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadVenues()
  }, [canCreate, user])

  const update = (
    field: keyof typeof initialForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateStartTime = (
    value: string,
  ) => {
    setForm((current) => {
      /*
       * Se la fine non è ancora stata scelta,
       * la imposta automaticamente sei ore dopo.
       */
      if (!value || current.endsAt) {
        return {
          ...current,
          startsAt: value,
        }
      }

      const startDate =
        new Date(value)

      startDate.setHours(
        startDate.getHours() + 6,
      )

      return {
        ...current,
        startsAt: value,
        endsAt: toDateTimeLocalValue(
          startDate,
        ),
      }
    })
  }

  const validate = () => {
    if (!form.title.trim()) {
      return 'Title is required.'
    }

    if (!form.description.trim()) {
      return 'Description is required.'
    }

    if (!form.venueId) {
      return 'Choose a venue.'
    }

    if (!form.startsAt) {
      return 'Start date and time are required.'
    }

    if (!form.endsAt) {
      return 'End date and time are required.'
    }

    const startTime =
      new Date(form.startsAt).getTime()

    const endTime =
      new Date(form.endsAt).getTime()

    if (
      Number.isNaN(startTime)
      || Number.isNaN(endTime)
    ) {
      return 'Enter valid start and end times.'
    }

    if (endTime <= startTime) {
      return 'End date and time must be after the start.'
    }

    if (!form.musicGenre) {
      return 'Music genre is required.'
    }

    if (!form.dressCode.trim()) {
      return 'Dress code is required.'
    }

    if (!form.ageRestriction.trim()) {
      return 'Age restriction is required.'
    }

    if (!form.entryCondition.trim()) {
      return 'Entry condition is required.'
    }

    if (Number(form.capacity) < 1) {
      return 'Capacity must be at least 1.'
    }

    if (
      Number(form.price) < 0
      || Number(form.vipPrice) < 0
    ) {
      return 'Prices cannot be negative.'
    }

    return ''
  }

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!user || saving) {
      return
    }

    const validationError =
      validate()

    if (validationError) {
      setError(validationError)
      return
    }

    const request: CreateEventRequest = {
      title: form.title.trim(),
      description:
        form.description.trim(),
      venueId: Number(form.venueId),
      managerId: user.id,
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      musicGenre: form.musicGenre,
      dressCode:
        form.dressCode.trim(),
      ageRestriction:
        form.ageRestriction.trim(),
      entryCondition:
        form.entryCondition.trim(),
      price: Number(
        form.price || 0,
      ),
      vipPrice: Number(
        form.vipPrice || 0,
      ),
      capacity: Number(
        form.capacity,
      ),
      imageUrl:
        form.imageUrl.trim()
        || '/demo/new-event.jpg',
    }

    setSaving(true)
    setError('')

    try {
      const created =
        await nightoutApi
          .createManagerEvent(
            request,
          )

      navigate(
        `/events/${created.id}`,
      )
    } catch {
      setError(
        'Could not create the event. Check the fields and try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <StateBlock
        title="Manager role required"
        message="Select PR manager or venue manager in the mock role selector."
      />
    )
  }

  if (loading) {
    return (
      <StateBlock
        title="Loading venues"
        message="Preparing the manager event form."
      />
    )
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Nuova serata"
        subtitle="Create a demo event for the manager dashboard."
      />

      {error && (
        <p className="inline-error">
          {error}
        </p>
      )}

      <form
        className="manager-form"
        onSubmit={submit}
      >
        <label>
          Title

          <input
            value={form.title}
            onChange={(event) =>
              update(
                'title',
                event.target.value,
              )
            }
            placeholder="Neon Friday"
          />
        </label>

        <label>
          Description

          <textarea
            value={form.description}
            onChange={(event) =>
              update(
                'description',
                event.target.value,
              )
            }
            placeholder="Describe the vibe, music, and entry details."
          />
        </label>

        <label>
          Venue

          <select
            value={form.venueId}
            onChange={(event) =>
              update(
                'venueId',
                event.target.value,
              )
            }
          >
            {venues.map((venue) => (
              <option
                value={venue.id}
                key={venue.id}
              >
                {venue.name}
                {' - '}
                {venue.area}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start date/time

          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) =>
              updateStartTime(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          End date/time

          <input
            type="datetime-local"
            value={form.endsAt}
            min={
              form.startsAt
              || undefined
            }
            onChange={(event) =>
              update(
                'endsAt',
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Music genre

          <select
            value={form.musicGenre}
            onChange={(event) =>
              update(
                'musicGenre',
                event.target
                  .value as MusicGenre,
              )
            }
          >
            {genres.map((genre) => (
              <option
                value={genre}
                key={genre}
              >
                {genre.replaceAll(
                  '_',
                  '-',
                )}
              </option>
            ))}
          </select>
        </label>

        <label>
          Dress code

          <input
            value={form.dressCode}
            onChange={(event) =>
              update(
                'dressCode',
                event.target.value,
              )
            }
            placeholder="Smart casual"
          />
        </label>

        <label>
          Age restriction

          <input
            value={
              form.ageRestriction
            }
            onChange={(event) =>
              update(
                'ageRestriction',
                event.target.value,
              )
            }
            placeholder="18+"
          />
        </label>

        <label>
          Entry condition

          <input
            value={
              form.entryCondition
            }
            onChange={(event) =>
              update(
                'entryCondition',
                event.target.value,
              )
            }
            placeholder="Standard entry or VIP area"
          />
        </label>

        <label>
          Price

          <input
            min="0"
            type="number"
            value={form.price}
            onChange={(event) =>
              update(
                'price',
                event.target.value,
              )
            }
            placeholder="15"
          />
        </label>

        <label>
          VIP price

          <input
            min="0"
            type="number"
            value={form.vipPrice}
            onChange={(event) =>
              update(
                'vipPrice',
                event.target.value,
              )
            }
            placeholder="35"
          />
        </label>

        <label>
          Capacity

          <input
            min="1"
            type="number"
            value={form.capacity}
            onChange={(event) =>
              update(
                'capacity',
                event.target.value,
              )
            }
            placeholder="200"
          />
        </label>

        <label>
          Image URL

          <input
            value={form.imageUrl}
            onChange={(event) =>
              update(
                'imageUrl',
                event.target.value,
              )
            }
            placeholder="/demo/new-event.jpg"
          />
        </label>

        <button
          className="primary-action"
          type="submit"
          disabled={
            saving
            || venues.length === 0
          }
        >
          {saving
            ? 'Creating...'
            : 'Create event'}
        </button>
      </form>
    </section>
  )
}

function toDateTimeLocalValue(
  date: Date,
) {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0')

  const hours =
    String(
      date.getHours(),
    ).padStart(2, '0')

  const minutes =
    String(
      date.getMinutes(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}