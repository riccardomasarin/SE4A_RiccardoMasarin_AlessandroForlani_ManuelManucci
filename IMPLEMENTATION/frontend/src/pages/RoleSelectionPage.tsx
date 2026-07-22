import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../session'

function homeForRole(role: string) {
  if (role === 'VENUE_MANAGER') {
    return '/manager'
  }
  if (role === 'PR_MANAGER') {
    return '/pr'
  }
  return '/feed'
}

export function RoleSelectionPage() {
  const { login } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submitLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      navigate(homeForRole(user.role), {
        replace: true,
      })
    } catch (loginError) {
      if (
        axios.isAxiosError(loginError) &&
        loginError.response?.status === 401
      ) {
        setError('Invalid email or password.')
      } else {
        setError(
          'Unable to log in. Check that the backend is running on port 8080.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="role-screen">
      <div className="role-hero">
        <h1>NightOUT</h1>
        <p>Log in with your NightOUT demo profile.</p>
      </div>

      <form
        className="login-form"
        onSubmit={submitLogin}
      >
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={loading}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            disabled={loading}
            required
          />
        </label>

        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="primary-action"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </section>
  )
}
