import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { nightoutApi } from './api/nightoutApi'
import { AppShell } from './components/AppShell'
import { DiscoveryFeedPage } from './pages/DiscoveryFeedPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { HelpSupportPage } from './pages/HelpSupportPage'
import { ManagerCreateEventPage } from './pages/ManagerCreateEventPage'
import { ManagerDashboardPage } from './pages/ManagerDashboardPage'
import { ManagerEventsPage } from './pages/ManagerEventsPage'
import { ManagerPromotionsPage } from './pages/ManagerPromotionsPage'
import { ManagerTicketsPage } from './pages/ManagerTicketsPage'
import { ManagerVenueProfilePage } from './pages/ManagerVenueProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { PaymentMethodsPage } from './pages/PaymentMethodsPage'
import { PregameDetailPage } from './pages/PregameDetailPage'
import { PregamePage } from './pages/PregamePage'
import { PrivacySettingsPage } from './pages/PrivacySettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { PrAccountPage } from './pages/PrAccountPage'
import { PrDashboardPage } from './pages/PrDashboardPage'
import { PrTicketsPage } from './pages/PrTicketsPage'
import { RoleSelectionPage } from './pages/RoleSelectionPage'
import { TicketPurchasePage } from './pages/TicketPurchasePage'
import { TicketsPage } from './pages/TicketsPage'
import { TransportPage } from './pages/TransportPage'
import { SessionContext } from './session'
import type {
  UserDto,
  UserRole,
} from './types/nightout'
import './App.css'

const storedRoleKey = 'nightout-demo-role'

function App() {
  const [user, setUser] =
    useState<UserDto | null>(null)

  const [loadingSession, setLoadingSession] =
    useState(true)

  useEffect(() => {
    const role = localStorage.getItem(
      storedRoleKey,
    ) as UserRole | null

    if (!role) {
      setLoadingSession(false)
      return
    }

    nightoutApi
      .getSession(role)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(storedRoleKey)
      })
      .finally(() => {
        setLoadingSession(false)
      })
  }, [])

  const session = useMemo(
    () => ({
      user,
      loadingSession,

      async selectRole(role: UserRole) {
        const nextUser =
          await nightoutApi.getSession(role)

        localStorage.setItem(
          storedRoleKey,
          role,
        )

        setUser(nextUser)
      },

      resetRole() {
        localStorage.removeItem(
          storedRoleKey,
        )

        setUser(null)
      },
    }),
    [user, loadingSession],
  )

  if (loadingSession) {
    return (
      <div className="boot-screen">
        <strong>NightOUT</strong>
        <span>Loading demo session</span>
      </div>
    )
  }

  return (
    <SessionContext.Provider value={session}>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <AppShell
                user={user}
                onResetRole={
                  session.resetRole
                }
              />
            }
          >
            <Route
              path="/role"
              element={<RoleSelectionPage />}
            />

            <Route
              path="/"
              element={
                user ? (
                  <Navigate
                    to={
                      user.role === 'PR_MANAGER'
                        ? '/pr'
                        : user.role === 'VENUE_MANAGER'
                          ? '/manager'
                          : '/feed'
                    }
                    replace
                  />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/feed"
              element={
                user ? (
                  <DiscoveryFeedPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/events/:id"
              element={
                user ? (
                  <EventDetailPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/checkout/:eventId"
              element={
                user ? (
                  <TicketPurchasePage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/tickets"
              element={
                user ? (
                  <TicketsPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/pregames"
              element={
                user ? (
                  <PregamePage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/pregames/:roomId"
              element={
                user ? (
                  <PregameDetailPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/transport"
              element={
                user ? (
                  <TransportPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/transport/:eventId"
              element={
                user ? (
                  <TransportPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/manager"
              element={
                user ? (
                  <ManagerDashboardPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/manager/events"
              element={
                user ? (
                  <ManagerEventsPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/manager/events/new"
              element={
                user ? (
                  <ManagerCreateEventPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/manager/tickets"
              element={
                user ? (
                  <ManagerTicketsPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/manager/promotions"
              element={
                user ? (
                  <ManagerPromotionsPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/manager/profile"
              element={
                user ? (
                  <ManagerVenueProfilePage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/pr"
              element={
                user?.role === 'PR_MANAGER' ? (
                  <PrDashboardPage />
                ) : (
                  <Navigate
                    to={user ? '/' : '/role'}
                    replace
                  />
                )
              }
            />

            <Route
              path="/pr/tickets"
              element={
                user?.role === 'PR_MANAGER' ? (
                  <PrTicketsPage />
                ) : (
                  <Navigate
                    to={user ? '/' : '/role'}
                    replace
                  />
                )
              }
            />

            <Route
              path="/pr/account"
              element={
                user?.role === 'PR_MANAGER' ? (
                  <PrAccountPage />
                ) : (
                  <Navigate
                    to={user ? '/' : '/role'}
                    replace
                  />
                )
              }
            />

            <Route
              path="/notifications"
              element={
                user ? (
                  <NotificationsPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/profile"
              element={
                user ? (
                  <ProfilePage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/payment-methods"
              element={
                user ? (
                  <PaymentMethodsPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/privacy-settings"
              element={
                user ? (
                  <PrivacySettingsPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="/help-support"
              element={
                user ? (
                  <HelpSupportPage />
                ) : (
                  <Navigate
                    to="/role"
                    replace
                  />
                )
              }
            />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionContext.Provider>
  )
}

export default App