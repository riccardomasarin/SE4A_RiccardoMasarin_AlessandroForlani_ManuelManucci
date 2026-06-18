import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../session'
import type { UserRole } from '../types/nightout'

const roles: Array<{
  role: UserRole
  title: string
  body: string
  target: string
}> = [
  {
    role: 'NORMAL_USER',
    title: 'Normal user',
    body: 'Browse events, reserve tickets, join pregames, and check Syncride returns.',
    target: '/feed',
  },
  {
    role: 'VENUE_MANAGER',
    title: 'Venue partner',
    body: 'Open the PR/venue dashboard with ticket, table, promo, and check-in data.',
    target: '/manager',
  },
  {
    role: 'PR_MANAGER',
    title: 'PR demo',
    body: 'Use the same dashboard flow with a PR-facing account.',
    target: '/manager',
  },
]

export function RoleSelectionPage() {
  const { selectRole } = useSession()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<UserRole>('NORMAL_USER')
  const [error, setError] = useState('')

  async function continueAsRole() {
    const item = roles.find((role) => role.role === selected) ?? roles[0]
    setError('')
    try {
      await selectRole(item.role)
      navigate(item.target)
    } catch {
      setError('Backend not reachable. Start the Spring Boot server on port 8080.')
    }
  }

  return (
    <section className="role-screen">
      <div className="role-hero">
        <span className="eyebrow">Software Engineering Demo</span>
        <h1>NightOUT</h1>
        <p>Choose a mock role to explore the nightlife app without real authentication.</p>
      </div>

      <div className="role-grid">
        {roles.map((role) => (
          <button
            className={selected === role.role ? 'role-card selected' : 'role-card'}
            type="button"
            key={role.role}
            onClick={() => setSelected(role.role)}
          >
            <strong>{role.title}</strong>
            <span>{role.body}</span>
          </button>
        ))}
      </div>

      {error && <p className="inline-error">{error}</p>}
      <button className="primary-action" type="button" onClick={continueAsRole}>
        Continue
      </button>
    </section>
  )
}
