import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { UserDto } from '../types/nightout'

interface AppShellProps {
  user: UserDto | null
  onResetRole: () => void
}

export function AppShell({ user, onResetRole }: AppShellProps) {
  const location = useLocation()
  const isManager = user?.role === 'VENUE_MANAGER' || user?.role === 'PR_MANAGER'
  const showNav = location.pathname !== '/role'

  return (
    <div className="app-shell">
      <header className="top-strip">
        <div>
          <span className="city-pill">Milano</span>
          <strong>NightOUT</strong>
        </div>
        {user && (
          <button className="avatar-button" type="button" onClick={onResetRole}>
            <span>{user.name.slice(0, 1)}</span>
          </button>
        )}
      </header>

      <main className={showNav ? 'screen with-nav' : 'screen'}>
        <Outlet />
      </main>

      {showNav && (
        <nav className="bottom-nav" aria-label="Primary navigation">
          <NavLink to="/feed"><b>H</b><span>Home</span></NavLink>
          <NavLink to="/tickets"><b>T</b><span>Ticket</span></NavLink>
          <NavLink to="/pregames"><b>P</b><span>Pregame</span></NavLink>
          <NavLink to="/transport"><b>S</b><span>Syncride</span></NavLink>
          {isManager ? (
            <NavLink to="/manager"><b>D</b><span>PR</span></NavLink>
          ) : (
            <NavLink to="/profile"><b>A</b><span>Account</span></NavLink>
          )}
        </nav>
      )}
    </div>
  )
}
