import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { nightoutApi } from '../api/nightoutApi'
import { useSession } from '../session'
import type {
  PaymentMethodDto,
} from '../types/nightout'

export function PaymentMethodsPage() {
  const { user } = useSession()

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethodDto[]>([])

  const [cardholderName, setCardholderName] =
    useState('')

  const [brand, setBrand] =
    useState('VISA')

  const [lastFourDigits, setLastFourDigits] =
    useState('')

  const [expiryMonth, setExpiryMonth] =
    useState('1')

  const [expiryYear, setExpiryYear] =
    useState(String(new Date().getFullYear()))

  const [defaultMethod, setDefaultMethod] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const loadPaymentMethods = useCallback(
    async () => {
      if (!user) {
        return
      }

      try {
        setLoading(true)
        setError('')

        const methods =
          await nightoutApi.getPaymentMethods(
            user.id,
          )

        setPaymentMethods(methods)
      } catch {
        setError(
          'Unable to load payment methods.',
        )
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  useEffect(() => {
    void loadPaymentMethods()
  }, [loadPaymentMethods])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!user) {
      return
    }

    if (!/^\d{4}$/.test(lastFourDigits)) {
      setError(
        'Enter exactly the last four digits.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await nightoutApi.createPaymentMethod(
        user.id,
        {
          cardholderName,
          brand,
          lastFourDigits,
          expiryMonth: Number(expiryMonth),
          expiryYear: Number(expiryYear),
          defaultMethod,
        },
      )

      setCardholderName('')
      setBrand('VISA')
      setLastFourDigits('')
      setExpiryMonth('1')
      setExpiryYear(
        String(new Date().getFullYear()),
      )
      setDefaultMethod(false)

      setSuccess(
        'Payment method added successfully.',
      )

      await loadPaymentMethods()
    } catch {
      setError(
        'Unable to add the payment method. Check the entered information.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleSetDefault(
    paymentMethodId: number,
  ) {
    if (!user) {
      return
    }

    try {
      setError('')
      setSuccess('')

      await nightoutApi.setDefaultPaymentMethod(
        user.id,
        paymentMethodId,
      )

      setSuccess(
        'Default payment method updated.',
      )

      await loadPaymentMethods()
    } catch {
      setError(
        'Unable to update the default payment method.',
      )
    }
  }

  async function handleDelete(
    paymentMethodId: number,
  ) {
    if (!user) {
      return
    }

    const confirmed = window.confirm(
      'Remove this payment method?',
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setSuccess('')

      await nightoutApi.deletePaymentMethod(
        user.id,
        paymentMethodId,
      )

      setSuccess(
        'Payment method removed.',
      )

      await loadPaymentMethods()
    } catch {
      setError(
        'Unable to remove the payment method.',
      )
    }
  }

  const currentYear =
    new Date().getFullYear()

  const availableYears =
    Array.from(
      { length: 15 },
      (_, index) => currentYear + index,
    )

  return (
    <main className="payment-methods-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            Account
          </span>

          <h1>Payment methods</h1>

          <p>
            Manage the payment methods associated
            with your NightOut account.
          </p>
        </div>
      </section>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="form-message success">
          {success}
        </div>
      )}

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <h2>Saved methods</h2>

            <p>
              Only the card brand and last four
              digits are stored.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="settings-empty-state">
            Loading payment methods...
          </p>
        ) : paymentMethods.length === 0 ? (
          <p className="settings-empty-state">
            No payment methods saved.
          </p>
        ) : (
          <div className="payment-method-list">
            {paymentMethods.map(
              (paymentMethod) => (
                <article
                  className="payment-method-card"
                  key={paymentMethod.id}
                >
                  <div className="payment-method-icon">
                    💳
                  </div>

                  <div className="payment-method-info">
                    <div className="payment-method-title">
                      <strong>
                        {paymentMethod.brand}
                        {' •••• '}
                        {
                          paymentMethod
                            .lastFourDigits
                        }
                      </strong>

                      {paymentMethod.defaultMethod && (
                        <span className="payment-default-badge">
                          Default
                        </span>
                      )}
                    </div>

                    <span>
                      {
                        paymentMethod.cardholderName
                      }
                    </span>

                    <small>
                      Expires{' '}
                      {String(
                        paymentMethod.expiryMonth,
                      ).padStart(2, '0')}
                      /
                      {paymentMethod.expiryYear}
                    </small>
                  </div>

                  <div className="payment-method-actions">
                    {!paymentMethod.defaultMethod && (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() =>
                          void handleSetDefault(
                            paymentMethod.id,
                          )
                        }
                      >
                        Set as default
                      </button>
                    )}

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() =>
                        void handleDelete(
                          paymentMethod.id,
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <h2>Add payment method</h2>

            <p>
              Enter only demo card information.
              Do not enter a complete card number
              or CVV.
            </p>
          </div>
        </div>

        <form
          className="payment-method-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>Cardholder name</span>

            <input
              type="text"
              value={cardholderName}
              onChange={(event) =>
                setCardholderName(
                  event.target.value,
                )
              }
              maxLength={100}
              required
            />
          </label>

          <label>
            <span>Card brand</span>

            <select
              value={brand}
              onChange={(event) =>
                setBrand(event.target.value)
              }
            >
              <option value="VISA">
                Visa
              </option>

              <option value="MASTERCARD">
                Mastercard
              </option>

              <option value="AMERICAN EXPRESS">
                American Express
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </label>

          <label>
            <span>Last four digits</span>

            <input
              type="text"
              inputMode="numeric"
              value={lastFourDigits}
              onChange={(event) =>
                setLastFourDigits(
                  event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 4),
                )
              }
              minLength={4}
              maxLength={4}
              placeholder="1234"
              required
            />
          </label>

          <div className="payment-expiry-row">
            <label>
              <span>Expiry month</span>

              <select
                value={expiryMonth}
                onChange={(event) =>
                  setExpiryMonth(
                    event.target.value,
                  )
                }
              >
                {Array.from(
                  { length: 12 },
                  (_, index) => index + 1,
                ).map((month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {String(month).padStart(
                      2,
                      '0',
                    )}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Expiry year</span>

              <select
                value={expiryYear}
                onChange={(event) =>
                  setExpiryYear(
                    event.target.value,
                  )
                }
              >
                {availableYears.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="payment-default-checkbox">
            <input
              type="checkbox"
              checked={defaultMethod}
              onChange={(event) =>
                setDefaultMethod(
                  event.target.checked,
                )
              }
            />

            <span>
              Set as default payment method
            </span>
          </label>

          <div className="payment-form-actions">
            <Link
              className="secondary-button"
              to="/profile"
            >
              Back to account
            </Link>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Adding...'
                : 'Add payment method'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}