import {
  useState,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { nightoutApi } from '../api/nightoutApi'
import { PageHeader } from '../components/PageHeader'
import { StateBlock } from '../components/StateBlock'
import { useSession } from '../session'

export function HelpSupportPage() {
  const { user } = useSession()

  const [category, setCategory] =
    useState('GENERAL')

  const [subject, setSubject] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [sending, setSending] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [formError, setFormError] =
    useState('')

  const submitSupportRequest = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!user || sending) return

    const nextCategory = category.trim()
    const nextSubject = subject.trim()
    const nextMessage = message.trim()

    setSuccessMessage('')
    setFormError('')

    if (
      !nextCategory ||
      !nextSubject ||
      !nextMessage
    ) {
      setFormError(
        'Category, subject and message are required.',
      )
      return
    }

    if (nextSubject.length > 120) {
      setFormError(
        'The subject must contain at most 120 characters.',
      )
      return
    }

    if (nextMessage.length > 2000) {
      setFormError(
        'The message must contain at most 2000 characters.',
      )
      return
    }

    setSending(true)

    try {
      const supportRequest =
        await nightoutApi.createSupportRequest(
          user.id,
          {
            category: nextCategory,
            subject: nextSubject,
            message: nextMessage,
          },
        )

      setSubject('')
      setMessage('')

      setSuccessMessage(
        `Request #${supportRequest.id} submitted successfully. Status: ${supportRequest.status}.`,
      )
    } catch {
      setFormError(
        'Could not submit the support request. Please try again.',
      )
    } finally {
      setSending(false)
    }
  }

  if (!user) {
    return (
      <StateBlock
        title="Support unavailable"
        message="You must be logged in to contact support."
      />
    )
  }

  return (
    <section className="page-stack help-support-page">
      <PageHeader
        title="Help and support"
        action={
          <Link
            className="small-action"
            to="/profile"
          >
            Back to account
          </Link>
        }
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Frequently asked questions</h2>

            <p className="section-description">
              Find quick answers about tickets,
              pregames and your NightOut account.
            </p>
          </div>
        </div>

        <div className="support-faq-list">
          <details className="support-faq-item">
            <summary>
              How can I cancel a ticket?
            </summary>

            <p>
              Open the Tickets page, select the
              ticket and use the cancellation
              option when it is available.
            </p>
          </details>

          <details className="support-faq-item">
            <summary>
              Why is my ticket on the waiting list?
            </summary>

            <p>
              The event may have reached its
              current capacity. Your ticket will
              remain on the waiting list until a
              place becomes available.
            </p>
          </details>

          <details className="support-faq-item">
            <summary>
              How do I join or leave a pregame?
            </summary>

            <p>
              Open the pregame detail page and
              use the Join or Leave button. The
              action may be unavailable when the
              room is full or already closed.
            </p>
          </details>

          <details className="support-faq-item">
            <summary>
              How can I change my profile picture?
            </summary>

            <p>
              Go to Account, select Edit profile
              and choose a JPG, PNG or WebP image
              smaller than 5 MB.
            </p>
          </details>

          <details className="support-faq-item">
            <summary>
              How do privacy settings work?
            </summary>

            <p>
              Open Privacy and security from your
              account to manage profile
              visibility and social permissions.
            </p>
          </details>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Contact support</h2>

            <p className="section-description">
              Describe the problem and a support
              request will be created.
            </p>
          </div>
        </div>

        <form
          className="support-request-form"
          onSubmit={submitSupportRequest}
        >
          <label>
            <span>Category</span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              disabled={sending}
            >
              <option value="GENERAL">
                General question
              </option>

              <option value="ACCOUNT">
                Account and profile
              </option>

              <option value="TICKETS">
                Tickets and payments
              </option>

              <option value="PREGAMES">
                Pregames
              </option>

              <option value="TECHNICAL">
                Technical problem
              </option>

              <option value="PRIVACY">
                Privacy and security
              </option>
            </select>
          </label>

          <label>
            <span>Subject</span>

            <input
              type="text"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              placeholder="Briefly describe the problem"
              maxLength={120}
              disabled={sending}
              required
            />

            <small>
              {subject.length}/120
            </small>
          </label>

          <label>
            <span>Message</span>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Explain what happened and include any useful details."
              rows={7}
              maxLength={2000}
              disabled={sending}
              required
            />

            <small>
              {message.length}/2000
            </small>
          </label>

          {successMessage && (
            <p className="inline-success">
              {successMessage}
            </p>
          )}

          {formError && (
            <p className="inline-error">
              {formError}
            </p>
          )}

          <div className="support-request-actions">
            <Link
              className="secondary-action"
              to="/profile"
            >
              Cancel
            </Link>

            <button
              className="primary-action"
              type="submit"
              disabled={sending}
            >
              {sending
                ? 'Sending...'
                : 'Send request'}
            </button>
          </div>
        </form>
      </section>
    </section>
  )
}