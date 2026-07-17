import {
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom'
import type { UserDto } from '../types/nightout'

interface AppShellProps {
  user: UserDto | null
  onResetRole: () => void
}

export function AppShell({
  user,
  onResetRole,
}: AppShellProps) {
  const location = useLocation()

  const isVenue =
    user?.role === 'VENUE_MANAGER'

  const isPr =
    user?.role === 'PR_MANAGER'

  const isManager = isVenue || isPr

  const showNav =
    location.pathname !== '/role'

  const navigationColumns = isPr ? 3 : 5

  return (
    <div className="app-shell">
      <header className="top-strip">
        <div>
          <span className="city-pill">
            Milan
          </span>

          <strong>NightOUT</strong>
        </div>

        {user && (
          <button
            className="avatar-button"
            type="button"
            onClick={onResetRole}
            aria-label="Log out"
          >
            <span>
              {user.name
                .slice(0, 1)
                .toUpperCase()}
            </span>
          </button>
        )}
      </header>

      <main
        className={
          showNav
            ? 'screen with-nav'
            : 'screen'
        }
      >
        <Outlet />
      </main>

      {showNav && user && (
        <nav
          className="bottom-nav"
          aria-label="Primary navigation"
          style={{
            gridTemplateColumns: `repeat(${navigationColumns}, 1fr)`,
          }}
        >
          {!isManager && (
            <>
              <NavLink to="/feed">
                <b>H</b>
                <span>Home</span>
              </NavLink>

              <NavLink to="/tickets">
                <b>T</b>
                <span>Tickets</span>
              </NavLink>

              <NavLink to="/pregames">
                <b>P</b>
                <span>Pregame</span>
              </NavLink>

              <NavLink to="/transport">
                <b>S</b>
                <span>Syncride</span>
              </NavLink>

              <NavLink to="/profile">
                <b>A</b>
                <span>Account</span>
              </NavLink>
            </>
          )}

          {isVenue && (
            <>
              <NavLink to="/manager">
                <b>D</b>
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/manager/events">
                <b>E</b>
                <span>Events</span>
              </NavLink>

              <NavLink to="/manager/tickets">
                <b>T</b>
                <span>Tickets</span>
              </NavLink>

              <NavLink to="/manager/promotions">
                <b>P</b>
                <span>Promotions</span>
              </NavLink>

              <NavLink to="/manager/profile">
                <b>V</b>
                <span>Profile</span>
              </NavLink>
            </>
          )}

          {isPr && (
            <>
              <NavLink to="/pr">
                <b>D</b>
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/pr/tickets">
                <b>C</b>
                <span>Code / Tickets</span>
              </NavLink>

              <NavLink to="/pr/account">
                <b>A</b>
                <span>Account</span>
              </NavLink>
            </>
          )}
        </nav>
      )}
    </div>
  )
}