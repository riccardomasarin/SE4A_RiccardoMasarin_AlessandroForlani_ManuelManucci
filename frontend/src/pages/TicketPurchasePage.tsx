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

  const [confirming, setConfirming] =
    useState(false)

  const [cancelling, setCancelling] =
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

  /*
   * Finché il ticket è PENDING, il frontend
   * controlla periodicamente se lo scheduler
   * del backend lo ha trasformato in EXPIRED.
   */
  useEffect(() => {
    if (
      !user
      || !createdTicket
      || createdTicket.status !== 'PENDING'
    ) {
      return
    }

    const intervalId = window.setInterval(
      async () => {
        try {
          const tickets =
            await nightoutApi.getTickets(
              user.id,
            )

          const updatedTicket =
            tickets.find(
              (ticket) =>
                ticket.id ===
                createdTicket.id,
            )

          if (
            updatedTicket
            && updatedTicket.status
              !== createdTicket.status
          ) {
            setCreatedTicket(
              updatedTicket,
            )

            if (
              updatedTicket.status
                === 'EXPIRED'
            ) {
              setNotice(
                'The confirmation time expired. The ticket request is no longer active.',
              )
            }
          }
        } catch {
          /*
           * Un errore temporaneo nel polling
           * non interrompe il checkout.
           */
        }
      },
      10000,
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [
    user,
    createdTicket,
  ])

  const selectedBasePrice =
    ticketType === 'VIP'
      ? event?.vipPrice ?? 0
      : event?.price ?? 0

  /*
   * Prima fase:
   * crea il ticket nello stato PENDING.
   */
  async function requestPendingTicket() {
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

      setNotice(
        'Ticket request created. Confirm it within 15 minutes to complete the reservation.',
      )
    } catch (requestError) {
      setError(
        friendlyTicketError(requestError),
      )
    } finally {
      setSubmitting(false)
    }
  }

  /*
   * Seconda fase:
   *
   * PENDING -> CONFIRMED
   * oppure
   * PENDING -> WAITING_LIST
   * oppure
   * PENDING -> EXPIRED
   */
  async function confirmPendingTicket() {
    if (
      !createdTicket
      || createdTicket.status !== 'PENDING'
      || confirming
    ) {
      return
    }

    setConfirming(true)
    setError('')
    setNotice('')

    try {
      const updatedTicket =
        await nightoutApi.confirmTicket(
          createdTicket.id,
        )

      setCreatedTicket(updatedTicket)

      if (
        updatedTicket.status
          === 'CONFIRMED'
      ) {
        setNotice(
          'Purchase confirmed successfully.',
        )
      } else if (
        updatedTicket.status
          === 'WAITING_LIST'
      ) {
        setNotice(
          'This event is full. You have been added to the waiting list.',
        )
      } else if (
        updatedTicket.status
          === 'EXPIRED'
      ) {
        setNotice(
          'The confirmation time expired. The ticket request is no longer active.',
        )
      }
    } catch (confirmationError) {
      setError(
        friendlyTicketError(
          confirmationError,
        ),
      )
    } finally {
      setConfirming(false)
    }
  }

  /*
   * Permette anche:
   *
   * PENDING -> CANCELLED
   */
  async function cancelPendingTicket() {
    if (
      !createdTicket
      || createdTicket.status !== 'PENDING'
      || cancelling
    ) {
      return
    }

    setCancelling(true)
    setError('')
    setNotice('')

    try {
      const updatedTicket =
        await nightoutApi.cancelTicket(
          createdTicket.id,
        )

      setCreatedTicket(updatedTicket)

      setNotice(
        'Ticket request cancelled.',
      )
    } catch (cancelError) {
      setError(
        friendlyTicketError(cancelError),
      )
    } finally {
      setCancelling(false)
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
    const isPending =
      createdTicket.status === 'PENDING'

    const isConfirmed =
      createdTicket.status === 'CONFIRMED'

    const isWaitingList =
      createdTicket.status ===
      'WAITING_LIST'

    const isExpired =
      createdTicket.status === 'EXPIRED'

    const isCancelled =
      createdTicket.status === 'CANCELLED'

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
              {isWaitingList
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

            {isPending && (
              <p className="inline-warning">
                Your ticket request is pending.
                Confirm it within 15 minutes or
                it will expire automatically.
              </p>
            )}

            {isWaitingList && (
              <p className="inline-warning">
                This event is full. You are on
                the waiting list and will be
                promoted if a confirmed ticket
                is cancelled.
              </p>
            )}

            {isExpired && (
              <p className="inline-error">
                This ticket request expired
                because it was not confirmed
                within the available time.
              </p>
            )}

            {isCancelled && (
              <p className="inline-warning">
                This ticket request has been
                cancelled.
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

            {isConfirmed && (
              <div className="qr-box">
                {createdTicket.qrPayload}
              </div>
            )}

            {isPending && (
              <div className="page-stack">
                <button
                  className="primary-action"
                  type="button"
                  disabled={
                    confirming
                    || cancelling
                  }
                  onClick={
                    confirmPendingTicket
                  }
                >
                  {confirming
                    ? 'Confirming...'
                    : 'Confirm purchase'}
                </button>

                <button
                  className="secondary-action"
                  type="button"
                  disabled={
                    confirming
                    || cancelling
                  }
                  onClick={
                    cancelPendingTicket
                  }
                >
                  {cancelling
                    ? 'Cancelling...'
                    : 'Cancel request'}
                </button>
              </div>
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
            the request is created.
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
          No real payment is processed. First,
          the backend creates a pending ticket
          request. You must then confirm it
          within 15 minutes.
        </p>

        {event.availableSpots === 0 && (
          <p className="inline-warning">
            This event is full. Confirming the
            pending request will place you on
            the waiting list.
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
          onClick={requestPendingTicket}
        >
          {submitting
            ? 'Creating request...'
            : 'Create ticket request'}
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
        'only a pending ticket',
      )
    ) {
      return 'This ticket is no longer pending and cannot be confirmed.'
    }

    if (
      normalizedMessage.includes(
        'not found',
      )
    ) {
      return 'We could not find this event, ticket or demo user. Refresh the page and try again.'
    }

    if (message) {
      return message
    }
  }

  return 'Ticket request could not be completed. Please try again.'
}