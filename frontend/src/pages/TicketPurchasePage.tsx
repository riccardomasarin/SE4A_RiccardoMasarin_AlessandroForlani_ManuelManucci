import {
  useEffect,
  useState,
} from 'react'
import axios from 'axios'
import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  formatCurrency,
  formatDateTime,
} from '../api/format'
import { nightoutApi } from '../api/nightoutApi'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'
import type {
  EventDetailDto,
  TicketDto,
} from '../types/nightout'

export function TicketPurchasePage() {
  const { user } = useSession()
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()

  const id = Number(eventId)

  const promoCodeFromUrl =
    searchParams.get('promoCode') ?? ''

  const [event, setEvent] =
    useState<EventDetailDto | null>(null)

  const [ticketType, setTicketType] =
    useState('Standard')

  const [promoCode, setPromoCode] =
    useState(promoCodeFromUrl)

  const [createdTicket, setCreatedTicket] =
    useState<TicketDto | null>(null)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState('')

  const [notice, setNotice] =
    useState('')

  useEffect(() => {
    if (!id) {
      setError('Invalid event.')
      return
    }

    nightoutApi
      .getEvent(id)
      .then((eventData) => {
        setEvent(eventData)
        setError('')
      })
      .catch(() => {
        setError('Event not available.')
      })
  }, [id])

  useEffect(() => {
    if (promoCodeFromUrl) {
      setPromoCode(
        promoCodeFromUrl.toUpperCase(),
      )
    }
  }, [promoCodeFromUrl])

  const selectedBasePrice =
    ticketType === 'VIP'
      ? event?.vipPrice ?? 0
      : event?.price ?? 0

  async function buyTicket() {
    if (!user || !event || submitting) {
      return
    }

    setSubmitting(true)
    setError('')
    setNotice('')

    try {
      const normalizedPromoCode =
        promoCode.trim().toUpperCase()

      const ticket =
        await nightoutApi.requestTicket({
          userId: user.id,
          eventId: event.id,
          ticketType,
          salesChannel: 'NightOut App',
          promoCode:
            normalizedPromoCode || undefined,
        })

      setCreatedTicket(ticket)

      if (
        ticket.status === 'WAITING_LIST'
      ) {
        setNotice(
          'This event is currently full, so you have been added to the waiting list. We will confirm you automatically if a spot opens.',
        )
      }
    } catch (requestError) {
      setError(
        friendlyTicketError(requestError),
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!event) {
    return (
      <StateBlock
        title="Loading checkout"
        message="Preparing the mock purchase flow."
      />
    )
  }

  if (createdTicket) {
    return (
      <section className="ticket-screen page-stack">
        <h1>Il mio biglietto</h1>

        <article className="ticket-card">
          <div className="ticket-band">
            <div>
              <h2>
                {createdTicket.ticketType}
              </h2>

              <p>
                NightOut - Biglietto digitale
              </p>
            </div>

            <span>
              {createdTicket.status ===
              'WAITING_LIST'
                ? 'WAITING LIST'
                : createdTicket.status}
            </span>
          </div>

          <div className="ticket-body">
            <h2>
              {createdTicket.eventTitle}
            </h2>

            <p>
              {createdTicket.venueAddress}
            </p>

            {createdTicket.status ===
              'WAITING_LIST' && (
              <p className="inline-warning">
                This event is full. You are on
                the waiting list and will be
                promoted if a confirmed ticket
                is cancelled.
              </p>
            )}

            {createdTicket.promoCodeUsed && (
              <div className="checkout-promo-result">
                <span>Promo code applied</span>

                <strong>
                  {
                    createdTicket
                      .promoCodeUsed
                  }
                </strong>

                <small>
                  You saved{' '}
                  {formatCurrency(
                    createdTicket
                      .discountAmount,
                  )}
                </small>
              </div>
            )}

            <div className="ticket-grid">
              <span>
                Data
                <strong>
                  {formatDateTime(
                    createdTicket
                      .eventStartsAt,
                  )}
                </strong>
              </span>

              <span>
                Accesso
                <strong>
                  {
                    createdTicket
                      .ticketType
                  }
                </strong>
              </span>

              <span>
                Biglietto
                <strong>
                  {createdTicket.code}
                </strong>
              </span>

              <span>
                Canale
                <strong>
                  {
                    createdTicket
                      .salesChannel
                  }
                </strong>
              </span>

              <span>
                Prezzo finale
                <strong>
                  {formatCurrency(
                    createdTicket.pricePaid,
                  )}
                </strong>
              </span>

              <span>
                Sconto
                <strong>
                  {formatCurrency(
                    createdTicket
                      .discountAmount,
                  )}
                </strong>
              </span>
            </div>

            <div className="qr-box">
              {createdTicket.qrPayload}
            </div>
          </div>
        </article>

        <Link
          className="secondary-action"
          to="/tickets"
        >
          Vai ai miei ticket
        </Link>
      </section>
    )
  }

  return (
    <section className="checkout page-stack">
      <h1>Ticket mock flow</h1>

      <article className="checkout-card">
        <h2>{event.title}</h2>

        <p>
          {event.venue.name}
          {' - '}
          {formatDateTime(event.startsAt)}
        </p>

        <div className="ticket-options">
          <button
            className={
              ticketType === 'Standard'
                ? 'selected'
                : ''
            }
            type="button"
            onClick={() =>
              setTicketType('Standard')
            }
          >
            Standard

            <strong>
              {formatCurrency(event.price)}
            </strong>
          </button>

          <button
            className={
              ticketType === 'VIP'
                ? 'selected'
                : ''
            }
            type="button"
            onClick={() =>
              setTicketType('VIP')
            }
          >
            VIP

            <strong>
              {formatCurrency(
                event.vipPrice,
              )}
            </strong>
          </button>
        </div>

        <label className="checkout-promo-field">
          <span>PR promo code</span>

          <input
            type="text"
            placeholder="Example: MARCO10"
            value={promoCode}
            maxLength={50}
            onChange={(inputEvent) =>
              setPromoCode(
                inputEvent.target.value
                  .toUpperCase(),
              )
            }
          />

          <small>
            Enter the code shared by your PR.
            The discount will be verified when
            you confirm the purchase.
          </small>
        </label>

        <div className="checkout-price-summary">
          <span>Selected ticket price</span>

          <strong>
            {formatCurrency(
              selectedBasePrice,
            )}
          </strong>

          {promoCode.trim() && (
            <small>
              Code to verify:{' '}
              <b>{promoCode.trim()}</b>
            </small>
          )}
        </div>

        <p className="body-copy">
          No real payment is processed. The
          backend creates a simulated ticket or
          waiting-list entry.
        </p>

        {event.availableSpots === 0 && (
          <p className="inline-warning">
            This event is full. Confirming will
            place you on the waiting list.
          </p>
        )}

        {notice && (
          <p className="inline-warning">
            {notice}
          </p>
        )}

        {error && (
          <p className="inline-error">
            {error}
          </p>
        )}

        <button
          className="primary-action"
          type="button"
          disabled={submitting}
          onClick={buyTicket}
        >
          {submitting
            ? 'Confirming purchase...'
            : 'Confirm mock purchase'}
        </button>
      </article>
    </section>
  )
}

function friendlyTicketError(
  error: unknown,
) {
  if (
    axios.isAxiosError<{
      message?: string
    }>(error)
  ) {
    const message =
      error.response?.data?.message ?? ''

    const normalizedMessage =
      message.toLowerCase()

    if (
      normalizedMessage.includes(
        'active ticket',
      )
    ) {
      return 'You already have an active ticket or waiting-list spot for this event. Check My Tickets to view or cancel it.'
    }

    if (
      normalizedMessage.includes(
        'invalid or inactive pr promo code',
      )
    ) {
      return 'The PR promo code is invalid, inactive or not available for this event.'
    }

    if (
      normalizedMessage.includes(
        'not found',
      )
    ) {
      return 'We could not find this event or demo user. Refresh the page and try again.'
    }

    if (message) {
      return message
    }
  }

  return 'Ticket request could not be completed. Please try again.'
}